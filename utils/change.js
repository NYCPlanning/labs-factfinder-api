const { executeWithValues: executeFormula } = require('./formula');

/*
 * Do calculations for all change_* values for the given row
 * @param{Object} row - The row to do calculations for
 * @param{Object} previousRow - The row to compare
 * @param{Object} rowConfig - Special calculation config for the row, or undefined; used to determine
 * @param{Boolean} isDecennial - True if given row is from a decennial survey, else false
 * when change percent calculations should be skipped (noChangePercents = true), and to skip percentage point
 * calculations for all special variables
 */
function doChangeCalculations(row, previousRow, rowConfig, isDecennial) {
  const change = calculateChanges(row, previousRow, isDecennial);
  const changePercents = calculateChangePercents(row, previousRow, rowConfig, isDecennial);
  const changePercentPoints = calculateChangePercentagePoints(row, previousRow, rowConfig, isDecennial);
  return {
    ...change,
    ...changePercents,
    ...changePercentPoints,
  };
}

/*
 * Calculate change_sum, change_m, and change_significant
 * @param{Object} row - The row to update
 * @param{Object} previousRow - The row to compare
 * @param{Boolean} isDecennial - True if given row is from a decennial survey, else false
 */
function calculateChanges(row, previousRow, isDecennial) {
  // explicitly set changes to null if:
  // - any sums are missing
  // - either sum or previous sum was coded
  const change = {};

  if (!row || !previousRow) {
    nullChanges(change);

    return change;
  }

  const { sum, marginOfError, codingThreshold } = row;
  const { sum: previousSum, marginOfError: previousMarginOfError, codingThreshold: previousCodingThreshold } = previousRow;

  let hasValidInputs = null;

  if (isDecennial) {
    hasValidInputs = allExist(sum, previousSum);
  } else {
    hasValidInputs = allExist(sum, previousSum, marginOfError, previousMarginOfError);
  }


  const shouldNullify = (!hasValidInputs || !!codingThreshold || !!previousCodingThreshold);

  if (shouldNullify) {
    nullChanges(change);

    return change; 
  }
  change.sum = executeFormula('delta', [sum, previousSum]);

  if (!isDecennial) {
    change.marginOfError = executeFormula('delta_m', [marginOfError, previousMarginOfError]);

    if (change.sum !== 0) change.significant = executeFormula('significant', [change.sum, change.marginOfError]);
  }
  return change;
}

/*
 * Calculate change_percent, change_percent_m, change_percent_significant
 * @param{Object} row - The row to update
 * @param{Object} previousRow - The row to compare
 * @param{Object} rowConfig - Special calculation config for the row, or undefined
 * @param{Boolean} isDecennial - True if given row is from a decennial survey, else false
 */
function calculateChangePercents(row, previousRow, rowConfig, isDecennial) {
  // explicitly set change percents to null if:
  // - any sums are missing
  // - either sum or previous sum was coded
  // - row config.noChangePercents is true
  const change = {};

  if (!row || !previousRow) {
    nullChangePercents(change);

    return change; 
  }

  const { sum, marginOfError, codingThreshold } = row;
  const { sum: previousSum, marginOfError: previousMarginOfError, codingThreshold: previousCodingThreshold } = previousRow;

  let hasValidInputs = null;

  if (isDecennial) {
    hasValidInputs = allExist(sum, previousSum);
  } else {
    hasValidInputs = allExist(sum, previousSum, marginOfError, previousMarginOfError);
  }

  const shouldNullify = (!hasValidInputs || !!codingThreshold || !!previousCodingThreshold || (!!rowConfig && !!rowConfig.noChangePercents));

  if (shouldNullify) {
    nullChangePercents(change);

    return change;
  }

  // previousSum is used as divisor in change_pct formula and due to shortcoming of the formula parsing library,
  // divide-by-0 errors cannot be preemptively caught and avoided with IF statements, so it must happen here
  change.percent = (previousSum === 0) ? 0 : executeFormula('change_pct', [sum, previousSum]);

  if (!isDecennial) {
    // change_percent_m is null if previousSum = 0, and 0 if sum = 0 (Not totally clear on why...)
    change.percentMarginOfError = (previousSum === 0) ? null : (sum === 0) ? 0 : executeFormula('change_pct_m', [sum, previousSum, marginOfError, previousMarginOfError]);
    if (change.percent !== 0 && change.percentMarginOfError !== null) change.percentSignificant = executeFormula('significant', [change.percent, change.percentMarginOfError]);
  }
  return change;
}

/*
 * Calculate change_percentage_point, change_percentage_point_m, change_percentage_point_significant
 * @param{row} - The row to update
 * @param{row} - The row to compare
 * @param{Object} rowConfig - Special calculation config for the row, or undefined
 * @param{Boolean} isDecennial - True if given row is from a decennial survey, else false
*/
function calculateChangePercentagePoints(row, previousRow, rowConfig, isDecennial) {
  // explicitly set change percentage poinst to null if:
  // - any percent sums are missing
  // - either sum or previous sum was coded
  // - both sum and previous sum are 0
  // - the given row is a special variables (indicated by existence of row config)
  const change = {};

  if (!row || !previousRow) {
    nullChangePercentagePoints(change);

    return change;
  }

  const {
    percent,
    percentMarginOfError,
    codingThreshold,
    sum,
  } = row;

  const {
    percent: previousPercent,
    marginOfError: previousPercentMarginOfError,
    codingThreshold: previousCodingThreshold,
    sum: previousSum,
  } = previousRow;

  const isSpecialCalculation = !!rowConfig;
  
  let hasValidInputs = null;

  if (isDecennial) {
    hasValidInputs = allExist(percent, previousPercent);
  } else {
    hasValidInputs = allExist(percent, previousPercent, percentMarginOfError, previousPercentMarginOfError);
  }

  const shouldNullify = (
    !hasValidInputs
      || codingThreshold
      || previousCodingThreshold
      || (sum === 0 && previousSum === 0)
  ) || isSpecialCalculation;

  if (shouldNullify) {
    nullChangePercentagePoints(row);

    return change;
  }
  change.percentagePoint = executeFormula('delta', [percent, previousPercent]);

  if (!isDecennial) {
    change.percentagePointMarginOfError = executeFormula('delta_m', [percentMarginOfError, previousPercentMarginOfError]);

    if (change.percentagePoint !== 0) change.percentagePointSignificant = executeFormula('significant', [change.percentagePoint, change.percentagePointMarginOfError]);
  }
  return change;
}

/*
 * Helper function to set change values to null
 * @param{Object} row - The row to update
 */
function nullChanges(row) {
  row.sum = null;
  row.marginOfError = null;
}

/*
 * Helper function to set change percent values to null
 * @param{Object} row - The row to update
 */
function nullChangePercents(row) {
  row.percent = null;
  row.percentMarginOfError = null;
}

/*
 * Helper function to set change percentage point values to null
 * @param{Object} row - The row to update
 */
function nullChangePercentagePoints(row) {
  row.percentagePoint = null;
  row.percentagePointMarginOfError = null;
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
