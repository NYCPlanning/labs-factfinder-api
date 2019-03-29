const { executeWithValues: executeFormula } = require('./formula');

/*
 * Do calculations for all change_* values for the given row
 * @param{Object} row - The row to do calculations for
 */
function doChangeCalculations(row) {
  calculateChanges(row);
  calculateChangePercents(row);
  calculateChangePercentagePoints(row);
}

/*
 * Calculate change_sum, change_m, and change_significant
 * @param{row} - The row to do calculations for
 */
function calculateChanges(row) {
  const updatedRow = row;
  if (exists(updatedRow.sum) && exists(updatedRow.previous_sum)) {
    updatedRow.change_sum = executeFormula('delta', [updatedRow.sum, updatedRow.previous_sum]);

    if (exists(updatedRow.m) && exists(updatedRow.previous_m)) {
      updatedRow.change_m = executeFormula('delta_m', [updatedRow.m, updatedRow.previous_m]);

      if (updatedRow.change_sum !== 0) updatedRow.change_significant = executeFormula('significant', [updatedRow.change_sum, updatedRow.change_m]);
    }
  }
}

/*
 * Calculate change_percent, change_percent_m, change_percent_significant
 * @param{row} - The row to do calculations for
 */
function calculateChangePercents(row) {
  const updatedRow = row;
  if (exists(updatedRow.sum) && exists(updatedRow.previous_sum) && updatedRow.previous_sum !== 0) {
    updatedRow.change_percent = executeFormula('change_pct', [updatedRow.sum, updatedRow.previous_sum]);

    if (exists(updatedRow.m) && exists(updatedRow.percent_m)) {
      updatedRow.change_percent_m = executeFormula('change_pct_m', [updatedRow.sum, updatedRow.previous_sum, updatedRow.m, updatedRow.previous_m]);

      if (updatedRow.change_percent !== 0) updatedRow.change_percent_significant = executeFormula('significant', [updatedRow.change_percent, updatedRow.change_percent_m]);
    }
  }
}

/*
 * Calculate change_percentage_point, change_percentage_point_m, change_percentage_point_significant
 * @param{row} - The row to do calculations for
 */
function calculateChangePercentagePoints(row) {
  const updatedRow = row;
  if (exists(updatedRow.percent) && exists(updatedRow.previous_percent)) {
    updatedRow.change_percentage_point = executeFormula('delta', [updatedRow.percent, updatedRow.previous_percent]);

    if (exists(updatedRow.percent_m) && exists(updatedRow.previous_percent_m)) {
      updatedRow.change_percentage_point_m = executeFormula('delta_m', [updatedRow.percent_m, updatedRow.previous_percent_m]);

      if (updatedRow.change_percentage_point !== 0) updatedRow.change_percentage_point_significant = executeFormula('significant', [updatedRow.change_percentage_point, updatedRow.change_percentage_point_m]);
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


module.exports = doChangeCalculations;
