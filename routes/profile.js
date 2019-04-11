const express = require('express');
const _ = require('lodash');

const Selection = require('../models/selection');
const profileQuery = require('../query-helpers/profile-new');
const decennialQuery = require('../query-helpers/decennial-new');
const DataIngestor = require('../utils/data-ingestor');
const doChangeCalculations = require('../utils/change');
const doDifferenceCalculations = require('../utils/difference');

const { find } = _;

const router = express.Router();

router.get('/:id/:profile', async (req, res) => {
  const { app } = req;

  const { id: _id, profile } = req.params;
  const { compare = '0' } = req.query;
  // validate compare
  if (invalidCompare(compare)) res.status(500).send({ error: 'invalid compare param' });

  // validate profile
  if (invalidProfile(profile)) res.status(500).send({ error: 'invalid profile' });

  try {
    const selectedGeo = await Selection.findOne({ _id });

    const isAggregate = selectedGeo.geoids.length > 1;

    const queryBuilder = getQueryBuilder(profile);
    // get data from postgres
    console.log('Querying for profile data & previous profile data');
    const profile_now = new Date().getTime();
    const [profileData, previousProfileData] = await Promise.all([
      app.db.query(queryBuilder(profile, selectedGeo.geoids)),
      app.db.query(queryBuilder(profile, selectedGeo.geoids, /* is previous */ true)),
    ]);
    console.log(`Finished in ${(new Date().getTime() - profile_now) / 1000} seconds`);
    // create Dataframe from profile data
    let profileDF = new DataIngestor(profileData, profile, isAggregate).processRaw();

    // join with previous profile data, and with renamed columns
    profileDF = profileDF.join(
      new DataIngestor(previousProfileData, profile, isAggregate, /* is previous */ true).processRaw('previous'),
      'variable',
    );

    console.log('Querying for compare profile data');
    const compare_now = new Date().getTime();
    const compareProfileData = await app.db.query(queryBuilder(profile, compare));
    console.log(`Finished in ${(new Date().getTime() - compare_now) / 1000} seconds`);

    profileDF = profileDF.join(
      // 'compare' profiles are always NOT aggregate; they are comprised of a single geoid
      new DataIngestor(compareProfileData, profile).processRaw('comparison'),
      'variable',
    );

    // easier to do the remaining calculations on array of objects
    const profileObj = profileDF.toCollection();

    console.log('Starting change & difference calculations');
    const calc_now = new Date().getTime();
    /* eslint-disable */
    profileObj.map((row) => {
      doChangeCalculations(row);
      doDifferenceCalculations(row);
    });
    /* eslint-enable */
    console.log(`Finished in ${(new Date().getTime() - calc_now) / 1000} seconds`);

    return res.send(profileObj);
  } catch (e) {
    console.log(e); // eslint-disable-line
    return res.status(500).send({ error: 'Failed to create profile' });
  }
});

function getQueryBuilder(profile) {
  if (profile === 'decennial') return decennialQuery;
  return profileQuery;
}

function invalidCompare(comp) {
  const cityOrBoro = comp.match(/[0-5]{1}/);
  const nta = comp.match(/[A-Z]{2}[0-9]{2}/);
  const puma = comp.match(/[0-9]{4}/);

  if (cityOrBoro || nta || puma) return false;
  return true;
}

function invalidProfile(pro) {
  const validProfiles = ['decennial', 'demographic', 'social', 'economic', 'housing'];
  if (validProfiles.includes(pro)) return false;
  return true;
}

module.exports = router;
