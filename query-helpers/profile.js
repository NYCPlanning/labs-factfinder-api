const buildFinalSelection = require('../query-helpers/final-select');

// return a comma-separated string of single-quoted numbers from an array of numbers
function stringifyArray(array) {
  return `'${array.join("','")}'`;
}

const buildSQL = function buildSQL(profile, ids, compare) {
  const idStrings = stringifyArray(ids);

  // This is the series of FROM statements needed to build out
  // the final selections that must be consistent
  // across queries
  const finalFromStatements = /* highlighter */`
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

  // WARNING: although our Carto backend will prevent any
  // malicious SQL injection, maintainers might consider
  // migrating to Postgres which would then make it very easy for
  // malicious code to be inserted
  return /* syntax highlighting */`
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
          (((m / 1.645) / NULLIF(SUM,0)) * 100) AS cv,
          CASE 
            WHEN is_most_recent THEN
              lag(sum) over (order by variable, dataset)
          END as previous_sum,

          CASE 
            WHEN is_most_recent THEN
              lag(m) over (order by variable, dataset)
          END as previous_m
        FROM (
          SELECT
            sum(e),
            sqrt(sum(power(m, 2))) AS m,
            CASE
              WHEN max(dataset) over () = dataset THEN
                TRUE
              ELSE
                FALSE
            END as is_most_recent,
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
          max(dataset) AS base_dataset,
          lag(sum(e)) over (order by variable, dataset) AS previous_base_sum,
          lag(sqrt(sum(power(m, 2)))) over (order by variable, dataset) AS previous_base_m
        FROM enriched_selection
        WHERE base = variable
        GROUP BY variable, dataset
      ),

      comparison_selection AS (
        SELECT *
        FROM ${profile}
        WHERE geoid IN ('${compare}')
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

      ${buildFinalSelection(finalFromStatements)}

  `;
};

module.exports = buildSQL;
