const express = require('express');
const { find } = require('lodash');

const Selection = require('../models/selection');
const profileQuery = require('../query-helpers/profile');
const decennialQuery = require('../query-helpers/decennial');
const specialCalculationConfigs = require('../special-calculations');
const DataProcessor = require('../utils/data-processor');
const doChangeCalculations = require('../utils/change');
const doDifferenceCalculations = require('../utils/difference');

const router = express.Router();
router.get('/:id/:profileName', async (req, res) => {
  const { app } = req;
  const { id: _id, profileName } = req.params;
  const { compare = '0' } = req.query;

  if (invalidCompare(compare)) res.status(500).send({ error: 'invalid compare param' });

  if (invalidProfileName(profileName)) res.status(500).send({ error: 'invalid profile' });

  try {
    const selectedGeo = await Selection.findOne({ _id });
    const profileObj = await getProfileData(profileName, selectedGeo.geoids, compare, app.db);
    return res.send(profileObj);
  } catch (e) {
    console.log(e); // eslint-disable-line
    return res.status(500).send({ error: 'Failed to create profile' });
  }
});

/*
 * Queries postgres for current, previous, and compare data for a given
 * profile type, set of geoids and compare geoid. Joins the data, and adds
 * 'change' and 'difference' calculation values.
 * @param {string} profileName - The profile type
 * @param {Array} geoids - The list of geoids for the given selected geography
 * @param {string} compare - Integer string representing the geoid of the comparison geography
 * @returns {Object}
 */
async function getProfileData(profileName, geoids, compare, db) {
  const isAggregate = geoids.length > 1;

  const queryBuilder = getQueryBuilder(profileName);

  // get data from postgres
  const [rawProfileData, rawPreviousProfileData, rawCompareProfileData] = await Promise.all([
    db.query(queryBuilder(profileName, geoids)),
    db.query(queryBuilder(profileName, geoids, /* is previous */ true)),
    db.query(queryBuilder(profileName, [compare])),
  ]);

  // Instantiate DataProcessors to process query results
  const profileData = new DataProcessor(rawProfileData, profileName, isAggregate).process();
  const previousProfileData = new DataProcessor(rawPreviousProfileData, profileName, isAggregate, /* isPrevious */ true).process();
  const compareProfileData = new DataProcessor(rawCompareProfileData, profileName, /* isAggregate */ false).process();

  // add previousProfileData and compareProfileData row objects into profileData row objects
  join(profileData, previousProfileData, compareProfileData);

  // profileData now contains the current selection data, in addition to previous & compare data
  return profileData
    .map((row) => {
      const rowConfig = find(specialCalculationConfigs[profileName], ['variable', row.variable]);
      doChangeCalculations(row, rowConfig);
      doDifferenceCalculations(row);
      return row;
    });
}

/*
 * Joins profile, previousProfile, and compareProfile row objects,
 * prepending key names with appropriate prefixes before combining.
 * (previous and compare, respectively).
 * @param{Object[]} profile - Array of profile row objects
 * @param{Object[]} previous - Array of previous profile row objects
 * @param{Object[]} compare - Array of compare profile row objects
 */
function join(profile, previous, compare) {
  const valueKeys = getValueKeys(Object.keys(profile[0]));

  profile.sort(sortRowByVariable);
  previous.sort(sortRowByVariable);
  compare.sort(sortRowByVariable);

  for (let i = 0; i < profile.length; i++) { // eslint-disable-line
    const row = profile[i];
    const previousRow = previous[i];
    const compareRow = compare[i];

    addValuesToRow(row, previousRow, 'previous', valueKeys);
    addValuesToRow(row, compareRow, 'comparison', valueKeys);
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
  const valueKeys = allKeys.filter(v => !['id', 'variable', 'variablename', 'base', 'category', 'profile', 'base_sum', 'base_m'].includes(v));

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
function addValuesToRow(row, rowToAdd, prefix, keys) {
  keys.forEach((key) => {
    row[`${prefix}_${key}`] = rowToAdd[key];
  });
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
 * @param{string} profile - The profile type
 * @returns{function}
 */
function getQueryBuilder(profile) {
  if (profile === 'decennial') return decennialQuery;
  return profileQuery;
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
 * @param{string} profileName - The profile type
 * @returns{Boolean}
 */
function invalidProfileName(profileName) {
  const validProfileNames = ['decennial', 'demographic', 'social', 'economic', 'housing'];
  if (validProfileNames.includes(profileName)) return false;
  return true;
}

module.exports = router;
