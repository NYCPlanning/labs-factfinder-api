const CV_CONST = 1.645;

module.exports = {
  // sum values
  sum: (aggSum, universe) => `GET("${aggSum}.sum") / GET("${universe}.sum")`,
  ratio: (observed, universe) => `GET("${observed}.sum") / (GET("${observed}.sum") + GET("${universe}.sum"))`,
  change_sum: 'GET("sum") - GET("previous_sum")',
  change_percent: 'IF(GET("previous_sum") = 0, "", (GET("sum") - GET("previous_sum")) / GET("previous_sum"))',
  previous_sum: (aggSum, universe) => `GET("${aggSum}.previous_sum") / GET("${universe}.previous_sum")`,
  previous_ratio: (observed, universe) => `GET("${observed}.previous_sum") / (GET("${observed}.previous_sum") + GET("${universe}.previous_sum"))`,
  difference_sum: 'GET("sum") - GET("comparison_sum")',

  // margin of error values
  m: (aggSum, universe) => `(1/GET("${universe}.sum")) * SQRT((GET("${aggSum}.m")^2) + ((GET("${aggSum}.sum") / GET("${universe}.sum"))^2 * (GET("${universe}".m)^2)))`,
  // copied from @emaurer in slack
  m_rate: (aggSum, universe) => `IF(GET("${universe}.sum")=0,0,IF(GET("${aggSum}.sum")=0,0,IF(((GET("${aggSum}.m")^2)-((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))<0,((1/GET("${universe}.sum")*(SQRT((GET("${aggSum}.m")^2)+((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))))*100),((1/GET("${universe}.sum")*(SQRT((GET("${aggSum}.m")^2)-((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))))*100))))`,
  change_m: 'SQRT(GET("m")^2 + GET("previous_m")^2)',
  change_percent_m: 'SQRT(GET("m")^2 + ((GET("sum") / GET("previous_sum"))^2 * GET("previous_m")^2))) / GET("previous_sum")',
  previous_m: (aggSum, universe) => `(1/GET("${universe}.previous_sum")) * SQRT(POWER(GET("${aggSum}.previous_m"), 2) + (GET("${aggSum}.previous_sum") / POWER(GET("${universe}.previous_sum"), 2) * POWER(GET("${universe}.previous_m"), 2)))`,
  previous_m_rate: (aggSum, universe) => `IF(GET("${universe}.previous_sum")=0,0,IF(GET("${aggSum}.previous_sum")=0,0,IF(((GET("${aggSum}.previous_m")^2)-((GET("${aggSum}.previous_sum")^2/GET("${universe}.previous_sum")^2)*(GET("${universe}.previous_m")^2)))<0,((1/GET("${universe}.previous_sum")*(SQRT((GET("${aggSum}.previous_m")^2)+((GET("${aggSum}.previous_sum")^2/GET("${universe}.previous_sum")^2)*(GET("${universe}.previous_m")^2)))))*100),((1/GET("${universe}.previous_sum")*(SQRT((GET("${aggSum}.previous_m")^2)-((GET("${aggSum}.previous_sum")^2/GET("${universe}.previous_sum")^2)*(GET("${universe}.previous_m")^2)))))*100))))`,
  difference_m: 'SQRT(GET("m")^2 + GET("comparison_m")^2)',

  // coefficient of variation values
  cv: `((GET("m") / "${CV_CONST}") / GET("comparison_sum")) * 100`,
  previous_cv: `((GET("previous_m") / "${CV_CONST}") / GET("comparison_sum")) * 100`,

  scale: (value, factor) => `GET("${value}") * ${factor}`,
};
