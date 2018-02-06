const express = require('express');
const carto = require('../utils/carto');
const Selection = require('../models/selection');
const buildProfileSQL = require('../query-helpers/profile');
const buildDecennialSQL = require('../query-helpers/decennial');
const tableConfig = require('../table-config');

const router = express.Router();

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

router.get('/:id/decennial', (req, res) => {
  const { id: _id } = req.params;
  Selection.findOne({ _id })
    .then((match) => {
      // match.geoids is an array of geoids to query with
      const apiCalls = tableNames.map((tableName) => { // eslint-disable-line
        return carto.SQL(buildDecennialSQL(`decennial_${tableName}`, match.geoids, 0));
      });

      Promise.all(apiCalls)
        .then((responses) => {
          res.send(responses.reduce((a, b) => a.concat(b)));
        });
    });
});

router.get('/:id/:profile', (req, res) => {
  const { id: _id, profile } = req.params;
  Selection.findOne({ _id })
    .then((match) => {
      // match.geoids is an array of geoids to query with
      carto.SQL(buildProfileSQL(profile, match.geoids, 0), 'json', 'post')
        .then((data) => {
          console.log(tableConfig)

          const categoryNormalized = category.camelize();
          const variables = get(tableConfigs, `${profile}.${categoryNormalized}`) || [];
          const foundVariable = variables.findBy('data', variableName);



        })
        .then((data) => {
          res.send(data);
        });
    });
});

module.exports = router;
