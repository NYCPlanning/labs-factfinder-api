const express = require('express');
const { find } = require('lodash');

const acsQuery = require('../query-helpers/acs');
const decennialQuery = require('../query-helpers/decennial');
const specialCalculationConfigs = require('../special-calculations');
const DataProcessor = require('../utils/data-processor');
const doChangeCalculations = require('../utils/change');
const doDifferenceCalculations = require('../utils/difference');

const router = express.Router();

function convertBoroughLabelToCode(potentialBoroughLabel) {
  switch (potentialBoroughLabel) {
    case 'NYC':
      return '0';
    case 'Manhattan':
      return '1';
    case 'Bronx':
      return '2';
    case 'Brooklyn':
      return '3';
    case 'Queens':
      return '4';
    case 'StatenIsland':
      return '5';
    default:
      return potentialBoroughLabel;
  }
}

/*
  Adding Prefix to object keys. Frontend requires these prefixes.
*/
function prefixObj(row, prefix) {
  // row may sometimes be undefined if current year and pervious year
  // table differ in length
  if (row && prefix) {
    Object.keys(row).forEach((key) => {
      row[`${prefix}${key}`] = row[key];
      delete row[key];
    });

    return row;
  }
}

router.get('/:survey/:geotype/:geoid/', async (req, res) => {
  const { app } = req;

  const { survey, geotype, geoid: _geoid } = req.params;
  const { compareTo = '0' } = req.query;

  if (geotype === null) {
    res.status(500).send({
      status: 'error: Invalid ID',
    });
  }

  const geoid = (geotype === 'boroughs') ? convertBoroughLabelToCode(_geoid) : _geoid;

  if (invalidCompare(compareTo)) res.status(500).send({ error: 'invalid compareTo param' });

  if (isInvalidSurvey(survey)) res.status(400).send({ error: 'Invalid survey name. Survey must be acs or decennial' });

  try {
    let surveyObj = null;

    if (geotype === 'selection') {
      try {
        const selection = await app.db.query('SELECT * FROM selection WHERE hash = ${geoid}', { geoid });

        if (selection && selection.length > 0) {
<<<<<<< HEAD
          surveyObj = await getSurveyData(survey, selection[0].geoids, compareTo, app.db);
=======
          // TODO: remove "profile" argument, and corresponding parameter in upstream functions
          // TODO: What happens if there is more than one selected geography result?
          profileObj = await getSurveyData(survey, selection[0].geoids, compareTo, app.db);
>>>>>>> 2a3cdc9 (Adding changes to survey from profile)
        }
      } catch (e) {
        return res.status(500).send({
          errors: [`Failed to find selection for hash ${geoid}. ${e}`],
        });
      }
    } else {
<<<<<<< HEAD
      surveyObj = await getSurveyData(survey, [geoid], compareTo, app.db);
=======
      profileObj = await getSurveyData(survey, [ selectionId ], compareTo, app.db);
>>>>>>> 2a3cdc9 (Adding changes to survey from profile)
    }
    return res.send(surveyObj);
  } catch (e) {
    console.log(e); // eslint-disable-line

    return res.status(500).send({
      errors: [`Failed to create profile: ${e}`],
    });
  }
});

/*
 * Queries postgres for current, previous, and compare data for a given
 * profile type, set of geoids and compare geoid. Joins the data, and adds
 * 'change' and 'difference' calculation values.
 * @param {('acs'|'decennial')} survey - The type of survey to return results for. Must be 'acs' or 'decennial
 * @param {Array} geoids - The list of geoids for the given selected geography
 * @param {string} compareTo - Integer string representing the geoid of the comparison geography
 * @returns {Object}
 */
// async function getProfileData(profileName, geoids, compareTo, db) {
async function getSurveyData(survey, geoids, compareTo, db) {
  const isAggregate = geoids.length > 1;

  const queryBuilder = getQueryBuilder(survey);
  console.log(queryBuilder(geoids))
  
  // get data from postgres
  const [rawProfileData, rawCompareProfileData, rawPreviousProfileData, rawPreviousCompareProfileData] = await Promise.all([
    db.query(queryBuilder(geoids)),
    db.query(queryBuilder([compareTo])),
    db.query(queryBuilder(geoids, /* is previous */ true)),
    db.query(queryBuilder([compareTo], /* is previous */ true)),
  ]);

  // Instantiate DataProcessors to process query results
  const surveyData = new DataProcessor(rawProfileData, survey, isAggregate).process();
  const compareSurveyData = new DataProcessor(rawCompareProfileData, survey, /* isAggregate */ false).process();
  const previousSurveyData = new DataProcessor(rawPreviousProfileData, survey, isAggregate, /* isPrevious */ true).process();
  const previousCompareSurveyData = new DataProcessor(rawPreviousCompareProfileData, survey, false, /* isPrevious */ true).process();

  // add previousProfileData and CompareData row objects into profileData row objects
  const joinedData = join(survey, surveyData, compareSurveyData, previousSurveyData, previousCompareSurveyData);

  return joinedData;
}

/*
 * Joins profile, previousProfile, and compareProfile row objects,
 * prepending key names with appropriate prefixes before combining.
 * (previous and compare, respectively).
 *
 * Note that this join algorithm depends on tables of the exact length.
 * So there could be issues later if for some reason they don't match.
 * @param{Object[]} profile - Array of profile row objects
 * @param{Object[]} previous - Array of previous profile row objects
 * @param{Object[]} compare - Array of compare profile row objects
 */
function join(survey, current, compare, previous, previousCompare) {
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
    const { id, variable, variablename, base, category, profile } = row;
    const rowConfig = find(specialCalculationConfigs[survey], ['variable', row.variable]);
    const compareRow = compare.find(c => c.id === row.id);
    const previousRow = previous.find(p => p.id === row.id);
    const previousCompareRow = previousCompare.find(p => p.id === row.id);

    const difference = doDifferenceCalculations(row, compareRow);
    const previousDifference = doDifferenceCalculations(previousRow, previousCompareRow);
    const changeOverTime = doChangeCalculations(row, previousRow, rowConfig);

    output.push({
      id,
      variable,
      variablename,
      base,
      category,
      profile,
      ...removeMetadata(row),
      ...prefixObj(removeMetadata(previousRow), 'previous_'),
      ...prefixObj(removeMetadata(compareRow), 'comparison_'),
      ...prefixObj(removeMetadata(previousCompareRow), 'previous_comparison_'),
      ...prefixObj(difference, 'difference_'),
      ...prefixObj(previousDifference, 'previous_difference_'),
      ...prefixObj(changeOverTime, 'change_'),
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
    'profile',
  ]

  if (row) {
    for(let i = 0; i < propertiesToRemove.length; i++) {
      delete row[propertiesToRemove[i]];
    }

    return row;
  }
}

/*
 * Comparison function for sorting profile row object
 */
function sortRowByVariable(rowA, rowB) {
  if (rowA.variable > rowB.variable) return 1;
  if (rowA.variable < rowB.variable) return -1;
  return 0;
}

/*
 * Returns the appropriate query builder for the given profile type
 * @param{string} profile - The profile type (TODO: this parameter's domain should be [`decennial`, `acs`]
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
 * Checks that the survey query parameter is a valid profile type
 * @param{string} survey - The profile type
 * @returns{Boolean}
 */
function isInvalidSurvey(survey) {
  const validSurveyNames = ['decennial', 'acs'];
  if (validSurveyNames.includes(survey)) return false;
  return true;
}

module.exports = router;
