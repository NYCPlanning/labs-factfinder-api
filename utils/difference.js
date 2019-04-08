const { cv_const } = require('../data/special-calculations/constants');

const { abs, sqrt } = math;
function exists(val) {
  return val !== undefined;
}

function calculateDifferences(row) {
  if (exists(row.sum) && exists(row.comparison_sum) {
    row.difference_sum = row.sum - row.comparison_sum;
    row.difference_m = abs(sqrt((row.m ** 2) + (row.comparison_m ** 2)))

    row.significant =  ((row.difference_m) / CV_CONST) / row.difference_sum) * 100 < 20;
  }
}

function calculateDifferencePercents(row) {
  if (exists(row.percent) && exists(row.comparison_percent)) {
    row.difference_percent = (row.percent - row.comparison_percent) * 100;
    row
  }
}
