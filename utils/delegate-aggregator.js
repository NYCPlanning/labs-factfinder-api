const _ = require('lodash');

const { set } = _;

const noop = () => null;

function aggregateSpecialVariable(row, rowConfig, allData) {
  const { specialCalculations = [] } = rowConfig || {};
  const { variable } = rowConfig;
  const mutatedRow = row;

  specialCalculations.forEach(({ column, aggregator = noop, options }) => {
    let specialValue;

    /*
      Skip special calculations if it's a single geography
    */
    if ((column.indexOf('comparison') === 0)) return;

    try {
      specialValue = aggregator(allData, column, options, variable, row);
    } catch (err) {
      console.log('Error with ', variable, row.dataset, column, options, 'Stack trace: ', err.toString()); // eslint-disable-line
    }
    set(mutatedRow, column, specialValue);
  });

  return mutatedRow;
}

module.exports = aggregateSpecialVariable;
