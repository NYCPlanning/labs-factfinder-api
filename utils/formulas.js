const { CV_CONST } = require('../data/special-calculations/constants');

module.exports = {
  // sum values
  sum: (aggSum, universe) => `GET("${aggSum}.sum") / GET("${universe}.sum")`,
  ratio: (observed, universe) => `GET("${observed}.sum") / (GET("${observed}.sum") + GET("${universe}.sum"))`,

  // margin of error values
  m: (aggSum, universe) => `(1/GET("${universe}.sum")) * SQRT((GET("${aggSum}.m")^2) + ((GET("${aggSum}.sum") / GET("${universe}.sum"))^2 * (GET("${universe}".m)^2)))`,
  // copied from @emaurer in slack
  rate: (aggSum, universe) => `IF(GET("${universe}.sum")=0,0,IF(GET("${aggSum}.sum")=0,0,IF(((GET("${aggSum}.m")^2)-((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))<0,((1/GET("${universe}.sum")*(SQRT((GET("${aggSum}.m")^2)+((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))))*100),((1/GET("${universe}.sum")*(SQRT((GET("${aggSum}.m")^2)-((GET("${aggSum}.sum")^2/GET("${universe}.sum")^2)*(GET("${universe}.m")^2)))))*100))))`,

  // coefficient of variation values
  cv: `((GET("m") / "${CV_CONST}") / GET("comparison_sum")) * 100`,

  scale: (value, factor) => `GET("${value}") * ${factor}`,
};
