const { CV_CONST, DIFF_PERCENT_THRESHOLD } = require('../special-calculations/data/constants');

/*
 * The goal is that, as much as possible, all math done on the data is contained in formulas in this file.
 * These calculations are used to recompute 'sum', 'm', 'cv' values for aggregate datasets,
 * as well as to do all of the change and difference calculations, including significance calculations.
 * The change and difference values are calculated from the given formulas as follows:
 * - delta: change_sum, change_percentage_point, difference_sum
 * - delta_with_threshold: difference_percent
 * - delta_m: change_m, change_percentage_point_m, difference_m, difference_percent_m
 * - change_pct: change_percent
 * - change_pct_m: change_percent_m
 * - significant: change_significant, change_percent_significant, change_percentage_point_significant, significant, percent_significant
 *
 * There are a few other places where some calculations/calculation-related-decisioning happens:
 * - 'percent', 'percent_m', and 'is_reliable' are calculated as part of the original SQL query
 * - boolean checks for value existance are done before all change & difference checks in the code,
 *   and are not represented here in the formulas for readability and easier implementation
 */
module.exports = {
  /** *** sum calculations **** */
  sum: (aggSum, universe) => `GET("${aggSum}.sum") / GET("${universe}.sum")`,
  // special mean calculation for 'ratio' type values TODO: get a better name for ratio
  sum_ratio: (observed, universe) => `GET("${observed}.sum") / (GET("${observed}.sum") + GET("${universe}.sum"))`,

  /** *** margin of error calculations **** */
  m: (aggSum, universe) => `(1/GET("${universe}.sum")) * SQRT((GET("${aggSum}.m")^2) + ((GET("${aggSum}.sum") / GET("${universe}.sum"))^2 * (GET("${universe}.m")^2)))`,
  // special MOE calculation for 'rate' type values, copied from @emaurer in slack
  m_rate: (aggSum, universe) => `IF(GET("${universe}.sum")=0,0,IF(GET("${aggSum}.sum")=0,0,IF(((GET("${aggSum}.m")^2)-((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))<0,((1/GET("${universe}.sum")*(SQRT((GET("${aggSum}.m")^2)+((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))))*100),((1/GET("${universe}.sum")*(SQRT((GET("${aggSum}.m")^2)-((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))))*100))))`,

  /** *** coefficient of variation calculations **** */
  cv: `((GET("m") / "${CV_CONST}") / GET("sum")) * 100`,

  /** *** is_reliable calculation **** */
  is_reliable: 'GET("cv") < 20',

  /** *** change and difference calculations **** */
  // Δ sum
  delta: (sum, compSum) => `${sum} - ${compSum}`,
  delta_with_threshold: (sum, compSum) => `IF(AND(${sum} - ${compSum} < 0, ${sum} - ${compSum} > ${DIFF_PERCENT_THRESHOLD}), 0, ${sum} - ${compSum})`,
  // Δ m
  delta_m: (m, compM) => `ABS(SQRT((${m}^2) + (${compM}^2)))`,
  // Δ change % - requires special calculation
  change_pct: (sum, prevSum) => `(${sum} - ${prevSum}) / ${prevSum}`,
  // Δ change_m % - requires special calculation
  change_pct_m: (sum, prevSum, m, prevM) => `ABS(${sum} / ${prevSum}) * SQRT(((${m} / ${CV_CONST}) / ${sum})^2 + ((${prevM} / ${CV_CONST}) / ${prevSum})^2) * ${CV_CONST}`,
  // Δ significant
  significant: (sum, m) => `((${m} / ${CV_CONST}) / ABS(${sum})) * 100 < 20`,
};
