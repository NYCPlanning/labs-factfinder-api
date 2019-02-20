const formula = require('../../utils/formula');

module.exports = [
  {
    highlight: true,
    title: 'Occupied housing units',
    variable: 'ochu_2',
  },
  {
    title: 'Owner-occupied housing units',
    variable: 'oochu',
  },
  {
    title: 'Renter-occupied housing units',
    variable: 'rochu_1',
  },
  {
    divider: true,
  },
  {
    title: 'Average household size of owner-occupied units',
    tooltip: 'Number of people living in owner-occupied housing units, divided by number of owner-occupied housing units',
    variable: 'avhhszooc',
    decimal: 2,
    special: true,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '(GET("popoochu.sum"))/(GET("oochu.sum"))',
        },
      },
      {
        column: 'comparison_est',
        aggregator: formula,
        options: {
          formula: '(GET("popoochu.comparison_est"))/(GET("oochu.comparison_est"))',
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("popoochu.previous_est"))/(GET("oochu.previous_est"))',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszooc.sum") - GET("avhhszooc.comparison_est"))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszooc.sum") - GET("avhhszooc.previous_est"))',
        },
      },
    ],
  },
  {
    title: 'Average household size of renter-occupied units',
    tooltip: 'Number of people living in renter-occupied housing units, divided by number of renter-occupied housing units',
    variable: 'avhhszroc',
    decimal: 2,
    special: true,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '(GET("poprochu.sum"))/(GET("rochu_1.sum"))',
        },
      },
      {
        column: 'comparison_est',
        aggregator: formula,
        options: {
          formula: '(GET("poprochu.comparison_est"))/(GET("rochu_1.comparison_est"))',
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("poprochu.previous_est"))/(GET("rochu_1.previous_est"))',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszroc.sum") - GET("avhhszroc.comparison_est"))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszroc.sum") - GET("avhhszroc.previous_est"))',
        },
      },
    ],
  },
];
