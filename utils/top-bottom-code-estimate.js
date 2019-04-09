const _ = require('lodash');
const { CUR_YEAR } = require('../data/special-calculations/constants');
const topBottomCodings = require('../metadata/top-bottom-codings');

const { get } = _;

/*
  Top and bottom "code" estimated medians based on a set of conditions.

  Latest:
    single-geography estimates - use "all", except when NTA (then use "nta")
    multi-geography aggregates - use "nta"

  Earlier:
    single-geography estimates - use "all", except when NTA and PUMA (then use "nta")
    multi-geography aggregates - use "nta"
*/

function topBottomCodeEstimate(estimate, variable, year, numGeoids, geotype) {

  let mutatedEstimate = estimate;
  let geographicTypeDesignation = 'nta';
  let codingThreshold = null;

  if (year === CUR_YEAR) {
    if (numGeoids === 1 && (geotype !== 'NTA2010')) {
      geographicTypeDesignation = 'all';
    }
  } else if (numGeoids === 1 && (geotype !== 'NTA2010' && geotype !== 'PUMA2010')) {
    geographicTypeDesignation = 'all';
  }

  const codingRule = get(topBottomCodings, `${year}.${variable}.${geographicTypeDesignation}`);

  if (estimate <= get(codingRule, 'lower')) {
    mutatedEstimate = get(codingRule, 'lower');
    codingThreshold = 'lower';
  }

  if (estimate >= get(codingRule, 'upper')) {
    mutatedEstimate = get(codingRule, 'upper');
    codingThreshold = 'upper';
  }

  return { mutatedEstimate, codingThreshold };
}

module.exports = topBottomCodeEstimate;
