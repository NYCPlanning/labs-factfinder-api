const INFLATION_FACTOR = 1.1267; // inflates 2010 dollars to 2017 dollars
const CV_CONST = 1.645;
const RENAME_COLS = [
  'sum',
  'm',
  'cv',
  'percent',
  'percent_m',
  'codingThreshold',
  'is_reliable',
];



const CUR_YEAR = 'Y2013-2017';
const PREV_YEAR = 'Y2006-2010';

module.exports = {
  INFLATION_FACTOR,
  CV_CONST,
  RENAME_COLS,
  CUR_YEAR,
  PREV_YEAR,
};
