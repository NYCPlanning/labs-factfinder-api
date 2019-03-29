const bins = require('../special-calculations/data/bins');

/*
 * Finds a bin object for a given (variable, year), or an empty array if no bin exists
 * @param{string} variable
 * @param{string} year
 * @returns{Array}
 */
function getBins(variable, year) {
  if (bins[variable][year]) return bins[variable][year];
  if (bins[variable]) return bins[variable];
  console.log(`No bins found for ${variable}`);
  return [];
}

module.exports = getBins;
