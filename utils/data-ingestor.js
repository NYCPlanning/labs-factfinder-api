const { find } = require('lodash');
const df = require('dataframe-js');

const specialCalcConfigs = require('../special-calculations');
const calculateMedianError = require('../utils/calculate-median-error');
const interpolate = require('../utils/interpolate');
const executeFormula = require('../utils/formula');

const {
  INFLATION_FACTOR,
  RENAME_COLS,
  PREV_YEAR,
  CUR_YEAR,
} = require('../special-calculations/data/constants');

class DataIngester {
  constructor(data, profileType, isAggregate = false, isPrevious = false) {
    this.data = data;
    this.profileType = profileType;
    this.isAggregate = isAggregate;
    this.isPrevious = isPrevious;
    this.extraColumns = ['codingThreshold'];
  }

  processRaw(columnPrefix = '') {
    let d = this.makeBaseDataFrame();

    if (this.isAggregate) {
      d = this.recalculate(d);
    }

    if (columnPrefix) {
      d = prefixColumns(d, columnPrefix);
    }

    return d;
  }

  makeBaseDataFrame() {
    let d = new df.DataFrame(this.data);
    this.extraColumns.forEach((col) => {
      d = d.withColumn(col);
    });
    return d;
  }

  recalculate(d) {
    // join with special calculation configuration
    d = d.leftJoin(new df.DataFrame(specialCalcConfigs[this.profileType], ['variable', 'specialType']), 'variable');
    d = this.applyAggregateCalculations(d);
    return d;
  }

  applyAggregateCalculations(d) {
    d = d.chain(row => this.recomputeSpecialVars(row));
    return d;
  }

  recomputeSpecialVars(row) {
    try { 
      let updatedRow = row;
      const specialType = updatedRow.get('specialType');
      if (specialType === undefined) return updatedRow;
  
      const variable = updatedRow.get('variable');
      const year = this.isPrevious ? PREV_YEAR : CUR_YEAR;
      const { options } = find(specialCalcConfigs[this.profileType], ['variable', variable]);
      updatedRow = this.recomputeSum(updatedRow, specialType, variable, year, options);
      updatedRow = this.recomputeM(updatedRow, specialType, variable, year, options);
      return updatedRow;
    } catch(e) {
      console.log(`Failed to update special vars for ${variable}:`, e);
    }
  }

  recomputeSum(row, specialType, variable, year, options) {
    let updatedRow = row;
    let sum;

    if (specialType === 'median') {
      const { trimmedEstimate, codingThreshold } = interpolate(this.data, variable, year, options, updatedRow.toDict());
      sum = trimmedEstimate;
      if (codingThreshold) {
        updatedRow = updatedRow.set('codingThreshold', codingThreshold);
        // if codingThreshold is set, indicates value was top- or bottom-coded,
        // meaning the v alue is not reliable
        updatedRow = updatedRow.set('is_reliable', false);
      }
    } else { // specialType == mean, ratio, rate
      const formulaName = getFormulaName(options, 'sum');
      sum = executeFormula(this.data, variable, formulaName, options.args);
    }
    sum = this.applyTransform(sum, options.transform);

    return updatedRow.set('sum', sum);
  }

  recomputeM(row, specialType, variable, year, options) {
    const updatedRow = row;
    let m;
    if (specialType === 'median') {
      m = calculateMedianError(this.data, variable, year, options);
    } else {
      const formulaName = getFormulaName(options, 'm');
      m = executeFormula(this.data, variable, formulaName, options.args);
    }

    m = this.applyTransform(m, options.transform);

    return updatedRow.set('m', m);
  }

  applyTransform(val, opts) {
    if (!opts) return val;

    // inflations are special scalar transforms only applied to prev year dataset
    if (opts.type === 'inflate' && !this.isPrevious) return val;

    return val * (opts.type === 'inflate' ? INFLATION_FACTOR : opts.factor);
  }
}

function prefixColumns(d, prefix) {
  RENAME_COLS.forEach((colName) => {
    d = d.rename(colName, `${prefix}_${colName}`);
  });
  return d;
}

function getFormulaName(options, valType) {
  if(options.formulaName) return options.formulaName[valType];
  return valType; 
}

module.exports = DataIngester;
