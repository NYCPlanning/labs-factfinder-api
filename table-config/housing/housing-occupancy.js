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
        column: 'est',
        aggregator: calculator,
        options: {
          procedure: [['vacsale.est', 'divide', 'hovacu.est'], 'multiply', 100],
        },
      },
      {
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: [['vacsale.comparison_est', 'divide', 'hovacu.comparison_est'], 'multiply', 100],
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: [['vacsale.previous_est', 'divide', 'hovacu.previous_est'], 'multiply', 100],
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacsale.m")^2)-(( GET("vacsale.est") ^2/ GET("hovacu.est") ^2)*( GET("hovacu.m") ^2)))<0,((1/ GET("hovacu.est") *(SQRT((GET("vacsale.m") ^2)+(( GET("vacsale.est") ^2/ GET("hovacu.est") ^2)*( GET("hovacu.m") ^2)))))*100),((1/ GET("hovacu.est") *(SQRT((GET("vacsale.m") ^2)-(( GET("vacsale.est") ^2/ GET("hovacu.est") ^2)*( GET("hovacu.m") ^2)))))*100))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacsale.comparison_moe")^2)-(( GET("vacsale.comparison_est") ^2/ GET("hovacu.comparison_est") ^2)*( GET("hovacu.comparison_moe") ^2)))<0,((1/ GET("hovacu.comparison_est") *(SQRT((GET("vacsale.comparison_moe") ^2)+(( GET("vacsale.comparison_est") ^2/ GET("hovacu.comparison_est") ^2)*( GET("hovacu.comparison_moe") ^2)))))*100),((1/ GET("hovacu.comparison_est") *(SQRT((GET("vacsale.comparison_moe") ^2)-(( GET("vacsale.comparison_est") ^2/ GET("hovacu.comparison_est") ^2)*( GET("hovacu.comparison_moe") ^2)))))*100))',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacsale.previous_moe")^2)-(( GET("vacsale.previous_est") ^2/ GET("hovacu.previous_est") ^2)*( GET("hovacu.previous_moe") ^2)))<0,((1/ GET("hovacu.previous_est") *(SQRT((GET("vacsale.previous_moe") ^2)+(( GET("vacsale.previous_est") ^2/ GET("hovacu.previous_est") ^2)*( GET("hovacu.previous_moe") ^2)))))*100),((1/ GET("hovacu.previous_est") *(SQRT((GET("vacsale.previous_moe") ^2)-(( GET("vacsale.previous_est") ^2/ GET("hovacu.previous_est") ^2)*( GET("hovacu.previous_moe") ^2)))))*100))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("hovacrt.m")/ 1.645) / GET("hovacrt.est") * 100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("hovacrt.comparison_moe")/ 1.645) / GET("hovacrt.comparison_est") * 100)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("hovacrt.est") - GET("hovacrt.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("hovacrt.m"),2) + POWER(GET("hovacrt.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("hovacrt.est") - GET("hovacrt.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("hovacrt.m"),2) + POWER(GET("hovacrt.previous_moe"),2))',
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
        column: 'est',
        aggregator: calculator,
        options: {
          procedure: [['vacrnt.est', 'divide', 'rntvacu.est'], 'multiply', 100],
        },
      },
      {
        column: 'comparison_est',
        aggregator: calculator,
        options: {
          procedure: [['vacrnt.comparison_est', 'divide', 'rntvacu.comparison_est'], 'multiply', 100],
        },
      },
      {
        column: 'previous_est',
        aggregator: calculator,
        options: {
          procedure: [['vacrnt.previous_est', 'divide', 'rntvacu.previous_est'], 'multiply', 100],
        },
      },
      {
        column: 'm',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacrnt.m")^2)-(( GET("vacrnt.est") ^2/ GET("rntvacu.est") ^2)*( GET("rntvacu.m") ^2)))<0,((1/ GET("rntvacu.est") *(SQRT((GET("vacrnt.m") ^2)+(( GET("vacrnt.est") ^2/ GET("rntvacu.est") ^2)*( GET("rntvacu.m") ^2)))))*100),((1/ GET("rntvacu.est") *(SQRT((GET("vacrnt.m") ^2)-(( GET("vacrnt.est") ^2/ GET("rntvacu.est") ^2)*( GET("rntvacu.m") ^2)))))*100))',
        },
      },
      {
        column: 'comparison_moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacrnt.comparison_moe")^2)-(( GET("vacrnt.comparison_est") ^2/ GET("rntvacu.comparison_est") ^2)*( GET("rntvacu.comparison_moe") ^2)))<0,((1/ GET("rntvacu.comparison_est") *(SQRT((GET("vacrnt.comparison_moe") ^2)+(( GET("vacrnt.comparison_est") ^2/ GET("rntvacu.comparison_est") ^2)*( GET("rntvacu.comparison_moe") ^2)))))*100),((1/ GET("rntvacu.comparison_est") *(SQRT((GET("vacrnt.comparison_moe") ^2)-(( GET("vacrnt.comparison_est") ^2/ GET("rntvacu.comparison_est") ^2)*( GET("rntvacu.comparison_moe") ^2)))))*100))',
        },
      },
      {
        column: 'previous_moe',
        aggregator: formula,
        options: {
          formula: 'IF(((GET("vacrnt.previous_moe")^2)-(( GET("vacrnt.previous_est") ^2/ GET("rntvacu.previous_est") ^2)*( GET("rntvacu.previous_moe") ^2)))<0,((1/ GET("rntvacu.previous_est") *(SQRT((GET("vacrnt.previous_moe") ^2)+(( GET("vacrnt.previous_est") ^2/ GET("rntvacu.previous_est") ^2)*( GET("rntvacu.previous_moe") ^2)))))*100),((1/ GET("rntvacu.previous_est") *(SQRT((GET("vacrnt.previous_moe") ^2)-(( GET("vacrnt.previous_est") ^2/ GET("rntvacu.previous_est") ^2)*( GET("rntvacu.previous_moe") ^2)))))*100))',
        },
      },
      {
        column: 'cv',
        aggregator: formula,
        options: {
          formula: '((GET("rntvacrt.m")/ 1.645) / GET("rntvacrt.est") * 100)',
        },
      },
      {
        column: 'comparison_cv',
        aggregator: formula,
        options: {
          formula: '((GET("rntvacrt.comparison_moe")/ 1.645) / GET("rntvacrt.comparison_est") * 100)',
        },
      },
      {
        column: 'difference_est',
        aggregator: formula,
        options: {
          formula: '(GET("rntvacrt.est") - GET("rntvacrt.comparison_est"))',
        },
      },
      {
        column: 'difference_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("rntvacrt.m"),2) + POWER(GET("rntvacrt.comparison_moe"),2))',
        },
      },
      {
        column: 'change_est',
        aggregator: formula,
        options: {
          formula: '(GET("rntvacrt.est") - GET("rntvacrt.previous_est"))',
        },
      },
      {
        column: 'change_moe',
        aggregator: formula,
        options: {
          formula: 'SQRT(POWER(GET("rntvacrt.m"),2) + POWER(GET("rntvacrt.previous_moe"),2))',
        },
      },
    ],
  },
];
