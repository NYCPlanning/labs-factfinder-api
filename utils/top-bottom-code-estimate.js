const _ = require('lodash');
const topBottomCodings = require('../special-calculations/data/top-bottom-codings');

const { get } = _;

/*
 * Conditionally top- or bottom-codes an estimated median value, using configured coding values.
 * Returns the coded estimate, as well as the direction the estimate was coded if it was coded.
 * NOTE: all estimates calculated via interpolation & top- or bottom-coded here are for multi-geography
 * aggregates, so coding values will always be those for 'nta' geographic type designations
 * @param{Number} estimate - The estimated median to be potentially coded
 * @param{string} variable - The name of the variable this estimate value belongs to
 * @param{string} year - The year of the dataset this variable belongs to
 * @returns{Object}
 */
function topBottomCodeEstimate(estimate, variable, year) {
  let mutatedEstimate = estimate;
  let codingThreshold = null;

  const codingRule = get(topBottomCodings, `${year}.${variable}`);

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
