const bins = require('../special-calculations/data/bins');

function getBins(variable, year) {
  if (bins[variable][year]) return bins[variable][year];
  if (bins[variable]) return bins[variable];
  console.log(`No bins found for ${variable}`);
  return [];
}

module.exports = getBins;
