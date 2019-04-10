const {
  TRANSFORM_TYPE_SCALE: SCALE,
  TRANSFORM_TYPE_INFLATE: INFLATE,
} = require('./data/constants');

module.export = [
  // gross rent
  {
    variable: 'mdgr',
    type: 'median',
    options: { designFactor: 1.6, transform: { type: INFLATE } },
  },
  // housing occupancy
  {
    variable: 'hovacrt',
    type: 'mean',
    options: {
      args: ['vacsale', 'hovacu'],
      formulaName: { m: 'rate' },
      transform: { type: SCALE, factor: 100 },
    },
  },
  {
    variable: 'rntvacrt',
    type: 'mean',
    options: {
      args: ['vacrnt', 'rntvacu'],
      formulaName: { m: 'rate' },
      transform: { type: SCALE, factor: 100 },
    },
  },
  // housing tenure
  {
    variable: 'avghhsooc',
    type: 'mean',
    options: { args: ['popoochu', 'oochu1'] },
  },
  {
    variable: 'avghhsroc',
    type: 'mean',
    options: { args: ['poprtochu', 'rochu1'] },
  },
  // rooms
  {
    variable: 'mdrms',
    type: 'median',
    options: { transform: { type: SCALE, factor: 0.001 } },
  },
  // value
  {
    variable: 'mdvl',
    type: 'median',
    options: { designFactor: 1.4, transform: { type: INFLATE } },
  },
];
