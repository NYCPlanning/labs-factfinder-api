const interpolate = require('../../utils/interpolate');
const calculateMedianError = require('../../utils/calculate-median-error');
const calculator = require('../../utils/calculator');
const formula = require('../../utils/formula');
const inflate = require('../../utils/inflate');

const binsForMdhhinc = [
  ['mdhhiu10', [0, 9999]],
  ['mdhhi10t14', [10000, 14999]],
  ['mdhhi15t19', [15000, 19999]],
  ['mdhhi20t24', [20000, 24999]],
  ['mdhhi25t29', [25000, 29999]],
  ['mdhhi30t34', [30000, 34999]],
  ['mdhhi35t39', [35000, 39999]],
  ['mdhhi40t44', [40000, 44999]],
  ['mdhhi45t49', [45000, 49999]],
  ['mdhhi50t59', [50000, 59999]],
  ['mdhhi60t74', [60000, 74999]],
  ['mdhhi75t99', [75000, 99999]],
  ['mdhi100t124', [100000, 124999]],
  ['mdhi125t149', [125000, 149999]],
  ['mdhi150t199', [150000, 199999]],
  ['mdhhi200pl', [200000, 9999999]],
];

const binsForMdfaminc = [
  ['mdfamiu10', [0, 9999]],
  ['mdfami10t14', [10000, 14999]],
  ['mdfami15t19', [15000, 19999]],
  ['mdfami20t24', [20000, 24999]],
  ['mdfami25t29', [25000, 29999]],
  ['mdfami30t34', [30000, 34999]],
  ['mdfami35t39', [35000, 39999]],
  ['mdfami40t44', [40000, 44999]],
  ['mdfami45t49', [45000, 49999]],
  ['mdfami50t59', [50000, 59999]],
  ['mdfami60t74', [60000, 74999]],
  ['mdfami75t99', [75000, 99999]],
  ['mdfi100t124', [100000, 124999]],
  ['mdfi125t149', [125000, 149999]],
  ['mdfi150t199', [150000, 199999]],
  ['mdfami200pl', [200000, 9999999]],
];

const binsForMdnfinc = [
  ['nfmiu10', [0, 9999]],
  ['nfmi10t14', [10000, 14999]],
  ['nfmi15t19', [15000, 19999]],
  ['nfmi20t24', [20000, 24999]],
  ['nfmi25t29', [25000, 29999]],
  ['nfmi30t34', [30000, 34999]],
  ['nfmi35t39', [35000, 39999]],
  ['nfmi40t44', [40000, 44999]],
  ['nfmi45t49', [45000, 49999]],
  ['nfmi50t59', [50000, 59999]],
  ['nfmi60t74', [60000, 74999]],
  ['nfmi75t99', [75000, 99999]],
  ['nf100t124', [100000, 124999]],
  ['nf125t149', [125000, 149999]],
  ['nf150t199', [150000, 199999]],
  ['nfi200pl', [200000, 9999999]],
];

