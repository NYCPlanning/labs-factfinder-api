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
        column: 'est',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.est', 'divide', 'hh1.est'],
        },
      },
      {
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.comparison_est', 'divide', 'hh1.comparison_est'],
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: ['hhpop.previous_est', 'divide', 'hh1.previous_est'],
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.est")) * SQRT((GET("hhpop1.m")^2) + (GET("hhpop1.est") / (GET("hh4.est")^2) * (GET("hh4.m")^2)))',
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
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.previous_est")) * SQRT((GET("hhpop1.previous_moe")^2) + (GET("hhpop1.previous_est") / (GET("hh4.previous_est")^2) * (GET("hh4.previous_moe")^2)))',
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
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("hh4.comparison_est")) * SQRT((GET("hhpop1.comparison_moe")^2) + (GET("hhpop1.comparison_est") / (GET("hh4.comparison_est")^2) * (GET("hh4.comparison_moe")^2)))',
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
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsz.est") - GET("avghhsz.comparison_est"))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("avghhsz.est") - GET("avghhsz.previous_est"))',
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
        column: 'est',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.est', 'divide', 'fam1.est'],
        },
      },
      {
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.comparison_est', 'divide', 'fam1.comparison_est'],
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: ['popinfms.previous_est', 'divide', 'fam1.previous_est'],
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("fam3.previous_est")) * SQRT((GET("popinfms.previous_moe")^2) + (GET("popinfms.previous_est") / (GET("fam3.previous_est")^2) * (GET("fam3.previous_moe")^2)))',
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
        column: 'm',
        aggregator: formula,
        options: {
          formula: '(1/GET("fam3.est")) * SQRT((GET("popinfms.m")^2) + (GET("popinfms.est") / (GET("fam3.est")^2) * (GET("fam3.m")^2)))',
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
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: '(1/GET("fam3.comparison_est")) * SQRT((GET("popinfms.comparison_moe")^2) + (GET("popinfms.comparison_est") / (GET("fam3.comparison_est")^2) * (GET("fam3.comparison_moe")^2)))',
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
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("avgfmsz.est") - GET("avgfmsz.comparison_est"))',
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
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("avgfmsz.est") - GET("avgfmsz.previous_est"))',
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
