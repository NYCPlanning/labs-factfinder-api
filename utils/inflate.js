const INFLATION_MULTIPLIER = 1.1005; // inflates 2010 dollars to 2016 dollars

function runFormulaFor(data, column, rowConfig, variable) {
  const rowData = data[variable];
  return rowData.is_most_recent ? rowData[column] : (rowData[column] * INFLATION_MULTIPLIER);
}

module.exports = runFormulaFor;
