const { executeWithValues: executeFormula } = require('./formula');

/*
 * Do calculations for all difference_* values for the given row
 * @param{Object} row - The row to update
 * @param{Object} row - The row to compare
 * @param{Boolean} isDecennial - True if given row is from a decennial survey, else false
 */
function doDifferenceCalculations(row, comparisonRow, isDecennial) {
  const difference = calculateDifferences(row, comparisonRow, isDecennial);
  const differencePercent = calculateDifferencePercents(row, comparisonRow, isDecennial);

  return {
    ...difference,
    ...differencePercent,
  };
}

/*
 * Calculate difference_sum, difference_m, and significant
 * @param{row} - The row to update
 * @param{row} - The row to compare
 * @param{Boolean} isDecennial - True if given row is from a decennial survey, else false
 */
function calculateDifferences(row, comparisonRow, isDecennial) {
  // explicitly set differences to null if:
  // - any estimates are missing
  // - either estimate or comparison estimate was coded
  const difference = {};

  if (!row || !comparisonRow) {
    nullDifferences(difference);

    return difference;
  }

  const { sum, marginOfError } = row;
  const { sum: comparisonSum, marginOfError: comparisonMarginOfError } = comparisonRow;
  let hasValidInputs = null; 

  if (isDecennial) {
    hasValidInputs = allExist(sum, comparisonSum);
  } else {
    hasValidInputs = allExist(sum, comparisonSum, marginOfError, comparisonMarginOfError);
  }

  const shouldNullify = (!hasValidInputs || !!row.codingThreshold || !!row.comparisonCodingThreshold);

  if (shouldNullify) {
    nullDifferences(difference);

    return difference;
  }

  difference.sum = executeFormula('delta', [sum, comparisonSum]);
  // special handling for 'decennial' rows, which do not have MOE and are all considered 'significant'
  if (isDecennial) {
    difference.significant = true;
  } else {
    difference.m = executeFormula('delta_m', [marginOfError, comparisonMarginOfError]);

    // TODO rename difference_significant
    if (difference.sum !== 0) difference.significant = executeFormula('significant', [difference.sum, difference.marginOfError]);
  }

  return difference;
}

/*
 * Calculate difference_percent, difference_percent_m, and percent_significant
 * @param{row} - The row to do calculations for
 * @param{row} - The row to compare to
 * @param{Boolean} isDecennial - True if given row is from a decennial survey, else false
 */
function calculateDifferencePercents(row, comparisonRow, isDecennial) {
  // explicitly set difference percents to null if:
  // - any percent estimates are missing
  // - either estimate or comparison estimate was coded
  // - both estimate and previous estimate are 0
  const difference = {};

  if (!row || !comparisonRow) {
    nullDifferences(difference);

    return difference;
  }

  const { percent, percentMarginOfError } = row;
  const { percent: comparisonPercent, percentMarginOfError: comparisonPercentMarginOfError } = comparisonRow;

  let hasValidInputs = null; 

  if (isDecennial) {
    hasValidInputs = allExist(percent, comparisonPercent);
  } else {
    hasValidInputs = allExist(percent, comparisonPercent, percentMarginOfError, comparisonPercentMarginOfError);
  }

  const shouldNullify = !hasValidInputs;

  if (shouldNullify) {
    nullDifferencePercents(difference);

    return difference;
  }
  difference.percent = executeFormula('delta_with_threshold', [percent * 100, comparisonPercent * 100]);

  if (!isDecennial) {
    difference.percentMarginOfError = executeFormula('delta_m', [percentMarginOfError * 100, comparisonPercentMarginOfError * 100]);

    // TODO rename difference_percent_significant
    if (difference.percent !== 0) difference.percentSignificant = executeFormula('significant', [difference.percent, difference.percentMarginOfError]);
  }
  return difference;
}

/*
 * Helper function to set difference values to null
 * @param{Object} row - The row to update
 */
function nullDifferences(row) {
  row.sum = null;
  row.marginOfError = null;
}

/*
 * Helper function to set difference percent values to null
 * @param{Object} row - The row to update
 */
function nullDifferencePercents(row) {
  row.percent = null;
  row.percentMarginOfError = null;
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
