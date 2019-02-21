// ACS profile query for single geoid, no agg fucntions

const buildSQL = function buildSQL(profile, geoid, compare) {
  return /**/`
    WITH
      filtered_selection AS (
        SELECT *
        FROM ${profile}
        WHERE geoid = '${geoid}'
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

          -- previous_estimate --
          CASE
            WHEN is_most_recent THEN
              lag(estimate) over (order by variable, dataset)
          END as previous_estimate,

          -- previous_percent --
          CASE
            WHEN is_most_recent THEN
              lag(p / 100) over (order by variable, dataset)
          END as previous_percent,

          -- previous_moe --
          CASE
            WHEN is_most_recent THEN
              LAG(moe) over (order by variable, dataset)
          END as previous_moe,

          -- previous_percent_moe --
          CASE
            WHEN is_most_recent THEN
              lag(z / 100) over (order by variable, dataset)
          END as previous_percent_moe
        FROM (
          SELECT *,
            -- estimate --
            e as estimate,
            -- cv --
            (((m / 1.645) / NULLIF(e,0)) * 100) AS cv,
            -- percent --
            ROUND(p::numeric, 4) / 100 as percent,
            -- percent_moe --
            ROUND(z::numeric, 4) / 100 as percent_moe,

            -- is_most_recent --
            CASE
              WHEN max(dataset) over () = dataset THEN
                TRUE
              ELSE
                FALSE
            END as is_most_recent
          FROM enriched_selection
        ) precalculations
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
          -- comparison_estimate --
          e as comparison_estimate,
          -- comparison_cv --
          (((m / 1.645) / NULLIF(e,0)) * 100) AS comparison_cv,
          -- comparison_variable --
          variable as comparison_variable,
          -- comparison_dataset --
          dataset as comparison_dataset,
          -- comparison_percent --
          ROUND(p::numeric, 4) / 100 as comparison_percent,
          -- comparison_percent_moe --
          ROUND(z::numeric, 4) / 100 as comparison_percent_moe,
          -- comparison_moe --
          m as comparison_moe
        FROM comparison_enriched_selection
      )
    SELECT
      *,
      -- change_percentage_point_reliable --
      CASE
        WHEN ((((change_percentage_point_moe) / 1.645) / nullif(ABS(change_percentage_point), 0)) * 100) < 20 THEN
          TRUE
        ELSE
          FALSE
      END AS change_percentage_point_reliable,

      -- difference_reliable --
      CASE
        WHEN ((((difference_moe) / 1.645) / nullif(ABS(difference_estimate), 0)) * 100) < 20 THEN true
        ELSE false
      END AS difference_reliable,

      -- difference_percent_reliable --
      CASE
        WHEN ((((difference_percent_moe) / 1.645) / nullif(ABS(difference_percent), 0)) * 100) < 20 THEN
          true
        ELSE false
      END AS difference_percent_reliable

    FROM (
      SELECT
        *,

        -- difference_estimate --
        (estimate - comparison_estimate) AS difference_estimate,

        -- difference_percent --
        CASE
          WHEN (((percent - comparison_percent) * 100) < 0 AND ((percent - comparison_percent) * 100) > -0.05) THEN
            0
          ELSE
            (coalesce(percent, 0) - coalesce(comparison_percent,0)) * 100
        END AS difference_percent,

        -- difference_moe --
        (SQRT((POWER(coalesce(moe, 0), 2) + POWER(coalesce(comparison_moe, 0), 2)))) AS difference_moe,

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
          WHEN ((((change_moe) / 1.645) / nullif(ABS(change_estimate), 0)) * 100) < 20 THEN
            TRUE
          ELSE
            FALSE
        END AS change_reliable,

        -- change_percent_reliable --
        CASE
          WHEN ((((change_percent_moe) / 1.645) / nullif(ABS(change_percent), 0)) * 100) < 20 THEN
            TRUE
          ELSE
            FALSE
        END AS change_percent_reliable
      FROM (
        SELECT *,
          -- id --
          ENCODE(CONVERT_TO(VARIABLE || dataset, 'UTF-8'), 'base64') AS id,
          -- dataset --
          regexp_replace(lower(dataset), '[^A-Za-z0-9]', '_', 'g') AS dataset,
          -- profile --
          regexp_replace(lower(profile), '[^A-Za-z0-9]', '_', 'g') AS profile,
          -- category --
          regexp_replace(lower(category), '[^A-Za-z0-9]', '_', 'g') AS category,
          -- variable --
          regexp_replace(lower(variable), '[^A-Za-z0-9]', '_', 'g') AS variable,

          -- is_reliable --
          CASE
            WHEN (cv < 20)
              THEN true
            ELSE false
          END as is_reliable,

          -- comparison_is_reliable --
          CASE
            WHEN (comparison_cv < 20)
              THEN true
            ELSE false
          END as comparison_is_reliable,

          -- change_estimate --
          CASE
            WHEN is_most_recent THEN
              estimate - previous_estimate
          END as change_estimate,

          -- change_moe --
          CASE
            WHEN is_most_recent THEN
              ABS(SQRT(POWER(coalesce(moe, 0), 2) + POWER(coalesce(previous_moe, 0), 2)))
          END as change_moe,

          -- change_percent --
          CASE
            WHEN is_most_recent THEN
              ROUND(((estimate - previous_estimate) / NULLIF(previous_estimate,0))::numeric, 4)
          END as change_percent,

          -- change_percent_moe --
          CASE
            WHEN is_most_recent AND previous_estimate != 0 THEN
              coalesce(
                ABS(estimate / NULLIF(previous_estimate,0))
                * SQRT(
                  (POWER(coalesce(moe, 0) / 1.645, 2) / NULLIF(POWER(estimate, 2), 0))
                  + (POWER(previous_moe / 1.645, 2) / NULLIF(POWER(previous_estimate, 2), 0))
                ) * 1.645,
                0
              )
          END as change_percent_moe
        FROM
          main_numbers
        LEFT OUTER JOIN comparison_moeain_numbers
          ON main_numbers.variable = comparison_moeain_numbers.comparison_variable
          AND main_numbers.dataset = comparison_moeain_numbers.comparison_dataset
      ) precalculations
    ) significance
  `;
};

module.exports = buildSQL;
