const _ = require('lodash');
const topBottomCodeEstimate = require('../utils/top-bottom-code-estimate');
const medianOfRanges = require('../utils/median-of-ranges');

const { isArray } = Array;
const { get, set } = _;

function interpolate(data, sumKey = 'estimate', options, variable, row) {
  const { bins, multipleBins, referenceSumKey = sumKey } = options;
  let scenario = data;
  let foundBins = bins;

  // if we provide an array of bins in the configuration,
  // it's implied that the first bins should be used for the earlier
  // time period, and the last bin should be used for the later
  if (multipleBins) {
    const [earlySet, laterSet] = foundBins;

    // guess which year it is
    const [firstObject] = Object.keys(data) || [];
    const thisYear = get(data, `${firstObject}.dataset`).slice(-4);

    if (thisYear === '2000' || thisYear === '2017') {
      foundBins = laterSet;
    } else {
      foundBins = earlySet;
    }
  }

  // this is done in an effort to make this utility more generic
  // and therefore, testable
  if (!isArray(scenario)) {
    scenario = foundBins.map((bin) => {
      const [key, range] = bin;
      const [min, max] = range;
      const sum = get(data, `${key}.${referenceSumKey}`);

      return {
        quantity: sum,
        bounds: {
          lower: min,
          upper: max,
        },
      };
    });
  }

  const naturalMedian = medianOfRanges(scenario);

  const { mutatedEstimate: trimmedEstimate, codingThreshold } = topBottomCodeEstimate(naturalMedian, row);

  if (codingThreshold) {
    set(row, `codingThresholds.${sumKey}`, codingThreshold);
  }

  return trimmedEstimate;
}

module.exports = interpolate;
