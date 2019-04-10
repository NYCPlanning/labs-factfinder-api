module.export = [
  // housing-occupancy
  {
    variable: 'hmownrvcrt',
    type: 'mean',
    options: { args: ['vhufslo', 'oochu1'], formulaName: { sum: 'ratio' } },
  },
  {
    variable: 'rntvcrt',
    type: 'mean',
    options: { args: ['vhufrnt', 'rochu3'], formulaName: { sum: 'ratio' } },
  },
  // housing tenure
  {
    variable: 'avhhszooc',
    type: 'mean',
    options: { args: ['popoochu', 'oochu'] },
  },
  {
    variable: 'avhhszroc',
    type: 'mean',
    options: { args: ['poprochu', 'rochu_1'] },
  },
  // population density
  {
    variable: 'popperacre',
    type: 'mean',
    options: { args: ['pop1', 'landacres'] },
  },
  // relationship to head of household (householder)
  {
    variable: 'avghhsz',
    type: 'mean',
    options: { args: ['popinhh', 'hh1'] },
  },
  {
    variable: 'avgfamsz',
    type: 'mean',
    options: { args: ['popinfam', 'fam1'] },
  },
  // sex and age
  {
    variable: 'mdage',
    type: 'median',
    options: {},
  },
];
