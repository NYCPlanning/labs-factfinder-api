const mdage = [
  ['mdpop0t4', [0, 4]],
  ['mdpop5t9', [5, 9]],
  ['mdpop10t14', [10, 14]],
  ['mdpop15t17', [15, 17]],
  ['mdpop18t19', [18, 19]],
  ['mdpop20', [20, 20]],
  ['mdpop21', [21, 21]],
  ['mdpop22t24', [22, 24]],
  ['mdpop25t29', [25, 29]],
  ['mdpop30t34', [30, 34]],
  ['mdpop35t39', [35, 39]],
  ['mdpop40t44', [40, 44]],
  ['mdpop45t49', [45, 49]],
  ['mdpop50t54', [50, 54]],
  ['mdpop55t59', [55, 59]],
  ['mdpop60t61', [60, 61]],
  ['mdpop62t64', [62, 64]],
  ['mdpop65t66', [65, 66]],
  ['mdpop67t69', [67, 69]],
  ['mdpop70t74', [70, 74]],
  ['mdpop75t79', [75, 79]],
  ['mdpop80t84', [80, 84]],
  ['mdpop85pl', [85, 115]],
];

module.exports = {
  options: {
    filter: 'noPercent',
    bins: { mdage },
    designFactor: 1.1,
  },
  variables: [
    { name: 'mdage', type: 'median' }
  ],
}
