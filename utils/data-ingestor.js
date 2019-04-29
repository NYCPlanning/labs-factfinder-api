const { find } = require('lodash');

const df = require('dataframe-js');

const specialCalculationConfigs = require('../special-calculations');
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
 * The DataIngestor class is used to convert profile data from postgres query into a Dataframe.
 * Additionally for aggregate profiles, the DataIngestor recalculates 'special' variables, configured
 * in 'special-calculations/[profile].js'.
 * NOTE: Dataframes (https://gmousse.gitbooks.io/dataframe-js/#dataframe-js) are immutable, so they cannot be modified
 * in place. That is why all functions mutating a Dataframe also return one.
 */
class DataIngestor {
  /*
   * Creates a DataIngestor
   * @constructor
   * @params{Array} data - Raw data from SQL query, an array of objects representing rows;
   * @params{string} profileName - The profile type; expected to be one of 'demographic', 'housing', 'economic', 'social', 'decennial'
   * @params{Boolean} isAggregate - True if the given data selection is comprised of multiple geoids; else false
   * @params{Boolean} isPrevious - True if the given data selection is for the older dataset year
   * @params{Boolean} isCompare - True if the given data selection is for the comparison dataset
   */
  constructor(data, profileName, isAggregate = false, isPrevious = false, isCompare = false) {
    this.data = data;
    this.profileName = profileName;
    this.isAggregate = isAggregate;
    this.isPrevious = isPrevious;
    this.isCompare = isCompare;
    this.extraColumns = ['codingThreshold'];
  }

  /*
   * Main function of the DataIngestor class, turns this.data into a Dataframe
   * with recalcuated special variables if aggregate, and with RENAME_COLS renamed
   * if columnPrefix argument is supplied.
   * @param{String} [columnPrefix] - String to prepend to RENAME_COLS names in Dataframe
   * @returns{Dataframe}
   */
  processRaw() {
    let d = this.makeBaseDataFrame();

    if (this.isAggregate) {
      d = this.recalculate(d);
    }

    if (this.isPrevious || this.isCompare) {
      d = this.prefixColumns(d, RENAME_COLS);
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
   * specialCalculationConfigs[profileName] is an array of objects containing 'variable' and 'specialType' properties
   * (see special-calculations/[profileName].js for examples)
   * Then, cleans up the special calculation configuration columns, and returns the final Dataframe.
   * @param{Dataframe} d - The dataframe to operate on
   * @returns{Dataframe}
   */
  recalculate(d) {
    d = d.leftJoin(
      new df.DataFrame(
        specialCalculationConfigs[this.profileName], ['variable', 'specialType'],
      ),
      'variable',
    );
    d = d.chain(row => this.recomputeSpecialVars(row));
    d = d.drop('specialType');
    return d;
  }

  /*
   * Given a dataframe, and an array of columns to rename
   * returns a copy of the original dataframe with the specified columns
   * renamed to prefix_columnName, where prefix is determined based on
   * isPrevious and isCompare instance variables, with isPrevious having precendence
   * over isComparison (both should not be, but could be, true).
   * @param{Dataframe} d - The dataframe to operate on
   * @param{Array} renameCols - The dataframe columns to rename
   * @returns{Dataframe}
   */
  prefixColumns(d, renameCols) {
    let prefix = '';
    if (this.isPrevious) prefix = 'previous';
    else if (this.isCompare) prefix = 'comparison';
    renameCols.forEach((colName) => {
      d = d.rename(colName, `${prefix}_${colName}`);
    });
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

    // do not recalculate values for 'normal' or 'noPercentOnly' rows,
    // which do not require recalculation
    const specialType = updatedRow.get('specialType');
    if (specialType === undefined || specialType === 'noPercentOnly') return updatedRow;

    // recalculate sum, and optionally m & cv
    const variable = updatedRow.get('variable');
    try {
      const year = this.isPrevious ? PREV_YEAR : CUR_YEAR;
      const { options } = find(specialCalculationConfigs[this.profileName], ['variable', variable]);

      let wasCoded;
      ({ updatedRow, wasCoded } = this.recomputeSum(updatedRow, specialType, variable, year, options));

      // decennial profiles do not have MOE values or CV values
      if (this.profileName !== 'decennial') {
        updatedRow = this.recomputeM(updatedRow, specialType, variable, year, wasCoded, options);
        updatedRow = this.recomputeCV(updatedRow, variable, wasCoded);
        updatedRow = this.recomputeIsReliable(updatedRow, variable, wasCoded);
      }
    } catch (e) {
      console.log(`Failed to update special vars for ${variable}:`, e); // eslint-disable-line
    }

    return updatedRow;
  }

  /*
   * Recomputes the 'sum' value for a given row, applying the appropriate calculation
   * based on the type of 'special' row. Additionally, scales the recomputed sum value
   * if configured in 'options'. Returns a boolean to indicate if the value was coded,
   * along with the updated row.
   * @param{Row} row - The row to operate on
   * @param{string} specialType - The type of this special variable
   * @param{string} variable - The variable for the given row
   * @param{string} year - The year for the given dataset
   * @param{Object} options - Additional configuration for special calculations
   * @returns{{row: Row, wasCoded: boolean}}
   */
  recomputeSum(row, specialType, variable, year, options) {
    let updatedRow = row;
    let sum;
    let wasCoded = false;

    if (specialType === 'median') {
      const { trimmedEstimate, codingThreshold } = interpolate(this.data, variable, year);
      sum = trimmedEstimate;
      if (codingThreshold) {
        wasCoded = true;
        updatedRow = updatedRow.set('codingThreshold', codingThreshold);
        // if codingThreshold is set, indicates value was top- or bottom-coded,
        // meaning the value is not reliable
        updatedRow = updatedRow.set('is_reliable', false);
      }
    } else {
      const formulaName = getFormulaName(options, 'sum');
      sum = executeFormula(this.data, variable, formulaName, options.args);
    }

    sum = this.applyTransform(sum, options.transform, wasCoded);

    return { updatedRow: updatedRow.set('sum', sum), wasCoded };
  }

  /*
   * Recomputes the 'm'(margin of error) value for a given row, applying the appropriate calculation
   * based on the type of 'special' row. Additionally, scales the recomputed m value
   * if configured in 'options'
   * @param{Row} row - The row to operate on
   * @param{string} specialType - The type of this special variable
   * @param{string} variable - The variable for the given row
   * @param{string} year - The year for the given dataset
   * @param{boolean} wasCoded - Flag indicating if the estimate value has been coded
   * @param{Object} options - Additional configuration for special calculations
   * @returns{Row}
   */
  recomputeM(row, specialType, variable, year, wasCoded, options) {
    const updatedRow = row;
    let m;

    // MOE should not be calculated for top- or bottom-coded values
    if (wasCoded) {
      m = null;
    } else if (specialType === 'median') {
      m = calculateMedianError(this.data, variable, year, options);
    } else {
      const formulaName = getFormulaName(options, 'm');
      m = executeFormula(this.data, variable, formulaName, options.args);
    }

    m = this.applyTransform(m, options.transform);

    return updatedRow.set('m', m);
  }

  /*
   * Recomputes 'cv' value for given row
   * @param{Row} row - The row to operate on
   * @param{string} variable - The variable for the given row
   * @param{boolean} wasCoded - Flag indicating if the estimate value has been coded
   * @returns{Row}
   */
  recomputeCV(row, variable, wasCoded) {
    const updatedRow = row;
    // CV should not be computed for top- or bottom-coded values
    const cv = wasCoded ? null : executeFormula(this.data, variable, 'cv');
    return updatedRow.set('cv', cv);
  }

  /*
   * Recomputes 'is_reliable' value for given row
   * @param{Row} row - The row to operate on
   * @param{string} variable - The variable for the given row
   * @param{boolean} wasCoded - Flag indicating if the estimate value has been coded
   * @returns{Row}
   */
  recomputeIsReliable(row, variable, wasCoded) {
    const updatedRow = row;
    // top- or bottom-coded values are not reliable
    const isReliable = wasCoded ? false : executeFormula(this.data, variable, 'is_reliable');
    return updatedRow.set('is_reliable', isReliable);
  }

  /*
   * If transformOptions exists, then applies the appropriate transformation.
   * 'inflate' is a special transform type, which only applies to previous year data points
   * (designated by this.isPrevious), and scales by INFLATION_FACTOR, if the value was not top- or bottom-coded.
   * Other allowed transformation is 'scale' type, and requires transformOptions.factor, where
   * factor is applied as scalar transformation
   * @param{Number} val - The value to transform
   * @param{Object} transformOptions - Object containing 'type', and optionally 'factor'; defines the transformation
   * @param{Boolean} wasCoded - flag indicating if the value was top or bottom coded
   * @returns{Number}
   */
  applyTransform(val, transformOptions, wasCoded) {
    if (!transformOptions) return val;

    // do not inflate if data is current (not isPrevious)
    if (transformOptions.type === 'inflate' && !this.isPrevious) return val;
    // do not inflate if data was top or bottom coded
    if (transformOptions.type === 'inflate' && wasCoded) return val;
    // else if inflation; do special scalar transformation
    if (transformOptions.type === 'inflate') return val * INFLATION_FACTOR;
    // else; do standard scalar transform
    if (transformOptions.type === 'scale' && transformOptions.factor) return val * transformOptions.factor;

    // else something unexpected happened with transformOptions; just leave the value as is
    return val;
  }
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

module.exports = DataIngestor;
