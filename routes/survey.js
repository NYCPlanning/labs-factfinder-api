const express = require('express');
const { find } = require('lodash');

const acsQuery = require('../query-helpers/acs');
const decennialQuery = require('../query-helpers/decennial');
const specialCalculationConfigs = require('../special-calculations');
const deserializeGeoid = require('../utils/deserialize-geoid');
const DataProcessor = require('../utils/data-processor');
const doChangeCalculations = require('../utils/change');
const doDifferenceCalculations = require('../utils/difference');
const { performance } = require('perf_hooks');
const router = express.Router();

/*
  Adding Prefix to object keys. Frontend requires these prefixes.
*/
function prefixObj(row, prefix) {
  // row may sometimes be undefined if current year and pervious year
  // table differ in length
  if (row && prefix) {
    Object.keys(row).forEach((key) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      row[`${prefix}${capitalizedKey}`] = row[key];
      delete row[key];
    });

    return row;
  }
}

// TODO: Move all these "null*" functions into common utils folder

/* Helper function to set change values to null
* @param{Object} row - The row to update
*/
function nullChanges(row) {
 row.sum = null;
 row.marginOfError = null;
}

/*
* Helper function to set change percent values to null
* @param{Object} row - The row to update
*/
function nullChangePercents(row) {
 row.percent = null;
 row.percentMarginOfError = null;
}

/*
* Helper function to set change percentage point values to null
* @param{Object} row - The row to update
*/
function nullChangePercentagePoints(row) {
 row.percentagePoint = null;
 row.percentagePointMarginOfError = null;
}

/*
 * Helper function to set difference values to null
 * @param{Object} row - The row to update
 */
function nullDifferences(row) {
  row.sum = null;
  row.marginOfError = null;
}

/*
 * Helper function to set difference percent values to null
 * @param{Object} row - The row to update
 */
function nullDifferencePercents(row) {
  row.percent = null;
  row.percentMarginOfError = null;
}

router.get('/:survey/:geotype/:geoid/', async (req, res) => {
  const { app } = req;

  const { survey, geotype, geoid: _geoid } = req.params;
  const { compareTo = '0' } = req.query;

  const geoid = deserializeGeoid(res, geotype, _geoid);

  if (invalidCompare(compareTo)) res.status(500).send({ error: 'invalid compareTo param' });

  if (isInvalidSurvey(survey)) res.status(400).send({ error: 'Invalid survey name. Survey must be acs or decennial' });

  try {
    let surveyObj = null;

    if (geotype === 'selection') {
      try {
        const selection = await app.db.query('SELECT * FROM selection WHERE hash = ${geoid}', { geoid });

        if (selection && selection.length > 0) {
          console.info("hit selection survey data");
          const start = performance.now();
          surveyObj = await getSurveyData(survey, selection[0].geoids, compareTo, app.db);
          const stop = performance.now();
          console.info('get survey data of selection ms: ', stop - start);
        }
      } catch (e) {
        return res.status(500).send({
          errors: [`Failed to find selection for hash ${geoid}. ${e}`],
        });
      }
    } else {
      console.info("hit non selection branch");
      surveyObj = await getSurveyData(survey, [geoid], compareTo, app.db);
    }
    return res.send(surveyObj);
  } catch (e) {
    console.log(e); // eslint-disable-line

    return res.status(500).send({
      errors: [`Failed to create survey: ${e}`],
    });
  }
});

/*
 * Queries postgres for current, previous, and compare data for a given
 * survey type, set of geoids and compare geoid. Joins the data, and adds
 * 'change' and 'difference' calculation values.
 * @param {('acs'|'decennial')} survey - The type of survey to return results for. Must be 'acs' or 'decennial
 * @param {Array} geoids - The list of geoids for the given selected geography
 * @param {string} compareTo - Integer string representing the geoid of the comparison geography
 * @returns {Object}
 */
async function getSurveyData(survey, geoids, compareTo, db) {
  const isAggregate = geoids.length > 1;

  const queryBuilder = getQueryBuilder(survey);
  let start = performance.now();
  // get data from postgres
  const [rawSurveyData, rawCompareSurveyData, rawPreviousSurveyData, rawPreviousCompareSurveyData] = await Promise.all([
    db.query(queryBuilder(geoids)),
    db.query(queryBuilder([compareTo])),
    db.query(queryBuilder(geoids, /* is previous */ true)),
    db.query(queryBuilder([compareTo], /* is previous */ true)),
  ]);
  let stop = performance.now();
  console.info('time to execute queries: ', stop - start);
  
  start = performance.now();
  // Instantiate DataProcessors to process query results
  const surveyData = new DataProcessor(rawSurveyData, survey, isAggregate).process();
  const compareSurveyData = new DataProcessor(rawCompareSurveyData, survey, /* isAggregate */ false).process();
  const previousSurveyData = new DataProcessor(rawPreviousSurveyData, survey, isAggregate, /* isPrevious */ true).process();
  const previousCompareSurveyData = new DataProcessor(rawPreviousCompareSurveyData, survey, false, /* isPrevious */ true).process();
  stop = performance.now();
  console.info('time to process data: ', stop - start);

  start = performance.now();
  // add previous surveyData and compareData row objects into surveyData row objects
  const joinedData = join(surveyData, compareSurveyData, previousSurveyData, previousCompareSurveyData);
  stop = performance.now();
  console.info('time to join data: ', stop - start);

  return joinedData;
}

