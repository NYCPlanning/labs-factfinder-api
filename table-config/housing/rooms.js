const interpolate = require('../../utils/interpolate');
const calculateMedianError = require('../../utils/calculate-median-error');
const formula = require('../../utils/formula');

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
          bins: [
            ['rms1', [0, 1.499]],
            ['rms2', [1.5, 2.499]],
            ['rms3', [2.5, 3.499]],
            ['rms4', [3.5, 4.499]],
            ['rms5', [4.5, 5.499]],
            ['rms6', [5.5, 6.499]],
            ['rms7', [6.5, 7.499]],
            ['rms8', [7.5, 8.499]],
            ['rms9pl', [8.5, 9]],
          ],
        },
      },
      {
        column: 'm',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: [
            ['rms1', [1, 1]],
            ['rms2', [2, 2]],
            ['rms3', [3, 3]],
            ['rms4', [4, 4]],
            ['rms5', [5, 5]],
            ['rms6', [6, 6]],
            ['rms7', [7, 7]],
            ['rms8', [8, 8]],
            ['rms9pl', [9, 9]],
          ],
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
          bins: [
            ['rms1', [1, 1]],
            ['rms2', [2, 2]],
            ['rms3', [3, 3]],
            ['rms4', [4, 4]],
            ['rms5', [5, 5]],
            ['rms6', [6, 6]],
            ['rms7', [7, 7]],
            ['rms8', [8, 8]],
            ['rms9pl', [9, 9]],
          ],
        },
      },
      {
        column: 'comparison_m',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: [
            ['rms1', [1, 1]],
            ['rms2', [2, 2]],
            ['rms3', [3, 3]],
            ['rms4', [4, 4]],
            ['rms5', [5, 5]],
            ['rms6', [6, 6]],
            ['rms7', [7, 7]],
            ['rms8', [8, 8]],
            ['rms9pl', [9, 9]],
          ],
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
    ],
  },
];
