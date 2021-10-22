const { find } = require('lodash');

const topBottomCodeEstimate = require('./top-bottom-code-estimate');
const medianOfRanges = require('./median-of-ranges');
const getBins = require('./get-bins');

/*
 * Interpolates a median value from a set of median values for ranges of the same data point,
 * and top- or bottom-codes the estimated median based on configured coding values
 * @param{Array} data - The full survey dataset, as an array of objects representing rows
 * @param{string} variable - The name of the variable for which values are being calculated
 * @param{string} year - The year of the given dataset
 * @param{Object} row - All values for the given variable as an object
 */
function interpolate(data, variable, year) {
  const bins = getBins(variable, year);
  const scenario = bins.map((bin) => {
    const [key, range] = bin;
    const [min, max] = range;
    const row = find(data, ['variable', key]);

    if (!row) throw new Error(`${key} was not found in the ${year} dataset.`);

    const { sum } = row;

    return {
      quantity: sum,
      bounds: {
        lower: min,
        upper: max,
      },
    };
  });

  const naturalMedian = medianOfRanges(scenario);


  return naturalMedian;
}

module.exports = interpolate;
