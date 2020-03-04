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
  // explicitly set changes to null if:
  // - any estimates are missing
  // - either estimate or previous estimate was coded
  if (!allExist(row.sum, row.previous_sum, row.m, row.previous_m)
    || row.codingThreshold
    || row.previous_codingThreshold) {
    nullChanges(row);
    return;
  }
  row.change_sum = executeFormula('delta', [row.sum, row.previous_sum]);
  row.change_m = executeFormula('delta_m', [row.m, row.previous_m]);

  if (row.change_sum !== 0) row.change_significant = executeFormula('significant', [row.change_sum, row.change_m]);
}

/*
 * Calculate change_percent, change_percent_m, change_percent_significant
 * @param{Object} row - The row to update
 * @param{Object} rowConfig - Special calculation config for the row, or undefined
 */
function calculateChangePercents(row, rowConfig) {
  // explicitly set change percents to null if:
  // - any estimates are missing
  // - either estimate or previous estimate was coded
  // - row config.noChangePercents is true
  if (!allExist(row.sum, row.previous_sum, row.m, row.previous_m)
    || row.codingThreshold
    || row.previous_codingThreshold
    || (rowConfig && rowConfig.noChangePercents)) {
    nullChangePercents(row);
    return;
  }

  // previous_sum is used as divisor in change_pct formula and due to shortcoming of the formula parsing library,
  // divide-by-0 errors cannot be preemptively caught and avoided with IF statements, so it must happen here
  row.change_percent = (row.previous_sum === 0) ? 0 : executeFormula('change_pct', [row.sum, row.previous_sum]);
  // change_percent_m is null if previous_sum = 0, and 0 if sum = 0 (Not totally clear on why...)
  row.change_percent_m = (row.previous_sum === 0) ? null : (row.sum === 0) ? 0 : executeFormula('change_pct_m', [row.sum, row.previous_sum, row.m, row.previous_m]);

  if (row.change_percent !== 0 && row.change_percent_m !== null) row.change_percent_significant = executeFormula('significant', [row.change_percent, row.change_percent_m]);
}

/*
 * Calculate change_percentage_point, change_percentage_point_m, change_percentage_point_significant
 * @param{row} - The row to update
 * @param{Object} rowConfig - Special calculation config for the row, or undefined
 */
function calculateChangePercentagePoints(row, rowConfig) {
  // explicitly set change percentage poinst to null if:
  // - any percent estimates are missing
  // - either estimate or previous estimate was coded
  // - both estimate and previous estimate are 0
  // - the given row is a special variables (indicated by existence of row config)
  if (!allExist(row.percent, row.previous_percent, row.percent_m, row.previous_percent_m)
    || row.codingThreshold
    || row.previous_codingThreshold
    || (row.sum === 0 && row.previous_sum === 0)
    || rowConfig) {
    nullChangePercentagePoints(row);
    return;
  }

  row.change_percentage_point = executeFormula('delta', [row.percent, row.previous_percent]);
  row.change_percentage_point_m = executeFormula('delta_m', [row.percent_m, row.previous_percent_m]);

  if (row.change_percentage_point !== 0) row.change_percentage_point_significant = executeFormula('significant', [row.change_percentage_point, row.change_percentage_point_m]);
}

/*
 * Helper function to set change values to null
 * @param{Object} row - The row to update
 */
function nullChanges(row) {
  row.change_sum = null;
  row.change_m = null;
}

/*
 * Helper function to set change percent values to null
 * @param{Object} row - The row to update
 */
function nullChangePercents(row) {
  row.change_percent = null;
  row.change_percent_m = null;
}

/*
 * Helper function to set change percentage point values to null
 * @param{Object} row - The row to update
 */
function nullChangePercentagePoints(row) {
  row.change_percentage_point = null;
  row.change_percentage_point_m = null;
}

/*
 * Helper function to check if a set of values exist.
 * Can't use plain conditional check b/c val = 0 would give false negative
 * @param{int[]} vals - the values to check
 * @returns{Boolean}
 */
function allExist(...vals) {
  return vals.every(val => val !== undefined && val !== null);
}
module.exports = doChangeCalculations;
