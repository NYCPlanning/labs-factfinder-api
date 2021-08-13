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

function calculatePreviousDifferences(row) {
  const {
    previous_sum,
    previous_comparison_sum,
    previous_m,
    previous_comparison_m,
  } = row;

  const isDecennial = row.profile === 'decennial';
  const hasValidInputs = allExist(previous_sum, previous_comparison_sum, previous_m, previous_comparison_m)
  const shouldNullify = (!hasValidInputs
    || row.previous_codingThreshold // TODO: why is this here?
    || row.previous_comparison_codingThreshold // TODO: why is this here?
  ) && !isDecennial;

  if (shouldNullify) {
    nullPreviousDifferences(row);
  } else {
    row.previous_difference_sum = executeFormula('delta', [row.previous_sum, row.previous_comparison_sum]);

    // special handling for 'decennial' rows, which do not have MOE and are all considered 'significant'
    if (isDecennial) {
      row.previous_significant = true;
    } else {
      row.previous_difference_m = executeFormula('delta_m', [row.previous_m, row.previous_comparison_m]);

      // TODO rename difference_significant
      if (row.previous_difference_sum !== 0) row.previous_significant = executeFormula('significant', [row.previous_difference_sum, row.previous_difference_m]);
    }
  }
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

function calculatePreviousDifferencePercents(row) {
  const {
    previous_percent,
    previous_comparison_percent,
    previous_percent_m,
    previous_comparison_percent_m,
  } = row;

  const isDecennial = row.profile === 'decennial';
  const hasValidInputs = allExist(
    previous_percent,
    previous_comparison_percent,
    previous_percent_m,
    previous_comparison_percent_m
    );
  const shouldNullify = !hasValidInputs && !isDecennial;

  if (shouldNullify) {
    nullPreviousDifferencePercents(row);
  } else {
    row.previous_difference_percent = executeFormula('delta_with_threshold', [row.previous_percent * 100, row.previous_comparison_percent * 100]);

    if (!isDecennial) {
      row.previous_difference_percent_m = executeFormula('delta_m', [row.previous_percent_m * 100, row.previous_comparison_percent_m * 100]);

      // TODO rename difference_percent_significant
      if (row.previous_difference_percent !== 0) row.previous_percent_significant = executeFormula('significant', [row.previous_difference_percent, row.previous_difference_percent_m]);
    }
  }
}


/*
 * Helper function to set difference values to null
 * @param{Object} row - The row to update
 */
function nullDifferences(row) {
  row.sum = null;
  row.m = null;
}

function nullPreviousDifferences(row) {
  row.previous_difference_sum = null;
  row.previous_difference_m = null;
}

/*
 * Helper function to set difference percent values to null
 * @param{Object} row - The row to update
 */
function nullDifferencePercents(row) {
  row.percent = null;
  row.percent_m = null;
}


function nullPreviousDifferencePercents(row) {
  row.previous_difference_percent = null;
  row.previous_difference_percent_m = null;
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
