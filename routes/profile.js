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

const { TaskQueue } = cwait;
const router = express.Router();
const { nest } = d3collection;

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=2592000');
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
      // Create queue and limit # of concu
      const queue = new TaskQueue(Promise, 2);
      // match.geoids is an array of geoids to query with
      const apiCalls = tableNames.map(queue.wrap((tableName) => { // eslint-disable-line
        return carto.SQL(buildDecennialSQL(`decennial_${tableName}`, match.geoids, compare), 'json', 'post');
      }));

      Promise.all(apiCalls)
        .then(responses => responses.reduce((a, b) => a.concat(b)))
        .then(data => appendRowConfig(data, 'decennial', match))
        .then(data => buildOrderedResponse(data, 'decennial'))
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
      carto.SQL(SQL, 'json', 'post')
        .then(data => appendRowConfig(data, profile, match))
        .then(data => buildOrderedResponse(data, profile))
        .then((data) => {
          res.send(data);
        });
    });
});

module.exports = router;
