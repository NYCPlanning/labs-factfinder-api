const express = require('express');
const _ = require('lodash');

const Selection = require('../models/selection');
const profileQuery = require('../query-helpers/base_profile');
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
    const selectedGeo = await Selection.findOne({_id});
    const isAggregate = selectedGeo.geoids.length > 1;

    // get data from postgres
    const [profileData, previousProfileData] = await Promise.all([
      app.db.query(profileQuery(profile, selectedGeo.geoids)),
      app.db.query(profileQuery(profile, selectedGeo.geoids, /*is previous*/ true)),
    ]);

    // create Dataframe from profile data
    let profileDF = new DataIngestor(profileData, profile, isAggregate).processRaw();

    // join with previous profile data, and with renamed columns
    profileDF = profileDF.join(
      new DataIngestor(previousProfileData, profile, isAggregate, /*is previous*/ true).processRaw().prefixCols('previous')
    );

    // if compare, get compare data
    if (compare) {
      const compareProfileData = await app.db-query(profileQuery(profile, compare));
      profileDF = profileDF.join(
        new DataIngestor(compareProfileData, profile, isAggregate, /*is previous*/ false).processRaw().prefixCols('comparison')
      );
    }

    // easier to do the remaining calculations on array of objects
    const profileObj = profileDf.toCollection();

    //TODO move all of this "config" into the front end
    const categoryNormalized = camelCase(category);
    const variables = get(tableConfigs, `${profile}.${categoryNormalized}`) || [];

    profileObj.map(row => {
      const updatedRow = row;
      calculateChangeAndDifference(updatedRow)
      // TODO remove when config is in front end
      row.rowConfig = find(variables, ['variable', variable]) || {};
    });

  } catch(e) {
    return res.status(500).send({ error: 'Failed to create profile' });
  }
});

function calculateChangeAndDifference(row) {
  const updatedRow = row;
  doChangeCalculations(updatedRow);
  doDifferenceCalculations(updatedRow);
  return row;
}

function invalidCompare(comp) {
  const cityOrBoro = comp.match(/[0-5]{1}/);
  const nta = comp.match(/[A-Z]{2}[0-9]{2}/);
  const puma = comp.match(/[0-9]{4}/);

  return (cityOrBoro || nta || puma) return false;
  return true;
}

function invalidProfile(pro) {
  const validProfiles = ['decennial', 'demographic', 'social', 'economic', 'housing'];
  return validProfiles.includes(pro) return false;
  return true;
}
