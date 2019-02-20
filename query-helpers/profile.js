// return a comma-separated string of single-quoted numbers from an array of numbers
function stringifyArray(array) {
  return `'${array.join("','")}'`;
}

const buildSQL = function buildSQL(profile, ids, compare) {
  const idStrings = stringifyArray(ids);
  // const { length } = idStrings;
  // WARNING: although our Carto backend will prevent any
  // malicious SQL injection, maintainers might consider
  // migrating to Postgres which would make it very easy for
  // malicious code to be inserted
  return /**/`
    WITH
      filtered_selection AS (
        SELECT *
        FROM ${profile}
        WHERE geoid IN (${idStrings})
      ),

      enriched_selection AS (
        SELECT *
        FROM filtered_selection
        INNER JOIN factfinder_metadata
          ON factfinder_metadata.variablename = filtered_selection.variable
      ),

      main_numbers AS (
        SELECT
          *,

          -- cv --
          (((m / 1.645) / NULLIF(SUM,0)) * 100) AS cv,

          -- previous_est --
          CASE
            WHEN is_most_recent THEN
              lag(est) over (order by variable, dataset)
          END AS previous_est,

          -- previous_moe --
          CASE
            WHEN is_most_recent THEN
              lag(m) over (order by variable, dataset)
          END AS previous_moe
        FROM (
          SELECT
            -- est --
            est(e) AS est,

            -- m --
            SQRT(SUM(POWER(m, 2))) AS m,

            -- is_most_recent --
            CASE
              WHEN max(dataset) over () = dataset THEN
                TRUE
              ELSE
                FALSE
            END AS is_most_recent,

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
          -- base_est --
          SUM(e) AS base_est,

          -- base_moe --
          SQRT(SUM(POWER(m, 2))) AS base_moe,

          -- base_join --
          MAX(base) AS base_join,

          -- base_dataset --
          MAX(dataset) AS base_dataset,

          -- previous_base_est --
          LAG(SUM(e)) over (order by variable, dataset) AS previous_base_est,

          -- previous_base_moe --
          LAG(SQRT(SUM(POWER(m, 2)))) over (order by variable, dataset) AS previous_base_moe
        FROM enriched_selection
        WHERE base = variable
        GROUP BY variable, dataset
      ),

      comparison_selection AS (
        SELECT *
        FROM ${profile}
        WHERE geoid = '${compare}'
      ),

      comparison_enriched_selection AS (
        SELECT *
        FROM comparison_selection
        INNER JOIN factfinder_metadata
          ON factfinder_metadata.variablename = comparison_selection.variable
      ),

      comparison_moeain_numbers AS (
        SELECT
          *
        FROM (
          SELECT
            -- comparison_est --
            e AS comparison_est,

            -- comparison_moe --
            m AS comparison_moe,

            -- comparison_percent --
            (p / 100) AS comparison_percent,

            -- comparison_percent_moe --
            (z / 100) AS comparison_percent_moe,

            -- comparison_cv --
            c AS comparison_cv,

            -- comparison_join --
            base AS comparison_join,

            -- comparison_variable --
            variable AS comparison_variable,

            -- comparison_dataset --
            dataset AS comparison_dataset
          FROM comparison_enriched_selection
        ) x
      )

    SELECT
      *,

      -- difference_reliable --
      CASE
        WHEN ((((difference_moe) / 1.645) / nullif(ABS(difference_est), 0)) * 100) < 20
        THEN true
        ELSE false
      END AS difference_reliable,

      -- difference_percent_reliable --
      CASE
        WHEN ((((difference_percent_moe) / 1.645) / nullif(ABS(difference_percent), 0)) * 100) < 20
        THEN true
        ELSE false
      END AS difference_percent_reliable,

      -- change_percent_reliable --
      CASE
        WHEN ((((change_percent_moe) / 1.645) / nullif(ABS(change_percent), 0)) * 100) < 20 THEN
          TRUE
        ELSE
          FALSE
      END AS change_percent_reliable,

      -- change_percentage_point_reliable --
      CASE
        WHEN ((((change_percentage_point_moe) / 1.645) / nullif(ABS(change_percentage_point), 0)) * 100) < 20 THEN
          TRUE
        ELSE
          FALSE
      END AS change_percentage_point_reliable

    FROM (
      SELECT
        *,

        -- difference_est --
        (est - comparison_est) AS difference_est,

        -- difference_percent --
        CASE
          WHEN (((percent - comparison_percent) * 100) < 0 AND ((percent - comparison_percent) * 100) > -0.05) THEN
            0
          ELSE
            (coalesce(percent, 0) - (coalesce(comparison_percent,0))) * 100
        END AS difference_percent,

        -- difference_moe --
        (SQRT((POWER(coalesce(m, 0), 2) + POWER(coalesce(comparison_moe, 0), 2)))) AS difference_moe,

        -- difference_percent_moe --
        (SQRT((POWER(coalesce(percent_moe, 0) * 100, 2) + POWER(coalesce(comparison_percent_moe, 0) * 100, 2)))) AS difference_percent_moe,

        -- change_percentage_point --
        CASE
          WHEN (percent = null AND previous_percent = null) THEN
            null
          WHEN (is_most_recent) THEN
            coalesce(percent, 0) - coalesce(previous_percent, 0)
        END AS change_percentage_point,

        -- change_percentage_point_moe --
        CASE
          WHEN is_most_recent THEN
            (SQRT((POWER(coalesce(previous_percent_moe, 0), 2) + POWER(coalesce(percent_moe, 0), 2))))
        END AS change_percentage_point_moe,

        -- change_reliable --
        CASE
          WHEN ((((change_moe) / 1.645) / nullif(ABS(change_est), 0)) * 100) < 20 THEN
            TRUE
          ELSE
            FALSE
        END AS change_reliable

      FROM (
        SELECT
          -- id --
          ENCODE(CONVERT_TO(variable || dataset, 'UTF-8'), 'base64') AS id,
          base,

          -- variablename --
          variable AS variablename,
          category,

          -- dataset --
          regexp_replace(lower(dataset), '[^A-Za-z0-9]', '_', 'g') AS dataset,

          -- profile --
          regexp_replace(lower(profile), '[^A-Za-z0-9]', '_', 'g') AS profile,

          -- variable --
          regexp_replace(lower(variable), '[^A-Za-z0-9]', '_', 'g') AS variable,
          is_most_recent,
          est,
          m,
          cv,

          -- percent --
          ROUND((est / NULLIF(base_est,0))::numeric, 4) AS percent,

          -- previous_percent --
          ROUND((previous_est / NULLIF(previous_base_est,0))::numeric, 4) AS previous_percent,
          previous_est,
          previous_moe,

          -- percent_moe --
          CASE
            WHEN (POWER(m, 2) - POWER(est / NULLIF(base_est,0), 2) * POWER(base_m, 2)) < 0
              THEN (1 / NULLIF(base_est,0)) * SQRT(POWER(m, 2) + POWER(est / NULLIF(base_est,0), 2) * POWER(base_m, 2))
            ELSE (1 / NULLIF(base_est,0)) * SQRT(POWER(m, 2) - POWER(est / NULLIF(base_est,0), 2) * POWER(base_m, 2))
          END AS percent_moe,

          -- previous_percent_moe --
          CASE
            WHEN (POWER(previous_moe, 2) - POWER(previous_est / NULLIF(previous_base_est,0), 2) * POWER(previous_base_m, 2)) < 0
              THEN (1 / NULLIF(previous_base_est,0)) * SQRT(POWER(previous_moe, 2) + POWER(previous_est / NULLIF(previous_base_est,0), 2) * POWER(previous_base_m, 2))
            ELSE (1 / NULLIF(previous_base_est,0)) * SQRT(POWER(previous_moe, 2) - POWER(previous_est / NULLIF(previous_base_est,0), 2) * POWER(previous_base_m, 2))
          END AS previous_percent_moe,

          comparison_cv,
          comparison_moe,
          comparison_est,
          comparison_percent_moe,
          comparison_percent,

          -- change_est --
          CASE
            WHEN is_most_recent THEN
              est - previous_est
          END AS change_est,

          -- change_moe --
          CASE
            WHEN is_most_recent THEN
              ABS(SQRT(POWER(coalesce(m, 0), 2) + POWER(coalesce(previous_moe, 0), 2)))
          END AS change_moe,

          -- change_percent --
          CASE
            WHEN is_most_recent THEN
              ROUND(((est - previous_est) / NULLIF(previous_est,0))::numeric, 4)
          END AS change_percent,

          -- change_percent_moe --
          CASE
            WHEN is_most_recent AND previous_est != 0 THEN
              coalesce(
                ABS(est / NULLIF(previous_est,0))
                * SQRT(
                  (POWER(coalesce(m, 0) / 1.645, 2) / NULLIF(POWER(est, 2),0))
                 + (POWER(previous_moe / 1.645, 2) / NULLIF(POWER(previous_est, 2),0))
                ) * 1.645,
                0
              )
            ELSE
              null
          END AS change_percent_moe

        FROM main_numbers

        INNER JOIN comparison_moeain_numbers
          ON main_numbers.variable = comparison_moeain_numbers.comparison_variable
          AND main_numbers.dataset = comparison_moeain_numbers.comparison_dataset

        LEFT OUTER JOIN base_numbers
          ON main_numbers.base = base_numbers.base_join
          AND main_numbers.dataset = base_numbers.base_dataset
      ) precalculations
    ) prework
  `;
};

module.exports = buildSQL;
