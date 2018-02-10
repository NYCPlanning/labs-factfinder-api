function buildFinalSelection(from) {
  return /* syntax highlighting */`
    SELECT
      *,
      CASE
        WHEN ABS(SQRT(POWER(m / 1.645, 2) %2B POWER(comparison_m / 1.645, 2)) * 1.645) > ABS(comparison_sum - sum) THEN false
        ELSE true
      END AS significant,
      CASE
        WHEN ABS(SQRT(POWER(percent_m / 1.645, 2) %2B POWER(comparison_percent_m / 1.645, 2)) * 1.645) > ABS(comparison_percent - percent) THEN false
        ELSE true
      END AS percent_significant,

      (sum - comparison_sum) AS difference_sum,

      CASE 
        WHEN (((percent - comparison_percent) * 100) < 0 AND ((percent - comparison_percent) * 100) > -0.05) THEN
          0
        ELSE
          (percent - comparison_percent) * 100
      END AS difference_percent,

      (SQRT((POWER(m, 2) %2B POWER(comparison_m, 2)))) AS difference_m,
      (SQRT((POWER(percent_m * 100, 2) %2B POWER(comparison_percent_m * 100, 2)))) AS difference_percent_m,

      CASE
        WHEN is_most_recent THEN
          percent - previous_percent
      END as change_percentage_point,

      CASE
        WHEN is_most_recent THEN
          (SQRT((POWER(previous_percent_m, 2) %2B POWER(percent_m, 2))))
      END as change_percentage_point_m,

      CASE
        WHEN (change_m < ABS(change_sum)) THEN
          TRUE
        ELSE
          FALSE
      END as change_significant,

      CASE
        WHEN (change_percent_m < ABS(change_percent)) THEN
          TRUE
        ELSE
          FALSE
      END as change_percent_significant,

      CASE
        WHEN (ABS((SQRT((POWER(previous_percent_m, 2) %2B POWER(percent_m, 2))))) < (percent - previous_percent)) THEN
          TRUE
        ELSE
          FALSE
      END as change_percentage_point_significant

    FROM (
      SELECT
        ENCODE(CONVERT_TO(variable || dataset, 'UTF-8'), 'base64') As id,
        base,
        variable AS variablename,
        category,
        regexp_replace(lower(dataset), '[^A-Za-z0-9]', '_', 'g') AS dataset,
        regexp_replace(lower(profile), '[^A-Za-z0-9]', '_', 'g') AS profile,
        regexp_replace(lower(variable), '[^A-Za-z0-9]', '_', 'g') AS variable,
        is_most_recent,

        sum,
        m,
        cv,
        ROUND((SUM / NULLIF(base_sum,0))::numeric, 4) as percent,
        ROUND((previous_sum / NULLIF(previous_base_sum,0))::numeric, 4) as previous_percent,
        previous_sum,
        previous_m,

        CASE
          WHEN (POWER(m, 2) %2D POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2)) < 0
            THEN (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) %2B POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))
          ELSE (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) %2D POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))
        END as percent_m,

        CASE
          WHEN (POWER(previous_m, 2) %2D POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2)) < 0
            THEN (1 / NULLIF(previous_base_sum,0)) * SQRT(POWER(previous_m, 2) %2B POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2))
          ELSE (1 / NULLIF(previous_base_sum,0)) * SQRT(POWER(previous_m, 2) %2D POWER(previous_sum / NULLIF(previous_base_sum,0), 2) * POWER(previous_base_m, 2))
        END as previous_percent_m,

        CASE 
          WHEN (cv < 20)
            THEN true
          ELSE false
        END as is_reliable,

        comparison_cv,
        comparison_m,
        comparison_sum,
        ROUND((comparison_sum / NULLIF(comparison_base_sum,0))::numeric, 4) as comparison_percent,

        CASE
          WHEN (POWER(comparison_m, 2) %2D POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2)) < 0
            THEN (1 / NULLIF(comparison_base_sum,0)) * SQRT(POWER(comparison_m, 2) %2B POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2))
          ELSE (1 / NULLIF(comparison_base_sum,0)) * SQRT(POWER(comparison_m, 2) %2D POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2))
        END as comparison_percent_m,

        CASE 
          WHEN (comparison_cv < 20)
            THEN true
          ELSE false
        END as comparison_is_reliable,

        CASE
          WHEN is_most_recent THEN
            sum - previous_sum
        END as change_sum,

        CASE
          WHEN is_most_recent THEN
            ABS(SQRT(POWER(m, 2) %2B POWER(previous_m, 2)))
        END as change_m,

        CASE
          WHEN is_most_recent THEN
            ROUND(((sum - previous_sum) / NULLIF(previous_sum,0))::numeric, 4)
        END as change_percent,

        CASE
          WHEN is_most_recent THEN
            ABS(sum / NULLIF(previous_sum,0)) 
            * SQRT(
              (POWER(m / 1.645, 2) / POWER(sum, 2))
              %2B (POWER(previous_m / 1.645, 2) / POWER(previous_sum, 2))
            ) * 1.645
        END as change_percent_m

        ${from}
      ) a
  `;
}

module.exports = buildFinalSelection;
