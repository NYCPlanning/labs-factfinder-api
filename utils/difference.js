const { executeWithValues: executeFormula } = require('./formula');

/*
 * Do calculations for all difference_* values for the given row
 * @param{Object} row - The row to update
 */
function doDifferenceCalculations(row, comparisonRow) {
  const difference = calculateDifferences(row, comparisonRow);
  const difference_percent = calculateDifferencePercents(row, comparisonRow);

  return {
    ...difference,
    ...difference_percent,
  };
}

/*
 * Calculate difference_sum, difference_m, and significant
 * @param{row} - The row to update
 */
function calculateDifferences(row, comparisonRow) {
  // explicitly set differences to null if:
  // - any estimates are missing
  // - either estimate or comparison estimate was coded
  const difference = {};
  const { sum, m } = row;
  const { sum: comparison_sum, m: comparison_m } = comparisonRow;
  const isDecennial = row.profile === 'decennial';
  const hasValidInputs = allExist(sum, comparison_sum, m, comparison_m)
  const shouldNullify = (!hasValidInputs
    || row.codingThreshold // TODO: why is this here?
    || row.comparison_codingThreshold // TODO: why is this here?
  ) && !isDecennial;

  if (shouldNullify) {
    nullDifferences(row);
  } else {
    difference.sum = executeFormula('delta', [sum, comparison_sum]);
    // special handling for 'decennial' rows, which do not have MOE and are all considered 'significant'
    if (isDecennial) {
      difference.significant = true;
    } else {
      difference.m = executeFormula('delta_m', [m, comparison_m]);

      // TODO rename difference_significant
      if (difference.sum !== 0) difference.significant = executeFormula('significant', [difference.sum, m]);
    }
  }
  return difference;
}

/*
 * Calculate difference_percent, difference_percent_m, and percent_significant
 * @param{row} - The row to do calculations for
 */
function calculateDifferencePercents(row, comparisonRow) {
  // explicitly set difference percents to null if:
  // - any percent estimates are missing
  // - either estimate or comparison estimate was coded
  // - both estimate and previous estimate are 0
  const difference = {};
  const { percent, percent_m } = row;
  const { percent: comparison_percent, percent_m: comparison_percent_m } = comparisonRow;

  const isDecennial = row.profile === 'decennial';
  const hasValidInputs = allExist(percent, comparison_percent, percent_m, comparison_percent_m);
  const shouldNullify = !hasValidInputs && !isDecennial;

  if (shouldNullify) {
    nullDifferencePercents(row);
  } else {
    difference.percent = executeFormula('delta_with_threshold', [percent * 100, comparison_percent * 100]);

    if (!isDecennial) {
      difference.percent_m = executeFormula('delta_m', [percent_m * 100, comparison_percent_m * 100]);

      // TODO rename difference_percent_significant
      if (difference.percent !== 0) difference.percent_significant = executeFormula('significant', [difference.percent, difference.percent_m]);
    }
  }
  return difference;
}

/*
 * Helper function to set difference values to null
 * @param{Object} row - The row to update
 */
function nullDifferences(row) {
  row.sum = null;
  row.m = null;
}

/*
 * Helper function to set difference percent values to null
 * @param{Object} row - The row to update
 */
function nullDifferencePercents(row) {
  row.percent = null;
  row.percent_m = null;
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
