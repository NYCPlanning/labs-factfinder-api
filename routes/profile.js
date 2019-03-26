const express = require('express');
const _ = require('lodash');

const {
  get, camelCase, find, merge,
} = _;

const Selection = require('../models/selection');
const buildProfileSQL = require('../query-helpers/profile');
const buildProfileSingleSQL = require('../query-helpers/profile-single');
const buildDecennialSQL = require('../query-helpers/decennial');
const tableConfigs = require('../table-config');
const delegateAggregator = require('../utils/delegate-aggregator');
const nestProfile = require('../utils/nest-profile');

const router = express.Router();


router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=0');
  next();
});

/*
 * Augments raw SQL row data by TODO: nestProfile explainer, and adding 'config' data:
 * - rowConfig: TODO
 * - special: boolean indicating if this row was derived by a special calculation
 * - category: normalized (camelCased) category name
 * - numGeoids: The number of geoids (i.e. individual selection 'units') that were used to compute the row values
 */
function appendRowConfig(data, profile, match) {
  const fullDataset = nestProfile(data, 'object', 'dataset', 'variable');

  return data
    .map((row) => {
      let rowWithConfig = row;
      const { category, variable, dataset } = row;
      const categoryNormalized = camelCase(category);
      const variables = get(tableConfigs, `${profile}.${categoryNormalized}`) || [];
      rowWithConfig.rowConfig = find(variables, ['variable', variable]) || {};
      rowWithConfig.special = !!get(rowWithConfig, 'rowConfig.special');
      rowWithConfig.category = categoryNormalized;
      rowWithConfig.numGeoids = match.geoids.length;

      // this is a special metadata object that lets the client
      // know which estimates were bottom coded with which direction.
      // The `delegateAggregator` special function `interpolate`
      // specifically assigns properties to this object.
      rowWithConfig.codingThresholds = {};

      /*
       * If this variable (row) has columns that require special calculation for aggregate datasets (geoids.length >1),
       * then replace raw SQL values with recalculated aggreate values
       */
      if (rowWithConfig.special && (match.geoids.length > 1)) {
        const currentYear = get(fullDataset, dataset);
        const newRowObject = delegateAggregator(rowWithConfig, rowWithConfig.rowConfig, currentYear);
        rowWithConfig = merge(newRowObject, rowWithConfig);
      }

      return rowWithConfig;
    });
}

/*
 * Augments SQL row by adding an `is_reliable` boolean flag and statistical
 * reliability values:
 * - is_reliable: true if "cv" < 20 and value has not been top/bottom coded
 * - comparison_is_reliable: true if comparison "cv" < 20 and value has not been top/bottom coded
 * - significant: true if difference  significance < 20
 * - change_significant: true if change significance < 20
 * - change_percent_significant
 */
function appendIsReliable(data) {
  return data.map((row) => {
    const appendedRow = row;
    appendedRow.is_reliable = false;
    appendedRow.comparison_is_reliable = false;

    const {
      cv,
      comparison_cv,
      codingThresholds,
      change_m,
      change_sum,
      change_percent_m,
      change_percent,
      difference_sum,
      difference_m,
    } = appendedRow;

    // set reliability to true if cv is less than 20
    if (cv !== null && cv < 20) appendedRow.is_reliable = true;
    if (comparison_cv !== null && comparison_cv < 20) appendedRow.comparison_is_reliable = true;

    // set reliability to false if the value is top or bottom-coded
    if (codingThresholds.sum) appendedRow.is_reliable = false;
    if (codingThresholds.comparison_sum) appendedRow.comparison_is_reliable = false;

    // calculate significance
    appendedRow.significant = ((((difference_m) / 1.645) / Math.abs(difference_sum)) * 100) < 20;
    appendedRow.change_significant = ((((change_m) / 1.645) / Math.abs(change_sum)) * 100) < 20;
    appendedRow.change_percent_significant = ((((change_percent_m) / 1.645) / Math.abs(change_percent)) * 100) < 20;

    return appendedRow;
  });
}
function invalidCompare(compare) {
  const cityOrBoro = compare.match(/[0-5]{1}/);
  const nta = compare.match(/[A-Z]{2}[0-9]{2}/);
  const puma = compare.match(/[0-9]{4}/);

  if (cityOrBoro || nta || puma) return false;
  return true;
}

function invalidProfile(profile) {
  const validProfiles = ['decennial', 'demographic', 'social', 'economic', 'housing'];
  return !validProfiles.includes(profile);
}

function getQuery(match, profile, compare) {
  if (profile === 'decennial') {
    return buildDecennialSQL(match.geoids, compare);
  }

  if (match.geoids.length === 1) {
    return buildProfileSingleSQL(profile, match.geoids[0], compare);
  }

  return buildProfileSQL(profile, match.geoids, compare);
}

router.get('/:id/:profile', (req, res) => {
  const { app } = req;

  const { id: _id, profile } = req.params;
  const { compare = '0' } = req.query;

  // validate compare
  if (invalidCompare(compare)) res.status(500).send({ error: 'invalid compare param' });

  // validate profile
  if (invalidProfile(profile)) res.status(500).send({ error: 'invalid profile' });

  Selection.findOne({ _id })
    .then((match) => {
      const query = getQuery(match, profile, compare);
      app.db.query(query)
        .then(data => appendRowConfig(data, profile, match))
        .then(data => appendIsReliable(data))
        .then((data) => {
          res.send(data);
        })
        .catch((error) => { res.status(500).send({ error: error.toString() }); });
    });
});

module.exports = router;
