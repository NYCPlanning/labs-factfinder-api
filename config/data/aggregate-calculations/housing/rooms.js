const mdrms = [
  ['rms1', [0, 1499]],
  ['rms2', [1500, 2499]],
  ['rms3', [2500, 3499]],
  ['rms4', [3500, 4499]],
  ['rms5', [4500, 5499]],
  ['rms6', [5500, 6499]],
  ['rms7', [6500, 7499]],
  ['rms8', [7500, 8499]],
  ['rms9pl', [8500, 9000]],
];



module.exports = {
  options: {
    bins: mdrms,
    transform: { type: 'scale', args: { factor: 0.001, applyTo: ['sum', 'm'] } },
  },
  variables: [
    { name: 'mdrms', type: 'median' },
    
  ],
}