/*
 * Joins survey, previousSurvey, and compareSurvey row objects,
 * prepending key names with appropriate prefixes before combining.
 * (previous and compare, respectively).
 *
 * Note that this join algorithm depends on tables of the exact length.
 * So there could be issues later if for some reason they don't match.
 * @param{Object[]} survey - Array of survey row objects
 * @param{Object[]} previous - Array of previous survey row objects
 * @param{Object[]} compare - Array of compare survey row objects
 */
function join(current, compare, previous, previousCompare) {
  const output = [];
  if (!(
      current.length === compare.length
    && compare.length === previous.length
    && previous.length === previousCompare.length
  )) {
    console.warn(`
      The lengths of query outputs differ:
      Current: ${current.length}
      Previous: ${previous.length}
      Compare: ${compare.length}
      Previous Compare: ${previousCompare.length}
      This is Bad and could lead to mismatched comparisons.
    `);
  }

  current.sort(sortRowByVariable);
  compare.sort(sortRowByVariable);
  previous.sort(sortRowByVariable);
  previousCompare.sort(sortRowByVariable);

  for (let i = 0; i < current.length; i++) { // eslint-disable-line
    const row = current[i];

    const {
      id,
      variable,
      variablename,
      base,
      category,
      survey,
    } = row;
    const isDecennial = survey === 'decennial';
    const rowConfig = find(specialCalculationConfigs[survey], ['variable', row.variable]);
    const compareRow = compare.find(c => c.id === row.id);
    const previousRow = previous.find(p => p.id === row.id);
    const previousCompareRow = previousCompare.find(p => p.id === row.id);

    let difference = doDifferenceCalculations(row, compareRow, isDecennial);
    let previousDifference = doDifferenceCalculations(previousRow, previousCompareRow, isDecennial);
    let changeOverTime = doChangeCalculations(row, previousRow, rowConfig, isDecennial);

    if (row.codingThreshold === 'upper' || (compareRow && compareRow.codingThreshold === 'upper')) {
      nullDifferences(difference);
      nullDifferencePercents(difference);
    }

    if (previousRow && (previousRow.codingThreshold === 'upper' || previousCompareRow.codingThreshold === 'upper')) {
      nullDifferences(previousDifference);
      nullDifferencePercents(previousDifference);
    }


    if (row.codingThreshold === 'upper' || (previousRow && previousRow.codingThreshold === 'upper')) {
      nullChanges(changeOverTime);
      nullChangePercents(changeOverTime);
      nullChangePercentagePoints(changeOverTime);
    }

    output.push({
      id,
      variable,
      variablename,
      base,
      category,
      survey,
      ...removeMetadata(row),
      ...prefixObj(removeMetadata(previousRow), 'previous'),
      ...prefixObj(removeMetadata(compareRow), 'comparison'),
      ...prefixObj(removeMetadata(previousCompareRow), 'previousComparison'),
      ...prefixObj(difference, 'difference'),
      ...prefixObj(previousDifference, 'previousDifference'),
      ...prefixObj(changeOverTime, 'change'),
    });
  }

  return output;
}

/*
This function will take a row object and remove
repeated metadata from the row object.
*/
function removeMetadata(row) {
  const propertiesToRemove = [
    'id',
    'variable',
    'variablename',
    'base',
    'category',
    'survey',
  ]

  if (row) {
    for(let i = 0; i < propertiesToRemove.length; i++) {
      delete row[propertiesToRemove[i]];
    }

    return row;
  }
}

/*
 * Comparison function for sorting survey row object
 */
function sortRowByVariable(rowA, rowB) {
  if (rowA.variable > rowB.variable) return 1;
  if (rowA.variable < rowB.variable) return -1;
  return 0;
}

/*
 * Returns the appropriate query builder for the given survey type
 * @param{string} survey - The survey type (TODO: this parameter's domain should be [`decennial`, `acs`]
 * @returns{function}
 */
function getQueryBuilder(survey) {
  if (survey === 'decennial') return decennialQuery;
  return acsQuery;
}

/*
 * Checks that the compare query parameter is a valid geoid
 * @param{string} comp - Integer string representing the geoid of the comparison geography
 * @returns{Boolean}
 */
function invalidCompare(compareTo) {
  const cityOrBoro = compareTo.match(/[0-5]{1}/);
  const nta = compareTo.match(/[A-Z]{2}[0-9]{2}/);
  const puma = compareTo.match(/[0-9]{4}/);

  if (cityOrBoro || nta || puma) return false;
  return true;
}

/*
 * Checks that the survey query parameter is a valid survey type
 * @param{string} survey - The survey type
 * @returns{Boolean}
 */
function isInvalidSurvey(survey) {
  const validSurveyNames = ['decennial', 'acs'];
  if (validSurveyNames.includes(survey)) return false;
  return true;
}

module.exports = router;
