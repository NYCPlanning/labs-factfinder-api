exports.up = (pgm) => {
  pgm.addColumns('factfinder_metadata', {
    sort_order: {
      type: 'integer',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('factfinder_metadata', ['sort_order']);
};
