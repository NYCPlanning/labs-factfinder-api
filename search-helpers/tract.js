const carto = require('../utils/carto');

const tract = (string) => {
  const SQL = `
    SELECT * FROM (
      SELECT
        the_geom,
        ct2010,
        ctlabel as geolabel,
        boroct2010,
        ntacode,
        boroct2010 AS geoid,
        '36' ||
          CASE
            WHEN borocode = '1' THEN '061'
            WHEN borocode = '2' THEN '005'
            WHEN borocode = '3' THEN '047'
            WHEN borocode = '4' THEN '081'
            WHEN borocode = '5' THEN '085'
          END
        || ct2010 as fips
      FROM nyc_census_tracts_2010
    ) x
    WHERE
      ct2010 LIKE '%25${string}%25'
      OR fips LIKE '%25${string}%25'
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
