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
    type: 'median',
    options: { designFactor: 1.6, transform: { type: INFLATE } },
  },
  {
    variable: 'mdemftwrk',
    type: 'median',
    options: { designFactor: 1.6, transform: { type: INFLATE } },
  },
  {
    variable: 'mdefftwrk',
    type: 'median',
    options: { designFactor: 1.6, transform: { type: INFLATE } },
  },
  // commute to work
  {
    variable: 'mntrvtm',
    type: 'mean',
    options: { args: ['agttm', 'wrkrnothm'] },
  },
];
