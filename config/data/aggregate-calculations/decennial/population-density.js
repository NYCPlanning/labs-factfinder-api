module.exports = {
  options: {
    filter: 'sumOnly',
  },
  variables: [
    {
      name: 'popperacre', 
      type: 'mean',
      args: { universe: 'landacres', aggSum: 'pop1',
    },
  ],
};
