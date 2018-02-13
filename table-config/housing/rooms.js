const interpolate = require('../../utils/interpolate');
const calculateMedianError = require('../../utils/calculate-median-error');
const formula = require('../../utils/formula');

const binsForMdrms = [
  ['rms1', [0, 1.499]],
  ['rms2', [1.5, 2.499]],
  ['rms3', [2.5, 3.499]],
  ['rms4', [3.5, 4.499]],
  ['rms5', [4.5, 5.499]],
  ['rms6', [5.5, 6.499]],
  ['rms7', [6.5, 7.499]],
  ['rms8', [7.5, 8.499]],
  ['rms9pl', [8.5, 9]],
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
    specialCalculations: [
      {
        column: 'sum',
        aggregator: interpolate,
        options: {
          bins: binsForMdrms,
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
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdrms.m")/ 1.645) / GET("mdrms.sum") * 100)',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: interpolate,
        options: {
          bins: binsForMdrms,
        },
      },
      {
        column: 'comparison_m',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdrms,
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdrms.comparison_m")/ 1.645) / GET("mdrms.comparison_sum") * 100)',
        },
      },
      {
        column: 'previous_sum',
        aggregator: interpolate,
        options: {
          bins: binsForMdrms,
        },
      },
      {
        column: 'previous_m',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdrms,
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.sum") - GET("mdrms.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdrms.m"),2) + POWER(GET("mdrms.comparison_m"),2))',
        },
      },
      {
        column: 'change_sum',
        aggregator: formula,
        options: {
          formula: '(GET("mdrms.sum") - GET("mdrms.previous_sum"))',
        },
      },
      {
        column: 'change_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdrms.m"),2) + POWER(GET("mdrms.previous_m"),2))',
        },
      },
    ],
  },
];
