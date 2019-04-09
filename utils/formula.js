const FormulaParser = require('hot-formula-parser');
const _ = require('lodash');
const formulas = require('./formulas');

const { get, find } = _;
const { Parser } = FormulaParser;

function execute(data, variable, formulaName, args = []) {
  const formula = formulas[formulaName];
  const formulaStr = typeof formula === 'function' ? formula(...args) : formula;

  const parser = new Parser();

  parser.setFunction('GET', ([path]) => {
    // if 'path' includes a '.', this means we want a value namespaced in a 
    // different variable context, so set targetVariable accordingly
    const targetVariable = path.includes('.') ? path.split('.')[0] : variable;

    // if 'path' does not include a '.', this means it is the value we want to access
    // in the current variable context
    const value = path.includes('.') ? path.split('.')[1] : path;

    const variableValues = find(data, [ 'variable', targetVariable ]);
    return variableValues[value];
  });

  const { result, error } = parser.parse(formulaStr);
  if (error) {
    console.log(" variable", variable);
    console.log('formula', formulaStr);
    throw new Error(error);
  }

  return result;
}
module.exports = execute;
