const { CV_CONST } = require('../data/special-calculations/constants');

const { abs, sqrt } = Math;
function exists(val) {
  return val !== undefined;
}

function calculateChanges(row) {
  const updatedRow = row;
  if (exists(updatedRow.sum) && exists(updatedRow.previous_sum)) {
    updatedRow.change_sum = updatedRow.sum - updatedRow.previous_sum;

    if (exists(updatedRow.previous_m)) {
      updatedRow.change_m = abs(sqrt((updatedRow.m ** 2) + (updatedRow.previous_m ** 2)));

      updatedRow.change_significant = (((updatedRow.change_m / CV_CONST) / abs(updatedRow.change_sum)) * 100) < 20;
    }
  }
}

function calculateChangePercents(row) {
  const updatedRow = row;
  if (exists(updatedRow.sum) && exists(updatedRow.previous_sum) && updatedRow.previous_sum !== 0) {
    updatedRow.change_percent = (updatedRow.sum - updatedRow.previous_sum) / updatedRow.previous_sum;

    if (exists(updatedRow.percent_m)) {
      updatedRow.change_percent_m = abs(updatedRow.sum / updatedRow.previous_sum)
        * sqrt((((updatedRow.m / CV_CONST) / updatedRow.sum) ** 2) + (((updatedRow.previous_m / CV_CONST) / updatedRow.previous_sum) ** 2))
        * CV_CONST;

      updatedRow.change_percent_significant = (((updatedRow.change_percent_m / CV_CONST) / abs(updatedRow.change_percent)) * 100) < 20;
    }
  }
}

function calculateChangePercentagePoints(row) {
  const updatedRow = row;
  if (exists(updatedRow.percent) && exists(updatedRow.previous_percent)) {
    updatedRow.change_percentage_point = updatedRow.percent - updatedRow.previous_percent;
    if (exists(updatedRow.percent_m)) {
      updatedRow.change_percentage_point_m = sqrt((updatedRow.percent_m ** 2) + (updatedRow.previous_percent_m ** 2));

      updatedRow.change_percentage_point_significant = ((updatedRow.change_percentage_point_m / CV_CONST) / abs(updatedRow.change_percentage_point)) * 100 < 20;
    }
  }
}


function doChangeCalculations(row) {
  calculateChanges(row);
  calculateChangePercents(row);
  calculateChangePercentagePoints(row);
}

module.exports = doChangeCalculations;
