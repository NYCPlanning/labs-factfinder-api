module.exports = [
  // housing-occupancy
  {
    variable: 'hmownrvcrt',
    specialType: 'mean',
    options: { args: ['vhufslo', 'oochu1'], formulaName: { sum: 'ratio' } },
  },
  {
    variable: 'rntvcrt',
    specialType: 'mean',
    options: { args: ['vhufrnt', 'rochu_3'], formulaName: { sum: 'ratio' } },
  },
  // housing tenure
  {
    variable: 'avhhszooc',
    specialType: 'mean',
    options: { args: ['popoochu', 'oochu'] },
  },
  {
    variable: 'avhhszroc',
    specialType: 'mean',
    options: { args: ['poprochu', 'rochu_1'] },
  },
  // population density
  {
    variable: 'popperacre',
    specialType: 'mean',
    options: { args: ['pop1', 'landacres'] },
  },
  // relationship to head of household (householder)
  {
    variable: 'avghhsz',
    specialType: 'mean',
    options: { args: ['popinhh', 'hh1'] },
  },
  {
    variable: 'avgfamsz',
    specialType: 'mean',
    options: { args: ['popinfam', 'fam1'] },
  },
  // sex and age
  {
    variable: 'mdage',
    specialType: 'median',
    options: {},
  },
];
