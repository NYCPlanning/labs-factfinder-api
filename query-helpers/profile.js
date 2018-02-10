// return a comma-separated string of single-quoted numbers from an array of numbers
function stringifyArray(array) {
  return `'${array.join("','")}'`;
}

const buildSQL = function buildSQL(profile, ids, compare) {
  const idStrings = stringifyArray(ids);

  // WARNING: although our Carto backend will prevent any
  // malicious SQL injection, maintainers might consider
  // migrating to Postgres which would make it very easy for
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

    SELECT
      *,
      CASE
        WHEN ABS(SQRT(POWER(m / 1.645, 2) %2B POWER(comparison_m / 1.645, 2)) * 1.645) > ABS(comparison_sum - sum) THEN false
        ELSE true
      END AS significant,
      CASE
        WHEN ABS(SQRT(POWER(percent_m / 1.645, 2) %2B POWER(comparison_percent_m / 1.645, 2)) * 1.645) > ABS(comparison_percent - percent) THEN false
        ELSE true
      END AS percent_significant,

      (sum - comparison_sum) AS difference_sum,

      CASE 
        WHEN (((percent - comparison_percent) * 100) < 0 AND ((percent - comparison_percent) * 100) > -0.05) THEN
          0
        ELSE
          (percent - comparison_percent) * 100
      END AS difference_percent,

      (SQRT((POWER(m, 2) %2B POWER(comparison_m, 2)))) AS difference_m,
      (SQRT((POWER(percent_m * 100, 2) %2B POWER(comparison_percent_m * 100, 2)))) AS difference_percent_m,

      CASE
        WHEN is_most_recent THEN
          percent - previous_percent
      END as change_percentage_point,

      CASE
        WHEN is_most_recent THEN
          (SQRT((POWER(previous_percent_m, 2) %2B POWER(percent_m, 2))))
      END as change_percentage_point_m,

      CASE
        WHEN (change_m < ABS(change_sum)) THEN
          TRUE
        ELSE
          FALSE
      END as change_significant,

      CASE
        WHEN (change_percent_m < ABS(change_percent)) THEN
          TRUE
        ELSE
          FALSE
      END as change_percent_significant,

      CASE
        WHEN (ABS((SQRT((POWER(previous_percent_m, 2) %2B POWER(percent_m, 2))))) < (percent - previous_percent)) THEN
          TRUE
        ELSE
          FALSE
      END as change_percentage_point_significant

    FROM (
      SELECT
        ENCODE(CONVERT_TO(variable || dataset, 'UTF-8'), 'base64') As id,
        base,
        variable AS variablename,
        category,
        regexp_replace(lower(dataset), '[^A-Za-z0-9]', '_', 'g') AS dataset,
        regexp_replace(lower(profile), '[^A-Za-z0-9]', '_', 'g') AS profile,
        regexp_replace(lower(variable), '[^A-Za-z0-9]', '_', 'g') AS variable,
        is_most_recent,

        sum,
        m,
        cv,
        ROUND((SUM / NULLIF(base_sum,0))::numeric, 4) as percent,
        ROUND((previous_sum / NULLIF(previous_base_sum,0))::numeric, 4) as previous_percent,
        previous_sum,
        previous_m,

        CASE
          WHEN (POWER(m, 2) %2D POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2)) < 0
            THEN (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) %2B POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))
          ELSE (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) %2D POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))
        END as percent_m,

        CASE
          WHEN (POWER(previous_m, 2) %2D POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2)) < 0
            THEN (1 / NULLIF(previous_base_sum,0)) * SQRT(POWER(previous_m, 2) %2B POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2))
          ELSE (1 / NULLIF(previous_base_sum,0)) * SQRT(POWER(previous_m, 2) %2D POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2))
        END as previous_percent_m,

        CASE 
          WHEN (cv < 20)
            THEN true
          ELSE false
        END as is_reliable,

        comparison_cv,
        comparison_m,
        comparison_sum,
        ROUND((comparison_sum / NULLIF(comparison_base_sum,0))::numeric, 4) as comparison_percent,

        CASE
          WHEN (POWER(comparison_m, 2) %2D POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2)) < 0
            THEN (1 / NULLIF(comparison_base_sum,0)) * SQRT(POWER(comparison_m, 2) %2B POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2))
          ELSE (1 / NULLIF(comparison_base_sum,0)) * SQRT(POWER(comparison_m, 2) %2D POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2))
        END as comparison_percent_m,

        CASE 
          WHEN (comparison_cv < 20)
            THEN true
          ELSE false
        END as comparison_is_reliable,

        CASE
          WHEN is_most_recent THEN
            sum - previous_sum
        END as change_sum,

        CASE
          WHEN is_most_recent THEN
            ABS(SQRT(POWER(m, 2) %2B POWER(previous_m, 2)))
        END as change_m,

        CASE
          WHEN is_most_recent THEN
            ROUND(((sum - previous_sum) / NULLIF(previous_sum,0))::numeric, 4)
        END as change_percent,

        CASE
          WHEN is_most_recent THEN
            ABS(sum / NULLIF(previous_sum,0)) 
            * SQRT(
              (POWER(m / 1.645, 2) / POWER(sum, 2))
              %2B (POWER(previous_m / 1.645, 2) / POWER(previous_sum, 2))
            ) * 1.645
        END as change_percent_m

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
      ) a
  `;
};

module.exports = buildSQL;
