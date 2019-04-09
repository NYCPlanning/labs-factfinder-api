const { get } = require('lodash');

const topBottomCodeEstimate = require('./top-bottom-code-estimate');
const medianOfRanges = require('./median-of-ranges');
const getBins = require('./get-bins');

function interpolate(data, variable, year, options, row) {
  const bins = getBins(variable, year);
  const scenario = bins.map((bin) => {
    const [key, range] = bin;
    const [min, max] = range;
    const [{ sum }] = data.filter(row => row.variable == key);

    return {
      quantity: sum,
      bounds: {
        lower: min,
        upper: max,
      },
    };
  });

  debugger;
  const naturalMedian = medianOfRanges(scenario);

  const { mutatedEstimate: trimmedEstimate, codingThreshold } = topBottomCodeEstimate(naturalMedian, variable, year, row.numGeoids, row.geotype);

  return { trimmedEstimate, codingThreshold };
}

module.exports = interpolate;
