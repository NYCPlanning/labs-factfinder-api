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
        column: 'estimate',
        aggregator: formula,
        options: {
          formula: '(GET("popoochu.estimate"))/(GET("oochu.estimate"))',
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("popoochu.comparison_estimate"))/(GET("oochu.comparison_estimate"))',
        },
      },
      {
        column: 'previous_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("popoochu.previous_estimate"))/(GET("oochu.previous_estimate"))',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszooc.estimate") - GET("avhhszooc.comparison_estimate"))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszooc.estimate") - GET("avhhszooc.previous_estimate"))',
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
        column: 'estimate',
        aggregator: formula,
        options: {
          formula: '(GET("poprochu.estimate"))/(GET("rochu_1.estimate"))',
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("poprochu.comparison_estimate"))/(GET("rochu_1.comparison_estimate"))',
        },
      },
      {
        column: 'previous_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("poprochu.previous_estimate"))/(GET("rochu_1.previous_estimate"))',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszroc.estimate") - GET("avhhszroc.comparison_estimate"))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszroc.estimate") - GET("avhhszroc.previous_estimate"))',
        },
      },
    ],
  },
];
