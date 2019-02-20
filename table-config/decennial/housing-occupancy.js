const formula = require('../../utils/formula');

module.exports = [
  {
    highlight: true,
    title: 'Total housing units',
    variable: 'hunits',
  },
  {
    title: 'Occupied housing units',
    variable: 'ochu_1',
  },
  {
    title: 'Vacant housing units',
    variable: 'vachus',
  },
  {
    indent: 1,
    title: 'For rent',
    variable: 'vhufrnt',
  },
  {
    indent: 1,
    title: 'For sale only',
    variable: 'vhufslo',
  },
  {
    indent: 1,
    title: 'Rented or sold, not occupied',
    variable: 'vhurosnoc',
  },
  {
    indent: 1,
    title: 'For seasonal, recreational, or occasional use',
    variable: 'vhufsroou',
  },
  {
    indent: 1,
    title: 'Other vacant',
    variable: 'vhuothvc',
  },
  {
    divider: true,
  },
  {
    title: 'Homeowner vacancy rate (percent)',
    tooltip: 'Number of vacant units "for sale only," divided by estimate of owner-occupied units and vacant units "for sale only," multiplied by 100. (Used definition from 2000 for consistency in measuring change.)',
    variable: 'hmownrvcrt',
    decimal: 1,
    special: true,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: formula,
        options: {
          formula: '((GET("vhufslo.est"))/((GET("vhufslo.est"))+(GET("oochu1.est"))))*100',
        },
      },
      {
        column: 'comparison_est',
        aggregator: formula,
        options: {
          formula: '((GET("vhufslo.comparison_est"))/((GET("vhufslo.comparison_est"))+(GET("oochu1.comparison_est"))))*100',
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '((GET("vhufslo.previous_est"))/((GET("vhufslo.previous_est"))+(GET("oochu1.previous_est"))))*100',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("hmownrvcrt.est") - GET("hmownrvcrt.comparison_est"))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("hmownrvcrt.est") - GET("hmownrvcrt.previous_est"))',
        },
      },
    ],
  },
  {
    title: 'Rental vacancy rate (percent)',
    tooltip: 'Number of vacant units "for rent," divided by estimate of renter-occupied units and vacant units "for rent," multiplied by 100. (Used definition from 2000 for consistency in measuring change.)',
    variable: 'rntvcrt',
    decimal: 1,
    special: true,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'est',
        aggregator: formula,
        options: {
          formula: '((GET("vhufrnt.est"))/((GET("vhufrnt.est"))+(GET("rochu_3.est"))))*100',
        },
      },
      {
        column: 'comparison_est',
        aggregator: formula,
        options: {
          formula: '((GET("vhufrnt.comparison_est"))/((GET("vhufrnt.comparison_est"))+(GET("rochu_3.comparison_est"))))*100',
        },
      },
      {
        column: 'previous_est',
        aggregator: formula,
        options: {
          formula: '((GET("vhufrnt.previous_est"))/((GET("vhufrnt.previous_est"))+(GET("rochu_3.previous_est"))))*100',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("rntvcrt.est") - GET("rntvcrt.comparison_est"))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("rntvcrt.est") - GET("rntvcrt.previous_est"))',
        },
      },
    ],
  },
];
