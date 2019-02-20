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
        column: 'est',
        aggregator: formula,
        options: {
          formula: '(GET("pop1.est"))/(GET("landacres.est"))',
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("pop1.previous_est"))/(GET("landacres.previous_est"))',
        },
      },
      {
        column: 'comparison_est',
        aggregator: formula,
        options: {
          formula: '(GET("pop1.comparison_est"))/(GET("landacres.comparison_est"))',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("popperacre.est") - GET("popperacre.comparison_est"))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("popperacre.est") - GET("popperacre.previous_est"))',
        },
      },
    ],
  },
];
