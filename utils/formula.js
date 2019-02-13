const FormulaParser = require('hot-formula-parser');
const _ = require('lodash');

const { get } = _;
const { Parser } = FormulaParser;

function runFormulaFor(data, sumKey, rowConfig) {
  const { formula } = rowConfig;
  const parser = new Parser();

  parser.setFunction('GET', ([path]) => get(data, path));

  try {
    const { result } = parser.parse(formula);

    return result;
  } catch (e) {
    console.log(e.toString());
    throw new Error(e);
  }
}

module.exports = runFormulaFor;
