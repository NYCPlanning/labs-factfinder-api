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
      upper: 230000,
      lower: 11500,
    },
    mdfaminc: {
      upper: 230000,
      lower: 11500,
    },
    mdnfinc: {
      upper: 230000,
      lower: 11500,
    },
    mdewrk: {
      upper: 115000,
      lower: 2800,
    },
    mdemftwrk: {
      upper: 115000,
      lower: 2800,
    },
    mdefftwrk: {
      upper: 115000,
      lower: 2800,
    },
    mdrms: {
      upper: 9,
      lower: 0,
    },
    mdvl: {
      upper: 1150000,
      lower: 0,
    },
    mdgr: {
      upper: 2300,
      lower: 0,
    },
  },
};

module.exports = topBottomCodings;
