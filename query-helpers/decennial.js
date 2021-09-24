const {
  DECENNIAL_METADATA_FULL_PATH,
  DECENNIAL_LATEST_TABLE_FULL_PATH,
  DECENNIAL_EARLIEST_TABLE_FULL_PATH,
} = require('../special-calculations/data/constants');

/*
 * Returns the appropriate second half of the geoid WHERE clause
 * If 'ids' is an array, returns an 'IN (...ids)' clause, with the quoted ids joined by ','
 * Else, if 'ids' is a single id, returns an '= id' clause, with id in quotes
 */
function formatGeoidWhereClause(ids) {
  if (Array.isArray(ids)) return `IN ('${ids.join("','")}')`;
  return `= '${ids}'`;
}

/* NOTE: 'survey' is a noop param, to make invocation from route cleaner */
const decennialSQL = (ids, isPrevious = false) => `
  WITH
  /*
   * enriched_survey_result: decennial data joined with meta data
   * from decennial_dictionary, filtered for given year
   * and geoids
   */
  enriched_survey_result AS (
    SELECT *
    FROM ${isPrevious ? DECENNIAL_EARLIEST_TABLE_FULL_PATH : DECENNIAL_LATEST_TABLE_FULL_PATH} d
    INNER JOIN ${DECENNIAL_METADATA_FULL_PATH} metadata
    ON LOWER(metadata.variablename) = LOWER(d.variable)
    WHERE d.geoid ${formatGeoidWhereClause(ids)}
  ),

  /*
   * base: an aggregation of enriched_survey_result that sums the
   * value of all base variables for the given selection
   */
  base AS (
    SELECT
    --- sum ---
    sum(value) as base_sum,
    relation as base
    FROM enriched_survey_result
    WHERE relation = variable
    GROUP BY relation
  )

  /*
   * an aggregation of enriched selection, joined with base that sums
   * value for all rows for a given 'variable' in the selection, and
   * adds additional aggregate value percent.
   * Columns: id, sum, variable, variablename, base, category, percent, survey
   */
  SELECT decennial.*,
  --- percent ---
  CASE
    WHEN base_sum = 0 THEN 0
    WHEN base_sum IS NULL THEN 0
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
      --- survey ---
      'decennial' AS survey
    FROM enriched_survey_result
    GROUP BY variable, variablename, base, category
  ) decennial
  LEFT JOIN base
  ON LOWER(decennial.base) = LOWER(base.base)
`;

module.exports = decennialSQL;
