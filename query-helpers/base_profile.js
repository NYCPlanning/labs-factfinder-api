function stringifyArray(ar) {
  return `'${ar.join("','")}'`;
}
const profileSQL = (profile, ids, dataset) => `
  SELECT
    --- sum ---
    SUM(e) AS sum,
    --- m ---
    SQRT(SUM(POWER(m, 2))) AS m,
    --- cv (uses m & sum, recomputed) ---
    (((SQRT(SUM(POWER(m, 2))) / 1.645) / NULLIF(SUM(e), 0)) * 100) AS cv,
    profile,
    category,
    base,
    LOWER(variable) as variable
  FROM (
    SELECT *
    FROM ${profile} p
    INNER JOIN factfinder_metadata ffm
    ON ffm.variablename = p.variable
    WHERE p.geoid IN (${stringifyArray(ids)})
    AND p.dataset = '${dataset}'
  ) raw_profile
  GROUP BY variable, base, category, profile
  ORDER BY variable, base, category
`;

module.exports = profileSQL;
