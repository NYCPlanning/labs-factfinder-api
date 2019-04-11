const { CV_CONST, CUR_YEAR, PREV_YEAR } = require('../special-calculations/data/constants');

function stringifyIds(ids) {
  if (Array.isArray(ids)) return `'${ids.join("','")}'`;
  return `'${ids}'`;
}

const profileSQL = (profile, ids, isPrevious = false) => `
  WITH
  enriched_profile AS (
    SELECT *
    FROM ${profile} p
    INNER JOIN factfinder_metadata ffm
    ON ffm.variablename = p.variable
    WHERE p.geoid IN (${stringifyIds(ids)})
    AND p.dataset = '${isPrevious ? PREV_YEAR : CUR_YEAR}'
  ),

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

  SELECT *,
    --- percent ---
    CASE
      WHEN base_sum = 0 THEN NULL
      WHEN base_sum IS NULL THEN NULL
      ELSE sum / base_sum
    END AS percent,
    --- percent_m ---
    CASE
      WHEN base_sum = 0 THEN NULL
      WHEN base_sum IS NULL THEN NULL
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
      --- numGeoIds ---
      ${ids.length} AS numGeoids,
      --- id --- 
      ENCODE(CONVERT_TO(variable, 'UTF-8'), 'base64') AS id,
      --- sum ---
      SUM(e) AS sum,
      --- m ---
      SQRT(SUM(POWER(m, 2))) AS m,
      --- cv ---
      (((SQRT(SUM(POWER(m, 2))) / ${CV_CONST}) / NULLIF(SUM(e), 0)) * 100) AS cv,
      --- geotype ---
      geotype,
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
    GROUP BY geotype, variable, variablename, base, category, profile
    ORDER BY variable, base, category
  ) AS variables
  LEFT JOIN base
  ON variables.base = base.base
`;

module.exports = profileSQL;
