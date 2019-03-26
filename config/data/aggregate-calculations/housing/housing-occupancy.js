module.exports = {
  options: {
    transform: { type: 'scale', args: { factor: 100, applyTo: ['sum', 'm'] } },
  },
  variables: [
    {
      name: 'hovacrt',
      type: 'mean',
      args: { universe: 'hovacu', aggSum: 'vacsale' },
    },
  ],
};
