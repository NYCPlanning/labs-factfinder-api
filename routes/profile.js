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
          *,
          (((m / 1.645) / NULLIF(SUM,0)) * 100) AS cv
        FROM (
          SELECT
            sum(e),
            sqrt(sum(power(m, 2))) AS m,
            base,
            category,
            variable,
            profile,
            dataset
          FROM enriched_selection
          GROUP BY variable, dataset, base, category, profile
        ) x
      ),

      base_numbers AS (
        SELECT
          sum(e) AS base_sum,
          sqrt(sum(power(m, 2))) AS base_m,
          max(base) AS base_join,
          max(dataset) AS base_dataset
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
          *,
          (((comparison_m / 1.645) / comparison_sum) * 100) AS comparison_cv
        FROM (
          SELECT
            sum(e) AS comparison_sum,
            sqrt(sum(power(m, 2))) AS comparison_m,
            base AS comparison_join,
            variable AS comparison_variable,
            dataset AS comparison_dataset
          FROM comparison_enriched_selection
          GROUP BY variable, dataset, base
        ) x
      ),

      comparison_base_numbers AS (
        SELECT
          sum(e) AS comparison_base_sum,
          sqrt(sum(power(m, 2))) AS comparison_base_m,
          base AS comparison_base_join,
          dataset AS comparison_base_dataset
        FROM comparison_enriched_selection
        WHERE base = variable
        GROUP BY variable, dataset, base
      )



    SELECT
      base,
      base_m,
      base_sum,
      base_dataset,
      category,
      comparison_base_m,
      comparison_base_sum,
      comparison_base_dataset,
      comparison_cv,
      comparison_m,
      comparison_sum,
      cv,
      dataset,
      m,
      sum,
      variable AS variablename,

      ROUND((comparison_sum / NULLIF(comparison_base_sum,0))::numeric, 4) as comparison_percent,

      CASE
        WHEN (POWER(comparison_m, 2) %2D POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2)) < 0
          THEN (1 / NULLIF(comparison_base_sum,0)) * SQRT(POWER(comparison_m, 2) %2B POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2))
        ELSE (1 / NULLIF(comparison_base_sum,0)) * SQRT(POWER(comparison_m, 2) %2D POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2))
      END as comparison_percent_m,

      ENCODE(CONVERT_TO(variable || dataset, 'UTF-8'), 'base64') As id,

      ROUND((SUM / NULLIF(base_sum,0))::numeric, 4) as percent,

      CASE
        WHEN (POWER(m, 2) %2D POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2)) < 0
          THEN (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) %2B POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))
        ELSE (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) %2D POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))
      END as percent_m,

      regexp_replace(lower(profile), '[^A-Za-z0-9]', '_', 'g') AS profile,

      regexp_replace(lower(variable), '[^A-Za-z0-9]', '_', 'g') AS variable
    FROM main_numbers

    INNER JOIN comparison_main_numbers
      ON main_numbers.variable = comparison_main_numbers.comparison_variable
      AND main_numbers.dataset = comparison_main_numbers.comparison_dataset

    LEFT OUTER JOIN base_numbers
      ON main_numbers.base = base_numbers.base_join
      AND main_numbers.dataset = base_numbers.base_dataset

    LEFT OUTER JOIN comparison_base_numbers
      ON main_numbers.base = comparison_base_numbers.comparison_base_join
      AND dataset = comparison_base_numbers.comparison_base_dataset
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
