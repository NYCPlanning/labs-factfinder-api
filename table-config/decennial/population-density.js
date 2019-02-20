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
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'estimate',
        aggregator: formula,
        options: {
          formula: '(GET("pop1.estimate"))/(GET("landacres.estimate"))',
        },
      },
      {
        column: 'previous_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("pop1.previous_estimate"))/(GET("landacres.previous_estimate"))',
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("pop1.comparison_estimate"))/(GET("landacres.comparison_estimate"))',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("popperacre.estimate") - GET("popperacre.comparison_estimate"))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("popperacre.estimate") - GET("popperacre.previous_estimate"))',
        },
      },
    ],
  },
];
