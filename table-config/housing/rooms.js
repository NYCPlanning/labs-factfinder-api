const interpolate = require('../../utils/interpolate');
const calculateMedianError = require('../../utils/calculate-median-error');
const formula = require('../../utils/formula');

const binsForMdrms = [
  ['rms1', [0, 1499]],
  ['rms2', [1500, 2499]],
  ['rms3', [2500, 3499]],
  ['rms4', [3500, 4499]],
  ['rms5', [4500, 5499]],
  ['rms6', [5500, 6499]],
  ['rms7', [6500, 7499]],
  ['rms8', [7500, 8499]],
  ['rms9pl', [8500, 9000]],
];

module.exports = [
  {
    title: 'Total housing units',
    highlight: true,
    variable: 'hu4',
  },
  {
    title: '1 room',
    variable: 'rms1',
  },
  {
    title: '2 rooms',
    variable: 'rms2',
  },
  {
    title: '3 rooms',
    variable: 'rms3',
  },
  {
    title: '4 rooms',
    variable: 'rms4',
  },
  {
    title: '5 rooms',
    variable: 'rms5',
  },
  {
    title: '6 rooms',
    variable: 'rms6',
  },
  {
    title: '7 rooms',
    variable: 'rms7',
  },
  {
    title: '8 rooms',
    variable: 'rms8',
  },
  {
    title: '9 rooms or more',
    variable: 'rms9pl',
  },
  {
    title: 'Median rooms',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top-coded values',
    variable: 'mdrms',
    special: true,
    decimal: 1,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: interpolate,
        options: {
          bins: binsForMdrms,
        },
      },
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.sum") / 1000)',
        },
      },
      {
        column: 'm',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdrms,
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.m") / 1000)',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdrms.m")/ 1.645) / GET("mdrms.sum") * 100)',
        },
      },
      {
        column: 'comparison_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdrms,
        },
      },
      {
        column: 'comparison_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.comparison_est") / 1000)',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdrms,
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.comparison_moe") / 1000)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdrms.comparison_moe")/ 1.645) / GET("mdrms.comparison_est") * 100)',
        },
      },
      {
        column: 'previous_est',
        aggregator: interpolate,
        referenceSumKey: 'previous_est',
        options: {
          bins: binsForMdrms,
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.previous_est") / 1000)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdrms,
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.previous_moe") / 1000)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.sum") - GET("mdrms.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdrms.m"),2) + POWER(GET("mdrms.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.sum") - GET("mdrms.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdrms.m"),2) + POWER(GET("mdrms.previous_moe"),2))',
        },
      },
    ],
  },
];
