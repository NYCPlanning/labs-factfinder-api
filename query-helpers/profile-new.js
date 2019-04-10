const { CV_CONST, CUR_YEAR, PREV_YEAR } = require('../special-calculations/data/constants');

function stringifyIds(ids) {
  if (Array.isArray(ids)) return `'${ids.join("','")}'`;
  return `'${ids}'`;
}

const profileSQL = (profile, ids, isPrevious = false) => `
  WITH enriched_profile AS (
    SELECT *
    FROM ${profile} p
    INNER JOIN factfinder_metadata ffm
    ON ffm.variablename = p.variable
    WHERE p.geoid IN (${stringifyIds(ids)})
    AND p.dataset = '${isPrevious ? PREV_YEAR : CUR_YEAR}'
  ),

  WITH base AS (
    SELECT
      --- sum ---
      SUM(e) as base_sum,
      SQRT(SUM(POWER(m, 2))) AS base_m,
      base
      FROM enriched_profile
      WHERE base IN (
        SELECT DISTINCT base
        FROM enriched_profile
      )
      GROUP BY variable, base
  ),

  SELECT *,
    CASE
      WHEN base_sum = 0 THEN NULL
      ELSE sum / base_sum
    END AS percent,
    CASE
      WHEN base_sum = 0 THEN NULL
      WHEN POWER(m, 2) - POWER(sum / base_sum, 2) * POWER(base_m, 2) < 0
        THEN (1 / base_sum) * SQRT(POWER(m, 2) + POWER(sum / base_sum, 2) * POWER(base_m, 2))
      ELSE (1 / base_sum) * SQRT(POWER(m, 2) - POWER(sum / base_sum, 2) * POWER(base_m, 2))
    END AS percent_m,
    CASE
      WHEN cv < 20 THEN true
      ELSE false
    END AS is_reliable,
  FROM (
    SELECT
      --- sum ---
      SUM(e) AS sum,
      --- m ---
      SQRT(SUM(POWER(m, 2))) AS m,
      --- cv ---
      (((SQRT(SUM(POWER(m, 2))) / ${CV_CONST}) / NULLIF(SUM(e), 0)) * 100) AS cv,
      geotype,
      LOWER(variable) as variable,
      variablename,
      base,
      category,
      profile
    FROM enriched_profile p
    GROUP BY geotype, variable, variablename, base, category, profile
    ORDER BY variable, base, category
  ) AS v
  INNER JOIN base b
  ON v.base = b.base
`;

module.exports = profileSQL;
