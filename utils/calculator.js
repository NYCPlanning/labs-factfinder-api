const _ = require('lodash');

const { isArray } = Array;
const { get, isNaN, copy } = _;

const operations = ['divide', 'subtract', 'add', 'multiply'];
const operators = {
  divide(a, b = 1) { return a / b; },
  add(a, b) { return a + b; },
  multiply(a, b) { return a * b; },
  subtract(a, b) { return a - b; },
};

function isOperator(step) {
  return operations.any(op => op === step);
}

function calculator(data, sumColumn = 'sum', rowConfig) {
  const { procedure } = rowConfig;
  const currentProcedure = copy(procedure);

  // impute values, replacing their signifiers with their signifieds
  currentProcedure.forEach((step, i) => {
    if (isArray(step)) {
      currentProcedure[i] = calculator(data, sumColumn, { procedure: step, data: rowConfig.variable });
      return;
    }

    if (!isOperator(step)) {
      const currentSum = get(data, `${step}`);
      currentProcedure[i] = !isNaN(currentSum) ? currentSum : step;
    }
  });

  const [firstValue] = currentProcedure;

  return currentProcedure
    .reduce((accumulator, step, i, array) => {
      if (!isOperator(step)) {
        return accumulator;
      }

      const first = array[i - 1];
      const second = array[i + 1];

      const operation = operators[step] || Math[step];

      return operation(first, second);
    }, firstValue);
}

module.exports = calculator;
