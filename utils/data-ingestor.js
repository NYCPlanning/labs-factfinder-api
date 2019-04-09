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
} = require('../data/special-calculations/constants');

class DataIngester {
  constructor(data, profileType, isAggregate, isPrevious = false) {
    this.data = data;
    this.profileType = profileType;
    this.isAggregate = isAggregate;
    this.isPrevious = isPrevious;
    this.extraColumns = ['codingThreshold'];
  }

  processRaw(columnPrefix = '') {
    debugger;
    let d = this.makeBaseDataFrame();

    if (this.isAggregate) {
      d = this.recalculate(d);
    }

    if(columnPrefix) {
      d = this.prefixColumns(d, columnPrefix);
    }

    return d;
  }

  prefixColumns(d, prefix) {
    RENAME_COLS.forEach((colName) => {
      d = d.rename(colName, `${prefix}_${colName}`);
    });
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
    d = d.leftJoin(new df.DataFrame(specialCalcConfigs[this.profileType], ['variable', 'specialType']), 'variable');
    d = this.applyAggregateCalculations(d);
    return d;
  }

  applyAggregateCalculations(d) {
    d = d.chain(row => this.recomputeSpecialVars(row));
    return d;
  }

  recomputeSpecialVars(row) {
    let updatedRow = row;
    const specialType = updatedRow.get('specialType');
    if (specialType === undefined) return updatedRow;

    const variable = updatedRow.get('variable');
    const year = this.isPrevious ? PREV_YEAR : CUR_YEAR;
    const { options } = find(specialCalcConfigs[this.profileType], ['variable', variable]);
    updatedRow = this.recomputeSum(updatedRow, specialType, variable, year, options);
    updatedRow = this.recomputeM(updatedRow, specialType, variable, year, options);
    return updatedRow
  }

  recomputeSum(row, specialType, variable, year, options) {
    let updatedRow = row;
    let sum;

    if (specialType === 'median') {
      if (variable === 'mdfaminc') debugger;
      const { trimmedEstimate, codingThreshold } = interpolate(this.data, variable, year, options, updatedRow.toDict());
      sum = trimmedEstimate;
      if (codingThreshold) {
        updatedRow = updatedRow.set('codingThreshold', codingThreshold);
        // if codingThreshold is set, indicates value was top- or bottom-coded,
        // meaning the v alue is not reliable
        updatedRow = updatedRow.set('is_reliable', false);
      }
    } else { // specialType == mean, ratio, rate
      const formulaName = options.formulaName || 'sum';
      sum = executeFormula(this.data, variable, formulaName, options.args);
    }
sum = this.applyTransform(sum, options.transform);

    return updatedRow.set('sum', sum);
  }

  recomputeM(row, specialType, variable, year, options) {
    let updatedRow = row;
    let m;
    if (specialType === 'median') {
      m = calculateMedianError(this.data, variable, year, options);
    } else {
      const formulaName = options.formulaName || 'm';
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

module.exports = DataIngester;
