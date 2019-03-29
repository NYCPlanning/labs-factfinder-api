const { find } = require('lodash');
const df = require('dataframe-js');

const specialCalcConfigs = require('../special-calculations');
const calculateMedianError = require('../utils/calculate-median-error');
const interpolate = require('../utils/interpolate');
const { executeWithData: executeFormula } = require('../utils/formula');

const {
  INFLATION_FACTOR,
  RENAME_COLS,
  PREV_YEAR,
  CUR_YEAR,
} = require('../special-calculations/data/constants');

/*
 * The DataIngester class is used to convert profile data from postgres query into a Dataframe.
 * Additionally for aggregate profiles, the DataIngester recalculates 'special' variables, configured
 * in 'special-calculations/[profile].js'.
 * NOTE: Dataframes (https://gmousse.gitbooks.io/dataframe-js/#dataframe-js) are immutable, so they cannot be modified
 * in place. That is why all functions mutating a Dataframe also return one.
 */
class DataIngester {
  /*
   * Creates a DataIngester
   * @constructor
   * @params{Array} data - Raw data from SQL query, an array of objects representing rows
   * @params{string} profileType - The profile type
   * @params{Boolean} isAggregate - True if the given data selection is comprised of multiple geoids; else false
   * @params{Boolean} isPrevious - True if the given data selection is for the older dataset year
   */
  constructor(data, profileType, isAggregate = false, isPrevious = false) {
    this.data = data;
    this.profileType = profileType;
    this.isAggregate = isAggregate;
    this.isPrevious = isPrevious;
    this.extraColumns = ['codingThreshold'];
  }

  /*
   * Main function of the DataIngestor class, turns this.data into a Dataframe
   * with recalcuated special variables if aggregate, and with RENAME_COLS renamed
   * if columnPrefix argument is supplied.
   * @param{String} [columnPrefix] - String to prepend to RENAME_COLS names in Dataframe
   * @returns{Dataframe}
   */
  processRaw(columnPrefix = '') {
    let d = this.makeBaseDataFrame();

    if (this.isAggregate) {
      d = this.recalculate(d);
    }

    if (columnPrefix) {
      d = prefixColumns(d, columnPrefix, RENAME_COLS);
    }

    return d;
  }

  /*
   * Turns this.data (raw SQL data) into a Dataframe, and adds columns specified by this.extraColumns
   * @returns{Dataframe}
   */
  makeBaseDataFrame() {
    let d = new df.DataFrame(this.data);
    this.extraColumns.forEach((col) => {
      d = d.withColumn(col);
    });
    return d;
  }

  /*
   * Joins special calculation configuration to the given Dataframe,
   * and applies aggregate calculations to the resulting Dataframe.
   * Then, cleans up the special calculation configuration columns, and returns the final Dataframe.
   * @param{Dataframe} d - The dataframe to operate on
   * @returns{Dataframe}
   */
  recalculate(d) {
    d = d.leftJoin(new df.DataFrame(specialCalcConfigs[this.profileType], ['variable', 'specialType']), 'variable');
    d = d.chain(row => this.recomputeSpecialVars(row));
    d = d.drop('specialType');
    return d;
  }

  /*
   * For all 'special' rows, recompute sum and margin of error if appropriate,
   * and return the updated row object. Logs if a given special row cannot be updated,
   * but does not throw error or stop chained procedure.
   * @param{Row} row - The row to operate on
   * @returns{Row}
   */
  recomputeSpecialVars(row) {
    let updatedRow = row;
    const variable = updatedRow.get('variable');

    try {
      const specialType = updatedRow.get('specialType');

      // do not recalculate values for 'normal' rows
      if (specialType === undefined) return updatedRow;

      const year = this.isPrevious ? PREV_YEAR : CUR_YEAR;
      const { options } = find(specialCalcConfigs[this.profileType], ['variable', variable]);

      updatedRow = this.recomputeSum(updatedRow, specialType, variable, year, options);
      // decennial profiles do not have MOE values
      if (this.profileType !== 'decennial') {
        updatedRow = this.recomputeM(updatedRow, specialType, variable, year, options);
      }
    } catch (e) {
      console.log(`Failed to update special vars for ${variable}:`, e); // eslint-disable-line
    }

    return updatedRow;
  }

