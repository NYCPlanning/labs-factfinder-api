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
  const { compare = '0', curYear='', prevYear='' } = req.query;

  // validate dataset year strings
  if (!curYear || !prevYear) res.status(500).send({ error: 'invalid year params' });

  // validate compare
  if (invalidCompare(compare)) res.status(500).send({ error: 'invalid compare param' });

  // validate profile
  if (invalidProfile(profile)) res.status(500).send({ error: 'invalid profile' });

  try {
    const selectedGeo = await Selection.findOne({_id});
    const isAggregate = selectedGeo.geoids.length > 1;
    
    // get data from postgres
    const [profileData, previousProfileData] = await Promise.all([
      app.db.query(profileQuery(profile, selectedGeo.geoids, curYear)),
      app.db.query(profileQUery(profile, selectedGeo.geoids, prevYear)),
    ]);

    // turn into DataFrames and join current and prev
    let profileDF = new DataIngestor(profileData, profile, isAggregate).processRaw();
    // column name overrides for "previous_data"
    profileDF = profileDF.join(
      new DataIngestor(previousProfileData, profile, isAggregate, true).processRaw()
    );

    // do change calculations! 

    // calculate previous/change values, apply any necessary calculations
    //if j0(compare) const compareProfile = await app.db-query(profileQuery(profile, compare, curYear));
  } catch(e) {
    console.log("Failed to get some data from postgres", e);
    return res.status(500).send({ error: 'Failed to query database' });
  }
});

function doSpecialCalculations(df, data, special) {
  return df.chain(
    row => recomputeSpecialVars(row, data, special)
  );
}

/*
 * row - dataframe-js Row
 * data - POJO containing full dataset from original SQL query
 * special - config for special recalculations, includes types, args, etc
 */
function recomputeSpecialVars(row, data, special) {
  if(row.get('specialType') === undefined) return;

  recomputeSum(row, data, special);
  recomputeM(row, data, special);
}

function recomputeSum(row, data, special) {
  const variable = row.get('variable');
  const options = find(special, ['variable', variable]);
  const type = row.get('specialType');
  if(type === 'median') {
    const { trimmedEstimate, codingThreshold } = interpolate(data, options, row.toDict());
    row.set('sum', trimmedEstimate);
    if (codingThreshold) row.set('codingThreshold', codingThreshold);
  } else {
    const sum = formula.execute(data, variable, formulas[type], options.args);
    row.set('sum', sum);
  }
}

function recomputeM(row, data, special) {
  if(type === 'median') {
    const marginOfError = calculateMedianError(data, options);
    row.set('sum', marginOfError);
  } else {
    formulas.execute(data, variable, formulas[type], options.args);
  }
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
  return !validProfiles.includes(pro);
}
