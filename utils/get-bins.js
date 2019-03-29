const bins = require('../data/special-calculations/bins');

function getBins(variable, year) {
  if (bins[variable][year]) return bins[variable][year];

  return bins[variable];
}

module.exports = getBins;
