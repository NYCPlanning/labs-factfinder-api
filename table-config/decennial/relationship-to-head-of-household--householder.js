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
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: formula,
        options: {
          formula: '(GET("popinhh.est"))/(GET("hh1.est"))',
        },
      },
      {
        column: 'comparison_est',
        aggregator: formula,
        options: {
          formula: '(GET("popinhh.comparison_est"))/(GET("hh1.comparison_est"))',
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("popinhh.previous_est"))/(GET("hh1.previous_est"))',
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
    ],
  },
  {
    title: 'Average family size',
    tooltip: 'Population in family households, minus nonrelatives in family households, divded by number of family households',
    variable: 'avgfamsz',
    decimal: 2,
    special: true,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: formula,
        options: {
          formula: '(GET("popinfam.est"))/(GET("fam1.est"))',
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '(GET("popinfam.previous_est"))/(GET("fam1.previous_est"))',
        },
      },
      {
        column: 'comparison_est',
        aggregator: formula,
        options: {
          formula: '(GET("popinfam.comparison_est"))/(GET("fam1.comparison_est"))',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("avgfamsz.est") - GET("avgfamsz.comparison_est"))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("avgfamsz.est") - GET("avgfamsz.previous_est"))',
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
    variable: 'popu18_2',
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
