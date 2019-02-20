// return a comma-separated string of single-quoted numbers from an array of numbers
function stringifyArray(array) {
  return `'${array.join("','")}'`;
}

const buildSQL = function buildSQL(ids, compare) {
  const idStrings = stringifyArray(ids);

  return /**/`
    WITH
      filtered_selection AS (
        SELECT *
        FROM decennial
        WHERE geoid IN (${idStrings})
      ),

      enriched_selection AS (
        SELECT *
        FROM filtered_selection
        INNER JOIN decennial_dictionary
          ON decennial_dictionary.variablename = filtered_selection.variable
      ),

      main_numbers AS (
        SELECT
          *,
          -- previous_est --
          CASE
            WHEN is_most_recent THEN
              lag(est) over (order by variable, year)
          END as previous_est
        FROM (
          SELECT

            -- est --
            est(value) AS est,

            -- relation --
            max(relation) AS relation,

            -- category --
            max(category) AS category,
            variable,

            -- is_most_recent --
            CASE
              WHEN max(year) over () = year THEN
                TRUE
              ELSE
                FALSE
            END as is_most_recent,
            year
          FROM enriched_selection
          GROUP BY variable, "year"
        ) x
      ),

      base_numbers AS (
        SELECT

          -- base_est --
          est(value) AS base_est,

          -- previous_base_est --
          lag(est(value)) over (order by variable, year) AS previous_base_est,

          -- base_variable --
          variable AS base_variable,

          -- base_year --
          year AS base_year
        FROM enriched_selection
        WHERE relation = variable
        GROUP BY variable, "year"
      ),

      comparison_selection AS (
        SELECT *
        FROM decennial
        WHERE geoid IN ('${compare}')
      ),

      comparison_enriched_selection AS (
        SELECT *
        FROM comparison_selection
        INNER JOIN decennial_dictionary
          ON decennial_dictionary.variablename = comparison_selection.variable
      ),

      comparison_moeain_numbers AS (
        SELECT

          -- comparison_est --
          est(value) AS comparison_est,

          -- comparison_relation --
          max(relation) AS comparison_relation,

          -- comparison_variable --
          variable AS comparison_variable,

          -- comparison_year --
          year AS comparison_year
        FROM comparison_enriched_selection
        GROUP BY variable, "year"
      ),

      comparison_base_numbers AS (
        SELECT

          -- comparison_base_est --
          est(value) AS comparison_base_est,

          -- comparison_base_variable --
          variable AS comparison_base_variable,

          -- comparison_base_year --
          year AS comparison_base_year
        FROM comparison_enriched_selection
        WHERE relation = variable
        GROUP BY variable, "year"
      )

    SELECT *,

      -- difference_est --
      (est - comparison_est) AS difference_est,

      -- difference_percent --
      ((percent - comparison_percent) * 100) AS difference_percent,

      -- change_est --
      (est - previous_est) AS change_est,

      -- change_percent --
      ROUND(((est - previous_est) / NULLIF(previous_est,0))::numeric, 4) AS change_percent,

      -- change_percentage_point --
      percent - previous_percent AS change_percentage_point
    FROM (
      SELECT *,

        -- id --
        ENCODE(CONVERT_TO(variable || year, 'UTF-8'), 'base64') As id,

        -- profile --
        'decennial' AS profile,

        -- variable --
        regexp_replace(lower(variable), '[^A-Za-z0-9]', '_', 'g') AS variable,

        -- category --
        regexp_replace(lower(category), '[^A-Za-z0-9]', '_', 'g') AS category,

        -- significant --
        true AS significant,

        -- year --
        'y' || year as year,

        -- dataset --
        'y' || year as dataset,

        -- percent --
        ROUND((est / NULLIF(base_est,0))::numeric, 4) as percent,

        -- previous_percent --
        ROUND((previous_est / NULLIF(previous_base_est,0))::numeric, 4) as previous_percent,

        -- comparison_percent --
        ROUND((comparison_est / NULLIF(comparison_base_est,0))::numeric, 4) as comparison_percent

        FROM main_numbers
        INNER JOIN comparison_moeain_numbers
          ON main_numbers.variable = comparison_moeain_numbers.comparison_variable
          AND main_numbers.year = comparison_moeain_numbers.comparison_year
        LEFT OUTER JOIN base_numbers
          ON main_numbers.relation = base_numbers.base_variable
          AND main_numbers.year = base_numbers.base_year
        LEFT OUTER JOIN comparison_base_numbers
          ON main_numbers.relation = comparison_base_numbers.comparison_base_variable
          AND main_numbers.year = comparison_base_numbers.comparison_base_year
    ) precalculations
  `;
};

module.exports = buildSQL;
