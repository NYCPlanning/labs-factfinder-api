const interpolate = require('../../utils/interpolate');
const formula = require('../../utils/formula');
const calculateMedianError = require('../../utils/calculate-median-error');
const inflate = require('../../utils/inflate');

const binsForMdewrk = [
  ['ernu2pt5k', [0, 2499]],
  ['ern2pt5t5', [2500, 4999]],
  ['ern5t7pt5', [5000, 7499]],
  ['e7pt5t10', [7500, 9999]],
  ['e10t12pt5', [10000, 12499]],
  ['e12pt5t15', [12500, 14999]],
  ['e15t17pt5', [15000, 17499]],
  ['e17pt5t20', [17500, 19999]],
  ['e20t22pt5', [20000, 22499]],
  ['e22pt5t25', [22500, 24999]],
  ['ern25t30', [25000, 29999]],
  ['ern30t35', [30000, 34999]],
  ['ern35t40', [35000, 39999]],
  ['ern40t45', [40000, 44999]],
  ['ern45t50', [45000, 49999]],
  ['ern50t55', [50000, 54999]],
  ['ern55t65', [55000, 64999]],
  ['ern65t75', [65000, 74999]],
  ['ern75t100', [75000, 99999]],
  ['ern100pl', [100000, 250000]],
];

const binsForMdemftwrk = [
  ['mftu2pt5k', [0, 2499]],
  ['mft2p5t5', [2500, 4999]],
  ['mft5t7p5', [5000, 7499]],
  ['mft7p5t10', [7500, 9999]],
  ['mf10t12p5', [10000, 12499]],
  ['mf12p5t15', [12500, 14999]],
  ['mf15t17p5', [15000, 17499]],
  ['mf17p5t20', [17500, 19999]],
  ['mf20t22p5', [20000, 22499]],
  ['mf22p5t25', [22500, 24999]],
  ['mft25t30', [25000, 29999]],
  ['mft30t35', [30000, 34999]],
  ['mft35t40', [35000, 39999]],
  ['mft40t45', [40000, 44999]],
  ['mft45t50', [45000, 49999]],
  ['mft50t55', [50000, 54999]],
  ['mft55t65', [55000, 64999]],
  ['mft65t75', [65000, 74999]],
  ['mft75t100', [75000, 99999]],
  ['mft100pl', [100000, 250000]],
];

const binsForMdefftwrk = [
  ['fftu2pt5k', [0, 2499]],
  ['fft2p5t5', [2500, 4999]],
  ['fft5t7p5', [5000, 7499]],
  ['fft7p5t10', [7500, 9999]],
  ['ff10t12p5', [10000, 12499]],
  ['ff12p5t15', [12500, 14999]],
  ['ff15t17p5', [15000, 17499]],
  ['ff17p5t20', [17500, 19999]],
  ['ff20t22p5', [20000, 22499]],
  ['ff22p5t25', [22500, 24999]],
  ['fft25t30', [25000, 29999]],
  ['fft30t35', [30000, 34999]],
  ['fft35t40', [35000, 39999]],
  ['fft40t45', [40000, 44999]],
  ['fft45t50', [45000, 49999]],
  ['fft50t55', [50000, 54999]],
  ['fft55t65', [55000, 64999]],
  ['fft65t75', [65000, 74999]],
  ['fft75t100', [75000, 99999]],
  ['fft100pl', [100000, 250000]],
];

