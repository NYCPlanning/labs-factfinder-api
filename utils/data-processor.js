const { find } = require('lodash');

const specialCalculationConfigs = require('../special-calculations');
const calculateMedianError = require('../utils/calculate-median-error');
const interpolate = require('../utils/interpolate');
const topBottomCodeEstimate = require('../utils/top-bottom-code-estimate');
const { executeWithData: executeFormula } = require('../utils/formula');

const {
  INFLATION_FACTOR,
  PREV_YEAR,
  CUR_YEAR,
} = require('../special-calculations/data/constants');

/*
 * The DataIngestor class is used to process raw survey data from postgres query.
 * Additionally for aggregate surveys, the processor recalculates special variables, configured
 * in 'special-calculations/[survey].js' (see special-calculations/index.js for more information).
 * NOTE: data is stored as an instance variable to make it easily accessible to utilities that perform
 * calculations relying on values from other rows in the data object
 */
class DataProcessor {
  /*
   * Creates a DataProcessor
   * @constructor
   * @params{Array} data - Raw data from SQL query, an array of objects representing rows;
   * @params{string} surveyName - The survey type; expected to be one of 'acs' or 'decennial'
   * @params{Boolean} isAggregate - True if the given data selection is comprised of multiple geoids; else false
   * @params{Boolean} isPrevious - True if the given data selection is for the older dataset year
   */
  constructor(data, surveyName, isAggregate = false, isPrevious = false) {
    this.data = data;
    this.surveyName = surveyName;
    this.isAggregate = isAggregate;
    this.isPrevious = isPrevious;
  }

  /*
   * Main function of the DataProcessor class; returns processed this.data
   * @returns{Object[]}
   */
  process() {
    const surveyConfig = specialCalculationConfigs[this.surveyName];

    this.data.forEach((row) => {
      const rowConfig = find(surveyConfig, ['variable', row.variable]);
      if (rowConfig) {
        removePercents(row);
        // Only recalculate values for aggregate datasets, and only for special variables that require it
        if (rowConfig.specialType !== 'removePercentsOnly') {
          this.recalculateSpecialVariables(row, rowConfig);
        }
      }
    });

    return this.data;
  }

  /*
   * For all special variables, recalculate estimte (called sum), and optionally
   * margin of error (called m), cv, and isReliable.
   * @param{Object} row - The row to update
   * @param{Object} config - The special calculation configuration for the given row
   */
  recalculateSpecialVariables(row, config) {
    try {
      const year = this.isPrevious ? PREV_YEAR : CUR_YEAR;

      this.recalculateSum(row, year, config);
      // row.codingThreshold will be set if in recalculating the sum the estimate was top- or bottom-coded
      const wasCoded = !!row.codingThreshold;

      // decennial survey results do not have MOE values or CV values
      if (this.surveyName !== 'decennial') {
        this.recalculateMarginOfError(row, year, config, wasCoded);
        this.recalculateCorrelationCoefficient(row, config, wasCoded);
        this.recalculateIsReliable(row, wasCoded);
      }
    } catch (e) {
      console.log(`Failed to update special vars for ${row.variable}:`, e); // eslint-disable-line
    }
  }

  /*
   * Recalculates the estimate for a given row, applying the appropriate calculation
   * based on the specialType. Additionally, scales the updated sum value if indicated in configuration.
   * @param{Object} row - The row to update
   * @param{string} year - The year for the given dataset
   * @param{Object} config - Special calculation configuration for given row
   */
  recalculateSum(row, year, config) {
    // For median calculation of aggregate selection, run interpolate() to determine "natural median"
    // before determining if value is top or bottom coded. Note that interpolate, in turn, runs
    // topBottomCodeEstimate() for aggregate selections
    if (config.specialType === 'median') {
      if (this.isAggregate) {
        row.sum =  interpolate(this.data, row.variable, year);
      }

      const { sum, variable } = row;
      const {
        mutatedEstimate: trimmedEstimate,
        codingThreshold,
      } = topBottomCodeEstimate(sum, variable, year, this.isPrevious, config);
      row.sum = trimmedEstimate;
      row.codingThreshold = codingThreshold;
    } else {
      if (this.isAggregate) {
        const formulaName = getFormulaName(config.options, 'sum');
        row.sum = executeFormula(this.data, row.variable, formulaName, config.options.args);
      }

      if (this.isPrevious && (
        config.options &&
        config.options.transform &&
        config.options.transform.inflate
     )) {
       row.sum = row.sum * INFLATION_FACTOR;
     }
    }
  }

  /*
   * Recalculates the margin of error for a given row, applying the appropriate calculation
   * based on the specialType. Additionally, scales the recomputed m value
   * if configured in 'options'
   * @param{Row} row - The row to update
   * @param{string} year - The year for the given dataset
   * @param{Object} config - Special calculation configuration for given row
   * @param{boolean} wasCoded - Flag indicating if the estimate value has been coded
   */
  recalculateMarginOfError(row, year, config, wasCoded) {
    // MOE should not be calculated for top- or bottom-coded values

    if (wasCoded) {
      row.marginOfError = null;
    } else if (config.specialType === 'median') {
      if (this.isAggregate) {
        row.marginOfError = calculateMedianError(this.data, row.variable, year, config.options);
      }
    } else {
      if (this.isAggregate) {
        const formulaName = getFormulaName(config.options, 'm');
        row.marginOfError = executeFormula(this.data, row.variable, formulaName, config.options.args);
      }
    }

    if (this.isPrevious && (
      config.options &&
      config.options.transform &&
      config.options.transform.inflate
   )) {
     row.marginOfError = row.marginOfError * INFLATION_FACTOR;
   }
  }

  /*
   * Recalculates cv for given row
   * @param{Row} row - The row to update
   * @param{Object} config - Special calculation configuration for given row
   * @param{boolean} wasCoded - Flag indicating if the estimate value has been coded
   */
  recalculateCorrelationCoefficient(row, config, wasCoded) {
    if (this.isAggregate) {
      // Correlation coefficient should not be computed for top- or bottom-coded values
      const formulaName = getFormulaName(config.options, 'cv');
      row.correlationCoefficient = wasCoded ? null : executeFormula(this.data, row.variable, formulaName, config.options.CVArgs);
    }
  }

  /*
   * Recalculates isReliable for given row
   * @param{Row} row - The row to update
   * @param{boolean} wasCoded - Flag indicating if the estimate value has been coded
   */
  recalculateIsReliable(row, wasCoded) {
    // top- or bottom-coded values are not reliable
    row.isReliable = wasCoded ? false : executeFormula(this.data, row.variable, 'isReliable');
  }
}


/*
 * Returns the formula name for a given value type, accounting for special cases:
 * If a special formulaName is defined for a given value calculation,
 * the corresponding key in the formulas object is of the format:
 * 'value_specialFormula'
 * i.e. if special formula 'rate' is defined for value calculation 'm',
 * the key in the formulas object would be 'm_rate'
 * @param{Object} options - Additional configuration for special calculations
 * @param{String} valType - The name of the value being calculated
 */
function getFormulaName(options, valType) {
  // if formulaName is defined for given valType, return the formula name appended to valType
  if (options.formulaName && options.formulaName[valType]) {
    return `${valType}_${options.formulaName[valType]}`;
  }

  // else, return the original value type as formula name
  return valType;
}

/*
 * Sets percent and percent_m values to null for a given row
 * @param{Object} row - The row to update
 */
function removePercents(row) {
  row.percent = null;
  row.percent_m = null;
}

module.exports = DataProcessor;
