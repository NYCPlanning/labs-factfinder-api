module.exports = [
  {
    variable: 'mdhhinc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { specialType: 'inflate' } },
  },
  {
    variable: 'mnhhinc',
    specialType: 'mean',
    options: { args: ['hh2', 'aghhinc'] },
  },
  {
    variable: 'mdfaminc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { specialType: 'inflate' } },
  },
  {
    variable: 'mdnfinc',
    specialType: 'median',
    options: { designFactor: 1.5, transform: { specialType: 'inflate' } },
  },
  {
    variable: 'percapinc',
    specialType: 'mean',
    options: { args: ['pop_6', 'agip15pl'] },
  },
];
