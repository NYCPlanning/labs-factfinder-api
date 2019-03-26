const mdage = [
  ['popu5', [0, 5]],
  ['pop5t9', [5, 9]],
  ['pop10t14', [10, 14]],
  ['pop15t19', [15, 19]],
  ['pop20t24', [20, 24]],
  ['pop25t29', [25, 29]],
  ['pop30t34', [30, 34]],
  ['pop35t39', [35, 39]],
  ['pop40t44', [40, 44]],
  ['pop45t49', [45, 49]],
  ['pop50t54', [50, 54]],
  ['pop55t59', [55, 59]],
  ['pop60t64', [60, 64]],
  ['pop65t69', [65, 69]],
  ['pop70t74', [70, 74]],
  ['pop75t79', [75, 79]],
  ['pop80t84', [80, 84]],
  ['pop85pl', [85, 115]],
];

module.exports = {
  options: {
    filter: 'sumOnly',
    bins: { mdage }
  },
  variables: [
    { name: 'mdage', type: 'median' }
  ],
};
