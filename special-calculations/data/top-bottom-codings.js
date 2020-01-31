// top and bottom codings used to code median interpolations
const topBottomCodings = {
  'Y2014-2018': {
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
      upper: 9000,
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
  'Y2006-2010': {
    mdage: {
      upper: 85,
      lower: 1,
    },
    mdhhinc: {
      upper: 225000,
      lower: 11000,
    },
    mdfaminc: {
      upper: 225000,
      lower: 11000,
    },
    mdnfinc: {
      upper: 225000,
      lower: 11000,
    },
    mdewrk: {
      upper: 112500,
      lower: 2800,
    },
    mdemftwrk: {
      upper: 112500,
      lower: 2800,
    },
    mdefftwrk: {
      upper: 112500,
      lower: 2800,
    },
    mdrms: {
      upper: 9000,
      lower: 0,
    },
    mdvl: {
      upper: 1275000,
      lower: 0,
    },
    mdgr: {
      upper: 2250,
      lower: 0,
    },
  },
};

module.exports = topBottomCodings;
