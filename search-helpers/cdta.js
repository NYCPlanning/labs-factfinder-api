const carto = require('../utils/carto');

const cdta = (string) => {
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
        || countyfips as fips
      FROM pff_2020_cdtas_21c
    ) x
    WHERE
      cdta2020 ILIKE '%25${string}%25'
      OR geolabel ILIKE '%25${string}%25'
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { boroname, geolabel, fips } = feature.properties;
      return {
        label: `${boroname} ${geolabel} (${fips})`,
        feature,
        type: 'cdta',
      };
    });
  });
};

module.exports = cdta;
