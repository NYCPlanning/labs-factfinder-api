const express = require('express');
const carto = require('../utils/carto');
const Selection = require('../models/selection');

const router = express.Router();

// return a comma-separated string of single-quoted numbers from an array of numbers
function stringifyArray(array) {
  return `'${array.join("','")}'`;
}

function buildSQL(profile, ids, comparator = 0) {
  const idStrings = stringifyArray(ids);

  return `
    WITH
      filtered_selection AS (
        SELECT *
        FROM ${profile}
        WHERE geoid IN (${idStrings})
      ),

      enriched_selection AS (
        SELECT *
        FROM filtered_selection
        INNER JOIN support_fact_finder_metadata_v3
          ON support_fact_finder_metadata_v3.variablename = filtered_selection.variable
      ),

      main_numbers AS (
        SELECT
          sum(e),
          base,
          category,
          variable,
          dataset
        FROM enriched_selection
        GROUP BY variable, dataset, base, category
      ),

      base_numbers AS (
        SELECT
          sum(e) AS base_sum,
          sqrt(sum(power(m, 2))) AS base_m,
          max(base) AS base_join,
          max(dataset) AS base_year
        FROM enriched_selection
        WHERE base = variable
        GROUP BY variable, dataset
      ),

      comparison_selection AS (
        SELECT *
        FROM ${profile}
        WHERE geoid IN ('${comparator}')
      ),

      comparison_enriched_selection AS (
        SELECT *
        FROM comparison_selection
        INNER JOIN support_fact_finder_metadata_v3
          ON support_fact_finder_metadata_v3.variablename = comparison_selection.variable
      ),

      comparison_main_numbers AS (
        SELECT
          sum(e) AS comparison_sum,
          sqrt(sum(power(m, 2))) AS comparison_m,
          base AS comparison_join,
          dataset AS comparison_year
        FROM comparison_enriched_selection
        GROUP BY variable, dataset, base
      ),

      comparison_base_numbers AS (
        SELECT
          sum(e) AS comparison_base_sum,
          sqrt(sum(power(m, 2))) AS comparison_base_m,
          base AS comparison_base_join,
          dataset AS comparison_base_year
        FROM comparison_enriched_selection
        WHERE base = variable
        GROUP BY variable, dataset, base
      )

    SELECT * FROM comparison_base_numbers
  `;
}

router.get('/:id/:profile', (req, res) => {
  const { id: _id, profile } = req.params;
  Selection.findOne({ _id })
    .then((match) => {
      // match.geoids is an array of geoids to query with
      carto.SQL(buildSQL(profile, match.geoids, 0))
        .then((data) => {
          res.send(data);
        });
    });
});

module.exports = router;

// hash submission => check to see if hash already exists in database =>
// if it does, return looked up hash, if not return new hash
