const express = require('express');
const { find } = require('lodash');

const Selection = require('../models/selection');
const profileQuery = require('../query-helpers/profile');
const decennialQuery = require('../query-helpers/decennial');
const specialCalculationConfigs = require('../special-calculations');
const DataProcessor = require('../utils/data-processor');
const doChangeCalculations = require('../utils/change');
const doDifferenceCalculations = require('../utils/difference');
const getGeotypeFromIdPrefix = require('../utils/geotype-from-id-prefix');

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

router.get('/:id/', async (req, res) => {
  const { app } = req;
  let { id: _id } = req.params;
  const { compare = '0' } = req.query;

  let [ idPrefix, selectionId ] = _id.split('_');

  const geotype = getGeotypeFromIdPrefix(idPrefix);

  if (geotype === null) {
    res.status(500).send({
      status: `error: Invalid ID`,
    });
  }

  if (geotype === 'boroughs') {
    selectionId = convertBoroughLabelToCode(selectionId);
  }

  if (invalidCompare(compare)) res.status(500).send({ error: 'invalid compare param' });

  try {
    let profileObj = null;

    if (geotype === 'selection') {
      const selectedGeo = await Selection.findOne({ _id: selectionId });

      // TODO: remove "profile" argument, and corresponding parameter in upstream functions
      profileObj = await getProfileData("demographic", selectedGeo.geoids, compare, app.db);
   } else {
    profileObj = await getProfileData("demographic", [ selectionId ], compare, app.db);
   }

    return res.send(profileObj);
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
 * @param {string} profileName - The profile type
 * @param {Array} geoids - The list of geoids for the given selected geography
 * @param {string} compare - Integer string representing the geoid of the comparison geography
 * @returns {Object}
 */
async function getProfileData(profileName, geoids, compare, db) {
  const isAggregate = geoids.length > 1;

  const queryBuilder = getQueryBuilder(profileName);

  // get data from postgres
  const [rawProfileData, rawCompareData, rawPreviousProfileData, rawPreviousCompareData] = await Promise.all([
    db.query(queryBuilder(profileName, geoids)),
    db.query(queryBuilder(profileName, [compare])),
    db.query(queryBuilder(profileName, geoids, /* is previous */ true)),
    db.query(queryBuilder(profileName, [compare], /* is previous */ true)),
  ]);

  // Instantiate DataProcessors to process query results
  const profileData = new DataProcessor(rawProfileData, profileName, isAggregate).process();
  const compareData = new DataProcessor(rawCompareData, profileName, /* isAggregate */ false).process();  
  const previousProfileData = new DataProcessor(rawPreviousProfileData, profileName, isAggregate, /* isPrevious */ true).process();
  const previousCompareData = new DataProcessor(rawPreviousCompareData, profileName, /* isAggregate */ false, /* isPrevious */ true).process();

  // add previousProfileData and CompareData row objects into profileData row objects
  const joinedData = join(profileName, profileData, previousProfileData, compareData, previousCompareData);

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
function join(profileName, current, compare, previous, previousCompare) {
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
    `)
  }

  current.sort(sortRowByVariable);
  compare.sort(sortRowByVariable);
  previous.sort(sortRowByVariable);
  previousCompare.sort(sortRowByVariable);

  for (let i = 0; i < current.length; i++) { // eslint-disable-line
    const row = current[i];
    const { id, variable, variablename, base, category, profile } = row;
    const rowConfig = find(specialCalculationConfigs[profileName], ['variable', row.variable]);
    const previousRow = previous.find(previous => previous.id === row.id);
    const compareRow = compare.find(compare => compare.id === row.id);
    const previousCompareRow = previousCompare.find(previousCompare => previousCompare.id === row.id);

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
      current: removeMetadata(row),
      previous: removeMetadata(previousRow),
      compare: removeMetadata(compareRow),
      preivousCompare: removeMetadata(previousCompareRow),
      difference,
      previousDifference,
      changeOverTime,
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

  for(let i = 0; i < propertiesToRemove.length; i++) {
    delete row[propertiesToRemove[i]];
  }

  return row;
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
  // if (profile === 'decennial') return decennialQuery;
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

module.exports = router;
