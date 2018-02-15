const express = require('express');
const _ = require('lodash');
const { Client } = require('pg');
const PgError = require('pg-error');

const Selection = require('../models/selection');
const buildProfileSQL = require('../query-helpers/profile');
const buildProfileSingleSQL = require('../query-helpers/profile-single');
const buildDecennialSQL = require('../query-helpers/decennial');
const tableConfigs = require('../table-config');
const delegateAggregator = require('../utils/delegate-aggregator');
const nestProfile = require('../utils/nest-profile');

const router = express.Router();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const { connection } = client;
connection.parseE = PgError.parse;
connection.parseN = PgError.parse;

function emitPgError(err) {
  switch (err.severity) {
    case 'ERROR':
    case 'FATAL':
    case 'PANIC': return this.emit('error', err);
    default: return this.emit('notice', err);
  }
}

connection.on('PgError', emitPgError);

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

const invalidCompare = (compare) => {
  const cityOrBoro = compare.match(/[0-5]{1}/);
  const nta = compare.match(/[A-Z]{2}[0-9]{2}/);
  const puma = compare.match(/[0-9]{4}/);

  if (cityOrBoro || nta || puma) return false;
  return true;
};


router.get('/:id/:profile', (req, res) => {
  const { id: _id, profile } = req.params;
  const { compare = 0 } = req.query;

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

      // match.geoids is an array of geoids to query with
      client.connect();

      client
        .query(SQL)
        .then(data => appendRowConfig(data.rows, profile, match))
        .then((data) => {
          res.send(data);
        })
        .catch((error) => { res.status(500).send({ error }); });
    });
});

module.exports = router;
