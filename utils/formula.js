const FormulaParser = require('hot-formula-parser');
const _ = require('lodash');
const formulas = require('./formulas');
const { format } = require('mathjs');

const { find } = _;
const { Parser } = FormulaParser;

/*
 * Executes a given formula, with arguments directly providing values to operate on
 * @param{string} formulaName - A string representing the name of the formula to execute
 * @param{Array} args - Array containing ordered arguments that will be provided to the function;
 * these arguments should be actual numerical values, not references to values.
 * @returns{Number}
 */
function executeWithValues(formulaName, args) {
  const formula = formulas[formulaName];

  // Format these numbers to use fixed notation instead of
  // exponential notation, which is JavaScript's default behavior
  // because Formula Parser does not understand e notation:
  // See https://github.com/handsontable/formula-parser/issues/72
  const formattedArgs = args.map(arg => format(arg, { notation: 'fixed' }));
  const formulaStr = formula(...formattedArgs);
  const parser = new Parser();
  const { result, error } = parser.parse(formulaStr);

  if (error) {
    console.log(`${formulaStr}`, formattedArgs);
    throw new Error(`${error}: ${formulaName}`);
  }

  return result;
}

/*
 * Executes a given formula, in the context of provided variable + data argument, with optional formula arguments
 * @param{Array} data - The full survey dataset, as an array of object representing rows
 * @param{string} variable - The name of the variable for which values are being calculated
 * @param{string} formulaName - A string representing the name of the formula to execute
 * @param{Array} [args] - Arguments to pass to the given formula
 * @returns{Number}
 */
function executeWithData(data, variable, formulaName, args = []) {
  const formula = formulas[formulaName];
  const formulaStr = typeof formula === 'function' ? formula(...args) : formula;

  const parser = new Parser();

  // custom 'GET' function in parser is used to access values from data context
  parser.setFunction('GET', ([path]) => {
    // if 'path' includes a '.', this means we want a value namespaced in a
    // different variable context, so set targetVariable accordingly
    const targetVariable = path.includes('.') ? path.split('.')[0] : variable;

    // if 'path' does not include a '.', this means it is the value we want to access
    // in the current variable context
    const value = path.includes('.') ? path.split('.')[1] : path;

    const variableValues = find(data, ['variable', targetVariable]);
    return variableValues[value];
  });

  const { result, error } = parser.parse(formulaStr);
  if (error) {
    console.log(`${formulaStr}`);
    throw new Error(`${error}: ${formulaName}`);
  }

  return result;
}
module.exports = {
  executeWithValues,
  executeWithData,
};
