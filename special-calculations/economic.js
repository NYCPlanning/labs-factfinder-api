const { TRANSFORM_TYPE_INFLATE: INFLATE } = require('./data/constants');

module.exports = [
  // income and benefits
  {
    variable: 'mdhhinc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { type: INFLATE } },
  },
  {
    variable: 'mnhhinc',
    specialType: 'mean',
    options: { args: ['aghhinc', 'hh2'], transform: { type: INFLATE } },
  },
  {
    variable: 'mdfaminc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { type: INFLATE } },
  },
  {
    variable: 'mdnfinc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { type: INFLATE } },
  },
  {
    variable: 'percapinc',
    specialType: 'mean',
    options: { args: ['agip15pl', 'pop_6'], transform: { type: INFLATE } },
  },
  // earnings
  {
    variable: 'mdewrk',
    specialType: 'median',
    options: { designFactor: 1.6, transform: { type: INFLATE } },
  },
  {
    variable: 'mdemftwrk',
    specialType: 'median',
    options: { designFactor: 1.6, transform: { type: INFLATE } },
  },
  {
    variable: 'mdefftwrk',
    specialType: 'median',
    options: { designFactor: 1.6, transform: { type: INFLATE } },
  },
  // commute to work
  {
    variable: 'mntrvtm',
    specialType: 'mean',
    options: { args: ['agttm', 'wrkrnothm'] },
  },
  // health insurance coverage
  {
    variable: 'cni1864_2',
    specialType: 'noPercentOnly',
  },
  {
    variable: 'cvlf18t64',
    specialType: 'noPercentOnly',
  },
];
