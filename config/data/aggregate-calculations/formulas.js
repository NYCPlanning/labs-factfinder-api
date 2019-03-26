const CV_CONST = 1.645;

module.exports = {
  // sum values
  sum: {
    median: 'interpolate',
    mean: (aggSum, universe) => `GET(${aggSum}.sum) / GET(${universe}.sum)`,
    ratio: (observed, universe) => `GET(${observed}.sum) / (GET(${observed}.sum) + GET(${universe}.sum))`,
  },
  change_sum: `GET(sum) - GET(previous_sum)`,
  change_percent: `IF(GET(previous_sum) = 0, '', (GET(sum) - GET(previous_sum)) / GET(previous_sum)`,
  previous_sum: {
    median: 'interpolate',
    mean: (aggSum, universe) => `GET(${aggSum}.previous_sum) / GET(${universe}.previous_sum)`,
  },
  difference_sum: `GET(sum) - GET(comparison_sum)`,

  // margin of error values
  m: {
    median: 'calculateMedianError',
    mode: (aggSum, universe) => `(1/GET(${universe}.sum)) * SQRT(POWER(GET(${aggSum}.m), 2) + (GET(${aggSum}.sum) / POWER(GET(${universe}.sum), 2) * POWER(GET(${universe}.m), 2)))`,
  },
  change_m: `SQRT(POWER(GET(m), 2) + POWER(GET(previous_m), 2))`,
  change_percent_m: `SQRT(POWER(GET(m), 2) + POWER(GET(sum) / GET(previous_sum), 2) * POWER(GET(previous_m), 2)) / GET(previous_sum)`,
  previous_m: {
    median: 'calculateMedianError',
    mode: (addSum, universe) => `(1/GET(${universe}.previous_sum)) * SQRT(POWER(GET(${aggSum}.previous_m), 2) + (GET(${aggSum}.previous_sum) / POWER(GET(${universe}.previous_sum), 2) * POWER(GET(${universe}.previous_m), 2)))`,
  },
  difference_m: `SQRT(POWER(GET(m), 2) + POWER(GET(comparison_m), 2))`,

  // coefficient of variation values
  cv: `((GET(m) / ${CV_CONST}) / GET(comparison_sum)) * 100`,
  previous_cv: `((GET(previous_m) / ${CV_CONST}) / GET(comparison_sum)) * 100`,
};
