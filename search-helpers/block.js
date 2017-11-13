const carto = require('../utils/carto');

const block = (string) => {
  const SQL = `
    SELECT
      the_geom,
      ct2010,
      borocode || ct2010 AS boroct2010,
      cb2010,
      borocode,
      bctcb2010,
      bctcb2010 AS geoid,
      (ct2010::float / 100)::text || ' - ' || cb2010 as geolabel
    FROM nyc_census_blocks_2010
    WHERE
      LOWER(bctcb2010) LIKE LOWER('%25${string}%25')
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map(feature => ({
      label: feature.properties.bctcb2010,
      feature,
      type: 'block',
    }));
  });
};

module.exports = block;
