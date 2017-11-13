const carto = require('../utils/carto');

const tract = (string) => {
  const SQL = `
    SELECT
      the_geom,
      ct2010,
      ctlabel as geolabel,
      boroct2010,
      ntacode,
      boroct2010 AS geoid
    FROM nyc_census_tracts_2010
      WHERE
        LOWER(ct2010) LIKE LOWER('%25${string}%25')
      LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map(feature => ({
      label: feature.properties.ct2010,
      feature,
      type: 'tract',
    }));
  });
};

module.exports = tract;
