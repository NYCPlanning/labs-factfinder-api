const { find } = require('lodash');
const df = require('dataframe-js');

const specialCalcConfigs = require('../special-calculations');
const calculateMedianError = require('../utils/calculate-median-error');
const interpolate = require('../utils/interpolate');
const formula = require('../utils/formula');
const formulas = require('../utils/formulas');
const { INFLATION_FACTOR, RENAME_COLS } = require('../data/special-calculations/constants');

class DataIngester {
  constructor(data, profileType, isAggregate, isPrevious = false, isCompare = false) {
    this.data = data;
    this.profileType = profileType;
    this.isAggregate = isAggregate;
    this.isPrevious = isPrevious;
    this.extraColumns = ['codingThreshold'];
  }

  processRaw() {
    let d = this.makeBaseDataFrame();

    if (this.isAggregate) {
      d = this.recalculate(d);
    }

    return d;
  }

  prefixColumns(prefix) {
    if (this.isPrevious) {
      RENAME_COLS.forEach((colName) => {
        d.rename(colName, `${prefix}_${colName}`);
      });
    }

  makeBaseDataFrame() {
    let d = new df.DataFrame(this.data);
    this.extraColumns.forEach((col) => {
      d = d.withColumn(col);
    });
    return d;
  }

  recalculate(d) {
    d = d.join(new df.DataFrame(specialCalcConfigs[this.profileType], ['variable', 'specialType']), 'variable');
    return this.applyAggregateCalculations(d);
  }

  applyAggregateCalculations(d) {
    return d.chain(row => this.recomputeSpecialVars(row));
  }

  recomputeSpecialVars(row) {
    const type = row.get('specialType');
    if (type === undefined) return;

    const variable = row.get('variable');
    const year = row.get('dataset');
    const options = find(specialCalcConfigs[this.special], ['variable', variable]);
    this.recomputeSum(row, type, variable, year, options);
    this.recomputeM(row, type, variable, year, options);
  }

  recomputeSum(row, type, variable, year, options) {
    let sum;

    if (type === 'median') {
      const { trimmedEstimate, codingThreshold } = interpolate(this.data, year, options, row.toDict());
      sum = trimmedEstimate;
      if (codingThreshold) row.set('codingThreshold', codingThreshold);
    } else {
      sum = formula.execute(this.data, variable, formulas[type], options.args);
    }

    sum = this.applyTransform(sum, options.transform);

    row.set('sum', sum);
  }

  recomputeM(row, type, variable, year, options) {
    let m;
    if (type === 'median') {
      m = calculateMedianError(this.data, variable, year, options);
    } else {
      m = formulas.execute(this.data, variable, formulas[type], options.args);
    }

    m = this.applyTransform(m, options.transform);

    row.set('m', m);
  }

  applyTransform(val, opts) {
    // inflations are special scalar transforms only applied to prev year dataset
    if (opts.type === 'inflate' && !this.isPrevious) return val;

    return val * (opts.type === 'inflate' ? INFLATION_FACTOR : opts.factor);
  }
}

module.exports = DataIngester;
