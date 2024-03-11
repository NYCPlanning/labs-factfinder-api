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
      lower: 10000,
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
      upper: {
        preInflation: 200000,
        postInflation: 270000,
      },
      lower: {
        preInflation: 9999,
        postInflation: 13500
      }
    },
    mdfaminc: {
      upper: {
        preInflation: 200000,
        postInflation: 270000,
      },
      lower: {
        preInflation: 9999,
        postInflation: 13500
      }
    },
    mdnfinc: {
      upper: {
        preInflation: 200000,
        postInflation: 270000,
      },
      lower: {
        preInflation: 9999,
        postInflation: 13500
      }
    },
    mdewrk: {
      upper: {
        preInflation: 100000,
        postInflation: 135000,
      },
      lower: {
        preInflation: 2499,
        postInflation: 3400
      }
    },
    mdemftwrk: {
      upper: {
        preInflation: 100000,
        postInflation: 135000,
      },
      lower: {
        preInflation: 2499,
        postInflation: 3400
      }
    },
    mdefftwrk: {
      upper: {
        preInflation: 100000,
        postInflation: 135000,
      },
      lower: {
        preInflation: 2499,
        postInflation: 3400
      }
    },
    mdrms: {
      upper: 9,
      lower: 0,
    },
    mdvl: {
      upper: {
        preInflation: 1000000,
        postInflation: 1350000,
      },
      lower: {
        preInflation: 0,
        postInflation: 0,
      }
    },
    mdgr: {
      upper: {
        preInflation: 2000,
        postInflation: 2700,
      },
      lower: {
        preInflation: 0,
        postInflation: 0,
      }
    },
  },
};

module.exports = topBottomCodings;
