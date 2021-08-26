const carto = require('../utils/carto');

const district = (string) => {
  const SQL = `
    SELECT * FROM (
      SELECT
        the_geom,
        CAST(borocd AS varchar) AS geolabel,
        borocd AS geoid
      FROM nycd2020
    ) x
    WHERE
      geolabel LIKE '%25${string}%25'
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { geolabel } = feature.properties;
      return {
        label: `${geolabel}`,
        feature,
        type: 'district',
      };
    });
  });
};

module.exports = district;
