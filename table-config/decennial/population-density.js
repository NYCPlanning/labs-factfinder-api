const formula = require('../../utils/formula');

module.exports = [
  {
    title: 'Total population',
    variable: 'pop1',
  },
  {
    title: 'Population per acre',
    tooltip: 'Total population divided by land area (in acres)',
    variable: 'popperacre',
    decimal: 1,
    special: true,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '(GET("pop1.sum"))/(GET("landacres.sum"))',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: formula,
        options: {
          formula: '(GET("pop1.comparison_sum"))/(GET("landacres.comparison_sum"))',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("popperacre.sum") - GET("popperacre.comparison_sum"))',
        },
      },
      {
        column: 'change_sum',
        aggregator: formula,
        options: {
          formula: '(GET("popperacre.sum") - GET("popperacre.previous_sum"))',
        },
      },
    ],
  },
];
