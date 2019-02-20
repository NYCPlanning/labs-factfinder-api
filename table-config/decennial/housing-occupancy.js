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
        column: 'estimate',
        aggregator: formula,
        options: {
          formula: '((GET("vhufslo.estimate"))/((GET("vhufslo.estimate"))+(GET("oochu1.estimate"))))*100',
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: formula,
        options: {
          formula: '((GET("vhufslo.comparison_estimate"))/((GET("vhufslo.comparison_estimate"))+(GET("oochu1.comparison_estimate"))))*100',
        },
      },
      {
        column: 'previous_estimate',
        aggregator: formula,
        options: {
          formula: '((GET("vhufslo.previous_estimate"))/((GET("vhufslo.previous_estimate"))+(GET("oochu1.previous_estimate"))))*100',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("hmownrvcrt.estimate") - GET("hmownrvcrt.comparison_estimate"))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("hmownrvcrt.estimate") - GET("hmownrvcrt.previous_estimate"))',
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
        column: 'estimate',
        aggregator: formula,
        options: {
          formula: '((GET("vhufrnt.estimate"))/((GET("vhufrnt.estimate"))+(GET("rochu_3.estimate"))))*100',
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: formula,
        options: {
          formula: '((GET("vhufrnt.comparison_estimate"))/((GET("vhufrnt.comparison_estimate"))+(GET("rochu_3.comparison_estimate"))))*100',
        },
      },
      {
        column: 'previous_estimate',
        aggregator: formula,
        options: {
          formula: '((GET("vhufrnt.previous_estimate"))/((GET("vhufrnt.previous_estimate"))+(GET("rochu_3.previous_estimate"))))*100',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("rntvcrt.estimate") - GET("rntvcrt.comparison_estimate"))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("rntvcrt.estimate") - GET("rntvcrt.previous_estimate"))',
        },
      },
    ],
  },
];
