exports.up = (pgm) => {
  // acs
  ['demographic', 'social', 'economic', 'housing']
    .forEach((profileName) => {
      pgm.createTable(profileName, {
        geotype: { type: 'text' },
        geogname: { type: 'text' },
        geoid: { type: 'text' },
        dataset: { type: 'text' },
        variable: { type: 'text' },
        c: { type: 'double precision' },
        e: { type: 'double precision' },
        m: { type: 'double precision' },
        p: { type: 'double precision' },
        z: { type: 'double precision' },
      });

      pgm.createIndex(profileName, 'geoid');
    });

  // decennial
  pgm.createTable('decennial', {
    year: { type: 'text' },
    geoid: { type: 'text' },
    variable: { type: 'text' },
    value: { type: 'double precision' },
  });

  pgm.createIndex('decennial', 'geoid');

  pgm.createTable('factfinder_metadata', {
    variablename: { type: 'text' },
    producttype: { type: 'text' },
    release_year: { type: 'text' },
    profile: { type: 'text' },
    category: { type: 'text' },
    _order: { type: 'text' },
    base: { type: 'text' },
    unittype: { type: 'text' },
    notinprofile: { type: 'text' },
    infltnfctr10to16: { type: 'text' },
  });

  pgm.createTable('decennial_dictionary', {
    variablename: { type: 'text' },
    producttype: { type: 'text' },
    dataset: { type: 'text' },
    profile: { type: 'text' },
    category: { type: 'text' },
    _order: { type: 'text' },
    relation: { type: 'text' },
    unittype: { type: 'text' },
  });
};
