const calculator = require ('../../utils/calculator');
const formula = require ('../../utils/formula');

module.exports = [
  {
    title: 'Total housing units',
    highlight: true,
    variable: 'hu1',
  },
  {
    title: 'Occupied housing units',
    variable: 'ochu1',
  },
  {
    title: 'Vacant housing units',
    variable: 'vachu',
  },
  {
    divider: true,
  },
  {
    title: 'Homeowner vacancy rate',
    tooltip: 'Number of vacant units “for sale only,” divided by sum of owner-occupied units, vacant units that are “for sale only,” and vacant units that have been sold but not yet occupied. Quotient is multiplied by 100.',
    variable: 'hovacrt',
    special: true,
    decimal: 1,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: calculator,
        options: {
          procedure: [['vacsale.sum', 'divide', 'hovacu.sum'], 'multiply', 100],
        },
      },
      {
        column: 'comparison_sum',
        aggregator: calculator,
        options: {
          procedure: [['vacsale.comparison_sum', 'divide', 'hovacu.comparison_sum'], 'multiply', 100],
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacsale.m")^2)-(( GET("vacsale.sum") ^2/ GET("hovacu.sum") ^2)*( GET("hovacu.m") ^2)))<0,((1/ GET("hovacu.sum") *(SQRT((GET("vacsale.m") ^2)+(( GET("vacsale.sum") ^2/ GET("hovacu.sum") ^2)*( GET("hovacu.m") ^2)))))*100),((1/ GET("hovacu.sum") *(SQRT((GET("vacsale.m") ^2)-(( GET("vacsale.sum") ^2/ GET("hovacu.sum") ^2)*( GET("hovacu.m") ^2)))))*100))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacsale.comparison_m")^2)-(( GET("vacsale.comparison_sum") ^2/ GET("hovacu.comparison_sum") ^2)*( GET("hovacu.comparison_m") ^2)))<0,((1/ GET("hovacu.comparison_sum") *(SQRT((GET("vacsale.comparison_m") ^2)+(( GET("vacsale.comparison_sum") ^2/ GET("hovacu.comparison_sum") ^2)*( GET("hovacu.comparison_m") ^2)))))*100),((1/ GET("hovacu.comparison_sum") *(SQRT((GET("vacsale.comparison_m") ^2)-(( GET("vacsale.comparison_sum") ^2/ GET("hovacu.comparison_sum") ^2)*( GET("hovacu.comparison_m") ^2)))))*100))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("hovacrt.m")/ 1.645) / GET("hovacrt.sum") * 100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("hovacrt.comparison_m")/ 1.645) / GET("hovacrt.comparison_sum") * 100)',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("hovacrt.sum") - GET("hovacrt.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("hovacrt.m"),2) + POWER(GET("hovacrt.comparison_m"),2))',
        },
      },      
    ],
  },
  {
    title: 'Rental vacancy rate',
    tooltip: 'Number of vacant units “for rent,” divided by sum of renter-occupied units, vacant units that are “for rent,” and vacant units that have been rented but not yet occupied. Quotient is multiplied by 100.',
    variable: 'rntvacrt',
    special: true,
    decimal: 1,
    specialCalculations: [
      {
        column: 'sum',
        aggregator: calculator,
        options: {
          procedure: [['vacrnt.sum', 'divide', 'rntvacu.sum'], 'multiply', 100],
        },
      },
      {
        column: 'comparison_sum',
        aggregator: calculator,
        options: {
          procedure: [['vacrnt.comparison_sum', 'divide', 'rntvacu.comparison_sum'], 'multiply', 100],
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacrnt.m")^2)-(( GET("vacrnt.sum") ^2/ GET("rntvacu.sum") ^2)*( GET("rntvacu.m") ^2)))<0,((1/ GET("rntvacu.sum") *(SQRT((GET("vacrnt.m") ^2)+(( GET("vacrnt.sum") ^2/ GET("rntvacu.sum") ^2)*( GET("rntvacu.m") ^2)))))*100),((1/ GET("rntvacu.sum") *(SQRT((GET("vacrnt.m") ^2)-(( GET("vacrnt.sum") ^2/ GET("rntvacu.sum") ^2)*( GET("rntvacu.m") ^2)))))*100))',
        },
      },
      {
        column: 'comparison_m',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacrnt.comparison_m")^2)-(( GET("vacrnt.comparison_sum") ^2/ GET("rntvacu.comparison_sum") ^2)*( GET("rntvacu.comparison_m") ^2)))<0,((1/ GET("rntvacu.comparison_sum") *(SQRT((GET("vacrnt.comparison_m") ^2)+(( GET("vacrnt.comparison_sum") ^2/ GET("rntvacu.comparison_sum") ^2)*( GET("rntvacu.comparison_m") ^2)))))*100),((1/ GET("rntvacu.comparison_sum") *(SQRT((GET("vacrnt.comparison_m") ^2)-(( GET("vacrnt.comparison_sum") ^2/ GET("rntvacu.comparison_sum") ^2)*( GET("rntvacu.comparison_m") ^2)))))*100))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("rntvacrt.m")/ 1.645) / GET("rntvacrt.sum") * 100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("rntvacrt.comparison_m")/ 1.645) / GET("rntvacrt.comparison_sum") * 100)',
        },
      },
      {
        column: 'difference_sum',
        aggregator: formula,
        options: {
          formula: '(GET("rntvacrt.sum") - GET("rntvacrt.comparison_sum"))',
        },
      },
      {
        column: 'difference_m',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("rntvacrt.m"),2) + POWER(GET("rntvacrt.comparison_m"),2))',
        },
      },      
    ],
  },
];
