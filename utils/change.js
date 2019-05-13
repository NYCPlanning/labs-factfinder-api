const { executeWithValues: executeFormula } = require('./formula');

/*
 * Do calculations for all change_* values for the given row
 * @param{Object} row - The row to do calculations for
 * @param{Object} rowConfig - Special calculation config for the row, or undefined; used to determine
 * when change percent calculations should be skipped (noChangePercents = true), and to skip percentage point
 * calculations for all special variables
 */
function doChangeCalculations(row, rowConfig) {
  calculateChanges(row);
  calculateChangePercents(row, rowConfig);
  calculateChangePercentagePoints(row, rowConfig);
}

/*
 * Calculate change_sum, change_m, and change_significant
 * @param{Object} row - The row to update
 */
function calculateChanges(row) {
  if (exists(row.sum) && exists(row.previous_sum)) {
    row.change_sum = executeFormula('delta', [row.sum, row.previous_sum]);

    if (exists(row.m) && exists(row.previous_m)) {
      row.change_m = executeFormula('delta_m', [row.m, row.previous_m]);

      if (row.change_sum !== 0) row.change_significant = executeFormula('significant', [row.change_sum, row.change_m]);
    }
  }
}

/*
 * Calculate change_percent, change_percent_m, change_percent_significant
 * @param{Object} row - The row to update
 * @param{Object} rowConfig - Special calculation config for the row, or undefined
 */
function calculateChangePercents(row, rowConfig) {
  // do not calculate change percent values for special variables with noChangePercents flag set to true
  if (rowConfig && rowConfig.noChangePercents) {
    row.change_percent = null;
    row.change_percent_m = null;
    return;
  }

  if (exists(row.sum) && exists(row.previous_sum) && row.previous_sum !== 0) {
    row.change_percent = executeFormula('change_pct', [row.sum, row.previous_sum]);

    if (exists(row.m) && exists(row.previous_m) && row.sum !== 0) {
      row.change_percent_m = executeFormula('change_pct_m', [row.sum, row.previous_sum, row.m, row.previous_m]);

      if (row.change_percent !== 0) row.change_percent_significant = executeFormula('significant', [row.change_percent, row.change_percent_m]);
    }
  }
}

/*
 * Calculate change_percentage_point, change_percentage_point_m, change_percentage_point_significant
 * @param{row} - The row to update
 * @param{Object} rowConfig - Special calculation config for the row, or undefined
 */
function calculateChangePercentagePoints(row, rowConfig) {
  // do not calculate change percentage point values for ANY special variables
  if (rowConfig) {
    row.change_percentage_point = null;
    row.change_percentage_point_m = null;
    return;
  }

  // do not calculate change percentage points if either value was top- or bottom-coded
  if (row.codingThreshold || row.previous_codingThreshold) return;

  if (exists(row.percent) && exists(row.previous_percent)) {
    row.change_percentage_point = executeFormula('delta', [row.percent, row.previous_percent]);

    if (exists(row.percent_m) && exists(row.previous_percent_m)) {
      row.change_percentage_point_m = executeFormula('delta_m', [row.percent_m, row.previous_percent_m]);

      if (row.change_percentage_point !== 0) row.change_percentage_point_significant = executeFormula('significant', [row.change_percentage_point, row.change_percentage_point_m]);
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
