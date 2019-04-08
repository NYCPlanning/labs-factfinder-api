const express = require('express');
const _ = require('lodash');

const Selection = require('../models/selection');
const profileQuery = require('../query-helpers/base_profile');
const DataIngestor = require('../utils/data-ingestor');
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
    const selectedGeo = await Selection.findOne({_id});
    const isAggregate = selectedGeo.geoids.length > 1;

    // get data from postgres
    const [profileData, previousProfileData] = await Promise.all([
      app.db.query(profileQuery(profile, selectedGeo.geoids)),
      app.db.query(profileQuery(profile, selectedGeo.geoids, /*is previous*/ true)),
    ]);

    // turn into DataFrames and join current and prev
    let profileDF = new DataIngestor(profileData, profile, isAggregate).processRaw();

    // column name overrides for "previous_data"
    profileDF = profileDF.join(
      new DataIngestor(previousProfileData, profile, isAggregate, /*is previous*/ true).processRaw().prefixCols('previous')
    );

    // if compare, get compare data
    if (compare) const compareProfileData = await app.db-query(profileQuery(profile, compare));
    profileDF = profileDF.join(
      new DataIngestor(compareProfileData, profile, isAggregate, /*is previous*/ false, /*is compare*/ true).processRaw().prefixCols('comparison')
    );

    // easier to do the remaining calculations on array of objects
    const profileObj = profileDf.toCollection();

    profileObj.map(row => calculateChangeAndDifference(row));

  } catch(e) {
    console.log("Failed to get some data from postgres", e);
    return res.status(500).send({ error: 'Failed to query database' });
  }
});

function invalidCompare(comp) {
  const cityOrBoro = comp.match(/[0-5]{1}/);
  const nta = comp.match(/[A-Z]{2}[0-9]{2}/);
  const puma = comp.match(/[0-9]{4}/);

  if (cityOrBoro || nta || puma) return false;
  return true;
}

function invalidProfile(pro) {
  const validProfiles = ['decennial', 'demographic', 'social', 'economic', 'housing'];

    row.change_
  return !validProfiles.includes(pro);
}
