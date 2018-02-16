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

          -- previous_sum --
          CASE
            WHEN is_most_recent THEN
              lag(sum) over (order by variable, dataset)
          END AS previous_sum,

          -- previous_m --
          CASE
            WHEN is_most_recent THEN
              lag(m) over (order by variable, dataset)
          END AS previous_m
        FROM (
          SELECT
            -- sum --
            sum(e) AS sum,

            -- m --
            sqrt(sum(power(m, 2))) AS m,

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
          -- base_sum --
          sum(e) AS base_sum,

          -- base_m --
          sqrt(sum(power(m, 2))) AS base_m,

          -- base_join --
          max(base) AS base_join,

          -- base_dataset --
          max(dataset) AS base_dataset,

          -- previous_base_sum --
          lag(sum(e)) over (order by variable, dataset) AS previous_base_sum,

          -- previous_base_m --
          lag(sqrt(sum(power(m, 2)))) over (order by variable, dataset) AS previous_base_m
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

      comparison_main_numbers AS (
        SELECT
          *
        FROM (
          SELECT
            -- comparison_sum --
            e AS comparison_sum,

            -- comparison_m --
            m AS comparison_m,

            -- comparison_percent --
            (p / 100) AS comparison_percent,

            -- comparison_percent_m --
            (z / 100) AS comparison_percent_m,

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
      -- significant --
      CASE
        WHEN ABS(SQRT(POWER(m / 1.645, 2) + POWER(comparison_m / 1.645, 2)) * 1.645) > ABS(comparison_sum - sum) THEN false
        ELSE true
      END AS significant,

      -- percent_significant --
      CASE
        WHEN ABS(SQRT(POWER(percent_m / 1.645, 2) + POWER(comparison_percent_m / 1.645, 2)) * 1.645) > ABS(comparison_percent - percent) THEN false
        ELSE true
      END AS percent_significant,

      -- difference_sum --
      (sum - comparison_sum) AS difference_sum,

      -- difference_percent --
      CASE
        WHEN (((percent - comparison_percent) * 100) < 0 AND ((percent - comparison_percent) * 100) > -0.05) THEN
          0
        ELSE
          (coalesce(percent, 0) - (coalesce(comparison_percent,0))) * 100
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
        WHEN (ABS((SQRT((POWER(previous_percent_m, 2) + POWER(percent_m, 2))))) < (percent - previous_percent)) THEN
          TRUE
        ELSE
          FALSE
      END AS change_percentage_point_significant

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
        sum,
        m,
        cv,

        -- percent --
        ROUND((sum / NULLIF(base_sum,0))::numeric, 4) AS percent,

        -- previous_percent --
        ROUND((previous_sum / NULLIF(previous_base_sum,0))::numeric, 4) AS previous_percent,
        previous_sum,
        previous_m,

        -- percent_m --
        CASE
          WHEN (POWER(m, 2) - POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2)) < 0
            THEN (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) + POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))
          ELSE (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) - POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))
        END AS percent_m,

        -- previous_percent_m --
        CASE
          WHEN (POWER(previous_m, 2) - POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2)) < 0
            THEN (1 / NULLIF(previous_base_sum,0)) * SQRT(POWER(previous_m, 2) + POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2))
          ELSE (1 / NULLIF(previous_base_sum,0)) * SQRT(POWER(previous_m, 2) - POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2))
        END AS previous_percent_m,

        comparison_cv,
        comparison_m,
        comparison_sum,
        comparison_percent_m,
        comparison_percent,

        -- change_sum --
        CASE
          WHEN is_most_recent THEN
            sum - previous_sum
        END AS change_sum,

        -- change_m --
        CASE
          WHEN is_most_recent THEN
            ABS(SQRT(POWER(coalesce(m, 0), 2) + POWER(coalesce(previous_m, 0), 2)))
        END AS change_m,

        -- change_percent --
        CASE
          WHEN is_most_recent THEN
            ROUND(((sum - previous_sum) / NULLIF(previous_sum,0))::numeric, 4)
        END AS change_percent,

        -- change_percent_m --
        CASE
          WHEN is_most_recent THEN
            ABS(sum / NULLIF(previous_sum,0))
            * SQRT(
              (POWER(coalesce(m, 0) / 1.645, 2) / NULLIF(POWER(sum, 2),0))
             + (POWER(previous_m / 1.645, 2) / NULLIF(POWER(previous_sum, 2),0))
            ) * 1.645
        END AS change_percent_m

      FROM main_numbers

      INNER JOIN comparison_main_numbers
        ON main_numbers.variable = comparison_main_numbers.comparison_variable
        AND main_numbers.dataset = comparison_main_numbers.comparison_dataset

      LEFT OUTER JOIN base_numbers
        ON main_numbers.base = base_numbers.base_join
        AND main_numbers.dataset = base_numbers.base_dataset
    ) precalculations
  `;
};

module.exports = buildSQL;
