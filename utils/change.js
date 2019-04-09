const { CV_CONST } = require('../data/special-calculations/constants');

const { abs, sqrt } = Math;
function exists(val) {
  return val !== undefined;
}

function calculateChanges(row) {
  if (exists(row.sum) && exists(row.previous_sum)) {
    row.change_sum = row.sum - row.previous_sum;

    if(exists(row.previous_m)) {
      row.change_m = abs(sqrt((row.m ** 2) + (row.previous_m ** 2)));

      row.change_significant = (((row.change_m / CV_CONST) / abs(row.change_sum)) * 100) < 20;
    }
  }
}

function calculateChangePercents(row) {
  if (exists(row.sum) && exists(row.previous_sum) && row.previous_sum !== 0) {
    row.change_percent = (row.sum - row.previous_sum) / row.previous_sum;

    if(exists(row.percent_m)) {
      row.change_percent_m = abs(row.sum / row.previous_sum)
        * sqrt((((row.m / CV_CONST) / row.sum) ** 2) + (((row.previous_m / CV_CONST) / row.previous_sum) ** 2))
        * CV_CONST;
  
      row.change_percent_significant = (((row.change_percent_m / CV_CONST) / abs(row.change_percent)) * 100) < 20;
    }
  }
}

function calculateChangePercentagePoints(row) {
  if (exists(row.percent) && exists(row.previous_percent)) {
    row.change_percentage_point = row.percent - row.previous_percent;
    if(exists(row.percent_m)) {
      row.change_percentage_point_m = sqrt((row.percent_m ** 2) + (row.previous_percent_m ** 2));
  
      row.change_percentage_point_significant = ((row.change_percentage_point_m / CV_CONST) / abs(row.change_percentage_point)) * 100 < 20;
    }
  }
}


function doChangeCalculations(row) {
  const updatedRow = row;
  calculateChanges(updatedRow);
  calculateChangePercents(updatedRow);
  calculateChangePercentagePoints(updatedRow);
  return updatedRow;
}

module.exports = doChangeCalculations;
