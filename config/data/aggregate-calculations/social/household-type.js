module.exports = {
  options: {
    filter: 'noPercent',
  },
  variables: [
    {
      name: 'avghhsz',
      type: 'mean',
      args: { universe: 'hh1', aggSum: 'hhpop' },
    },
    {
      name: 'avgfmsz',
      type: 'mean',
      args: { universe: 'fam1', aggSum: 'popinfms' },
    },
  ],
};
