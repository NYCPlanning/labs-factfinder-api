const calculator = require('../../utils/calculator');
const formula = require('../../utils/formula');

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
    tooltip: 'Number of vacant units “for sale only,” divided by estimate of owner-occupied units, vacant units that are “for sale only,” and vacant units that have been sold but not yet occupied. Quotient is multiplied by 100.',
    variable: 'hovacrt',
    special: true,
    decimal: 1,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'estimate',
        aggregator: calculator,
        options: {
          procedure: [['vacsale.estimate', 'divide', 'hovacu.estimate'], 'multiply', 100],
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: calculator,
        options: {
          procedure: [['vacsale.comparison_estimate', 'divide', 'hovacu.comparison_estimate'], 'multiply', 100],
        },
      },
      {
        column: 'previous_estimate',
        aggregator: calculator,
        options: {
          procedure: [['vacsale.previous_estimate', 'divide', 'hovacu.previous_estimate'], 'multiply', 100],
        },
      },
      {
        column: 'moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacsale.moe")^2)-(( GET("vacsale.estimate") ^2/ GET("hovacu.estimate") ^2)*( GET("hovacu.moe") ^2)))<0,((1/ GET("hovacu.estimate") *(SQRT((GET("vacsale.moe") ^2)+(( GET("vacsale.estimate") ^2/ GET("hovacu.estimate") ^2)*( GET("hovacu.moe") ^2)))))*100),((1/ GET("hovacu.estimate") *(SQRT((GET("vacsale.moe") ^2)-(( GET("vacsale.estimate") ^2/ GET("hovacu.estimate") ^2)*( GET("hovacu.moe") ^2)))))*100))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacsale.comparison_moe")^2)-(( GET("vacsale.comparison_estimate") ^2/ GET("hovacu.comparison_estimate") ^2)*( GET("hovacu.comparison_moe") ^2)))<0,((1/ GET("hovacu.comparison_estimate") *(SQRT((GET("vacsale.comparison_moe") ^2)+(( GET("vacsale.comparison_estimate") ^2/ GET("hovacu.comparison_estimate") ^2)*( GET("hovacu.comparison_moe") ^2)))))*100),((1/ GET("hovacu.comparison_estimate") *(SQRT((GET("vacsale.comparison_moe") ^2)-(( GET("vacsale.comparison_estimate") ^2/ GET("hovacu.comparison_estimate") ^2)*( GET("hovacu.comparison_moe") ^2)))))*100))',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacsale.previous_moe")^2)-(( GET("vacsale.previous_estimate") ^2/ GET("hovacu.previous_estimate") ^2)*( GET("hovacu.previous_moe") ^2)))<0,((1/ GET("hovacu.previous_estimate") *(SQRT((GET("vacsale.previous_moe") ^2)+(( GET("vacsale.previous_estimate") ^2/ GET("hovacu.previous_estimate") ^2)*( GET("hovacu.previous_moe") ^2)))))*100),((1/ GET("hovacu.previous_estimate") *(SQRT((GET("vacsale.previous_moe") ^2)-(( GET("vacsale.previous_estimate") ^2/ GET("hovacu.previous_estimate") ^2)*( GET("hovacu.previous_moe") ^2)))))*100))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("hovacrt.moe")/ 1.645) / GET("hovacrt.estimate") * 100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("hovacrt.comparison_moe")/ 1.645) / GET("hovacrt.comparison_estimate") * 100)',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("hovacrt.estimate") - GET("hovacrt.comparison_estimate"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("hovacrt.moe"),2) + POWER(GET("hovacrt.comparison_moe"),2))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("hovacrt.estimate") - GET("hovacrt.previous_estimate"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("hovacrt.moe"),2) + POWER(GET("hovacrt.previous_moe"),2))',
        },
      },
    ],
  },
  {
    title: 'Rental vacancy rate',
    tooltip: 'Number of vacant units “for rent,” divided by estimate of renter-occupied units, vacant units that are “for rent,” and vacant units that have been rented but not yet occupied. Quotient is multiplied by 100.',
    variable: 'rntvacrt',
    special: true,
    decimal: 1,
    hidePercentChange: true,
    specialCalculations: [
      {
        column: 'estimate',
        aggregator: calculator,
        options: {
          procedure: [['vacrnt.estimate', 'divide', 'rntvacu.estimate'], 'multiply', 100],
        },
      },
      {
        column: 'comparison_estimate',
        aggregator: calculator,
        options: {
          procedure: [['vacrnt.comparison_estimate', 'divide', 'rntvacu.comparison_estimate'], 'multiply', 100],
        },
      },
      {
        column: 'previous_estimate',
        aggregator: calculator,
        options: {
          procedure: [['vacrnt.previous_estimate', 'divide', 'rntvacu.previous_estimate'], 'multiply', 100],
        },
      },
      {
        column: 'moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacrnt.moe")^2)-(( GET("vacrnt.estimate") ^2/ GET("rntvacu.estimate") ^2)*( GET("rntvacu.moe") ^2)))<0,((1/ GET("rntvacu.estimate") *(SQRT((GET("vacrnt.moe") ^2)+(( GET("vacrnt.estimate") ^2/ GET("rntvacu.estimate") ^2)*( GET("rntvacu.moe") ^2)))))*100),((1/ GET("rntvacu.estimate") *(SQRT((GET("vacrnt.moe") ^2)-(( GET("vacrnt.estimate") ^2/ GET("rntvacu.estimate") ^2)*( GET("rntvacu.moe") ^2)))))*100))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacrnt.comparison_moe")^2)-(( GET("vacrnt.comparison_estimate") ^2/ GET("rntvacu.comparison_estimate") ^2)*( GET("rntvacu.comparison_moe") ^2)))<0,((1/ GET("rntvacu.comparison_estimate") *(SQRT((GET("vacrnt.comparison_moe") ^2)+(( GET("vacrnt.comparison_estimate") ^2/ GET("rntvacu.comparison_estimate") ^2)*( GET("rntvacu.comparison_moe") ^2)))))*100),((1/ GET("rntvacu.comparison_estimate") *(SQRT((GET("vacrnt.comparison_moe") ^2)-(( GET("vacrnt.comparison_estimate") ^2/ GET("rntvacu.comparison_estimate") ^2)*( GET("rntvacu.comparison_moe") ^2)))))*100))',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacrnt.previous_moe")^2)-(( GET("vacrnt.previous_estimate") ^2/ GET("rntvacu.previous_estimate") ^2)*( GET("rntvacu.previous_moe") ^2)))<0,((1/ GET("rntvacu.previous_estimate") *(SQRT((GET("vacrnt.previous_moe") ^2)+(( GET("vacrnt.previous_estimate") ^2/ GET("rntvacu.previous_estimate") ^2)*( GET("rntvacu.previous_moe") ^2)))))*100),((1/ GET("rntvacu.previous_estimate") *(SQRT((GET("vacrnt.previous_moe") ^2)-(( GET("vacrnt.previous_estimate") ^2/ GET("rntvacu.previous_estimate") ^2)*( GET("rntvacu.previous_moe") ^2)))))*100))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("rntvacrt.moe")/ 1.645) / GET("rntvacrt.estimate") * 100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("rntvacrt.comparison_moe")/ 1.645) / GET("rntvacrt.comparison_estimate") * 100)',
        },
      },
      {
        column: 'difference_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("rntvacrt.estimate") - GET("rntvacrt.comparison_estimate"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("rntvacrt.moe"),2) + POWER(GET("rntvacrt.comparison_moe"),2))',
        },
      },
      {
        column: 'change_estimate',
        aggregator: formula,
        options: {
          formula: '(GET("rntvacrt.estimate") - GET("rntvacrt.previous_estimate"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("rntvacrt.moe"),2) + POWER(GET("rntvacrt.previous_moe"),2))',
        },
      },
    ],
  },
];
