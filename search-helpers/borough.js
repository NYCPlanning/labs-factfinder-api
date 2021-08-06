const carto = require('../utils/carto');

const borough = (string) => {
  const SQL = `
    SELECT * FROM (
      SELECT
        the_geom,
        boroname as geolabel,
        boroname,
        borocode AS geoid,
      FROM nybb2020
    ) x
    WHERE
      boroname LIKE '%25${string}%25'
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { boroname } = feature.properties;
      return {
        label: `${boroname}`,
        feature,
        type: 'borough',
      };
    });
  });
};

module.exports = borough;
