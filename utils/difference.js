const { executeWithValues: executeFormula } = require('./formula');

/*
 * Do calculations for all difference_* values for the given row
 * @param{Object} row - The row to update
 */
function doDifferenceCalculations(row) {
  calculateDifferences(row);
  calculateDifferencePercents(row);
}

/*
 * Calculate difference_sum, difference_m, and significant
 * @param{row} - The row to update
 */
function calculateDifferences(row) {
  if (exists(row.sum) && exists(row.comparison_sum)) {
    row.difference_sum = executeFormula('delta', [row.sum, row.comparison_sum]);

    if (exists(row.m) && exists(row.comparison_m)) {
      row.difference_m = executeFormula('delta_m', [row.m, row.comparison_m]);

      // TODO rename difference_significant
      if (row.difference_sum !== 0) row.significant = executeFormula('significant', [row.difference_sum, row.difference_m]);
    }
  }

  // special handling for 'decennial' rows, which do not have MOE and are all considered 'significant'
  if (row.profile === 'decennial') row.significant = true;
}

/*
 * Calculate difference_percent, difference_percent_m, and percent_significant
 * @param{row} - The row to do calculations for
 */
function calculateDifferencePercents(row) {
  // do not calculate difference percents if either value was top- or bottom-coded
  if (row.codingThreshold || row.comparison_codingThreshold) {
    row.difference_percent = null;
    row.difference_percent_m = null;
    return;
  }

  if (exists(row.percent) && exists(row.comparison_percent)) {
    row.difference_percent = executeFormula('delta_with_threshold', [row.percent * 100, row.comparison_percent * 100]);

    if (exists(row.percent_m) && exists(row.comparison_percent_m)) {
      row.difference_percent_m = executeFormula('delta_m', [row.percent_m * 100, row.comparison_percent_m * 100]);

      // TODO rename difference_percent_significant
      if (row.difference_percent !== 0) row.percent_significant = executeFormula('significant', [row.difference_percent, row.difference_percent_m]);
    }
  }
}

/*
 * Helper function to check if a given value has a real value.
 * Can't use plain conditional check b/c val = 0 would give false negative
 * @param{Number} val - the value to check
 * @returns{Boolean}
 */
function exists(val) {
  return val !== undefined && val !== null;
}
module.exports = doDifferenceCalculations;
