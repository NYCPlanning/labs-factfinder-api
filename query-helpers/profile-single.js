// ACS profile query for single geoid, no agg fucntions
const buildFinalSelection = require('../query-helpers/final-select');

const buildSQL = function buildSQL(profile, geoid, compare) {
  const finalFromStatements = /* highlight */`
    FROM filtered_selection
    LEFT OUTER JOIN comparison_selection
      ON filtered_selection.variable = comparison_selection.comparison_variable
      AND filtered_selection.dataset = comparison_selection.comparison_dataset
  `;

  return /* syntax highlighting */`
    WITH
      filtered_selection AS (
        SELECT *
        FROM ${profile}
        INNER JOIN support_fact_finder_meta_1
          ON support_fact_finder_meta_1.variablename = variable
        WHERE geoid = '${geoid}'
      ),
      comparison_selection AS (
        SELECT e as comparison_sum,
          (((m / 1.645) / NULLIF(e,0)) * 100) AS comparison_cv,
          variable as comparison_variable,
          dataset as comparison_dataset,
          ROUND(p::numeric, 4) / 100 as comparison_percent,
          ROUND(z::numeric, 4) / 100 as comparison_percent_m,
          m as comparison_m
        FROM ${profile}
        INNER JOIN support_fact_finder_meta_1
          ON support_fact_finder_meta_1.variablename = variable
        WHERE geoid = '${compare}'
      )

      ${buildFinalSelection(finalFromStatements)}
  `;
};

module.exports = buildSQL;
