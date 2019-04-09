const { CV_CONST } = require('../data/special-calculations/constants');

const { abs, sqrt } = Math;

function exists(val) {
  return val !== undefined;
}

function calculateDifferences(row) {
  if (exists(row.sum) && exists(row.comparison_sum)) {
    row.difference_sum = row.sum - row.comparison_sum;
    if (exists(row.comparison_m)) {
      row.difference_m = abs(sqrt((row.m ** 2) + (row.comparison_m ** 2)));

      row.significant = (((row.difference_m) / CV_CONST) / row.difference_sum) * 100 < 20;
    }
  }
}

function calculateDifferencePercents(row) {
  if (exists(row.percent) && exists(row.comparison_percent)) {
    row.difference_percent = (row.percent - row.comparison_percent) * 100;
    if (exists(row.percent_m)) {
      row.difference_percent_m = sqrt(((row.percent_m * 100) ** 2) + ((row.omparison_percent_m * 100) ** 2));

      // TODO rename difference_percent_significant
      row.percent_significant = ((row.difference_percent_m / CV_CONST) / abs(row.diffference_percent)) * 100 < 20;
    }
  }
}

function doDifferenceCalculations(row) {
  calculateDifferences(row);
  calculateDifferencePercents(row);
}

module.exports = doDifferenceCalculations;
