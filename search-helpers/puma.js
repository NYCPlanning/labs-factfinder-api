const carto = require('../utils/carto');

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
