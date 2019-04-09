const express = require('express');
const _ = require('lodash');

const Selection = require('../models/selection');
const profileQuery = require('../query-helpers/profile-new');
const DataIngestor = require('../utils/data-ingestor');
const doChangeCalculations = require('../utils/change');
const doDifferenceCalculations = require('../utils/change');
const tableConfigs = require('../table-config');

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

    // get data from postgres
    const [profileData, previousProfileData] = await Promise.all([
      app.db.query(profileQuery(profile, selectedGeo.geoids)),
      app.db.query(profileQuery(profile, selectedGeo.geoids, /* is previous */ true)),
    ]);

    // create Dataframe from profile data
    let profileDF = new DataIngestor(profileData, profile, isAggregate).processRaw();

    // join with previous profile data, and with renamed columns
    profileDF = profileDF.join(
      new DataIngestor(previousProfileData, profile, isAggregate, /* is previous */ true).processRaw('previous'),
      'variable',
    );
//
//    // if compare, get compare data
//    if (compare) {
//      const compareProfileData = await app.db.query(profileQuery(profile, compare));
//      profileDF = profileDF.join(
//        new DataIngestor(compareProfileData, profile, isAggregate).processRaw('comparison'),
//        'variable',
//      );
//    }
//
//    // easier to do the remaining calculations on array of objects
//    const profileObj = profileDF.toCollection();
//
//    // TODO move all of this "config" into the front end
//    const variables = tableConfigs[profile] || [];
//
//    /* eslint-disable */
//    profileObj.map((row) => {
//      const updatedRow = row;
//      doChangeCalculations(updatedRow);
//      if (compare) doDifferenceCalculations(updatedRow);
//      // TODO remove when config is in front end
//      updatedRow.rowConfig = find(variables, ['variable', updatedRow.variable]) || {};
//    });
//    /* eslint-enable */
//    // send profileObj as response
//    return res.send({ data: profileObj });
    debugger;
    return res.send({ data: profileDF.count() });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Failed to create profile' });
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
  if (validProfiles.includes(pro)) return false;
  return true;
}

module.exports = router;
