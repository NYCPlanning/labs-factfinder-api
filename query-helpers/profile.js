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

function isAggregate(ids) {
  return !!ids.length;
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
   * An aggregation of enriched selection, joined with base. For true aggregate data selections,
   * e, m, c, p, and z (sum, m, cv, percent, percent_m, respectively) are recalculated.
   * For non-aggrenate data selections, the original values are selected using MAX as a noop aggregate function.
   * is_reliable is calculated for all data selections.
   * Note: m is coalesced to 0 if the value does not exist in the data
   * TODO make this fix in the data? make m NOT NULL DEFAULT 0?
   * Columns: id, sum, m, cv, variable, variablename, base, category, profile, percent, percent_m, is_reliable
   */
  SELECT variables.*,
    --- percent (do not recalculate for non-aggregate selections)---
    CASE
      WHEN NOT ${isAggregate(ids)} THEN percent
      WHEN base_sum = 0 THEN 0
      WHEN base_sum IS NULL THEN 0
      ELSE sum / base_sum
    END AS percent,
    --- percent_m ---
    CASE
      WHEN NOT ${isAggregate(ids)} THEN percent_m
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
      --- m (do not recalculate for non-aggregate selections)---
      CASE
        WHEN NOT ${isAggregate(ids)} THEN MAX(m)
        WHEN SUM(m) IS NULL THEN 0
        ELSE SQRT(SUM(POWER(m, 2)))
      END AS m,
      --- cv (do not recalculate for non-aggregate selections)---
      CASE
        WHEN NOT ${isAggregate(ids)} THEN MAX(c)
        ELSE (((SQRT(SUM(POWER(m, 2))) / ${CV_CONST}) / NULLIF(SUM(e), 0)) * 100)
      END AS cv,
      --- percent (use MAX() as noop agg for non-agg selections; will be recalculated for aggregate selections)--
      MAX(p) AS percent,
      --- percent_m (use MAX() as noop agg for non-agg selections; will be recalculated for aggregate selections)---
      MAX(z) AS percent_m,
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
