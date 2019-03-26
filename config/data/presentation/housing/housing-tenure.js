const calculator = require('../../../../utils/calculator');
const formula = require('../../../../utils/formula');

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
    hidePercentChange: false,
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
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1/GET("oochu4.sum")) * SQRT((GET("popoochu.m")^2) + (GET("popoochu.sum") / (GET("oochu4.sum")^2) * (GET("oochu4.m")^2)))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: '(1/GET("oochu4.comparison_sum")) * SQRT((GET("popoochu.comparison_m")^2) + (GET("popoochu.comparison_sum") / (GET("oochu4.comparison_sum")^2) * (GET("oochu4.comparison_m")^2)))',
        },
      },
      {
        column: 'previous_sum',
        aggregator: calculator,
        options: {
          procedure: ['popoochu.previous_sum', 'divide', 'oochu1.previous_sum'],
        },
      },
      {
        column: 'previous_m',
        aggregator: formula,
        options: {
          formula: '(1/GET("oochu4.previous_sum")) * SQRT((GET("popoochu.previous_m")^2) + (GET("popoochu.previous_sum") / (GET("oochu4.previous_sum")^2) * (GET("oochu4.previous_m")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("m")/1.645/GET("sum")*100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(GET("comparison_m")/1.645/GET("comparison_sum")*100)',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_m")/1.645/GET("previous_sum")*100)',
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
      {
        column: 'change_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsooc.sum") - GET("avghhsooc.previous_sum"))',
        },
      },
      {
        column: 'change_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsooc.m"),2) + (POWER(GET("avghhsooc.previous_m"),2)))',
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
    hidePercentChange: false,
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
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1/GET("rochu2.sum")) * SQRT((GET("poprtochu.m")^2) + (GET("poprtochu.sum") / (GET("rochu2.sum")^2) * (GET("rochu2.m")^2)))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: '(1/GET("rochu2.comparison_sum")) * SQRT((GET("poprtochu.comparison_m")^2) + (GET("poprtochu.comparison_sum") / (GET("rochu2.comparison_sum")^2) * (GET("rochu2.comparison_m")^2)))',
        },
      },
      {
        column: 'previous_sum',
        aggregator: calculator,
        options: {
          procedure: ['poprtochu.previous_sum', 'divide', 'rochu1.previous_sum'],
        },
      },
      {
        column: 'previous_m',
        aggregator: formula,
        options: {
          formula: '(1/GET("rochu2.previous_sum")) * SQRT((GET("poprtochu.previous_m")^2) + (GET("poprtochu.previous_sum") / (GET("rochu2.previous_sum")^2) * (GET("rochu2.previous_m")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("m")/1.645/GET("sum")*100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(GET("comparison_m")/1.645/GET("comparison_sum")*100)',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_m")/1.645/GET("previous_sum")*100)',
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
      {
        column: 'change_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsroc.sum") - GET("avghhsroc.previous_sum"))',
        },
      },
      {
        column: 'change_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsroc.m"),2) + POWER(GET("avghhsroc.previous_m"),2))',
        },
      },
    ],
  },
];
