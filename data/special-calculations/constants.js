const INFLATION_MULTIPLIER = 1.1267; // inflates 2010 dollars to 2017 dollars
const CV_CONST = 1.645;
const RENAME_COLS = ['sum', 'm', 'cv', 'percent', 'percent_m', 'codingThreshold'];
const CHANGE_COLS = [
  'change_sum',
  'change_m',
  'change_percent',
  'change_percent_m',
  'change_percent_significant',
  'change_percentage_point',
  'change_percentage_point_m',
  'change_percentage_point_significant',
];

const STANDARD_ERROR = (designFactor) => designFactor * ((
    (93 / (7 * sum)) * 2500
  ) ** 0.5);
const CUR_YEAR = 'Y2013-2017';
const PREV_YEAR = 'Y2006-2010';


module.exports = {
  INFLATION_MULTIPLIER,
  CV_CONST,
  CHANGE_COLS,
  PREVIOUS_COLS,
  CUR_YEAR, 
  PREV_YEAR,
};
