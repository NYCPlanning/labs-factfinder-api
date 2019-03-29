  SELECT
    sum,
    m,
    cv,
    universe_sum,
    universe_m,
    profile,
    category,
    base,
    profile.variable
  FROM (
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
    FROM economic p
    INNER JOIN factfinder_metadata ffm
    ON p.variable = ffm.variablename
    WHERE p.geoid IN ('SI05')
    AND p.dataset = 'Y2006-2010'
    GROUP BY variable, base, category, profile
    ORDER BY variable, base, category
  ) profile
  LEFT JOIN (
    SELECT
      SUM(e) as universe_sum,
      SQRT(SUM(POWER(m, 2))) as universe_m,
      LOWER(variable) as variable
    FROM economic base
    WHERE base.dataset = 'Y2006-2010'
    GROUP BY variable
  ) universe
  ON profile.variable = universe.variable;

