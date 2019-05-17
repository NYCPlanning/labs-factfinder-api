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
  {
    variable: 'grnorntpd',
    specialType: 'removePercentsOnly',
  },
  // gross rent as a percent
  {
    variable: 'grpintc',
    specialType: 'removePercentsOnly',
  },
  // housing occupancy
  {
    variable: 'hovacrt',
    specialType: 'mean',
    options: {
      args: ['vacsale', 'hovacu'],
      formulaName: { m: 'rate' },
    },
    noChangePercents: true,
  },
  {
    variable: 'rntvacrt',
    specialType: 'mean',
    options: {
      args: ['vacrnt', 'rntvacu'],
      formulaName: { m: 'rate' },
    },
    noChangePercents: true,
  },
  // housing tenure
  {
    variable: 'avghhsooc',
    specialType: 'mean',
    options: { args: ['popoochu', 'oochu1'] },
    noChangePercents: true,
  },
  {
    variable: 'avghhsroc',
    specialType: 'mean',
    options: { args: ['poprtochu', 'rochu1'] },
    noChangePercents: true,
  },
  // rooms
  {
    variable: 'mdrms',
    specialType: 'median',
    options: { transform: { type: SCALE, factor: 0.001 } },
    noChangePercents: true,
  },
  // value
  {
    variable: 'mdvl',
    specialType: 'median',
    options: { designFactor: 1.4, transform: { type: INFLATE } },
  },
  // selected monthly owner cost
  {
    variable: 'smpntc',
    specialType: 'removePercentsOnly',
  },
  {
    variable: 'nmsmpntc',
    specialType: 'removePercentsOnly',
  },
];
