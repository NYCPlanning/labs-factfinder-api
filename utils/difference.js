const { executeWithValues: executeFormula } = require('./formula');

/*
 * Do calculations for all difference_* values for the given row
 * @param{Object} row - The row to do calculations for
 */
function doDifferenceCalculations(row) {
  calculateDifferences(row);
  calculateDifferencePercents(row);
}

/*
 * Calculate difference_sum, difference_m, and significant
 * @param{row} - The row to do calculations for
 */
function calculateDifferences(row) {
  const updatedRow = row;
  if (exists(updatedRow.sum) && exists(updatedRow.comparison_sum)) {
    updatedRow.difference_sum = executeFormula('delta', [updatedRow.sum, updatedRow.comparison_sum]);

    if (exists(updatedRow.comparison_m)) {
      updatedRow.difference_m = executeFormula('delta_m', [updatedRow.m, updatedRow.comparison_m]);

      // TODO rename difference_significant
      updatedRow.significant = executeFormula('significant', [updatedRow.difference_m, updatedRow.difference_sum]);
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
  const updatedRow = row;
  if (exists(updatedRow.percent) && exists(updatedRow.comparison_percent)) {
    const differencePercent = executeFormula('delta', [updatedRow.percent * 100, updatedRow.comparison_percent * 100]);
    updatedRow.difference_percent = differencePercent < 0 && differencePercent > -0.05 ? 0 : differencePercent;

    if (exists(updatedRow.percent_m)) {
      updatedRow.difference_percent_m = executeFormula('delta_m', [updatedRow.percent_m * 100, updatedRow.comparison_percent_m * 100]);

      // TODO rename difference_percent_significant
      updatedRow.percent_significant = executeFormula('significant', [updatedRow.difference_percent, updatedRow.difference_percent_m]);
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
