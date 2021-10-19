const {
  CUR_YEAR,
  PREV_YEAR,
} = require('./constants');

// top and bottom codings used to code median interpolations
const topBottomCodings = {
  [CUR_YEAR]: {
    mdage: {
      upper: 85,
      lower: 1,
    },
    mdhhinc: {
      upper: 200000,
      lower: 9999,
    },
    mdfaminc: {
      upper: 200000,
      lower: 9999,
    },
    mdnfinc: {
      upper: 200000,
      lower: 9999,
    },
    mdewrk: {
      upper: 100000,
      lower: 2499,
    },
    mdemftwrk: {
      upper: 100000,
      lower: 2499,
    },
    mdefftwrk: {
      upper: 100000,
      lower: 2499,
    },
    mdrms: {
      upper: 9,
      lower: 0,
    },
    mdvl: {
      upper: 2000000,
      lower: 0,
    },
    mdgr: {
      upper: 3500,
      lower: 0,
    },
  },
  [PREV_YEAR]: {
    mdage: {
      upper: 85,
      lower: 1,
    },
    mdhhinc: {
      upper: 235000,
      lower: 12000
    },
    mdfaminc: {
      upper: 235000,
      lower: 12000
    },
    mdnfinc: {
      upper: 235000,
      lower: 12000
    },
    mdewrk: {
      upper: 118000,
      lower: 2900
    },
    mdemftwrk: {
      upper: 118000,
      lower: 2900
    },
    mdefftwrk: {
      upper: 118000,
      lower: 2900
    },
    mdrms: {
      upper: 9,
      lower: 0,
    },
    mdvl: {
      upper: 1175000,
      lower: 0,
    },
    mdgr: {
      upper: 2350,
      lower: 0,
    },
  },
};

module.exports = topBottomCodings;
