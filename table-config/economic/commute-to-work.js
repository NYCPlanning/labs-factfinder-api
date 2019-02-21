const calculator = require('../../utils/calculator');
const formula = require('../../utils/formula');

module.exports = [
  {
    title: 'Workers 16 years and over',
    highlight: true,
    variable: 'wrkr16pl',
  },
  {
    title: 'Car, truck, or van -- drove alone',
    variable: 'cw_drvaln',
  },
  {
    title: 'Car, truck, or van -- carpooled',
    variable: 'cw_crpld',
  },
  {
    title: 'Public transportation',
    variable: 'cw_pbtrns',
  },
  {
    title: 'Walked',
    variable: 'cw_wlkd',
  },
  {
    title: 'Other means',
    variable: 'cw_oth',
  },
  {
    title: 'Worked at home',
    variable: 'cw_wrkdhm',
  },
  {
    divider: true,
  },
  {
    title: 'Mean travel time to work (minutes)',
    tooltip: 'Aggregate travel time to work, divided by workers 16 years and over who did not work at home',
    variable: 'mntrvtm',
    special: true,
    specialCalculations: [
      {
        column: 'estimate',
        aggregator: calculator,
        options: {
          procedure: ['agttm.estimate', 'divide', ['wrkr16pl.estimate', 'subtract', 'cw_wrkdhm.estimate']],
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: calculator,
        options: {
          procedure: ['agttm.comparison_estimate', 'divide', ['wrkr16pl.comparison_estimate', 'subtract', 'cw_wrkdhm.comparison_estimate']],
        },
      },
      {
        column: 'previous_estimate',
        aggregator: calculator,
        options: {
          procedure: ['agttm.previous_estimate', 'divide', ['wrkr16pl.previous_estimate', 'subtract', 'cw_wrkdhm.previous_estimate']],
        },
      },
      {
        column: 'moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("wrkrnothm.estimate")) * SQRT((GET("agttm.moe")^2) + (GET("agttm.estimate") / (GET("wrkrnothm.estimate")^2) * (GET("wrkrnothm.moe")^2)))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("wrkrnothm.comparison_estimate")) * SQRT((GET("agttm.comparison_moe")^2) + (GET("agttm.comparison_estimate") / (GET("wrkrnothm.comparison_estimate")^2) * (GET("wrkrnothm.comparison_moe")^2)))',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("wrkrnothm.previous_estimate")) * SQRT((GET("agttm.previous_moe")^2) + (GET("agttm.previous_estimate") / (GET("wrkrnothm.previous_estimate")^2) * (GET("wrkrnothm.previous_moe")^2)))',
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
          formula: '(GET("mntrvtm.estimate") - GET("mntrvtm.comparison_estimate"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mntrvtm.moe"),2) + POWER(GET("mntrvtm.comparison_moe"),2))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("mntrvtm.estimate") - GET("mntrvtm.previous_estimate"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mntrvtm.moe"),2) + POWER(GET("mntrvtm.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mntrvtm.previous_estimate"))=0,"",((GET("mntrvtm.estimate")-GET("mntrvtm.previous_estimate"))/GET("mntrvtm.previous_estimate")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mntrvtm.moe")^2)+((GET("mntrvtm.estimate")/GET("mntrvtm.previous_estimate"))^2*GET("mntrvtm.previous_moe")^2)))/GET("mntrvtm.previous_estimate"))',
        },
      },
    ],
    decimal: 1,
  },
];
