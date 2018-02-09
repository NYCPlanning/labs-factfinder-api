const formula = require('../../utils/formula');

module.exports = [
  {
    highlight: true,
    title: 'Total population',
    variable: 'pop4',
  },
  {
    title: 'In households',
    variable: 'popinhh',
  },
  {
    indent: 1,
    title: 'In family households',
    variable: 'popinfhh',
  },
  {
    indent: 2,
    title: 'Householder',
    variable: 'hhldr',
  },
  {
    indent: 2,
    title: 'Spouse',
    variable: 'spouse',
  },
  {
    indent: 2,
    title: 'Own child under 18 years',
    variable: 'owncu18',
  },
  {
    indent: 2,
    title: 'Other relatives',
    variable: 'othrrel',
  },
  {
    indent: 2,
    title: 'Nonrelatives',
    variable: 'nonrel',
  },
  {
    indent: 3,
    title: 'Unmarried partner',
    variable: 'nrelumptnr',
  },
  {
    indent: 1,
    title: 'In nonfamily households',
    variable: 'nonfamhh',
  },
  {
    indent: 2,
    title: 'Householder',
    variable: 'nfhhldr',
  },
  {
    indent: 2,
    title: 'Nonrelatives',
    variable: 'nfnonrel',
  },
  {
    indent: 3,
    title: 'Unmarried partner',
    variable: 'nfunmptnr',
  },
  {
    title: 'In group quarters',
    variable: 'ingrpqtrs',
  },
  {
    indent: 1,
    title: 'Institutionalized',
    variable: 'institlzd',
  },
  {
    divider: true,
  },
  {
    title: 'Average household size',
    tooltip: 'Household population divided by number of households',
    variable: 'avghhsz',
    decimal: 2,
    special: true,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '(GET("popinhh.sum"))/(GET("hh1.sum"))',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: formula,
        options: {
          formula: '(GET("popinhh.comparison_sum"))/(GET("hh1.comparison_sum"))',
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
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avghhsz.m"),2) + POWER(GET("avghhsz.comparison_m"),2))',
        },
      },      
    ],
  },
  {
    title: 'Average family size',
    tooltip: 'Population in family households, minus nonrelatives in family households, divded by number of family households',
    variable: 'avgfamsz',
    decimal: 2,
    special: true,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '(GET("popinfam.sum"))/(GET("fam1.sum"))',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: formula,
        options: {
          formula: '(GET("popinfam.comparison_sum"))/(GET("fam1.comparison_sum"))',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("avgfamsz.sum") - GET("avgfamsz.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("avgfamsz.m"),2) + POWER(GET("avgfamsz.comparison_m"),2))',
        },
      },      
    ],
  },
  {
    divider: true,
  },
  {
    highlight: true,
    title: 'Total persons under 18 years',
    variable: 'popu18',
  },
  {
    title: 'Householder or spouse',
    variable: 'hhldru18',
  },
  {
    title: 'Own child',
    variable: 'ownchu18',
  },
  {
    indent: 1,
    title: 'In married-couple family',
    variable: 'ocinmcfu18',
  },
  {
    indent: 1,
    title: 'In other family',
    variable: 'ocinofu18',
  },
  {
    indent: 2,
    title: 'Female householder',
    variable: 'ocinfhhu18',
  },
  {
    title: 'Other relatives',
    variable: 'orelu18',
  },
  {
    indent: 1,
    title: 'Grandchild',
    variable: 'grndchu18',
  },
  {
    title: 'Nonrelatives',
    variable: 'nonrelu18',
  },
  {
    title: 'In group quarters',
    variable: 'ingqu18',
  },
  {
    divider: true,
  },
  {
    highlight: true,
    title: 'Total persons 65 years and over',
    variable: 'pop65pl_2',
  },
  {
    title: 'In family households',
    variable: 'infmhh65p',
  },
  {
    indent: 1,
    title: 'Householder',
    variable: 'ifhhldr65p',
  },
  {
    indent: 1,
    title: 'Spouse',
    variable: 'ifsps65p',
  },
  {
    indent: 1,
    title: 'Other relatives',
    variable: 'iforel65p',
  },
  {
    indent: 1,
    title: 'Nonrelatives',
    variable: 'ifnrel65p',
  },
  {
    title: 'In nonfamily households',
    variable: 'innfmhh65p',
  },
  {
    indent: 1,
    title: 'Householder',
    variable: 'infhhlr65p',
  },
  {
    indent: 2,
    title: 'Living alone',
    variable: 'inflval65p',
  },
  {
    indent: 1,
    title: 'Nonrelatives',
    variable: 'infnrel65p',
  },
  {
    title: 'In group quarters',
    variable: 'ingq65p',
  },
  {
    indent: 1,
    title: 'Institutionalized',
    variable: 'instgq65p',
  },
];
