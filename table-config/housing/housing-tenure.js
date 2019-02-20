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
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: ['popoochu.comparison_est', 'divide', 'oochu1.comparison_est'],
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
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("oochu4.comparison_est")) * SQRT((GET("popoochu.comparison_moe")^2) + (GET("popoochu.comparison_est") / (GET("oochu4.comparison_est")^2) * (GET("oochu4.comparison_moe")^2)))',
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: ['popoochu.previous_est', 'divide', 'oochu1.previous_est'],
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("oochu4.previous_est")) * SQRT((GET("popoochu.previous_moe")^2) + (GET("popoochu.previous_est") / (GET("oochu4.previous_est")^2) * (GET("oochu4.previous_moe")^2)))',
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
          formula: '(GET("comparison_moe")/1.645/GET("comparison_est")*100)',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_moe")/1.645/GET("previous_est")*100)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsooc.sum") - GET("avghhsooc.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsooc.m"),2) + POWER(GET("avghhsooc.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsooc.sum") - GET("avghhsooc.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsooc.m"),2) + (POWER(GET("avghhsooc.previous_moe"),2)))',
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
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: ['poprtochu.comparison_est', 'divide', 'rochu1.comparison_est'],
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
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("rochu2.comparison_est")) * SQRT((GET("poprtochu.comparison_moe")^2) + (GET("poprtochu.comparison_est") / (GET("rochu2.comparison_est")^2) * (GET("rochu2.comparison_moe")^2)))',
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: ['poprtochu.previous_est', 'divide', 'rochu1.previous_est'],
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("rochu2.previous_est")) * SQRT((GET("poprtochu.previous_moe")^2) + (GET("poprtochu.previous_est") / (GET("rochu2.previous_est")^2) * (GET("rochu2.previous_moe")^2)))',
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
          formula: '(GET("comparison_moe")/1.645/GET("comparison_est")*100)',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_moe")/1.645/GET("previous_est")*100)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsroc.sum") - GET("avghhsroc.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsroc.m"),2) + POWER(GET("avghhsroc.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsroc.sum") - GET("avghhsroc.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsroc.m"),2) + POWER(GET("avghhsroc.previous_moe"),2))',
        },
      },
    ],
  },
];
