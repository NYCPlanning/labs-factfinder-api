// return a comma-separated string of single-quoted numbers from an array of numbers
function stringifyArray(array) {
  return `'${array.join("','")}'`;
}

const buildSQL = function buildSQL(tablename, ids, compare) {
  const idStrings = stringifyArray(ids);

  return /**/`
    WITH
    filtered_selection AS (
      SELECT *
      FROM ${tablename}
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
        CASE 
          WHEN is_most_recent THEN
            lag(sum) over (order by variable, year)
        END as previous_sum
      FROM (
        SELECT
          sum(value) AS sum,
          max(relation) AS relation,
          max(category) AS category,
          variable,
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
        sum(value) AS base_sum,
        lag(sum(value)) over (order by variable, year) AS previous_base_sum,
        variable AS base_variable,
        year AS base_year
      FROM enriched_selection
      WHERE relation = variable
      GROUP BY variable, "year"
    ),

    comparison_selection AS (
      SELECT *
      FROM ${tablename}
      WHERE geoid IN ('${compare}')
    ),

    comparison_enriched_selection AS (
      SELECT *
      FROM comparison_selection
      INNER JOIN decennial_dictionary
        ON decennial_dictionary.variablename = comparison_selection.variable
    ),

    comparison_main_numbers AS (
      SELECT
        sum(value) AS comparison_sum,
        max(relation) AS comparison_relation,
        variable AS comparison_variable,
        year AS comparison_year
      FROM comparison_enriched_selection
      GROUP BY variable, "year"
    ),

    comparison_base_numbers AS (
      SELECT
        sum(value) AS comparison_base_sum,
        variable AS comparison_base_variable,
        year AS comparison_base_year
      FROM comparison_enriched_selection
      WHERE relation = variable
      GROUP BY variable, "year"
    )

    SELECT *,
      (sum - comparison_sum) AS difference_sum,
      (percent - comparison_percent) AS difference_percent,
      (sum - previous_sum) AS change_sum,
      ROUND(((sum - previous_sum) / NULLIF(previous_sum,0))::numeric, 4) AS change_percent,
      percent - previous_percent AS change_percentage_point
    FROM ( 
      SELECT *,
        ENCODE(CONVERT_TO(variable || year, 'UTF-8'), 'base64') As id,
        'decennial' AS profile,
        regexp_replace(lower(variable), '[^A-Za-z0-9]', '_', 'g') AS variable,
        regexp_replace(lower(category), '[^A-Za-z0-9]', '_', 'g') AS category,
        true AS significant,
        'y' || year as year,
        'y' || year as dataset,
        ROUND((sum / NULLIF(base_sum,0))::numeric, 4) as percent,
        ROUND((previous_sum / NULLIF(previous_base_sum,0))::numeric, 4) as previous_percent,
        ROUND((comparison_sum / NULLIF(comparison_base_sum,0))::numeric, 4) as comparison_percent

        FROM main_numbers
        INNER JOIN comparison_main_numbers
          ON main_numbers.variable = comparison_main_numbers.comparison_variable
          AND main_numbers.year = comparison_main_numbers.comparison_year
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
