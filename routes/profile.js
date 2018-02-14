const express = require('express');
const _ = require('lodash');
const cwait = require('cwait');
const carto = require('../utils/carto');
const Selection = require('../models/selection');
const buildProfileSQL = require('../query-helpers/profile');
const buildProfileSingleSQL = require('../query-helpers/profile-single');
const buildDecennialSQL = require('../query-helpers/decennial');
const tableConfigs = require('../table-config');
const delegateAggregator = require('../utils/delegate-aggregator');
const nestProfile = require('../utils/nest-profile');
const d3collection = require('d3-collection');
const { Client } = require('pg');
const PgError = require('pg-error');

const { TaskQueue } = cwait;
const router = express.Router();
const { nest } = d3collection;

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

const tableNames = [
  'population_density',
  'sex_age',
  'mutually_exclusive_race',
  'hispanic_subgroup',
  'asian_subgroup',
  'relationship_head_householder',
  'household_type',
  'housing_occupancy',
  'housing_tenure',
  'tenure_by_age',
  'household_size',
];

const buildOrderedResponse = (data, profile) => {
  const tableConfig = get(tableConfigs, `${profile}`) || [];
  const fullDataset = nest()
    .key(d => get(d, 'category'))
    .entries(data)
    .map((nestedTable) => {
      const newTableObject = {};
      newTableObject.tableId = nestedTable.key;
      newTableObject.rows = nestedTable.values;
      return newTableObject;
    });

  const foundTableRowGroupings = Object.keys(tableConfig).map(tableId => ({
    tableId,
    rows: tableConfig[tableId]
      .filter(rowConfig => rowConfig.variable)
      .map(rowConfig => find(data, ['variable', rowConfig.variable])),
  }));
  return merge(foundTableRowGroupings, fullDataset);
};

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

// handle decennial profile route
router.get('/:id/decennial', (req, res) => {
  const { id: _id } = req.params;
  const { compare = 0 } = req.query;

  Selection.findOne({ _id })
    .then((match) => {
      const SQL = buildDecennialSQL(match.geoids, compare)

      // match.geoids is an array of geoids to query with
      // carto.SQL(SQL, 'json', 'post')
      client.connect();

      client
        .query(SQL)
        .then(data => appendRowConfig(data.rows, 'decennial', match))
        // .then(data => buildOrderedResponse(data, profile))
        .then((data) => {
          res.send(data);
        })
        .catch((error) => { res.status(500).send({ error }); });
    });
});

// handle all other profile routes
router.get('/:id/:profile', (req, res) => {
  const { id: _id, profile } = req.params;
  const { compare = 0 } = req.query;

  Selection.findOne({ _id })
    .then((match) => {
      let SQL = buildProfileSQL(profile, match.geoids, compare);
      if (match.geoids.length === 1) {
        SQL = buildProfileSingleSQL(profile, match.geoids[0], compare);
      }

      // match.geoids is an array of geoids to query with
      // carto.SQL(SQL, 'json', 'post')
      client.connect();

      client
        .query(SQL)
        .then(data => appendRowConfig(data.rows, profile, match))
        // .then(data => buildOrderedResponse(data, profile))
        .then((data) => {
          res.send(data);
        })
        .catch((error) => { res.status(500).send({ error }); });
    });
});

module.exports = router;
