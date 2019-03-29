const { CV_CONST, CUR_YEAR, PREV_YEAR } = require('../special-calculations/data/constants');

/*
 * Returns the appropriate second half of the geoid WHERE clause
 * If 'ids' is an array, returns an 'IN (...ids)' clause, with the quoted ids joined by ','
 * Else, if 'ids' is a single id, returns an '= id' clause, with id in quotes
 */
function formatGeoidWhereClause(ids) {
  if (Array.isArray(ids)) return `IN ('${ids.join("','")}')`;
  return `= '${ids}'`;
}

const profileSQL = (profile, ids, isPrevious = false) => `
  WITH
  /*
   * enriched_profile: profile data joined with meta data
   * from factfinder_metadata, filtered for given year
   * and geoids
   */
  enriched_profile AS (
    SELECT *
    FROM ${profile} p
    INNER JOIN factfinder_metadata ffm
    ON ffm.variablename = p.variable
    WHERE p.geoid ${formatGeoidWhereClause(ids)}
    AND p.dataset = '${isPrevious ? PREV_YEAR : CUR_YEAR}'
  ),

  /*
   * base: an aggregation of enriched_profile that sums the
   * value of all base variables for the given selection
   */
  base AS (
    SELECT
      --- sum ---
      SUM(e) as base_sum,
      SQRT(SUM(POWER(m, 2))) AS base_m,
      base
      FROM enriched_profile
      WHERE base = variable
      GROUP BY base
  )

  /*
   * an aggregation of enriched selection, joined with base that aggregates
   * e and m for all rows for a given 'variable' in the selection, and adds
   * additional aggregate values cv, percent, percent_m, and is_reliable
   * Columns: id, sum, m, cv, variable, variablename, base, category, profile, percent, percent_m, is_reliable
   */
  SELECT *,
    --- percent ---
    CASE
      WHEN base_sum = 0 THEN 0
      WHEN base_sum IS NULL THEN 0
      ELSE sum / base_sum
    END AS percent,
    --- percent_m ---
    CASE
      WHEN base_sum = 0 THEN 0
      WHEN base_sum IS NULL THEN 0
      WHEN POWER(m, 2) - POWER(sum / base_sum, 2) * POWER(base_m, 2) < 0
        THEN (1 / base_sum) * SQRT(POWER(m, 2) + POWER(sum / base_sum, 2) * POWER(base_m, 2))
      ELSE (1 / base_sum) * SQRT(POWER(m, 2) - POWER(sum / base_sum, 2) * POWER(base_m, 2))
    END AS percent_m,
    --- is_reliable ---
    CASE
      WHEN cv < 20 THEN true
      ELSE false
    END AS is_reliable
  FROM (
    SELECT
      --- id ---
      ENCODE(CONVERT_TO(variable, 'UTF-8'), 'base64') AS id,
      --- sum ---
      SUM(e) AS sum,
      --- m ---
      SQRT(SUM(POWER(m, 2))) AS m,
      --- cv ---
      (((SQRT(SUM(POWER(m, 2))) / ${CV_CONST}) / NULLIF(SUM(e), 0)) * 100) AS cv,
      --- variable ---
      REGEXP_REPLACE(
        LOWER(variable),
        '[^A-Za-z0-9]', '_', 'g'
      ) AS variable,
      --- variablename ---
      variablename,
      --- base ---
      base,
      --- category ---
      REGEXP_REPLACE(
        LOWER(category),
        '[^A-Za-z0-9]', '_', 'g'
      ) AS category,
      --- profile ---
      REGEXP_REPLACE(
        LOWER(profile),
        '[^A-Za-z0-9]', '_', 'g'
      ) AS profile
    FROM enriched_profile
    GROUP BY variable, variablename, base, category, profile
    ORDER BY variable, base, category
  ) AS variables
  LEFT JOIN base
  ON variables.base = base.base
`;

module.exports = profileSQL;
