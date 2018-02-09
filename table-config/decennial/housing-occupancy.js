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
    tooltip: 'Number of vacant units "for sale only," divided by sum of owner-occupied units and vacant units "for sale only," multiplied by 100. (Used definition from 2000 for consistency in measuring change.)',
    variable: 'hmownrvcrt',
    decimal: 1,
    special: true,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '((GET("vhufslo.sum"))/((GET("vhufslo.sum"))+(GET("oochu1.sum"))))*100',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: formula,
        options: {
          formula: '((GET("vhufslo.comparison_sum"))/((GET("vhufslo.comparison_sum"))+(GET("oochu1.comparison_sum"))))*100',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("hmownrvcrt.sum") - GET("hmownrvcrt.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("hmownrvcrt.m"),2) + POWER(GET("hmownrvcrt.comparison_m"),2))',
        },
      },      
    ],
  },
  {
    title: 'Rental vacancy rate (percent)',
    tooltip: 'Number of vacant units "for rent," divided by sum of renter-occupied units and vacant units "for rent," multiplied by 100. (Used definition from 2000 for consistency in measuring change.)',
    variable: 'rntvcrt',
    decimal: 1,
    special: true,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: formula,
        options: {
          formula: '((GET("vhufrnt.sum"))/((GET("vhufrnt.sum"))+(GET("rochu_3.sum"))))*100',
        },
      },
      {
        column: 'comparison_sum',
        aggregator: formula,
        options: {
          formula: '((GET("vhufrnt.comparison_sum"))/((GET("vhufrnt.comparison_sum"))+(GET("rochu_3.comparison_sum"))))*100',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("rntvcrt.sum") - GET("rntvcrt.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("rntvcrt.m"),2) + POWER(GET("rntvcrt.comparison_m"),2))',
        },
      },
    ],
  },
];
