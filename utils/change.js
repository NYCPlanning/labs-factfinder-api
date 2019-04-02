const { CV_CONST } = require('data/special-calculations/constants');

function changeSum(row) {
  const sum = row.get('sum');
  const previous_sum = row.get('previous_sum');
  if(exists(sum) && exists(previous_sum)) {
    row.get('change_sum', sum - previous_sum);
  }
}
function changeM(row) {
  const m = row.get('m');
  const previous_m = row.get('previous_m');
  if(exists(m) && exists(previous_m)) {
    row.set('change_m',
      abs(sqrt(m^2 + previous_m^2)));
  }
}

function changePercent(row) {
  const sum = row.get('sum');
  const previous_sum = row.get('previous_sum');
  if(exists(sum) && exists(previous_sum) && previous_sum !== 0 ) {
    row.set('change_percent', 
      (sum - previous_sum) / previous_sum);
  } 
}

function changePercentM(row) {
  const sum = row.get('sum');
  const previous_sum = row.get('previous_sum');

  if(exists(sum) && exists(previous_sum) && previous_sum !== 0) {
    row.set('change_percent_m', 
      abs(sum / previous_sum) * 
      sqrt(((m/CV_CONST)/sum)^2 + ((previous_m/CV_CONST)/previous_sum)^2) *
      CV_CONST
    );
  }
}

function exists(val) {
  return typeof val !== undefined;
}
