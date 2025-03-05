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
        postInflation: 281000,
      },
      lower: {
        preInflation: 9999,
        postInflation: 14000
      }
    },
    mdfaminc: {
      upper: {
        preInflation: 200000,
        postInflation: 281000,
      },
      lower: {
        preInflation: 9999,
        postInflation: 14000
      }
    },
    mdnfinc: {
      upper: {
        preInflation: 200000,
        postInflation: 281000,
      },
      lower: {
        preInflation: 9999,
        postInflation: 14000
      }
    },
    mdewrk: {
      upper: {
        preInflation: 100000,
        postInflation: 140000,
      },
      lower: {
        preInflation: 2499,
        postInflation: 3500
      }
    },
    mdemftwrk: {
      upper: {
        preInflation: 100000,
        postInflation: 140000,
      },
      lower: {
        preInflation: 2499,
        postInflation: 3500
      }
    },
    mdefftwrk: {
      upper: {
        preInflation: 100000,
        postInflation: 140000,
      },
      lower: {
        preInflation: 2499,
        postInflation: 3500
      }
    },
    mdrms: {
      upper: 9,
      lower: 0,
    },
    mdvl: {
      upper: {
        preInflation: 1000000,
        postInflation: 1405000,
      },
      lower: {
        preInflation: 0,
        postInflation: 0,
      }
    },
    mdgr: {
      upper: {
        preInflation: 2000,
        postInflation: 2800,
      },
      lower: {
        preInflation: 0,
        postInflation: 0,
      }
    },
  },
};

module.exports = topBottomCodings;
