const { CUR_YEAR, PREV_YEAR } = require('data/special-calculations/constants');

function stringifyArray(ar) {
  return `'${ar.join("','")}'`;
}
const baseProfileSQL = (profile, isPrevious) => `
  SELECT
    --- sum ---
    SUM(e) AS sum,
    --- m ---
    SQRT(SUM(POWER(m, 2))) AS m,
  FROM (
    SELECT *
    FROM ${profile} p
    AND p.dataset = '${isPrevious ? PREV_YEAR : CUR_YEAR}'
  ) raw_profile
  GROUP BY variable, base, category, profile
  ORDER BY variable, base, category
`;

module.exports = baseProfileSQL;
