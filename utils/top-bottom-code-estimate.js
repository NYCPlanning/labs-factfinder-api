const _ = require('lodash');
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

function topBottomCodeEstimate(estimate, row) {
  const is_most_recent = get(row, 'is_most_recent');
  const timeframe = is_most_recent ? 'latest' : 'earlier';
  const variable = get(row, 'variable');
  const geotype = get(row, 'geotype');
  const geoids = get(row, 'numGeoids');

  let mutatedEstimate = estimate;
  let geographicTypeDesignation = 'nta';
  let codingThreshold = null;

  if (is_most_recent) {
    if (geoids === 1 && (geotype !== 'NTA2010')) {
      geographicTypeDesignation = 'all';
    }
  } else if (geoids === 1 && (geotype !== 'NTA2010' && geotype !== 'PUMA2010')) {
    geographicTypeDesignation = 'all';
  }

  const codingRule = get(topBottomCodings, `${timeframe}.${variable}.${geographicTypeDesignation}`);

  if (estimate <= get(codingRule, 'lower')) {
    mutatedEstimate = get(codingRule, 'lower');
    codingThreshold = 'lower';
  }

  if (estimate >= get(codingRule, 'upper')) {
    mutatedEstimate = get(codingRule, 'upper');
    codingThreshold = 'lower';
  }

  return { mutatedEstimate, codingThreshold };
}

module.exports = topBottomCodeEstimate;
