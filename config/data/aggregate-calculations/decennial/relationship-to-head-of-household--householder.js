module.exports = {
  options: {
    filter: 'sumOnly',
  },
  variables: [
    {
      name: 'avghhsz',
      type: 'mean',
      args: { aggSum: 'popinhh', universe: 'hh1' },
    },
    {
      name: 'avgfamsz',
      type: 'mean',
      args: { aggSum: 'popinfam', universe: 'fam1' },
    },
  ],
};
