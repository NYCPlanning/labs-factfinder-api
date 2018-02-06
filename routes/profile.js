const express = require('express');
const _ = require('lodash');
const carto = require('../utils/carto');
const Selection = require('../models/selection');
const buildProfileSQL = require('../query-helpers/profile');
const buildProfileSingleSQL = require('../query-helpers/profile-single');
const buildDecennialSQL = require('../query-helpers/decennial');
const tableConfigs = require('../table-config');
const delegateAggregator = require('../utils/delegate-aggregator');
const nestProfile = require('../utils/nest-profile');

const router = express.Router();
const {
  get, set, camelCase, find, merge, clone,
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

// handle decennial profile route
router.get('/:id/decennial', (req, res) => {
  const { id: _id } = req.params;
  const { compare = 0 } = req.query;

  Selection.findOne({ _id })
    .then((match) => {
      // match.geoids is an array of geoids to query with
      const apiCalls = tableNames.map((tableName) => { // eslint-disable-line
        return carto.SQL(buildDecennialSQL(`decennial_${tableName}`, match.geoids, compare), 'json', 'post');
      });

      Promise.all(apiCalls)
        .then((responses) => {
          res.send(responses.reduce((a, b) => a.concat(b)));
        });
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
        .then((data) => {
          const fullDataset = nestProfile(data, 'dataset', 'variable');

          return data
            .map((row) => {
              let rowWithConfig = row;
              const { category, variable, dataset } = row;
              const categoryNormalized = camelCase(category);
              const variables = get(tableConfigs, `${profile}.${categoryNormalized}`) || [];
              rowWithConfig.rowConfig = find(variables, ['data', variable]) || {};
              rowWithConfig.special = !!get(rowWithConfig, 'rowConfig.special');

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
        })
        .then((data) => {
          res.send(data);
        });
    });
});

module.exports = router;
