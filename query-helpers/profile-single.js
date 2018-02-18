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

          -- previous_sum --
          CASE
            WHEN is_most_recent THEN
              lag(sum) over (order by variable, dataset)
          END as previous_sum,

          -- previous_percent --
          CASE
            WHEN is_most_recent THEN
              lag(p / 100) over (order by variable, dataset)
          END as previous_percent,

          -- previous_m --
          CASE
            WHEN is_most_recent THEN
              lag(m) over (order by variable, dataset)
          END as previous_m,

          -- previous_percent_m --
          CASE
            WHEN is_most_recent THEN
              lag(z) over (order by variable, dataset)
          END as previous_percent_m
        FROM (
          SELECT *,
            -- sum --
            e as sum,
            -- cv --
            (((m / 1.645) / NULLIF(e,0)) * 100) AS cv,
            -- percent --
            ROUND(p::numeric, 4) / 100 as percent,
            -- percent_m --
            ROUND(z::numeric, 4) / 100 as percent_m,

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

      comparison_main_numbers AS (
        SELECT
          -- comparison_sum --
          e as comparison_sum,
          -- comparison_cv --
          (((m / 1.645) / NULLIF(e,0)) * 100) AS comparison_cv,
          -- comparison_variable --
          variable as comparison_variable,
          -- comparison_dataset --
          dataset as comparison_dataset,
          -- comparison_percent --
          ROUND(p::numeric, 4) / 100 as comparison_percent,
          -- comparison_percent_m --
          ROUND(z::numeric, 4) / 100 as comparison_percent_m,
          -- comparison_m --
          m as comparison_m
        FROM comparison_enriched_selection
      )

    SELECT
      *,
      -- significant --
      CASE
        WHEN ABS(SQRT(POWER(coalesce(m, 0) / 1.645, 2) + POWER(coalesce(comparison_m, 0) / 1.645, 2)) * 1.645) > ABS(comparison_sum - sum) THEN false
        ELSE true
      END AS significant,

      -- percent_significant --
      CASE
        WHEN ABS(SQRT(POWER(coalesce(percent_m, 0) / 1.645, 2) + POWER(coalesce(comparison_percent_m, 0) / 1.645, 2)) * 1.645) > ABS(comparison_percent - percent) THEN false
        ELSE true
      END AS percent_significant,

      -- difference_sum --
      (sum - comparison_sum) AS difference_sum,

      -- difference_percent --
      CASE
        WHEN (((percent - comparison_percent) * 100) < 0 AND ((percent - comparison_percent) * 100) > -0.05) THEN
          0
        ELSE
          (coalesce(percent, 0) - (coalesce(comparison_percent,0)) * 100
      END AS difference_percent,

      -- difference_m --
      (SQRT((POWER(coalesce(m, 0), 2) + POWER(coalesce(comparison_m, 0), 2)))) AS difference_m,

      -- difference_percent_m --
      (SQRT((POWER(coalesce(percent_m, 0) * 100, 2) + POWER(coalesce(comparison_percent_m, 0) * 100, 2)))) AS difference_percent_m,

      -- change_percentage_point --
      CASE
        WHEN is_most_recent THEN
          percent - previous_percent
      END AS change_percentage_point,

      -- change_percentage_point_m --
      CASE
        WHEN is_most_recent THEN
          (SQRT((POWER(coalesce(previous_percent_m, 0), 2) + POWER(coalesce(percent_m, 0), 2))))
      END AS change_percentage_point_m,

      -- change_significant --
      CASE
        WHEN (change_m < ABS(change_sum)) THEN
          TRUE
        ELSE
          FALSE
      END AS change_significant,

      -- change_percent_significant --
      CASE
        WHEN (change_percent_m < ABS(change_percent)) THEN
          TRUE
        ELSE
          FALSE
      END AS change_percent_significant,

      -- change_percentage_point_significant --
      CASE
        WHEN (ABS((SQRT((POWER(coalesce(previous_percent_m, 0), 2) + POWER(coalesce(percent_m, 0), 2))))) < (percent - previous_percent)) THEN
          TRUE
        ELSE
          FALSE
      END AS change_percentage_point_significant
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

        -- significant --
        CASE WHEN ABS(SQRT(POWER(coalesce(m, 0) / 1.645, 2) + POWER(coalesce(comparison_m, 0) / 1.645, 2)) * 1.645) > ABS(comparison_sum - e) THEN false ELSE true END AS significant,

        -- percent_significant --
        CASE WHEN ABS(SQRT(POWER((ROUND(z::numeric, 4) / 100) / 1.645, 2) + POWER(coalesce(comparison_percent_m, 0) / 1.645, 2)) * 1.645) > ABS(comparison_percent - p) THEN false ELSE true END AS percent_significant,

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

        -- change_sum --
        CASE
          WHEN is_most_recent THEN
            sum - previous_sum
        END as change_sum,

        -- change_m --
        CASE
          WHEN is_most_recent THEN
            ABS(SQRT(POWER(coalesce(m, 0), 2) + POWER(coalesce(previous_m, 0), 2)))
        END as change_m,

        -- change_percent --
        CASE
          WHEN is_most_recent THEN
            ROUND(((sum - previous_sum) / NULLIF(previous_sum,0))::numeric, 4)
        END as change_percent,

        -- change_percent_m --
        CASE
          WHEN is_most_recent THEN
            ABS(sum / NULLIF(previous_sum,0))
            * SQRT(
              (POWER(coalesce(m, 0) / 1.645, 2) / (POWER(sum, 2))
              + (POWER(previous_m / 1.645, 2) / NULLIF(POWER(previous_sum, 2), 0))
            ) * 1.645
        END as change_percent_m
      FROM
        main_numbers
      LEFT OUTER JOIN comparison_main_numbers
        ON main_numbers.variable = comparison_main_numbers.comparison_variable
        AND main_numbers.dataset = comparison_main_numbers.comparison_dataset
    ) precalculations
  `;
};

module.exports = buildSQL;
