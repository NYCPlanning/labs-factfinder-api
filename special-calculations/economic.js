module.exports = [
  // income and benefits
  {
    variable: 'mdhhinc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { inflate: true } },
  },
  {
    variable: 'mnhhinc',
    specialType: 'mean',
    options: { args: ['aghhinc', 'hh2'], transform: { inflate: true } },
  },
  {
    variable: 'mdfaminc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { inflate: true } },
  },
  {
    variable: 'mdnfinc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { inflate: true } },
  },
  {
    variable: 'percapinc',
    specialType: 'mean',
    options: { args: ['agip15pl', 'pop_6'], transform: { inflate: true } },
  },
  // earnings
  {
    variable: 'mdewrk',
    specialType: 'median',
    options: { designFactor: 1.6, transform: { inflate: true } },
  },
  {
    variable: 'mdemftwrk',
    specialType: 'median',
    options: { designFactor: 1.6, transform: { inflate: true } },
  },
  {
    variable: 'mdefftwrk',
    specialType: 'median',
    options: { designFactor: 1.6, transform: { inflate: true } },
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
    specialType: 'removePercentsOnly',
  },
  {
    variable: 'cvlf18t64',
    specialType: 'removePercentsOnly',
  },
];
