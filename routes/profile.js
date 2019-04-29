const express = require('express');
const { find } = require('lodash');

const Selection = require('../models/selection');
const profileQuery = require('../query-helpers/profile');
const decennialQuery = require('../query-helpers/decennial');
const specialCalculationConfigs = require('../special-calculations');
const DataIngestor = require('../utils/data-ingestor');
const doChangeCalculations = require('../utils/change');
const doDifferenceCalculations = require('../utils/difference');
const removePercentsFromSpecialVars = require('../utils/percent');

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
  const [profileData, previousProfileData, compareProfileData] = await Promise.all([
    db.query(queryBuilder(profileName, geoids)),
    db.query(queryBuilder(profileName, geoids, /* is previous */ true)),
    db.query(queryBuilder(profileName, compare)),
  ]);

  // create Dataframe from profile data
  let profileDF = new DataIngestor(
    profileData,
    profileName,
    isAggregate,
  ).processRaw();

  // join with previous profile data Dataframe
  profileDF = profileDF.join(
    new DataIngestor(
      previousProfileData,
      profileName,
      isAggregate,
      /* is previous */ true,
    ).processRaw(),
    'variable',
  );

  // join with compare profile data Dataframe
  profileDF = profileDF.join(
    // 'compare' profiles are always NOT aggregate; they are comprised of a single geoid
    new DataIngestor(
      compareProfileData,
      profileName,
      /* is aggregate */ false,
      /* is previous */ false,
      /* is comparison */ true,
    ).processRaw(),
    'variable',
  );

  // convert combined Dataframe to array of objects
  // (change & difference calculations requires ad-hoc property addition,
  // which is *MUCH* easier with objects than Dataframe rows)
  // TODO: confirm using Dataframe is faster than just iterating over objects...
  return profileDF
    .toCollection()
    .map((row) => {
      const varConfig = find(specialCalculationConfigs[profileName], ['variable', row.variable]) || {};
      doChangeCalculations(row, varConfig);
      doDifferenceCalculations(row);
      removePercentsFromSpecialVars(row, varConfig);
      return row;
    });
}

/*
 *
 */

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
