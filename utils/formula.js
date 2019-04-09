const FormulaParser = require('hot-formula-parser');
const _ = require('lodash');

const { get } = _;
const { Parser } = FormulaParser;

function execute(data, variable, formula, args = []) {
  const formulaStr = typeof formula === 'function' ? formula(...args) : formula;

  const parser = new Parser();

  parser.setFunction('GET', ([path]) => {
    const first = get(data, path);
    const fallback = get(data[variable], path);

    if (typeof first === 'number') return first;

    return fallback;
  }); // fallback to current object

  const { result, error } = parser.parse(formulaStr);
  if (error) throw new Error(error);

  return result;
}
module.exports = execute;
