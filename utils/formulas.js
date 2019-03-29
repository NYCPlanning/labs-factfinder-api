const { CV_CONST } = require('../special-calculations/data/constants');

module.exports = {
  /***** sum calculations *****/
  sum: (aggSum, universe) => `GET("${aggSum}.sum") / GET("${universe}.sum")`,
  // special mean calculation for 'ratio' type values TODO: get a better name for ratio
  sum_ratio: (observed, universe) => `GET("${observed}.sum") / (GET("${observed}.sum") + GET("${universe}.sum"))`,

  /***** margin of error calculations *****/
  m: (aggSum, universe) => `(1/GET("${universe}.sum")) * SQRT((GET("${aggSum}.m")^2) + ((GET("${aggSum}.sum") / GET("${universe}.sum"))^2 * (GET("${universe}.m")^2)))`,
  // special MOE calculation for 'rate' type values, copied from @emaurer in slack
  m_rate: (aggSum, universe) => `IF(GET("${universe}.sum")=0,0,IF(GET("${aggSum}.sum")=0,0,IF(((GET("${aggSum}.m")^2)-((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))<0,((1/GET("${universe}.sum")*(SQRT((GET("${aggSum}.m")^2)+((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))))*100),((1/GET("${universe}.sum")*(SQRT((GET("${aggSum}.m")^2)-((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))))*100))))`,

  /***** coefficient of variation calculations *****/
  cv: `((GET("m") / "${CV_CONST}") / GET("sum")) * 100`,

 
  /***** change and difference calculations *****/ 
  // Δ sum
  delta: (sum, compSum) => `${sum} - ${compSum}`,
  // Δ m
  delta_m: (m, compM) => `ABS(SQRT((${m}^2) + (${compM}^2)))`,
  // Δ change % - requires special calculation
  change_pct: (sum, prevSum) => `(${sum} - ${prevSum}) / ${prevSum}`,
  // Δ change_m % - requires special calculation
  change_pct_m: (sum, prevSum, m, prevM) => `ABS(${sum} / ${prevSum}) * SQRT(((${m} / ${CV_CONST}) / ${sum})^2 + ((${prevM} / ${CV_CONST}) / ${prevSum})^2) * ${CV_CONST}`,
  // Δ significant
  significant: (sum, m) => `((${m} / ${CV_CONST}) / ABS(${sum})) * 100 < 20`,
};
