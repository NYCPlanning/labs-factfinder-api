const carto = require('../utils/carto');

const block = (string) => {
  const SQL = `
    SELECT * FROM (
      SELECT
        the_geom,
        ct2020,
        borocode || ct2020 AS boroct2020,
        cb2020,
        boroname,
        borocode,
        bctcb2020,
        geoid AS geoid,
        bctcb2020 as geolabel,
        '36' ||
          CASE
            WHEN borocode = '1' THEN '061'
            WHEN borocode = '2' THEN '005'
            WHEN borocode = '3' THEN '047'
            WHEN borocode = '4' THEN '081'
            WHEN borocode = '5' THEN '085'
          END
        || ct2020 || cb2020 as fips
      FROM pff_2020_census_blocks_21c
    ) x
    WHERE
      bctcb2020 LIKE '%25${string}%25'
      OR fips LIKE '%25${string}%25'
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const {
        boroname,
        geolabel,
        cb2020,
        fips,
      } = feature.properties;

      return {
        label: `${boroname} Tract ${geolabel} Block ${cb2020} (${fips})`,
        feature,
        type: 'block',
      };
    });
  });
};

module.exports = block;
