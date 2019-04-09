const INFLATION_MULTIPLIER = 1.1267; // inflates 2010 dollars to 2017 dollars

function inflate(data, column, rowConfig, variable) {
  const rowData = data[variable];
  return rowData.is_most_recent ? rowData[column] : (rowData[column] * INFLATION_MULTIPLIER);
}

module.exports = inflate;
