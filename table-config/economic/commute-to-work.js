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
        column: 'comparison_sum',
        aggregator: calculator,
        options: {
          procedure: ['agttm.comparison_sum', 'divide', ['wrkr16pl.comparison_sum', 'subtract', 'cw_wrkdhm.comparison_sum']],
        },
      },
      {
        column: 'previous_sum',
        aggregator: calculator,
        options: {
          procedure: ['agttm.previous_sum', 'divide', ['wrkr16pl.previous_sum', 'subtract', 'cw_wrkdhm.previous_sum']],
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1 / GET("wrkrnothm.sum")) * SQRT((GET("agttm.m")^2) + ((GET("agttm.sum") / (GET("wrkrnothm.sum")))^2 * (GET("wrkrnothm.m")^2)))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: '(1 / GET("wrkrnothm.comparison_sum")) * SQRT((GET("agttm.comparison_m")^2) + ((GET("agttm.comparison_sum") / (GET("wrkrnothm.comparison_sum")))^2 * (GET("wrkrnothm.comparison_m")^2)))',
        },
      },
      {
        column: 'previous_m',
        aggregator: formula,
        options: {
          formula: '(1/GET("wrkrnothm.previous_sum")) * SQRT((GET("agttm.previous_m")^2) + (GET("agttm.previous_sum") / (GET("wrkrnothm.previous_sum")^2) * (GET("wrkrnothm.previous_m")^2)))',
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
          formula: '(GET("mntrvtm.sum") - GET("mntrvtm.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mntrvtm.m"),2) + POWER(GET("mntrvtm.comparison_m"),2))',
        },
      },
      {
        column: 'change_sum',
        aggregator: formula,
        options: {
          formula: '(GET("mntrvtm.sum") - GET("mntrvtm.previous_sum"))',
        },
      },
      {
        column: 'change_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mntrvtm.m"),2) + POWER(GET("mntrvtm.previous_m"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mntrvtm.previous_sum"))=0,"",((GET("mntrvtm.sum")-GET("mntrvtm.previous_sum"))/GET("mntrvtm.previous_sum")))',
        },
      },
      {
        column: 'change_percent_m',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mntrvtm.m")^2)+((GET("mntrvtm.sum")/GET("mntrvtm.previous_sum"))^2*GET("mntrvtm.previous_m")^2)))/GET("mntrvtm.previous_sum"))',
        },
      },
    ],
    decimal: 1,
  },
];
