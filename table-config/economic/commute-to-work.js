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
        aggregator: formula,
        options: {
          formula: '99929',
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
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(316)*((GET("uwpopsmpl.sum"))^-0.679)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(316)*((GET("uwpopsmpl.comparison_sum"))^-0.679)',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(316)*((GET("uwpopsmpl.previous_sum"))^-0.679)',
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '((((GET("mntrvtm.cv"))/(100))*(1.645))*(GET("mntrvtm.sum")))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: '((((GET("mntrvtm.comparison_cv"))/(100))*(1.645))*(GET("mntrvtm.comparison_sum")))',
        },
      },
      {
        column: 'previous_m',
        aggregator: formula,
        options: {
          formula: '((((GET("mntrvtm.previous_cv"))/(100))*(1.645))*(GET("mntrvtm.previous_sum")))',
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
          formula: 'IF (GET("mntrvtm.previous_sum")=0, null, ((GET("mntrvtm.sum") - GET("mntrvtm.previous_sum") )/GET("mntrvtm.previous_sum")))',
        },
      },
    ],
    decimal: 1,
  },
];
