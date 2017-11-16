const carto = require('../utils/carto');

const block = (string) => {
  const SQL = `
    SELECT * FROM (
      SELECT
        the_geom,
        ct2010,
        borocode || ct2010 AS boroct2010,
        cb2010,
        boroname,
        bctcb2010,
        bctcb2010 AS geoid,
        (ct2010::float / 100)::text as ctlabel,
        '36' ||
          CASE
            WHEN borocode = '1' THEN '061'
            WHEN borocode = '2' THEN '005'
            WHEN borocode = '3' THEN '047'
            WHEN borocode = '4' THEN '081'
            WHEN borocode = '5' THEN '085'
          END
        || ct2010 || cb2010 as fips
      FROM nyc_census_blocks_2010
    ) x
    WHERE
      bctcb2010 LIKE '%25${string}%25'
      OR fips LIKE '%25${string}%25'
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const {
        boroname,
        ctlabel,
        cb2010,
        fips,
      } = feature.properties;

      return {
        label: `${boroname} Tract ${ctlabel} Block ${cb2010} (${fips})`,
        feature,
        type: 'block',
      };
    });
  });
};

module.exports = block;
