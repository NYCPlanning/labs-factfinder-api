const _ = require('lodash');

const { clone, find } = _;
const { round } = Math;

const getBins = require('./get-bins');
const { DESIGN_FACTOR } = require('../special-calculations/data/constants');

/*
 * Calculates a margin of error for a median from a set of median values for ranges of the same data point
 * @param{Array} data - The full survey dataset, as an array of objects representing rows
 * @param{string} variable - The name of the variable for which values are being calculated
 * @param{string} year - The year of the given dataset
 * @param{Object} options - An object containing variable-specific configuration for the calculation, specifically design factor
 * @returns{Number}
 */
function calculateMedianError(data, variable, year, options) {
  const { designFactor = DESIGN_FACTOR } = options;

  const bins = getBins(variable, year);
  const scenario = bins.map((bin) => {
    const [key] = bin;
    const { sum } = find(data, (row) => row.variable.match(key) !== null);

    return {
      quantity: sum,
    };
  });

  if (scenario.some(obj => obj.quantity === null)) return null;

  const sum = scenario.reduce(
    (total, { quantity }) => total + quantity,
    0,
  );

  const standardError = getStandardError(designFactor, sum);
  const pUpper = 50 + standardError;
  const pLower = 50 - standardError;

  const upperCategoryIndex = bins
    .findIndex((__, currentBin) => round(pUpper) > findCumulativePercentage(scenario, sum, currentBin)
        && round(pUpper) < findCumulativePercentage(scenario, sum, currentBin + 1));

  const lowerCategoryIndex = bins
    .findIndex((__, currentBin) => round(pLower) > findCumulativePercentage(scenario, sum, currentBin)
        && round(pLower) < findCumulativePercentage(scenario, sum, currentBin + 1));

  const upperCategory = bins[upperCategoryIndex];
  const lowerCategory = bins[lowerCategoryIndex];

  const upperA2SubsequentBin = (bins[upperCategoryIndex + 1] || bins[upperCategoryIndex])[1][0];

  const lowerA2SubsequentBin = (bins[lowerCategoryIndex + 1] || bins[lowerCategoryIndex])[1][0];

  const inputs = {
    upper: {
      A1: upperCategory[1][0],
      A2: upperA2SubsequentBin,
      C1: findCumulativePercentage(scenario, sum, upperCategoryIndex),
      C2: findCumulativePercentage(scenario, sum, upperCategoryIndex + 1),
    },
    lower: {
      A1: lowerCategory[1][0],
      A2: lowerA2SubsequentBin,
      C1: findCumulativePercentage(scenario, sum, lowerCategoryIndex),
      C2: findCumulativePercentage(scenario, sum, lowerCategoryIndex + 1),
    },
  };

  const upperBound = (
    (
      (pUpper - inputs.upper.C1) / (inputs.upper.C2 - inputs.upper.C1)
    ) * (inputs.upper.A2 - inputs.upper.A1)
  ) + inputs.upper.A1;

  const lowerBound = (
    (
      (pLower - inputs.lower.C1) / (inputs.lower.C2 - inputs.lower.C1)
    ) * (inputs.lower.A2 - inputs.lower.A1)
  ) + inputs.lower.A1;

  const standardErrorOfMedian = 0.5 * (upperBound - lowerBound);
  const marginOfError = standardErrorOfMedian * 1.645;

  return marginOfError;
}

function getStandardError(designFactor, sum) {
  return designFactor * (((93 / (7 * sum)) * 2500) ** 0.5);
}

function findCumulativePercentage(scenario, sum, index) {
  const copiedBins = clone(scenario);
  const slicedBins = copiedBins.slice(0, index);
  const cumulativeSum = slicedBins.reduce(
    (total, { quantity }) => total + quantity,
    0,
  );

  return (cumulativeSum / sum) * 100;
}

module.exports = calculateMedianError;
