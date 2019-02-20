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
        column: 'sum',
        aggregator: calculator,
        options: {
          procedure: ['agttm.sum', 'divide', ['wrkr16pl.sum', 'subtract', 'cw_wrkdhm.sum']],
        },
      },
      {
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: ['agttm.comparison_est', 'divide', ['wrkr16pl.comparison_est', 'subtract', 'cw_wrkdhm.comparison_est']],
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: ['agttm.previous_est', 'divide', ['wrkr16pl.previous_est', 'subtract', 'cw_wrkdhm.previous_est']],
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1/GET("wrkrnothm.sum")) * SQRT((GET("agttm.m")^2) + (GET("agttm.sum") / (GET("wrkrnothm.sum")^2) * (GET("wrkrnothm.m")^2)))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("wrkrnothm.comparison_est")) * SQRT((GET("agttm.comparison_moe")^2) + (GET("agttm.comparison_est") / (GET("wrkrnothm.comparison_est")^2) * (GET("wrkrnothm.comparison_moe")^2)))',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("wrkrnothm.previous_est")) * SQRT((GET("agttm.previous_moe")^2) + (GET("agttm.previous_est") / (GET("wrkrnothm.previous_est")^2) * (GET("wrkrnothm.previous_moe")^2)))',
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
          formula: '(GET("mntrvtm.sum") - GET("mntrvtm.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mntrvtm.m"),2) + POWER(GET("mntrvtm.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mntrvtm.sum") - GET("mntrvtm.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mntrvtm.m"),2) + POWER(GET("mntrvtm.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mntrvtm.previous_est"))=0,"",((GET("mntrvtm.sum")-GET("mntrvtm.previous_est"))/GET("mntrvtm.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mntrvtm.m")^2)+((GET("mntrvtm.sum")/GET("mntrvtm.previous_est"))^2*GET("mntrvtm.previous_moe")^2)))/GET("mntrvtm.previous_est"))',
        },
      },
    ],
    decimal: 1,
  },
];
