module.exports = [
  {
    name: 'mdhhinc',
    type: 'median',
    options: { designFactor: 1.5, transform: { type: 'inflate' } },
  },
  {
    name: 'mnhhinc',
    type: 'mean',
    options: { args: ['hh2', 'aghhinc'] },
  },
  {
    name: 'mdfaminc',
    type: 'median',
    options: { designFactor: 1.5, transform: { type: 'inflate' } },
  },
  {
    name: 'mdnfinc',
    type: 'median',
    options: { designFactor: 1.5, transform: { type: 'inflate' } },
  },
  {
    name: 'percapinc',
    type: 'mean',
    options: { args: ['pop_6', 'agip15pl'] },
  },
];
