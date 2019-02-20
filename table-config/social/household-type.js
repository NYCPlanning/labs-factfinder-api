const calculator = require('../../utils/calculator');
const formula = require('../../utils/formula');

module.exports = [
  {
    title: 'Total households',
    highlight: true,
    variable: 'hh1',
  },
  {
    title: 'Family households (families)',
    variable: 'fam1',
  },
  {
    indent: 2,
    title: 'With own children under 18 years',
    variable: 'famchu18',
  },
  {
    indent: 1,
    title: 'Married-couple family',
    variable: 'mrdfam',
  },
  {
    indent: 2,
    title: 'With own children under 18 years',
    variable: 'mrdchu18',
  },
  {
    indent: 1,
    title: 'Male householder, no wife present, family',
    variable: 'mhnw',
  },
  {
    indent: 2,
    title: 'With own children under 18 years',
    variable: 'mhnwchu18',
  },
  {
    indent: 1,
    title: 'Female householder, no husband present, family',
    variable: 'fhnh',
  },
  {
    indent: 2,
    title: 'With own children under 18 years',
    variable: 'fhnhchu18',
  },
  {
    title: 'Nonfamily households',
    variable: 'nfam1',
  },
  {
    indent: 1,
    title: 'Householder living alone',
    variable: 'nfama',
  },
  {
    indent: 2,
    title: '65 years and over',
    variable: 'nfama65pl',
  },
  {
    divider: true,
  },
  {
    title: 'Households with one or more people under 18 years',
    variable: 'hh1plu18',
  },
  {
    title: 'Households with one or more people 65 years and over',
    variable: 'hh1pl65pl',
  },
  {
    divider: true,
  },
  {
    title: 'Average household size',
    tooltip: 'Household population divided by number of households',
    variable: 'avghhsz',
    special: true,
    decimal: 2,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'estimate',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.estimate', 'divide', 'hh1.estimate'],
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.comparison_estimate', 'divide', 'hh1.comparison_estimate'],
        },
      },
      {
        column: 'previous_estimate',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.previous_estimate', 'divide', 'hh1.previous_estimate'],
        },
      },
      {
        column: 'moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.estimate")) * SQRT((GET("hhpop1.m")^2) + (GET("hhpop1.estimate") / (GET("hh4.estimate")^2) * (GET("hh4.m")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("moe")/1.645/GET("estimate")*100)',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.previous_estimate")) * SQRT((GET("hhpop1.previous_moe")^2) + (GET("hhpop1.previous_estimate") / (GET("hh4.previous_estimate")^2) * (GET("hh4.previous_moe")^2)))',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_moe")/1.645/GET("previous_estimate")*100)',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.comparison_estimate")) * SQRT((GET("hhpop1.comparison_moe")^2) + (GET("hhpop1.comparison_estimate") / (GET("hh4.comparison_estimate")^2) * (GET("hh4.comparison_moe")^2)))',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(GET("comparison_moe")/1.645/GET("comparison_estimate")*100)',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsz.estimate") - GET("avghhsz.comparison_estimate"))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsz.estimate") - GET("avghhsz.previous_estimate"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsz.m"),2) + POWER(GET("avghhsz.comparison_moe"),2))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsz.m"),2) + POWER(GET("avghhsz.previous_moe"),2))',
        },
      },
    ],
  },
  {
    title: 'Average family size',
    tooltip: 'Population in family households, minus nonrelatives in family households, divided by number of family households',
    variable: 'avgfmsz',
    special: true,
    decimal: 2,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'estimate',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.estimate', 'divide', 'fam1.estimate'],
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.comparison_estimate', 'divide', 'fam1.comparison_estimate'],
        },
      },
      {
        column: 'previous_estimate',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.previous_estimate', 'divide', 'fam1.previous_estimate'],
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("fam3.previous_estimate")) * SQRT((GET("popinfms.previous_moe")^2) + (GET("popinfms.previous_estimate") / (GET("fam3.previous_estimate")^2) * (GET("fam3.previous_moe")^2)))',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_moe")/1.645/GET("previous_estimate")*100)',
        },
      },
      {
        column: 'moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("fam3.estimate")) * SQRT((GET("popinfms.m")^2) + (GET("popinfms.estimate") / (GET("fam3.estimate")^2) * (GET("fam3.m")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("moe")/1.645/GET("estimate")*100)',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("fam3.comparison_estimate")) * SQRT((GET("popinfms.comparison_moe")^2) + (GET("popinfms.comparison_estimate") / (GET("fam3.comparison_estimate")^2) * (GET("fam3.comparison_moe")^2)))',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(GET("comparison_moe")/1.645/GET("comparison_estimate")*100)',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avgfmsz.estimate") - GET("avgfmsz.comparison_estimate"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avgfmsz.m"),2) + POWER(GET("avgfmsz.comparison_moe"),2))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("avgfmsz.estimate") - GET("avgfmsz.previous_estimate"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avgfmsz.m"),2) + POWER(GET("avgfmsz.previous_moe"),2))',
        },
      },
    ],
  },
  {
    divider: true,
  },
];
