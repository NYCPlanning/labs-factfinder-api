const carto = require('../utils/carto');

const district = (string) => {
  const SQL = `
    SELECT * FROM (
      SELECT
        the_geom,
        cdtaname as geolabel,
        cdta2020,
        cdtatype,
        boroname,
        cdta2020 AS geoid,
        '36' ||
          CASE
            WHEN borocode = '1' THEN '061'
            WHEN borocode = '2' THEN '005'
            WHEN borocode = '3' THEN '047'
            WHEN borocode = '4' THEN '081'
            WHEN borocode = '5' THEN '085'
          END
        || countyfips as fips,
        boroname || ' '
      FROM nycdta2020
    ) x
    WHERE
      cdta2020 LIKE '%25${string}%25'
      OR fips LIKE '%25${string}%25'
      OR boroname LIKE '%25${string}%25'
      OR geolabel LIKE '%25${string}%25'
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { boroname, geolabel, fips } = feature.properties;
      return {
        label: `${boroname} ${geolabel} (${fips})`,
        feature,
        type: 'district',
      };
    });
  });
};

module.exports = district;
