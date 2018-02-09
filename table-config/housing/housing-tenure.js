const calculator = require('../../utils/calculator');
const formula = require('../../utils/formula');

module.exports = [
  {
    title: 'Occupied housing units',
    highlight: true,
    variable: 'ochu2',
  },
  {
    title: 'Owner-occupied',
    variable: 'oochu1',
  },
  {
    title: 'Renter-occupied',
    variable: 'rochu1',
  },
  {
    divider: true,
  },
  {
    title: 'Average household size of owner-occupied unit',
    tooltip: 'Population in owner-occupied housing units, divided by number of owner-occupied housing units',
    variable: 'avghhsooc',
    special: true,
    decimal: 2,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: calculator,
        options: {
          procedure: ['popoochu.sum', 'divide', 'oochu1.sum'],
        },
      },
      {
        column: 'comparison_sum',
        aggregator: calculator,
        options: {
          procedure: ['popoochu.comparison_sum', 'divide', 'oochu1.comparison_sum'],
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(564)*((GET("uwhusmpl3.sum"))^-0.762)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(564)*((GET("uwhusmpl3.comparison_sum"))^-0.762)',
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '((((GET("avghhsooc.cv"))/(100))*1.645))*(GET("avghhsooc.sum"))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: '((((GET("avghhsooc.comparison_cv"))/(100))*1.645))*(GET("avghhsooc.comparison_sum"))',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsooc.sum") - GET("avghhsooc.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsooc.m"),2) + POWER(GET("avghhsooc.comparison_m"),2))',
        },
      },      
    ],
  },
  {
    title: 'Average household size of renter-occupied unit',
    tooltip: 'Population in renter-occupied housing units, divided by number of renter-occupied housing units',
    variable: 'avghhsroc',
    special: true,
    decimal: 2,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: calculator,
        options: {
          procedure: ['poprtochu.sum', 'divide', 'rochu1.sum'],
        },
      },
      {
        column: 'comparison_sum',
        aggregator: calculator,
        options: {
          procedure: ['poprtochu.comparison_sum', 'divide', 'rochu1.comparison_sum'],
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(257)*((GET("uwhusmpl3.sum"))^-0.699)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(257)*((GET("uwhusmpl3.comparison_sum"))^-0.699)',
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '((((GET("avghhsroc.cv"))/(100))*1.645))*(GET("avghhsroc.sum"))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: '((((GET("avghhsroc.comparison_cv"))/(100))*1.645))*(GET("avghhsroc.comparison_sum"))',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsroc.sum") - GET("avghhsroc.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsroc.m"),2) + POWER(GET("avghhsroc.comparison_m"),2))',
        },
      },      
    ],
  },
];
