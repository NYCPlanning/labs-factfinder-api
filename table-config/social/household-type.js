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
        column: 'sum',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.sum', 'divide', 'hh1.sum'],
        },
      },
      {
        column: 'comparison_sum',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.comparison_sum', 'divide', 'hh1.comparison_sum'],
        },
      },
      {
        column: 'previous_sum',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.previous_sum', 'divide', 'hh1.previous_sum'],
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.sum")) * SQRT((GET("hhpop1.m")^2) + (GET("hhpop1.sum") / (GET("hh4.sum")^2) * (GET("hh4.m")^2)))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(GET("m")/1.645/GET("sum")*100)',
        },
      },
      {
        column: 'previous_m',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.previous_sum")) * SQRT((GET("hhpop1.previous_m")^2) + (GET("hhpop1.previous_sum") / (GET("hh4.previous_sum")^2) * (GET("hh4.previous_m")^2)))',
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(GET("previous_m")/1.645/GET("previous_sum")*100)',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.comparison_sum")) * SQRT((GET("hhpop1.comparison_m")^2) + (GET("hhpop1.comparison_sum") / (GET("hh4.comparison_sum")^2) * (GET("hh4.comparison_m")^2)))',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(GET("comparison_m")/1.645/GET("comparison_sum")*100)',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsz.sum") - GET("avghhsz.comparison_sum"))',
        },
      },
      {
        column: 'change_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsz.sum") - GET("avghhsz.previous_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsz.m"),2) + POWER(GET("avghhsz.comparison_m"),2))',
        },
      },
      {
        column: 'change_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsz.m"),2) + POWER(GET("avghhsz.previous_m"),2))',
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
        column: 'sum',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.sum', 'divide', 'fam1.sum'],
        },
      },
      {
        column: 'comparison_sum',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.comparison_sum', 'divide', 'fam1.comparison_sum'],
        },
      },
      {
        column: 'previous_sum',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.previous_sum', 'divide', 'fam1.previous_sum'],
        },
      },
      {
        column: 'previous_cv',
        aggregator: formula,
        options: {
          formula: '(51)*((GET("uwhusmpl1.previous_sum"))^-0.473)',
        },
      },
      {
        column: 'previous_m',
        aggregator: formula,
        options: {
          formula: '((((GET("avgfmsz.previous_cv"))/(100))*(1.645))*(GET("avgfmsz.previous_sum")))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '(51)*((GET("uwhusmpl1.sum"))^-0.473)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '(51)*((GET("uwhusmpl1.comparison_sum"))^-0.473)',
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '((((GET("avgfmsz.cv"))/(100))*(1.645))*(GET("avgfmsz.sum")))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: '((((GET("avgfmsz.comparison_cv"))/(100))*(1.645))*(GET("avgfmsz.comparison_sum")))',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avgfmsz.sum") - GET("avgfmsz.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avgfmsz.m"),2) + POWER(GET("avgfmsz.comparison_m"),2))',
        },
      },
      {
        column: 'change_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avgfmsz.sum") - GET("avgfmsz.previous_sum"))',
        },
      },
      {
        column: 'change_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avgfmsz.m"),2) + POWER(GET("avgfmsz.previous_m"),2))',
        },
      },
    ],
  },
  {
    divider: true,
  },
];
