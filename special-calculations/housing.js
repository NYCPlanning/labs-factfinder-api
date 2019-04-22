const {
  TRANSFORM_TYPE_SCALE: SCALE,
  TRANSFORM_TYPE_INFLATE: INFLATE,
} = require('./data/constants');

module.exports = [
  // gross rent
  {
    variable: 'mdgr',
    specialType: 'median',
    options: { designFactor: 1.6, transform: { type: INFLATE } },
  },
  // housing occupancy
  {
    variable: 'hovacrt',
    specialType: 'mean',
    options: {
      args: ['vacsale', 'hovacu'],
      formulaName: { m: 'rate' },
      transform: { type: SCALE, factor: 100 },
    },
  },
  {
    variable: 'rntvacrt',
    specialType: 'mean',
    options: {
      args: ['vacrnt', 'rntvacu'],
      formulaName: { m: 'rate' },
      transform: { type: SCALE, factor: 100 },
    },
  },
  // housing tenure
  {
    variable: 'avghhsooc',
    specialType: 'mean',
    options: { args: ['popoochu', 'oochu1'] },
  },
  {
    variable: 'avghhsroc',
    specialType: 'mean',
    options: { args: ['poprtochu', 'rochu1'] },
  },
  // rooms
  {
    variable: 'mdrms',
    specialType: 'median',
    options: { transform: { type: SCALE, factor: 0.001 } },
  },
  // value
  {
    variable: 'mdvl',
    specialType: 'median',
    options: { designFactor: 1.4, transform: { type: INFLATE } },
  },
];
