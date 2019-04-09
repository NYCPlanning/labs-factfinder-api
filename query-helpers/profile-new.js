const { CUR_YEAR, PREV_YEAR } = require('../data/special-calculations/constants');

function stringifyArray(ar) {
  return `'${ar.join("','")}'`;
}

const profileSQL = (profile, ids, isPrevious) => `
  SELECT
    sum,
    m,
    cv,
    universe_sum,
    universe_m,
    CASE
      WHEN universe_sum = 0 THEN null
      ELSE sum / universe_sum
    END AS percent,
    CASE
      WHEN universe_sum = 0 THEN null
      WHEN POWER(m, 2) - POWER(sum / universe_sum, 2) * POWER(universe_m, 2) < 0
        THEN (1 / universe_sum) * SQRT(POWER(m, 2) + POWER(sum / universe_sum, 2) * POWER(base_m, 2))
      ELSE (1 / universe_sum) * SQRT(POWER(m, 2) - POWER(sum / universe_sum, 2) * POWER(base_m, 2))  
    END AS percent_m
    CASE
      WHEN cv < 20 THEN true
      ELSE false
    END AS is_reliable
    profile,
    category,
    base,
    unittype,
    variable
  FROM (
    SELECT
      --- sum ---
      SUM(e) AS sum,
      --- m ---
      SQRT(SUM(POWER(m, 2))) AS m,
      --- cv (uses m & sum, recomputed) ---
      (((SQRT(SUM(POWER(m, 2))) / 1.645) / NULLIF(SUM(e), 0)) * 100) AS cv,
      LOWER(variable) as variable,
      ffm.*
    FROM ${profile} p
    INNER JOIN factfinder_metadata ffm
    ON p.variable = ffm.variablename
    WHERE p.geoid IN (${stringifyArray(ids)})
    AND p.dataset = '${isPrevious ? PREV_YEAR : CUR_YEAR}'
    GROUP BY variable, base, category, profile
    ORDER BY variable, base, category
  ) profile
  LEFT JOIN (
    SELECT
      SUM(e) as universe_sum,
      SQRT(SUM(POWER(m, 2))) as universe_m,
      LOWER(variable) as variable
    FROM ${profile} base
    WHERE base.dataset = '${isPrevious ? PREV_YEAR : CUR_YEAR}'
    GROUP BY variable
  ) universe
  ON profile.variable = universe.variable
`;

module.exports = profileSQL;