module.exports = [
  {
    title: 'Median earnings for workers (dollars)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top- and bottom-coded values',
    variable: 'mdewrk',
    special: true,
    adjustForInflation: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: interpolate,
        options: {
          bins: binsForMdewrk,
        },
      },
      {
        column: 'est',
        aggregator: inflate,
      },
      {
        column: 'm',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdewrk,
        },
      },
      {
        column: 'm',
        aggregator: inflate,
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdewrk.m")/ 1.645) / GET("mdewrk.est") * 100)',
        },
      },
      {
        column: 'comparison_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdewrk,
        },
      },
      {
        column: 'comparison_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdewrk,
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdewrk.comparison_moe")/ 1.645) / GET("mdewrk.comparison_est") * 100)',
        },
      },
      {
        column: 'previous_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdewrk,
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdewrk.previous_est") * 1.1005)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdewrk,
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdewrk.previous_moe") * 1.1005)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdewrk.est") - GET("mdewrk.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdewrk.m"),2) + POWER(GET("mdewrk.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdewrk.est") - GET("mdewrk.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdewrk.m"),2) + POWER(GET("mdewrk.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mdewrk.previous_est"))=0,"",((GET("mdewrk.est")-GET("mdewrk.previous_est"))/GET("mdewrk.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mdewrk.m")^2)+((GET("mdewrk.est")/GET("mdewrk.previous_est"))^2*GET("mdewrk.previous_moe")^2)))/GET("mdewrk.previous_est"))',
        },
      },
    ],
  },
  {
    title: 'Median earnings for male full-time, year-round workers (dollars)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top- and bottom-coded values',
    variable: 'mdemftwrk',
    special: true,
    adjustForInflation: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: interpolate,
        options: {
          bins: binsForMdemftwrk,
        },
      },
      {
        column: 'est',
        aggregator: inflate,
      },
      {
        column: 'm',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdemftwrk,
        },
      },
      {
        column: 'm',
        aggregator: inflate,
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdemftwrk.m")/ 1.645) / GET("mdemftwrk.est") * 100)',
        },
      },
      {
        column: 'comparison_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdemftwrk,
        },
      },
      {
        column: 'comparison_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdemftwrk,
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdemftwrk.comparison_moe")/ 1.645) / GET("mdemftwrk.comparison_est") * 100)',
        },
      },
      {
        column: 'previous_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdemftwrk,
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdemftwrk.previous_est") * 1.1005)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdemftwrk,
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdemftwrk.previous_moe") * 1.1005)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdemftwrk.est") - GET("mdemftwrk.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdemftwrk.m"),2) + POWER(GET("mdemftwrk.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdemftwrk.est") - GET("mdemftwrk.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdemftwrk.m"),2) + POWER(GET("mdemftwrk.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mdemftwrk.previous_est"))=0,"",((GET("mdemftwrk.est")-GET("mdemftwrk.previous_est"))/GET("mdemftwrk.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mdemftwrk.m")^2)+((GET("mdemftwrk.est")/GET("mdemftwrk.previous_est"))^2*GET("mdemftwrk.previous_moe")^2)))/GET("mdemftwrk.previous_est"))',
        },
      },
    ],
  },
  {
    title: 'Median earnings for female full-time, year-round workers (dollars)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top- and bottom-coded values',
    variable: 'mdefftwrk',
    special: true,
    adjustForInflation: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: interpolate,
        options: {
          bins: binsForMdefftwrk,
        },
      },
      {
        column: 'est',
        aggregator: inflate,
      },
      {
        column: 'm',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdefftwrk,
        },
      },
      {
        column: 'm',
        aggregator: inflate,
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdefftwrk.m")/ 1.645) / GET("mdefftwrk.est") * 100)',
        },
      },
      {
        column: 'comparison_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdefftwrk,
        },
      },
      {
        column: 'comparison_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdefftwrk,
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdefftwrk.comparison_moe")/ 1.645) / GET("mdefftwrk.comparison_est") * 100)',
        },
      },
      {
        column: 'previous_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdefftwrk,
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdefftwrk.previous_est") * 1.1005)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsForMdefftwrk,
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdefftwrk.previous_moe") * 1.1005)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdefftwrk.est") - GET("mdefftwrk.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdefftwrk.m"),2) + POWER(GET("mdefftwrk.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdefftwrk.est") - GET("mdefftwrk.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdefftwrk.m"),2) + POWER(GET("mdefftwrk.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mdefftwrk.previous_est"))=0,"",((GET("mdefftwrk.est")-GET("mdefftwrk.previous_est"))/GET("mdefftwrk.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mdefftwrk.m")^2)+((GET("mdefftwrk.est")/GET("mdefftwrk.previous_est"))^2*GET("mdefftwrk.previous_moe")^2)))/GET("mdefftwrk.previous_est"))',
        },
      },
    ],
  },
];
