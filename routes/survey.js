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
          surveyObj = await getSurveyData(survey, selection[0].geoids, compareTo, app.db);
        }
      } catch (e) {
        return res.status(500).send({
          errors: [`Failed to find selection for hash ${geoid}. ${e}`],
        });
      }
    } else {
      surveyObj = await getSurveyData(survey, [geoid], compareTo, app.db);
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
 * @param {string} compare - Integer string representing the geoid of the comparison geography
 * @returns {Object}
 */
// async function getProfileData(profileName, geoids, compare, db) {
async function getSurveyData(survey, geoids, compare, db) {
  const isAggregate = geoids.length > 1;

  const queryBuilder = getQueryBuilder(survey);
  // get data from postgres
  const [rawProfileData, rawCompareProfileData, rawPreviousProfileData, rawPreviousCompareProfileData] = await Promise.all([
    db.query(queryBuilder(geoids)),
    db.query(queryBuilder([compare])),
    db.query(queryBuilder(geoids, /* is previous */ true)),
    db.query(queryBuilder([compare], /* is previous */ true)),
  ]);

  // Instantiate DataProcessors to process query results
  const surveyData = new DataProcessor(rawProfileData, survey, isAggregate).process();
  const compareSurveyData = new DataProcessor(rawCompareProfileData, survey, /* isAggregate */ false).process();
  const previousSurveyData = new DataProcessor(rawPreviousProfileData, survey, isAggregate, /* isPrevious */ true).process();
  const previousCompareSurveyData = new DataProcessor(rawPreviousCompareProfileData, survey, false, /* isPrevious */ true).process();

  // add previousProfileData and compareProfileData row objects into profileData row objects
  join(surveyData, compareSurveyData, previousSurveyData, previousCompareSurveyData);

  // profileData now contains the current selection data, in addition to previous & compare data
  return surveyData
    .map((row) => {
      const rowConfig = find(specialCalculationConfigs[survey], ['variable', row.variable]);
      const isDecennial = survey === 'decennial';
      // wrap in a try catch in case something goes wrong.
      // TODO: this was added as a stopgap for known issues
      //    with decennial variables (for example, certain race
      //    categories were missing). we should more explicitly
      //    validate those decennial inputs instead of a general
      //    purpose try/catch.
      try {
        doChangeCalculations(row, rowConfig, isDecennial);
        doDifferenceCalculations(row, isDecennial);
      } catch (e) {
        console.log(`Something went wrong calculating ${row.variable}: ${e}`);
      }

      return row;
    });
}

/*
 * Joins profile, previousProfile, and compareProfile row objects,
 * prepending key names with appropriate prefixes before combining.
 * (previous and compare, respectively).
 *
 * Note that this join algorithm depends on tables of the exact length.
 * So there could be issues later if for some reason they don't match.
 *
 * @param{Object[]} profile - Array of profile row objects
 * @param{Object[]} previous - Array of previous profile row objects
 * @param{Object[]} compare - Array of compare profile row objects
 */
function join(profile, compare, previous, previousCompare) {
  if (!(
    profile.length === compare.length
    && compare.length === previous.length
    && previous.length === previousCompare.length
  )) {
    console.warn(`
      The lengths of query outputs differ:
      Profile: ${profile.length}
      Previous: ${previous.length}
      Compare: ${compare.length}
      This is Bad and could lead to mismatched comparisons.
    `);
  }

  profile.sort(sortRowByVariable);
  compare.sort(sortRowByVariable);
  previous.sort(sortRowByVariable);
  previousCompare.sort(sortRowByVariable);

  for (let i = 0; i < profile.length; i++) { // eslint-disable-line
    const row = profile[i];
    const previousRow = previous.find(p => p.id === row.id);
    const compareRow = compare.find(c => c.id === row.id);
    const previousCompareRow = previousCompare.find(p => p.id === row.id);

    if (previousRow) {
      addValuesToRow(row, previousRow, 'previous');
    }

    if (compareRow) {
      addValuesToRow(row, compareRow, 'comparison');
    }

    if (previousCompareRow) {
      addValuesToRow(row, previousCompareRow, 'previous_comparison');
    }
  }
}

/*
 * Returns the keys for actual values in a row object,
 * filtering out all metadata, as these fields do not need to.
 * Additionally adds special variable field 'codingThreshold' (not present in normal variable rows),
 * which is hacky and I don't love it but I'm OVER IT, and will think of a better solution
 * some other time sorry future coder readers.
 * be preserved from the previous and compare row objects.
 * @param{String[]} allKeys - Array containing all of keys in the row object
 */
function getValueKeys(allKeys) {
  const valueKeys = allKeys.filter(key => ![
    'id',
    'variable',
    'variablename',
    'base',
    'category',
    'profile',
    'base_sum',
    'base_m',
    'survey',
  ].includes(key));

  // this is not great, maybe codingThreshold property should be added to all rows?
  if (!valueKeys.includes('codingThreshold')) {
    valueKeys.push('codingThreshold');
  }

  return valueKeys;
}

/*
 * Adds all values for a given set of keys from one row
 * to another row, prepending the keys with the given profix
 * in the final object
 * @param{Object} row - The target row to add values to
 * @param{Object} rowToAdd - The source row to add values from
 * @param{String} prefix - The prefix to prepend to a key when adding the value to the target object
 * @param{String[]} keys - The array of keys for values to add from rowToAdd to row
 */
function addValuesToRow(row, rowToAdd, prefix) {
  const valueKeys = getValueKeys(Object.keys(row));

  if (row && rowToAdd) { // TODO: if this is false, it is a silent failure
    if (row.variable !== rowToAdd.variable) {
      console.warn(`Issue during join: attempting to merge with mismatched variables ${row.variable} and ${rowToAdd.variable}.`);
    }

    valueKeys.forEach((key) => {
      row[`${prefix}_${key}`] = rowToAdd[key];
    });
  } else {
    throw new Error(`Missing "${prefix}" variable for ${row.variable}`);
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
 * @param {('acs'|'decennial')} survey - The type of survey to return results for. Must be 'acs' or 'decennial
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
function invalidCompare(compare) {
  const cityOrBoro = compare.match(/[0-5]{1}/);
  const nta = compare.match(/[A-Z]{2}[0-9]{2}/);
  const puma = compare.match(/[0-9]{4}/);

  if (cityOrBoro || nta || puma) return false;
  return true;
}

/*
 * Checks that the profile query parameter is a valid profile type
 * @param{string} survey - The profile type
 * @returns{Boolean}
 */
function isInvalidSurvey(survey) {
  const validProfileNames = ['decennial', 'acs'];
  if (validProfileNames.includes(survey)) return false;
  return true;
}

module.exports = router;
