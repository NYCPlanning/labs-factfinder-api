const interpolate = require('../../utils/interpolate');
const formula = require('../../utils/formula');

module.exports = [

  {
    title: 'Total population',
    highlight: true,
    variable: 'pop2',
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
    title: 'Median age (years)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top-coded values',
    classNames: '',
    variable: 'mdage',
    special: true,
    decimal: 1,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'previous_sum',
        aggregator: interpolate,
        options: {
          bins: [
            ['popu5', [0, 5]],
            ['pop5t9', [5, 9]],
            ['pop10t14', [10, 14]],
            ['pop15t19', [15, 19]],
            ['pop20t24', [20, 24]],
            ['pop25t29', [25, 29]],
            ['pop30t34', [30, 34]],
            ['pop35t39', [35, 39]],
            ['pop40t44', [40, 44]],
            ['pop45t49', [45, 49]],
            ['pop50t54', [50, 54]],
            ['pop55t59', [55, 59]],
            ['pop60t64', [60, 64]],
            ['pop65t69', [65, 69]],
            ['pop70t74', [70, 74]],
            ['pop75t79', [75, 79]],
            ['pop80t84', [80, 84]],
            ['pop85pl', [85, 115]],
          ],
        },
      },
      {
        column: 'sum',
        aggregator: interpolate,
        options: {
          bins: [
            ['popu5', [0, 5]],
            ['pop5t9', [5, 9]],
            ['pop10t14', [10, 14]],
            ['pop15t19', [15, 19]],
            ['pop20t24', [20, 24]],
            ['pop25t29', [25, 29]],
            ['pop30t34', [30, 34]],
            ['pop35t39', [35, 39]],
            ['pop40t44', [40, 44]],
            ['pop45t49', [45, 49]],
            ['pop50t54', [50, 54]],
            ['pop55t59', [55, 59]],
            ['pop60t64', [60, 64]],
            ['pop65t69', [65, 69]],
            ['pop70t74', [70, 74]],
            ['pop75t79', [75, 79]],
            ['pop80t84', [80, 84]],
            ['pop85pl', [85, 115]],
          ],
        },
      },
      {
        column: 'comparison_sum',
        aggregator: interpolate,
        options: {
          bins: [
            ['popu5', [0, 5]],
            ['pop5t9', [5, 9]],
            ['pop10t14', [10, 14]],
            ['pop15t19', [15, 19]],
            ['pop20t24', [20, 24]],
            ['pop25t29', [25, 29]],
            ['pop30t34', [30, 34]],
            ['pop35t39', [35, 39]],
            ['pop40t44', [40, 44]],
            ['pop45t49', [45, 49]],
            ['pop50t54', [50, 54]],
            ['pop55t59', [55, 59]],
            ['pop60t64', [60, 64]],
            ['pop65t69', [65, 69]],
            ['pop70t74', [70, 74]],
            ['pop75t79', [75, 79]],
            ['pop80t84', [80, 84]],
            ['pop85pl', [85, 115]],
          ],
        },
      },
      {
        column: 'change_sum',
        aggregator: formula,
        options: {
          formula: '(GET("mdage.sum") - GET("mdage.previous_sum"))',
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
    variable: 'popu18',
  },
  {
    title: '21 years and over',
    variable: 'pop21pl',
  },
  {
    title: '62 years and over',
    variable: 'pop62pl',
  },
  {
    title: '65 years and over',
    variable: 'pop65pl_1',
  },
  {
    indent: 1,
    title: 'Male',
    variable: 'pop65plm',
  },
  {
    indent: 1,
    title: 'Female',
    variable: 'pop65plf',
  },
];
