const { executeWithValues: executeFormula } = require('./formula');

/*
 * Do calculations for all change_* values for the given row
 * @param{Object} row - The row to do calculations for
 * @param{Object} rowConfig - Special calculation config for the row, or undefined; used to determine
 * when change percent calculations should be skipped (noChangePercents = true), and to skip percentage point
 * calculations for all special variables
 */
function doChangeCalculations(row, previousRow, rowConfig) {
  const change = calculateChanges(row, previousRow);
  const changePercents = calculateChangePercents(row, previousRow, rowConfig);
  const changePercentPoints = calculateChangePercentagePoints(row, previousRow, rowConfig);
  return {
    ...change,
    ...changePercents,
    ...changePercentPoints,
  };
}

/*
 * Calculate change_sum, change_m, and change_significant
 * @param{Object} row - The row to update
 */
function calculateChanges(row, previousRow) {
  // explicitly set changes to null if:
  // - any estimates are missing
  // - either estimate or previous estimate was coded
  const change = {};
  const { sum, m, codingThreshold } = row;
  const { sum: previous_sum, m: previous_m, codingThreshold: previous_codingThreshold } = previousRow;

  const isDecennial = row.profile === 'decennial'; // TODO: check for valid decennial inputs
  const hasValidInputs = allExist(sum, previous_sum, m, previous_m);
  const shouldNullify = (!hasValidInputs
    || codingThreshold // TODO: Why is this part of it?
    || previous_codingThreshold // TODO: What is this here for?
  ) && !isDecennial;

  if (shouldNullify) {
    nullChanges(row);
  } else {
    change.sum = executeFormula('delta', [sum, previous_sum]);

    if (!isDecennial) {
      change.m = executeFormula('delta_m', [m, previous_m]);

      if (change.sum !== 0) change.significant = executeFormula('significant', [change.sum, change.m]);
    }
  }
  return change;
}

/*
 * Calculate change_percent, change_percent_m, change_percent_significant
 * @param{Object} row - The row to update
 * @param{Object} rowConfig - Special calculation config for the row, or undefined
 */
function calculateChangePercents(row, previousRow, rowConfig) {
  // explicitly set change percents to null if:
  // - any estimates are missing
  // - either estimate or previous estimate was coded
  // - row config.noChangePercents is true
  const change = {};
  const { sum, m, codingThreshold } = row;
  const { sum: previous_sum, m: previous_m, codingThreshold: previous_codingThreshold } = previousRow;

  const isDecennial = row.profile === 'decennial';
  const hasValidInputs = allExist(sum, previous_sum, m, previous_m);
  const shouldNullify = (!hasValidInputs
    || codingThreshold
    || previous_codingThreshold
    || (rowConfig && rowConfig.noChangePercents)
  ) && !isDecennial;

  if (shouldNullify) {
    nullChangePercents(row);
  } else {
    // previous_sum is used as divisor in change_pct formula and due to shortcoming of the formula parsing library,
    // divide-by-0 errors cannot be preemptively caught and avoided with IF statements, so it must happen here
    change.percent = (previous_sum === 0) ? 0 : executeFormula('change_pct', [sum, previous_sum]);

    if (!isDecennial) {
      // change_percent_m is null if previous_sum = 0, and 0 if sum = 0 (Not totally clear on why...)
      change.percent_m = (previous_sum === 0) ? null : (sum === 0) ? 0 : executeFormula('change_pct_m', [sum, previous_sum, m, previous_m]);

      if (change.percent !== 0 && change.percent_m !== null) change.percent_significant = executeFormula('significant', [change.percent, change.percent_m]);
    }
  }
  return change;
}

/*
 * Calculate change_percentage_point, change_percentage_point_m, change_percentage_point_significant
 * @param{row} - The row to update
 * @param{Object} rowConfig - Special calculation config for the row, or undefined
 */
function calculateChangePercentagePoints(row, previousRow, rowConfig) {
  // explicitly set change percentage poinst to null if:
  // - any percent estimates are missing
  // - either estimate or previous estimate was coded
  // - both estimate and previous estimate are 0
  // - the given row is a special variables (indicated by existence of row config)
  const change = {};
  const {
    percent,
    percent_m,
    codingThreshold,
    sum,
  } = row;

  const {
    percent: previous_percent,
    m: previous_percent_m,
    codingThreshold: previous_codingThreshold,
    sum: previous_sum,
  } = previousRow;

  const isDecennial = row.profile === 'decennial';
  const isSpecialCalculation = !!rowConfig;
  const hasValidInputs = allExist(percent, previous_percent, percent_m, previous_percent_m);
  const shouldNullify = (
    (!hasValidInputs
      || codingThreshold
      || previous_codingThreshold
      || (sum === 0 && previous_sum === 0)
    )  && !isDecennial
  ) || isSpecialCalculation;

  if (shouldNullify) {
    nullChangePercentagePoints(row);
  } else {
    change.percentage_point = executeFormula('delta', [percent, previous_percent]);

    if (!isDecennial) {
      change.percentage_point_m = executeFormula('delta_m', [percent_m, previous_percent_m]);

      if (change.percentage_point !== 0) change.percentage_point_significant = executeFormula('significant', [change.percentage_point, change.percentage_point_m]);
    }
  }
  return change;
}

/*
 * Helper function to set change values to null
 * @param{Object} row - The row to update
 */
function nullChanges(row) {
  row.sum = null;
  row.m = null;
}

/*
 * Helper function to set change percent values to null
 * @param{Object} row - The row to update
 */
function nullChangePercents(row) {
  row.percent = null;
  row.percent_m = null;
}

/*
 * Helper function to set change percentage point values to null
 * @param{Object} row - The row to update
 */
function nullChangePercentagePoints(row) {
  row.percentage_point = null;
  row.percentage_point_m = null;
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
