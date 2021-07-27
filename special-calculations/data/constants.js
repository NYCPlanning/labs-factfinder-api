// constants for use in special calculations
const INFLATION_FACTOR = 1.1542; // inflates 2010 dollars to 2017 dollars
const TRANSFORM_TYPE_INFLATE = 'inflate';
const TRANSFORM_TYPE_SCALE = 'scale';
const CV_CONST = 1.645;
const DIFF_PERCENT_THRESHOLD = -0.05;
const DESIGN_FACTOR = 1.5;
const CUR_YEAR = 'Y2015-2019';
const PREV_YEAR = 'Y2006-2010'; // TODO: update with actual previous year
const DECENNIAL_CUR_YEAR = '2010';
const DECENNIAL_PREV_YEAR = '2000';
const ACS_SCHEMA_NAME = 'acs';
const ACS_LATEST_TABLE_NAME = '2019';
const ACS_EARLIEST_TABLE_NAME = '2019';
const ACS_METADATA_TABLE_NAME = 'factfinder_metadata';
const ACS_LATEST_TABLE_FULL_PATH = `"${ACS_SCHEMA_NAME}"."${ACS_LATEST_TABLE_NAME}"`;
const ACS_EARLIEST_TABLE_FULL_PATH = `"${ACS_SCHEMA_NAME}"."${ACS_EARLIEST_TABLE_NAME}"`;

module.exports = {
  INFLATION_FACTOR,
  TRANSFORM_TYPE_INFLATE,
  TRANSFORM_TYPE_SCALE,
  CV_CONST,
  DIFF_PERCENT_THRESHOLD,
  DESIGN_FACTOR,
  CUR_YEAR,
  PREV_YEAR,
  DECENNIAL_CUR_YEAR,
  DECENNIAL_PREV_YEAR,
  ACS_SCHEMA_NAME,
  ACS_LATEST_TABLE_NAME,
  ACS_EARLIEST_TABLE_NAME,
  ACS_METADATA_TABLE_NAME,
  ACS_LATEST_TABLE_FULL_PATH,
  ACS_EARLIEST_TABLE_FULL_PATH,
};