module.exports = [
  {
    title: 'Total households',
    highlight: true,
    variable: 'hh2',
  },
  {
    title: 'Household income of less than $10,000',
    variable: 'hhiu10',
  },
  {
    title: '$10,000 to $14,999',
    variable: 'hhi10t14',
  },
  {
    title: '$15,000 to $24,999',
    variable: 'hhi15t24',
  },
  {
    title: '$25,000 to $34,999',
    variable: 'hhi25t34',
  },
  {
    title: '$35,000 to $49,999',
    variable: 'hhi35t49',
  },
  {
    title: '$50,000 to $74,999',
    variable: 'hhi50t74',
  },
  {
    title: '$75,000 to $99,999',
    variable: 'hhi75t99',
  },
  {
    title: '$100,000 to $149,999',
    variable: 'hi100t149',
  },
  {
    title: '$150,000 to $199,999',
    variable: 'hi150t199',
  },
  {
    title: '$200,000 or more',
    variable: 'hhi200pl',
  },
  {
    title: 'Median household income (dollars)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top- and bottom-coded values',
    variable: 'mdhhinc',
    special: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: interpolate,
        options: {
          bins: binsForMdhhinc,
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
          designFactor: 1.5,
          bins: binsForMdhhinc,
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
          formula: '((GET("mdhhinc.m")/ 1.645) / GET("mdhhinc.est") * 100)',
        },
      },
      {
        column: 'comparison_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdhhinc,
        },
      },
      {
        column: 'comparison_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdhhinc,
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdhhinc.comparison_moe")/ 1.645) / GET("mdhhinc.comparison_est") * 100)',
        },
      },
      {
        column: 'previous_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdhhinc,
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdhhinc.previous_est") * 1.1005)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdhhinc,
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdhhinc.previous_moe") * 1.1005)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdhhinc.est") - GET("mdhhinc.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdhhinc.m"),2) + POWER(GET("mdhhinc.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdhhinc.est") - GET("mdhhinc.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdhhinc.m"),2) + POWER(GET("mdhhinc.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mdhhinc.previous_est"))=0,"",((GET("mdhhinc.est")-GET("mdhhinc.previous_est"))/GET("mdhhinc.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mdhhinc.m")^2)+((GET("mdhhinc.est")/GET("mdhhinc.previous_est"))^2*GET("mdhhinc.previous_moe")^2)))/GET("mdhhinc.previous_est"))',
        },
      },
    ],
  },
  {
    title: 'Mean household income (dollars)',
    tooltip: 'Aggregate household income in the past 12 months, divided by total households',
    variable: 'mnhhinc',
    special: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: calculator,
        options: {
          procedure: ['aghhinc.est', 'divide', 'hh2.est'],
        },
      },
      {
        column: 'est',
        aggregator: inflate,
      },
      {
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: ['aghhinc.comparison_est', 'divide', 'hh2.comparison_est'],
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: ['aghhinc.previous_est', 'divide', 'hh2.previous_est'],
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("mnhhinc.previous_est") * 1.1005)',
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh5.est")) * SQRT((GET("aghhinc.m")^2) + (GET("aghhinc.est") / (GET("hh5.est")^2) * (GET("hh5.m")^2)))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh5.comparison_est")) * SQRT((GET("aghhinc.comparison_moe")^2) + (GET("aghhinc.comparison_est") / (GET("hh5.comparison_est")^2) * (GET("hh5.comparison_moe")^2)))',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh5.previous_est")) * SQRT((GET("aghhinc.previous_moe")^2) + (GET("aghhinc.previous_est") / (GET("hh5.previous_est")^2) * (GET("hh5.previous_moe")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("m")/1.645/GET("est")*100)',
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
          formula: '(GET("mnhhinc.est") - GET("mnhhinc.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mnhhinc.m"),2) + POWER(GET("mnhhinc.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mnhhinc.est") - GET("mnhhinc.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mnhhinc.m"),2) + POWER(GET("mnhhinc.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mnhhinc.previous_est"))=0,"",((GET("mnhhinc.est")-GET("mnhhinc.previous_est"))/GET("mnhhinc.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mnhhinc.m")^2)+((GET("mnhhinc.est")/GET("mnhhinc.previous_est"))^2*GET("mnhhinc.previous_moe")^2)))/GET("mnhhinc.previous_est"))',
        },
      },
    ],
  },
  {
    divider: true,
  },
  {
    title: 'Households with Social Security',
    variable: 'inc_sosec',
  },
  {
    title: 'Households with retirement income',
    variable: 'inc_rtrmt',
  },
  {
    title: 'Households with Supplemental Security Income',
    variable: 'inc_spsec',
  },
  {
    title: 'Households with cash public assistance income',
    variable: 'inc_cpba',
  },
  {
    title: 'Households with Food Stamp/SNAP benefits in the past 12 months',
    variable: 'inc_snap',
  },
  {
    divider: true,
  },
  {
    title: 'Family households',
    highlight: true,
    variable: 'fam2',
  },
  {
    title: 'Family income of less than $10,000',
    variable: 'famiu10',
  },
  {
    title: '$10,000 to $14,999',
    variable: 'fami10t14',
  },
  {
    title: '$15,000 to $24,999',
    variable: 'fami15t24',
  },
  {
    title: '$25,000 to $34,999',
    variable: 'fami25t34',
  },
  {
    title: '$35,000 to $49,999',
    variable: 'fami35t49',
  },
  {
    title: '$50,000 to $74,999',
    variable: 'fami50t74',
  },
  {
    title: '$75,000 to $99,999',
    variable: 'fami75t99',
  },
  {
    title: '$100,000 to $149,999',
    variable: 'fi100t149',
  },
  {
    title: '$150,000 to $199,999',
    variable: 'fi150t199',
  },
  {
    title: '$200,000 or more',
    variable: 'fami200pl',
  },
  {
    title: 'Median family income (dollars)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top- and bottom-coded values',
    variable: 'mdfaminc',
    special: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: interpolate,
        options: {
          bins: binsForMdfaminc,
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
          designFactor: 1.5,
          bins: binsForMdfaminc,
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
          formula: '((GET("mdfaminc.m")/ 1.645) / GET("mdfaminc.est") * 100)',
        },
      },
      {
        column: 'comparison_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdfaminc,
        },
      },
      {
        column: 'comparison_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdfaminc,
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdfaminc.comparison_moe")/ 1.645) / GET("mdfaminc.comparison_est") * 100)',
        },
      },
      {
        column: 'previous_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdfaminc,
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdfaminc.previous_est") * 1.1005)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdfaminc,
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdfaminc.previous_moe") * 1.1005)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdfaminc.est") - GET("mdfaminc.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdfaminc.m"),2) + POWER(GET("mdfaminc.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdfaminc.est") - GET("mdfaminc.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdfaminc.m"),2) + POWER(GET("mdfaminc.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mdfaminc.previous_est"))=0,"",((GET("mdfaminc.est")-GET("mdfaminc.previous_est"))/GET("mdfaminc.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mdfaminc.m")^2)+((GET("mdfaminc.est")/GET("mdfaminc.previous_est"))^2*GET("mdfaminc.previous_moe")^2)))/GET("mdfaminc.previous_est"))',
        },
      },
    ],
  },
  {
    divider: true,
  },
  {
    title: 'Nonfamily households',
    highlight: true,
    variable: 'nfam2',
  },
  {
    title: 'Median nonfamily income (dollars)',
    tooltip: 'Medians are calculated using linear interpolation, which may result in top- and bottom-coded values',
    variable: 'mdnfinc',
    special: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: interpolate,
        options: {
          bins: binsForMdnfinc,
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
          designFactor: 1.5,
          bins: binsForMdnfinc,
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
          formula: '((GET("mdnfinc.m")/ 1.645) / GET("mdnfinc.est") * 100)',
        },
      },
      {
        column: 'comparison_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdnfinc,
        },
      },
      {
        column: 'comparison_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdnfinc,
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("mdnfinc.comparison_moe")/ 1.645) / GET("mdnfinc.comparison_est") * 100)',
        },
      },
      {
        column: 'previous_est',
        aggregator: interpolate,
        options: {
          bins: binsForMdnfinc,
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdnfinc.previous_est") * 1.1005)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: calculateMedianError,
        options: {
          designFactor: 1.5,
          bins: binsForMdnfinc,
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(GET("mdnfinc.previous_moe") * 1.1005)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdnfinc.est") - GET("mdnfinc.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdnfinc.m"),2) + POWER(GET("mdnfinc.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("mdnfinc.est") - GET("mdnfinc.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("mdnfinc.m"),2) + POWER(GET("mdnfinc.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("mdnfinc.previous_est"))=0,"",((GET("mdnfinc.est")-GET("mdnfinc.previous_est"))/GET("mdnfinc.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("mdnfinc.m")^2)+((GET("mdnfinc.est")/GET("mdnfinc.previous_est"))^2*GET("mdnfinc.previous_moe")^2)))/GET("mdnfinc.previous_est"))',
        },
      },
    ],
  },
  {
    divider: true,
  },
  {
    title: 'Per capita income (dollars)',
    tooltip: 'Aggregate income in the past 12 months, divided by total population',
    variable: 'percapinc',
    special: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: calculator,
        options: {
          procedure: ['agip15pl.est', 'divide', 'pop_6.est'],
        },
      },
      {
        column: 'est',
        aggregator: inflate,
      },
      {
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: ['agip15pl.comparison_est', 'divide', 'pop_6.comparison_est'],
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: ['agip15pl.previous_est', 'divide', 'pop_6.previous_est'],
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("percapinc.previous_est") * 1.1005)',
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1/GET("pop_6.est")) * SQRT((GET("agip15pl.m")^2) + (GET("agip15pl.est") / (GET("pop_6.est")^2) * (GET("pop_6.m")^2)))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("pop_6.comparison_est")) * SQRT((GET("agip15pl.comparison_moe")^2) + (GET("agip15pl.comparison_est") / (GET("pop_6.comparison_est")^2) * (GET("pop_6.comparison_moe")^2)))',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("pop_6.previous_est")) * SQRT((GET("agip15pl.previous_moe")^2) + (GET("agip15pl.previous_est") / (GET("pop_6.previous_est")^2) * (GET("pop_6.previous_moe")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("m")/1.645/GET("est")*100)',
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
          formula: '(GET("percapinc.est") - GET("percapinc.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("percapinc.m"),2) + POWER(GET("percapinc.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("percapinc.est") - GET("percapinc.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("percapinc.m"),2) + POWER(GET("percapinc.previous_moe"),2))',
        },
      },
      {
        column: 'change_percent',
        aggregator: formula,
        options: {
          formula: 'IF((GET("percapinc.previous_est"))=0,"",((GET("percapinc.est")-GET("percapinc.previous_est"))/GET("percapinc.previous_est")))',
        },
      },
      {
        column: 'change_percent_moe',
        aggregator: formula,
        options: {
          formula: '((SQRT((GET("percapinc.m")^2)+((GET("percapinc.est")/GET("percapinc.previous_est"))^2*GET("percapinc.previous_moe")^2)))/GET("percapinc.previous_est"))',
        },
      },
    ],
  },
];
