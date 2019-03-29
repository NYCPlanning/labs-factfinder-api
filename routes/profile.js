const express = require('express');

const Selection = require('../models/selection');
const profileQuery = require('../query-helpers/profile');
const decennialQuery = require('../query-helpers/decennial');
const DataIngestor = require('../utils/data-ingestor');
const doChangeCalculations = require('../utils/change');
const doDifferenceCalculations = require('../utils/difference');

const router = express.Router();

router.get('/:id/:profile', async (req, res) => {
  const { app } = req;
  const { id: _id, profile } = req.params;
  const { compare = '0' } = req.query;

  if (invalidCompare(compare)) res.status(500).send({ error: 'invalid compare param' });

  if (invalidProfile(profile)) res.status(500).send({ error: 'invalid profile' });

  try {
    const selectedGeo = await Selection.findOne({ _id });
    const profileObj = await getProfileData(profile, selectedGeo.geoids, compare, app.db);
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
 * @param {string} profile - The profile type
 * @param {Array} geoids - The list of geoids for the given selected geography
 * @param {string} compare - Integer string representing the geoid of the comparison geography
 * @returns {Object}
 */
async function getProfileData(profile, geoids, compare, db) {
  const isAggregate = geoids.length > 1;

  const queryBuilder = getQueryBuilder(profile);

  // get data from postgres
  const [profileData, previousProfileData, compareProfileData] = await Promise.all([
    db.query(queryBuilder(profile, geoids)),
    db.query(queryBuilder(profile, geoids, /* is previous */ true)),
    db.query(queryBuilder(profile, compare)),
  ]);

  // create Dataframe from profile data
  let profileDF = new DataIngestor(profileData, profile, isAggregate).processRaw();

  // join with previous profile data Dataframe
  profileDF = profileDF.join(
    new DataIngestor(previousProfileData, profile, isAggregate, /* is previous */ true).processRaw('previous'),
    'variable',
  );

  // join with compare profile data Dataframe
  profileDF = profileDF.join(
    // 'compare' profiles are always NOT aggregate; they are comprised of a single geoid
    new DataIngestor(compareProfileData, profile).processRaw('comparison'),
    'variable',
  );

  // convert combined Dataframe to array of objects
  // (change & difference calculations results in ad-hoc property addition,
  // which is easier with objects than Dataframe rows)
  const profileObj = profileDF.toCollection();

  /* eslint-disable */
  debugger;
  profileObj.map((row) => {
    doChangeCalculations(row);
    doDifferenceCalculations(row);
  });
  /* eslint-enable */

  return profileObj;
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
 * @param{string} profile - The profile type
 * @returns{Boolean} 
 */
function invalidProfile(profile) {
  const validProfiles = ['decennial', 'demographic', 'social', 'economic', 'housing'];
  if (validProfiles.includes(profile)) return false;
  return true;
}

module.exports = router;
