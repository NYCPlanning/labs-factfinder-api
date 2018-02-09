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
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '(GET("popoochu.sum"))/(GET("oochu.sum"))',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: formula,
        options: {
          formula: '(GET("popoochu.comparison_sum"))/(GET("oochu.comparison_sum"))',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszooc.sum") - GET("avhhszooc.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avhhszooc.m"),2) + POWER(GET("avhhszooc.comparison_m"),2))',
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
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '(GET("poprochu.sum"))/(GET("rochu_1.sum"))',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: formula,
        options: {
          formula: '(GET("poprochu.comparison_sum"))/(GET("rochu_1.comparison_sum"))',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avhhszroc.sum") - GET("avhhszroc.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avhhszroc.m"),2) + POWER(GET("avhhszroc.comparison_m"),2))',
        },
      },      
    ],
  },
];
