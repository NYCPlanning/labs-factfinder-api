const interpolate = require('../../utils/interpolate');
const formula = require('../../utils/formula');
const calculateMedianError = require('../../utils/calculate-median-error');
const inflate = require('../../utils/inflate');

const binsMedianEarlySet = [
  ['ru100', [0, 99]],
  ['r100t149', [100, 149]],
  ['r150t199', [150, 199]],
  ['r200t249', [200, 249]],
  ['r250t299', [250, 299]],
  ['r300t349', [300, 349]],
  ['r350t399', [350, 399]],
  ['r400t449', [400, 449]],
  ['r450t499', [450, 499]],
  ['r500t549', [500, 549]],
  ['r550t599', [550, 599]],
  ['r600t649', [600, 649]],
  ['r650t699', [650, 699]],
  ['r700t749', [700, 749]],
  ['r750t799', [750, 799]],
  ['r800t899', [800, 899]],
  ['r900t999', [900, 999]],
  ['r1kt1249', [1000, 1249]],
  ['r1250t1p5', [1250, 1499]],
  ['r1p5t1999', [1500, 1999]],
  ['r2000pl', [2000, 9999]],
];

const binsMedianLaterSet = [
  ['ru100', [0, 99]],
  ['r100t149', [100, 149]],
  ['r150t199', [150, 199]],
  ['r200t249', [200, 249]],
  ['r250t299', [250, 299]],
  ['r300t349', [300, 349]],
  ['r350t399', [350, 399]],
  ['r400t449', [400, 449]],
  ['r450t499', [450, 499]],
  ['r500t549', [500, 549]],
  ['r550t599', [550, 599]],
  ['r600t649', [600, 649]],
  ['r650t699', [650, 699]],
  ['r700t749', [700, 749]],
  ['r750t799', [750, 799]],
  ['r800t899', [800, 899]],
  ['r900t999', [900, 999]],
  ['r1kt1249', [1000, 1249]],
  ['r1250t1p5', [1250, 1499]],
  ['r1p5t1999', [1500, 1999]],
  ['r2kt2499', [2000, 2499]],
  ['r2p5t2999', [2500, 2999]],
  ['r3kt3499', [3000, 3499]],
  ['r3500pl', [3500, 9000]],
];

module.exports = [
  {
    title: 'Occupied units paying rent',
    highlight: true,
    variable: 'ochuprnt1',
  },
  {
    title: 'Less than $500',
    variable: 'gru500',
  },
  {
    title: '$500 to $999',
    variable: 'gr500t999',
  },
  {
    title: '$1,000 to $1499',
    variable: 'gr1kt14k',
  },
  {
    title: '$1,500 to $1,999',
    variable: 'gr15kt19k',
  },
  {
    title: '$2,000 to $2,499',
    variable: 'gr20kt24k',
  },
  {
    title: '$2,500 to $2,999',
    variable: 'gr25kt29k',
  },
  {
    title: '$3,000 or more',
    variable: 'gr3kpl',
  },
  {
    title: 'Median (dollars)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top-coded values',
    variable: 'mdgr',
    special: true,
    adjustForInflation: true,
    specialCalculations: [
      {
        column: 'estimate',
        aggregator: interpolate,
        options: {
          multipleBins: true,
          bins: [binsMedianEarlySet, binsMedianLaterSet],
        },
      },
      {
        column: 'estimate',
        aggregator: inflate,
      },
      {
        column: 'moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          multipleBins: true,
          bins: [binsMedianEarlySet, binsMedianLaterSet],
        },
      },
      {
        column: 'moe',
        aggregator: inflate,
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdgr.moe")/ 1.645) / GET("mdgr.estimate") * 100)',
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: interpolate,
        options: {
          multipleBins: true,
          bins: [binsMedianEarlySet, binsMedianLaterSet],
        },
      },
      {
        column: 'comparison_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          multipleBins: true,
          bins: [binsMedianEarlySet, binsMedianLaterSet],
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdgr.comparison_moe")/ 1.645) / GET("mdgr.comparison_estimate") * 100)',
        },
      },
      {
        column: 'previous_estimate',
        aggregator: interpolate,
        options: {
          designFactor: 1.6,
          bins: binsMedianEarlySet,
        },
      },
      {
        column: 'previous_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("mdgr.previous_estimate") * 1.1005)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.6,
          bins: binsMedianEarlySet,
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdgr.previous_moe") * 1.1005)',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("mdgr.estimate") - GET("mdgr.comparison_estimate"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdgr.moe"),2) + POWER(GET("mdgr.comparison_moe"),2))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("mdgr.estimate") - GET("mdgr.previous_estimate"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdgr.moe"),2) + POWER(GET("mdgr.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mdgr.previous_estimate"))=0,"",((GET("mdgr.estimate")-GET("mdgr.previous_estimate"))/GET("mdgr.previous_estimate")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mdgr.moe")^2)+((GET("mdgr.estimate")/GET("mdgr.previous_estimate"))^2*GET("mdgr.previous_moe")^2)))/GET("mdgr.previous_estimate"))',
        },
      },
    ],
  },
  {
    divider: true,
  },
  {
    title: 'No rent paid',
    variable: 'grnorntpd',
    special: true,
  },
];
