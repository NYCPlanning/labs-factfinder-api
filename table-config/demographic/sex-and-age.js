const interpolate = require('../../utils/interpolate');
const formula = require('../../utils/formula');
const calculateMedianError = require('../../utils/calculate-median-error');

module.exports = [
  {
    title: 'Total population',
    highlight: true,
    variable: 'pop_1',
  },
  {
    title: 'Male',
    classNames: '',
    variable: 'male',
  },
  {
    title: 'Female',
    classNames: '',
    variable: 'fem',
  },
  {
    divider: true,
  },
  {
    title: 'Under 5 years',
    classNames: '',
    variable: 'popu5',
  },
  {
    title: '5 to 9 years',
    classNames: '',
    variable: 'pop5t9',
  },
  {
    title: '10 to 14 years',
    classNames: '',
    variable: 'pop10t14',
  },
  {
    title: '15 to 19 years',
    classNames: '',
    variable: 'pop15t19',
  },
  {
    title: '20 to 24 years',
    classNames: '',
    variable: 'pop20t24',
  },
  {
    title: '25 to 29 years',
    classNames: '',
    variable: 'pop25t29',
  },
  {
    title: '30 to 34 years',
    classNames: '',
    variable: 'pop30t34',
  },
  {
    title: '35 to 39 years',
    classNames: '',
    variable: 'pop35t39',
  },
  {
    title: '40 to 44 years',
    classNames: '',
    variable: 'pop40t44',
  },
  {
    title: '45 to 49 years',
    classNames: '',
    variable: 'pop45t49',
  },
  {
    title: '50 to 54 years',
    classNames: '',
    variable: 'pop50t54',
  },
  {
    title: '55 to 59 years',
    classNames: '',
    variable: 'pop55t59',
  },
  {
    title: '60 to 64 years',
    classNames: '',
    variable: 'pop60t64',
  },
  {
    title: '65 to 69 years',
    classNames: '',
    variable: 'pop65t69',
  },
  {
    title: '70 to 74 years',
    classNames: '',
    variable: 'pop70t74',
  },
  {
    title: '75 to 79 years',
    classNames: '',
    variable: 'pop75t79',
  },
  {
    title: '80 to 84 years',
    classNames: '',
    variable: 'pop80t84',
  },
  {
    title: '85 years and over',
    classNames: '',
    variable: 'pop85pl',
  },
  {
    divider: true,
  },
  {
    title: 'Under 18 years',
    classNames: '',
    variable: 'popu181',
  },
  {
    title: '65 years and over',
    classNames: '',
    variable: 'pop65pl1',
  },
  {
    divider: true,
  },
  {
    title: 'Median age (years)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top-coded values',
    classNames: '',
    variable: 'mdage',
    special: true,
    decimal: 1,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: interpolate,
        options: {
          bins: [
            ['mdpop0t4', [0, 4]],
            ['mdpop5t9', [5, 9]],
            ['mdpop10t14', [10, 14]],
            ['mdpop15t17', [15, 17]],
            ['mdpop18t19', [18, 19]],
            ['mdpop20', [20, 20]],
            ['mdpop21', [21, 21]],
            ['mdpop22t24', [22, 24]],
            ['mdpop25t29', [25, 29]],
            ['mdpop30t34', [30, 34]],
            ['mdpop35t39', [35, 39]],
            ['mdpop40t44', [40, 44]],
            ['mdpop45t49', [45, 49]],
            ['mdpop50t54', [50, 54]],
            ['mdpop55t59', [55, 59]],
            ['mdpop60t61', [60, 61]],
            ['mdpop62t64', [62, 64]],
            ['mdpop65t66', [65, 66]],
            ['mdpop67t69', [67, 69]],
            ['mdpop70t74', [70, 74]],
            ['mdpop75t79', [75, 79]],
            ['mdpop80t84', [80, 84]],
            ['mdpop85pl', [85, 115]],
          ],
        },
      },
      {
        column: 'm',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.1,
          bins: [
            ['mdpop0t4', [0, 4]],
            ['mdpop5t9', [5, 9]],
            ['mdpop10t14', [10, 14]],
            ['mdpop15t17', [15, 17]],
            ['mdpop18t19', [18, 19]],
            ['mdpop20', [20, 20]],
            ['mdpop21', [21, 21]],
            ['mdpop22t24', [22, 24]],
            ['mdpop25t29', [25, 29]],
            ['mdpop30t34', [30, 34]],
            ['mdpop35t39', [35, 39]],
            ['mdpop40t44', [40, 44]],
            ['mdpop45t49', [45, 49]],
            ['mdpop50t54', [50, 54]],
            ['mdpop55t59', [55, 59]],
            ['mdpop60t61', [60, 61]],
            ['mdpop62t64', [62, 64]],
            ['mdpop65t66', [65, 66]],
            ['mdpop67t69', [67, 69]],
            ['mdpop70t74', [70, 74]],
            ['mdpop75t79', [75, 79]],
            ['mdpop80t84', [80, 84]],
            ['mdpop85pl', [85, 115]],
          ],
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdage.m")/ 1.645) / GET("mdage.sum") * 100)',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: interpolate,
        options: {
          bins: [
            ['mdpop0t4', [0, 4]],
            ['mdpop5t9', [5, 9]],
            ['mdpop10t14', [10, 14]],
            ['mdpop15t17', [15, 17]],
            ['mdpop18t19', [18, 19]],
            ['mdpop20', [20, 20]],
            ['mdpop21', [21, 21]],
            ['mdpop22t24', [22, 24]],
            ['mdpop25t29', [25, 29]],
            ['mdpop30t34', [30, 34]],
            ['mdpop35t39', [35, 39]],
            ['mdpop40t44', [40, 44]],
            ['mdpop45t49', [45, 49]],
            ['mdpop50t54', [50, 54]],
            ['mdpop55t59', [55, 59]],
            ['mdpop60t61', [60, 61]],
            ['mdpop62t64', [62, 64]],
            ['mdpop65t66', [65, 66]],
            ['mdpop67t69', [67, 69]],
            ['mdpop70t74', [70, 74]],
            ['mdpop75t79', [75, 79]],
            ['mdpop80t84', [80, 84]],
            ['mdpop85pl', [85, 115]],
          ],
        },
      },
      {
        column: 'comparison_m',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.1,
          bins: [
            ['mdpop0t4', [0, 4]],
            ['mdpop5t9', [5, 9]],
            ['mdpop10t14', [10, 14]],
            ['mdpop15t17', [15, 17]],
            ['mdpop18t19', [18, 19]],
            ['mdpop20', [20, 20]],
            ['mdpop21', [21, 21]],
            ['mdpop22t24', [22, 24]],
            ['mdpop25t29', [25, 29]],
            ['mdpop30t34', [30, 34]],
            ['mdpop35t39', [35, 39]],
            ['mdpop40t44', [40, 44]],
            ['mdpop45t49', [45, 49]],
            ['mdpop50t54', [50, 54]],
            ['mdpop55t59', [55, 59]],
            ['mdpop60t61', [60, 61]],
            ['mdpop62t64', [62, 64]],
            ['mdpop65t66', [65, 66]],
            ['mdpop67t69', [67, 69]],
            ['mdpop70t74', [70, 74]],
            ['mdpop75t79', [75, 79]],
            ['mdpop80t84', [80, 84]],
            ['mdpop85pl', [85, 115]],
          ],
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdage.comparison_m")/ 1.645) / GET("mdage.comparison_sum") * 100)',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("mdage.sum") - GET("mdage.comparison_sum"))',
        },
      },
    ],
  },
  {
    divider: true,
  },
  {
    title: 'Under 18 years',
    highlight: true,
    variable: 'popu18_2',
  },
  {
    title: 'Male',
    classNames: '',
    variable: 'popu18m',
  },
  {
    title: 'Female',
    classNames: '',
    variable: 'popu18f',
  },
  {
    divider: true,
  },
  {
    title: '65 years and over',
    highlight: true,
    variable: 'pop65pl2',
  },
  {
    title: 'Male',
    classNames: '',
    variable: 'pop65plm',
  },
  {
    title: 'Female',
    classNames: '',
    variable: 'pop65plf',
  },
];