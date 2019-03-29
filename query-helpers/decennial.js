const { DECENNIAL_CUR_YEAR, DECENNIAL_PREV_YEAR } = require('../special-calculations/data/constants');

function stringifyIds(ids) {
  if (Array.isArray(ids)) return `'${ids.join("','")}'`;
  return `'${ids}'`;
}

/* NOTE: 'profile' is a noop param, to make invocation from route cleaner */
const decennialProfileSQL = (profile, ids, isPrevious = false) => `
  WITH
  /* 
   * enriched_profile: decennial data joined with meta data
   * from decennial_dictionary, filtered for given year
   * and geoids
   */
  enriched_profile AS (
    SELECT *
    FROM decennial d
    INNER JOIN decennial_dictionary dd
    ON dd.variablename = d.variable
    WHERE d.geoid IN (${stringifyIds(ids)})
    AND d.year = '${isPrevious ? DECENNIAL_PREV_YEAR : DECENNIAL_CUR_YEAR}'
  ),

  /* 
   * base: an aggregation of enriched_profile that sums the
   * value of all base variables for the given selection
   */
  base AS (
    SELECT
    --- sum ---
    sum(value) as base_sum,
    relation as base
    FROM enriched_profile
    WHERE relation = variable
    GROUP BY relation
  )

  /*
   * an aggregation of enriched selection, joined with base that sums
   * value for all rows for a given 'variable' in the selection, and
   * adds additional aggregate value percent.
   * Columns: id, sum, variable, variablename, base, category, profile, percent
   */
  SELECT *,
  --- percent ---
  CASE
    WHEN base_sum = 0 THEN NULL
    WHEN base_sum IS NULL THEN NULL
    ELSE sum / base_sum
  END AS percent
  FROM (
    SELECT
      --- id ---
      ENCODE(CONVERT_TO(variable, 'UTF-8'), 'base64') AS id,
      --- sum ---
      SUM(value) AS sum,
      --- variable ---
      REGEXP_REPLACE(
        LOWER(variable),
        '[^A-Za-z0-9]', '_', 'g'
      ) AS variable,
      --- variablename ---
      variablename,
      --- base ---
      relation AS base,
      --- category ---
      REGEXP_REPLACE(
        LOWER(category),
        '[^A-Za-z0-9]', '_', 'g'
      ) AS category,
      --- profile ---
      'decennial' AS profile
    FROM enriched_profile
    GROUP BY variable, variablename, base, category
  ) decennial
  LEFT JOIN base
  ON decennial.base = base.base
`;

module.exports = decennialProfileSQL;
