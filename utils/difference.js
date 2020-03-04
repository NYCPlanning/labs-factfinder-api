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
  // explicitly set differences to null if:
  // - any estimates are missing
  // - either estimate or comparison estimate was coded
  // - the profile is NOT decennial
  const isDecennial = (row.profile == 'decennial');
  const shouldNullify = (!allExist(row.sum, row.comparison_sum, row.m, row.comparison_m)
    || row.codingThreshold
    || row.comparison_codingThreshold) && !isDecennial;

  if (shouldNullify) {
    nullDifferences(row);

    return;
  }

  row.difference_sum = executeFormula('delta', [row.sum, row.comparison_sum]);

  if (isDecennial) {
    row.significant = true;
  }

  // special handling for 'decennial' rows, which do not have MOE and are all considered 'significant'
  if (!isDecennial) {
    row.difference_m = executeFormula('delta_m', [row.m, row.comparison_m]);

    // TODO rename difference_significant
    if (row.difference_sum !== 0) row.significant = executeFormula('significant', [row.difference_sum, row.difference_m]);
  }
}

/*
 * Calculate difference_percent, difference_percent_m, and percent_significant
 * @param{row} - The row to do calculations for
 */
function calculateDifferencePercents(row) {
  // explicitly set difference percents to null if:
  // - any percent estimates are missing
  // - either estimate or comparison estimate was coded
  // - both estimate and previous estimate are 0
  if (!allExist(row.percent, row.comparison_percent, row.percent_m, row.comparison_percent_m)
    || row.codingThreshold
    || row.comparison_codingThreshold
    || (row.sum === 0 && row.comparison_sum === 0)) {
    nullDifferencePercents(row);
    return;
  }

  row.difference_percent = executeFormula('delta_with_threshold', [row.percent * 100, row.comparison_percent * 100]);
  row.difference_percent_m = executeFormula('delta_m', [row.percent_m * 100, row.comparison_percent_m * 100]);

  // TODO rename difference_percent_significant
  if (row.difference_percent !== 0) row.percent_significant = executeFormula('significant', [row.difference_percent, row.difference_percent_m]);
}

/*
 * Helper function to set difference values to null
 * @param{Object} row - The row to update
 */
function nullDifferences(row) {
  row.difference_sum = null;
  row.difference_m = null;
}

/*
 * Helper function to set difference percent values to null
 * @param{Object} row - The row to update
 */
function nullDifferencePercents(row) {
  row.difference_percent = null;
  row.difference_percent_m = null;
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
module.exports = doDifferenceCalculations;
