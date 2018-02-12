const _ = require('lodash');

const { set } = _;

const noop = () => null;

function aggregateSpecialVariable(row, rowConfig, data) {
  const { specialCalculations = [] } = rowConfig || {};
  const { variable } = rowConfig;
  const mutatedRow = row;

  specialCalculations.forEach(({ column, aggregator = noop, options }) => {
    let specialValue;
    try {
      specialValue = aggregator(data, column, options, variable);
    } catch (err) {
      console.log('Error with ', column, options, 'Stack trace: ', err); // eslint-disable-line
    }
    set(mutatedRow, column, specialValue);
  });

  return mutatedRow;
}

module.exports = aggregateSpecialVariable;
