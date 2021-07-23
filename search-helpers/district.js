const carto = require('../utils/carto');

const district = (string) => {
  const SQL = `
    SELECT * FROM (
      SELECT
        the_geom,
        cd_short_title as geolabel,
        borocd AS geoid,
        '36' ||
          CASE
            WHEN borocode = '1' THEN '061'
            WHEN borocode = '2' THEN '005'
            WHEN borocode = '3' THEN '047'
            WHEN borocode = '4' THEN '081'
            WHEN borocode = '5' THEN '085'
          END
          as fips
      FROM cd_boundaries_v0_dh
    ) x
    WHERE
      geolabel LIKE '%25${string}%25'
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { geolabel, fips } = feature.properties;
      return {
        label: `${geolabel} (${fips})`,
        feature,
        type: 'district',
      };
    });
  });
};

module.exports = district;