  /*
   * Recomputes the 'sum' value for a given row, applying the appropriate calculation
   * based on the type of 'special' row. Additionally, scales the recomputed sum value
   * if configured in 'options'
   * @param{Row} row - The row to operate on
   * @param{string} specialType - The type of this special variable
   * @param{string} variable - The variable for the given row
   * @param{string} year - The year for the given dataset
   * @param{Object} options - Additional configuration for special calculations
   * @returns{Row}
   */
  recomputeSum(row, specialType, variable, year, options) {
    let updatedRow = row;
    let sum;

    if (specialType === 'median') {
      const { trimmedEstimate, codingThreshold } = interpolate(this.data, variable, year);
      sum = trimmedEstimate;
      if (codingThreshold) {
        updatedRow = updatedRow.set('codingThreshold', codingThreshold);
        // if codingThreshold is set, indicates value was top- or bottom-coded,
        // meaning the value is not reliable
        updatedRow = updatedRow.set('is_reliable', false);
      }
    } else {
      const formulaName = getFormulaName(options, 'sum');
      sum = executeFormula(this.data, variable, formulaName, options.args);
    }
    sum = this.applyTransform(sum, options.transform);

    return updatedRow.set('sum', sum);
  }

  /*
   * Recomputes the 'm'(margin of error) value for a given row, applying the appropriate calculation
   * based on the type of 'special' row. Additionally, scales the recomputed m value
   * if configured in 'options'
   * @param{Row} row - The row to operate on
   * @param{string} specialType - The type of this special variable
   * @param{string} variable - The variable for the given row
   * @param{string} year - The year for the given dataset
   * @param{Object} options - Additional configuration for special calculations
   * @returns{Row}
   */
  recomputeM(row, specialType, variable, year, options) {
    const updatedRow = row;
    let m;
    if (specialType === 'median') {
      m = calculateMedianError(this.data, variable, year, options);
    } else {
      const formulaName = getFormulaName(options, 'm');
      m = executeFormula(formulaName, options.args, this.data, variable);
    }

    m = this.applyTransform(m, options.transform);

    return updatedRow.set('m', m);
  }

  /*
   * If transformOptions exists, then applies the appropriate transformation.
   * 'inflate' is a special transform type, which only applies to previous year data points
   * (designated by this.isPrevious), and scales by INFLATION_FACTOR. Other allowed transformation
   * is 'scale' type, and require transformOptions.factor; factor is applied as scalar transformation
   * @param{Number} val - The value to transform
   * @param{Object} [transformOptions] - Object containing 'type', and optionally 'factor'; defines the transformation
   * @returns{Number}
   */
  applyTransform(val, transformOptions) {
    if (!transformOptions) return val;

    // inflations are special scalar transforms only applied to prev year dataset
    if (transformOptions.type === 'inflate' && !this.isPrevious) return val;
    // do inflation
    if (transformOptions.type === 'inflate') return val * INFLATION_FACTOR;
    // do scalar transform
    if (transformOptions.type === 'scale' && transformOptions.factor) return val * transformOptions.factor;

    // something unexpected happened with transformOptions -- just leave the value as is
    return val;
  }
}

/*
 * Given a dataframe, a prefix string, and an array of columns to rename
 * returns a copy of the original dataframe with the specified columns
 * renamed to 'prefix_originalColumnName'
 */
function prefixColumns(d, prefix, renameCols) {
  renameCols.forEach((colName) => {
    d = d.rename(colName, `${prefix}_${colName}`);
  });
  return d;
}

/*
 * If a special formula name is defined for a given value calculation,
 * the corresponding key in the formulas object is of the format:
 * 'value_specialFormula'
 * i.e. if special formula 'rate' is defined for value calculation 'm',
 * the key in the formulas object would be 'm_rate'
 */
function getFormulaName(options, valType) {
  if (options.formulaName) {
    const specialFormulaName = options.formulaName[valType];
    return `${valType}_${specialFormulaName}`;
  }
  return valType;
}

module.exports = DataIngester;
