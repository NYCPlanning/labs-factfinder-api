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
        column: 'estimate',
        aggregator: calculator,
        options: {
          procedure: ['popoochu.estimate', 'divide', 'oochu1.estimate'],
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: calculator,
        options: {
          procedure: ['popoochu.comparison_estimate', 'divide', 'oochu1.comparison_estimate'],
        },
      },
      {
        column: 'moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("oochu4.estimate")) * SQRT((GET("popoochu.m")^2) + (GET("popoochu.estimate") / (GET("oochu4.estimate")^2) * (GET("oochu4.m")^2)))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("oochu4.comparison_estimate")) * SQRT((GET("popoochu.comparison_moe")^2) + (GET("popoochu.comparison_estimate") / (GET("oochu4.comparison_estimate")^2) * (GET("oochu4.comparison_moe")^2)))',
        },
      },
      {
        column: 'previous_estimate',
        aggregator: calculator,
        options: {
          procedure: ['popoochu.previous_estimate', 'divide', 'oochu1.previous_estimate'],
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("oochu4.previous_estimate")) * SQRT((GET("popoochu.previous_moe")^2) + (GET("popoochu.previous_estimate") / (GET("oochu4.previous_estimate")^2) * (GET("oochu4.previous_moe")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("moe")/1.645/GET("estimate")*100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(GET("comparison_moe")/1.645/GET("comparison_estimate")*100)',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_moe")/1.645/GET("previous_estimate")*100)',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsooc.estimate") - GET("avghhsooc.comparison_estimate"))',
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
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsooc.estimate") - GET("avghhsooc.previous_estimate"))',
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
        column: 'estimate',
        aggregator: calculator,
        options: {
          procedure: ['poprtochu.estimate', 'divide', 'rochu1.estimate'],
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: calculator,
        options: {
          procedure: ['poprtochu.comparison_estimate', 'divide', 'rochu1.comparison_estimate'],
        },
      },
      {
        column: 'moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("rochu2.estimate")) * SQRT((GET("poprtochu.m")^2) + (GET("poprtochu.estimate") / (GET("rochu2.estimate")^2) * (GET("rochu2.m")^2)))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("rochu2.comparison_estimate")) * SQRT((GET("poprtochu.comparison_moe")^2) + (GET("poprtochu.comparison_estimate") / (GET("rochu2.comparison_estimate")^2) * (GET("rochu2.comparison_moe")^2)))',
        },
      },
      {
        column: 'previous_estimate',
        aggregator: calculator,
        options: {
          procedure: ['poprtochu.previous_estimate', 'divide', 'rochu1.previous_estimate'],
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("rochu2.previous_estimate")) * SQRT((GET("poprtochu.previous_moe")^2) + (GET("poprtochu.previous_estimate") / (GET("rochu2.previous_estimate")^2) * (GET("rochu2.previous_moe")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("moe")/1.645/GET("estimate")*100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(GET("comparison_moe")/1.645/GET("comparison_estimate")*100)',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_moe")/1.645/GET("previous_estimate")*100)',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsroc.estimate") - GET("avghhsroc.comparison_estimate"))',
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
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsroc.estimate") - GET("avghhsroc.previous_estimate"))',
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
