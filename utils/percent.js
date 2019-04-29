/*
 * Sets all percent values to null for all special variables
 * @param{Object} row - The row the operate on
 * @param{Object} varConfig - The special configuration for the variable, or empty array
 */
function removePercents(row, varConfig) {
  if (Object.keys(varConfig).length) {
    cols = [
    'percent', 'percent_m',
    'previous_percent', 'previous_percent_m',
    'comparison_percent', 'comparison_percent_m',
    ];
    cols.forEach((col) => {
      row[col] = null;
    });
  }
}

module.exports = removePercents;
