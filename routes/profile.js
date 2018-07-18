const express = require('express');
const _ = require('lodash');

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

const {
  get, camelCase, find, merge,
} = _;

const appendRowConfig = (data, profile, match) => {
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

      // if the row is "special" and the number of geoids in the
      // selection are greater than 1
      // then, delete the unneeded special calculations data

      if (rowWithConfig.special && (match.geoids.length > 1)) {
        const currentYear = get(fullDataset, dataset);
        const newRowObject = delegateAggregator(rowWithConfig, rowWithConfig.rowConfig, currentYear);
        rowWithConfig = merge(newRowObject, rowWithConfig);
      }

      return rowWithConfig;
    });
};

const appendIsReliable = data => (data.map((row) => {
  const appendedRow = row;
  appendedRow.is_reliable = false;
  appendedRow.comparison_is_reliable = false;

  const {
    cv, comparison_cv, codingThresholds, change_m, change_sum, change_percent_m, change_percent,
    difference_sum, difference_m,
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
}));

const invalidCompare = (compare) => {
  const cityOrBoro = compare.match(/[0-5]{1}/);
  const nta = compare.match(/[A-Z]{2}[0-9]{2}/);
  const puma = compare.match(/[0-9]{4}/);

  if (cityOrBoro || nta || puma) return false;
  return true;
};


router.get('/:id/:profile', (req, res) => {
  const { app } = req;

  const { id: _id, profile } = req.params;
  const { compare = '0' } = req.query;

  // validate compare
  if (invalidCompare(compare)) res.status(500).send({ error: 'invalid compare param' });

  // validate profile
  const validProfiles = ['decennial', 'demographic', 'social', 'economic', 'housing'];
  if (validProfiles.indexOf(profile) === -1) res.status(500).send({ error: 'invalid profile' });

  Selection.findOne({ _id })
    .then((match) => {
      let SQL;

      if (profile === 'decennial') {
        SQL = buildDecennialSQL(match.geoids, compare);
      } else if (match.geoids.length === 1) {
        SQL = buildProfileSingleSQL(profile, match.geoids[0], compare);
      } else {
        SQL = buildProfileSQL(profile, match.geoids, compare);
      }

      app.db.query(SQL)
        .then(data => appendRowConfig(data, profile, match))
        .then(data => appendIsReliable(data))
        .then((data) => {
          res.send(data);
        })
        .catch((error) => { res.status(500).send({ error }); });
    });
});

module.exports = router;
