const carto = require('../utils/carto');

// function toTitleCase(str) {
//   return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
// }
//
// function format(ntaname, string) {
//   const nabes = ntaname.split('-');
//   return toTitleCase(nabes.filter(nabe => nabe.toLowerCase().indexOf(string.toLowerCase()) !== -1)[0]);
// }

const puma = (string) => {
  const SQL = `
    SELECT
      the_geom,
      puma,
      puma as geolabel,
      puma as geoid
    FROM nyc_puma
    WHERE
      LOWER(puma) LIKE LOWER('%25${string}%25')
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map(feature => ({
      label: puma,
      feature,
      type: 'puma',
    }));
  });
};

module.exports = puma;
