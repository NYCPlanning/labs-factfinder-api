const FormulaParser = require('hot-formula-parser');
const _ = require('lodash');

const { get } = _;
const { Parser } = FormulaParser;

function runFormulaFor(data, sumKey, rowConfig, variable) {
  const { formula } = rowConfig;
  const parser = new Parser();

  parser.setFunction('GET', ([path]) => get(data, path) || get(data[variable], path)); // fallback to current object

  const { result, error } = parser.parse(formula);

  if (error) {
    throw new Error(error);
  }

  return result;
}

module.exports = runFormulaFor;
