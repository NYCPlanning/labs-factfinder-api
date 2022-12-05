const {
  CORRELATION_COEFFICIENT_CONST,
  CUR_YEAR,
  PREV_YEAR,
  ACS_METADATA_FULL_PATH,
  ACS_LATEST_TABLE_FULL_PATH,
  ACS_EARLIEST_TABLE_FULL_PATH,
} = require('../special-calculations/data/constants');

/*
 * Returns the appropriate second half of the geoid WHERE clause
 * If 'ids' is an array, returns an 'IN (...ids)' clause, with the quoted ids joined by ','
 * Else, if 'ids' is a single id, returns an '= id' clause, with id in quotes
 */
function formatGeoidWhereClause(ids) {
  if (ids.length > 1) return `IN ('${ids.join("','")}')`;
  return `= '${ids[0]}'`;
}

function isAggregate(ids) {
  return ids.length > 1;
}

const acsSQL = (ids, isPrevious = false) => `
  WITH
  /*
   * enriched_survey_result: survey data joined with meta data
   * from acs.metadata, filtered for given year
   * and geoids
   */
  enriched_survey_result AS (
    SELECT *,

    /*
    * Used for Change over Time calculation. Determines whether the table comparison year
    * is "previous" or otherwise. Exact value is referenced downstream so make sure it's
    * correct.
    */
    '${isPrevious ? PREV_YEAR : CUR_YEAR}' AS dataset

    FROM ${isPrevious ? ACS_EARLIEST_TABLE_FULL_PATH : ACS_LATEST_TABLE_FULL_PATH} p
    INNER JOIN ${ACS_METADATA_FULL_PATH} metadata

      /*
      * these need to be lowercased to make sure they're consistent.
      * otherwise, they won't join.
      */
      ON LOWER(metadata.variablename) = LOWER(p.variable)
    WHERE p.geoid ${formatGeoidWhereClause(ids)}
  ),

  /*
   * base: an aggregation of enriched_survey_result that sums the
   * value of all base variables for the given selection
   */
  base AS (
    SELECT
      --- sum ---
      SUM(estimate) as base_sum,
      SQRT(SUM(POWER(margin_of_error, 2))) AS base_margin_of_error,
      base
      FROM enriched_survey_result

      /*
      * these need to be lowercased to make sure they're consistent.
      * otherwise, they won't join.
      */
      WHERE LOWER(base) = LOWER(variable)
      GROUP BY base
  )

  /*
   * An aggregation of enriched selection, joined with base. For true aggregate data selections,
   * e, m, c, percent and z (sum, m, cv, percent, percent_m, respectively) are recalculated.
   * For non-aggrenate data selections, the original values are selected using MAX as a noop aggregate function.
   * isReliable is calculated for all data selections.
   * Note: m is coalesced to 0 if the value does not exist in the data
   * TODO make this fix in the data? make m NOT NULL DEFAULT 0?
   * Columns: id, sum, m, cv, variable, variablename, base, category, survey, percent, percent_m, isReliable
   */
  SELECT variables.*,
    --- percent (do not recalculate for non-aggregate selections)---
    CASE
      WHEN NOT ${isAggregate(ids)} THEN percent / 100
      WHEN base_sum = 0 THEN 0
      WHEN base_sum IS NULL THEN 0
      ELSE sum / base_sum
    END AS percent,
    --- percent_margin_of_error ---
    CASE
      WHEN NOT ${isAggregate(ids)} THEN "percentMarginOfError" / 100
      WHEN base_sum = 0 THEN 0
      WHEN base_sum IS NULL THEN 0
      WHEN POWER("marginOfError", 2) - POWER(sum / base_sum, 2) * POWER(base_margin_of_error, 2) < 0
        THEN (1 / base_sum) * SQRT(POWER("marginOfError", 2) + POWER(sum / base_sum, 2) * POWER(base_margin_of_error, 2))
      ELSE (1 / base_sum) * SQRT(POWER("marginOfError", 2) - POWER(sum / base_sum, 2) * POWER(base_margin_of_error, 2))
    END AS "percentMarginOfError",
    --- isReliable ---
    CASE
      WHEN "correlationCoefficient" < 20 THEN true
      ELSE false
    END AS "isReliable"
  FROM (
    SELECT
      --- id ---
      ENCODE(CONVERT_TO(variable, 'UTF-8'), 'base64') AS id,
      --- sum ---
      SUM(estimate) AS sum,
      --- margin_of_error (do not recalculate for non-aggregate selections)---
      --- coalesce null m to 0 ---
      CASE
        WHEN NOT ${isAggregate(ids)} THEN MAX(margin_of_error)
        ELSE SQRT(SUM(POWER(margin_of_error, 2)))
      END AS "marginOfError",
      --- correlation_coefficient (do not recalculate for non-aggregate selections)---
      CASE
        WHEN NOT ${isAggregate(ids)} THEN MAX(correlation_coefficient)
        ELSE (((SQRT(SUM(POWER(margin_of_error, 2))) / ${CORRELATION_COEFFICIENT_CONST}) / NULLIF(SUM(estimate), 0)) * 100)
      END AS "correlationCoefficient",
      --- percent (use MAX() as noop agg for non-agg selections; will be recalculated for aggregate selections)--
      --- coalesce null percent to 0 ---
      COALESCE(MAX(percent), 0) AS percent,
      --- percent_margin_of_error (use MAX() as noop agg for non-agg selections; will be recalculated for aggregate selections)---
      --- coalesce null percent_margin_of_error to 0 ---
      COALESCE(MAX(percent_margin_of_error), 0) AS "percentMarginOfError",
      --- variable ---
      REGEXP_REPLACE(
        LOWER(variable),
        '[^A-Za-z0-9]', '_', 'g'
      ) AS variable,
      --- variableName ---
      variableName,
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
      ) AS profile,
      --- survey ---
      'acs' AS survey
    FROM enriched_survey_result
    GROUP BY variable, variableName, base, category, profile
    ORDER BY variable, base, category
  ) AS variables
  LEFT JOIN base
  ON LOWER(variables.base) = LOWER(base.base)
`;

module.exports = acsSQL;
