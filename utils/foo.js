const formulas = require('../config/data/aggregate-calculations/formulas');

function getColumns(type, options) {
  let columns = [
    'sum',
    'change_sum',
    'change_percent',
    'previous_sum',
    'difference_sum',
    'comparison_sum',
    'm',
    'change_m',
    'change_percent_m',
    'previous_m',
    'difference_m',
    'comparison_m',
    'cv',
    'comparison_cv',
    'previous_cv',
  ];

}
function doSpecialCalculation(row, type, options, args = {}) {
   
}
