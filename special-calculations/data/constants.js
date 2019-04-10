const INFLATION_FACTOR = 1.1267; // inflates 2010 dollars to 2017 dollars
const TRANSFORM_TYPE_INFLATE = 'inflate';
const TRANSFORM_TYPE_SCALE = 'scale';
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

const DECENNIAL_CUR_YEAR = '2010';
const DECENNIAL_PREV_YEAR = '2000';

module.exports = {
  INFLATION_FACTOR,
  TRANSFORM_TYPE_INFLATE,
  TRANSFORM_TYPE_SCALE,
  CV_CONST,
  RENAME_COLS,
  CUR_YEAR,
  PREV_YEAR,
  DECENNIAL_CUR_YEAR,
  DECENNIAL_PREV_YEAR,
};
