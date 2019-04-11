const { CV_CONST } = require('../special-calculations/data/constants');

const { abs, sqrt } = Math;

function exists(val) {
  return val !== undefined;
}

function calculateDifferences(row) {
  const updatedRow = row;
  if (exists(updatedRow.sum) && exists(updatedRow.comparison_sum)) {
    updatedRow.difference_sum = updatedRow.sum - updatedRow.comparison_sum;
    if (exists(updatedRow.comparison_m)) {
      updatedRow.difference_m = abs(sqrt((updatedRow.m ** 2) + (updatedRow.comparison_m ** 2)));

      updatedRow.significant = (((updatedRow.difference_m) / CV_CONST) / updatedRow.difference_sum) * 100 < 20;
    }
  }

  // special handling for 'decennial' rows, which do not have MOE and are all considered 'significant'
  if (row.profile === 'decennial') row.significant = true;
}

function calculateDifferencePercents(row) {
  const updatedRow = row;
  if (exists(updatedRow.percent) && exists(updatedRow.comparison_percent)) {
    updatedRow.difference_percent = (updatedRow.percent - updatedRow.comparison_percent) * 100;
    if (exists(updatedRow.percent_m)) {
      updatedRow.difference_percent_m = sqrt(((updatedRow.percent_m * 100) ** 2) + ((updatedRow.comparison_percent_m * 100) ** 2));

      // TODO rename difference_percent_significant
      updatedRow.percent_significant = ((updatedRow.difference_percent_m / CV_CONST) / abs(updatedRow.difference_percent)) * 100 < 20;
    }
  }
}

function doDifferenceCalculations(row) {
  calculateDifferences(row);
  calculateDifferencePercents(row);
}

module.exports = doDifferenceCalculations;
