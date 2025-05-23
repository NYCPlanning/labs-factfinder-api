// constants for use in special calculations
const INFLATION_FACTOR = 1.4049;
const CORRELATION_COEFFICIENT_CONST = 1.645;
const DIFF_PERCENT_THRESHOLD = -0.05;
const DESIGN_FACTOR = 1.5;
const CUR_YEAR = 'Y2019-2023';
const PREV_YEAR = 'Y2006-2010'; // TODO: update with actual previous year
const GEOGRAPHY_VERSION = '2023-08-29';
const DECENNIAL_SCHEMA_NAME = 'decennial';
const DECENNIAL_LATEST_TABLE_NAME = '2020';
const DECENNIAL_LATEST_VERSION = '2025-02-04';
const DECENNIAL_EARLIEST_TABLE_NAME = '2010';
const DECENNIAL_EARLIEST_VERSION = '2025-02-04';
const ACS_SCHEMA_NAME = 'acs';
const ACS_LATEST_TABLE_NAME = '2023';
const ACS_LATEST_VERSION = '2025-02-20';
const ACS_EARLIEST_TABLE_NAME = '2010';
const ACS_EARLIEST_VERSION = '2025-02-20';
const ACS_METADATA_FULL_PATH = `"${ACS_SCHEMA_NAME}"."metadata"`;
const ACS_LATEST_TABLE_FULL_PATH = `"${ACS_SCHEMA_NAME}"."${ACS_LATEST_TABLE_NAME}"`;
const ACS_EARLIEST_TABLE_FULL_PATH = `"${ACS_SCHEMA_NAME}"."${ACS_EARLIEST_TABLE_NAME}"`;
const DECENNIAL_METADATA_FULL_PATH = `"${DECENNIAL_SCHEMA_NAME}"."metadata"`;
const DECENNIAL_LATEST_TABLE_FULL_PATH = `"${DECENNIAL_SCHEMA_NAME}"."${DECENNIAL_LATEST_TABLE_NAME}"`;
const DECENNIAL_EARLIEST_TABLE_FULL_PATH = `"${DECENNIAL_SCHEMA_NAME}"."${DECENNIAL_EARLIEST_TABLE_NAME}"`;

module.exports = {
  INFLATION_FACTOR,
  CORRELATION_COEFFICIENT_CONST,
  DIFF_PERCENT_THRESHOLD,
  DESIGN_FACTOR,
  CUR_YEAR,
  PREV_YEAR,
  GEOGRAPHY_VERSION,
  DECENNIAL_LATEST_TABLE_NAME,
  DECENNIAL_LATEST_VERSION,
  DECENNIAL_EARLIEST_TABLE_NAME,
  DECENNIAL_EARLIEST_VERSION,
  DECENNIAL_LATEST_TABLE_FULL_PATH,
  DECENNIAL_EARLIEST_TABLE_FULL_PATH,
  DECENNIAL_METADATA_FULL_PATH,
  ACS_SCHEMA_NAME,
  ACS_LATEST_TABLE_NAME,
  ACS_LATEST_VERSION,
  ACS_EARLIEST_TABLE_NAME,
  ACS_EARLIEST_VERSION,
  ACS_METADATA_FULL_PATH,
  ACS_LATEST_TABLE_FULL_PATH,
  ACS_EARLIEST_TABLE_FULL_PATH,
};
