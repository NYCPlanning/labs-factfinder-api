const carto = require('../utils/carto');

const tract = (string) => {
  const SQL = `
    SELECT * FROM (
      SELECT
        the_geom,
        ct2020,
        ctlabel as geolabel,
        boroct2020,
        nta2020,
        boroname,
        boroct2020 AS geoid,
        '36' ||
          CASE
            WHEN borocode = '1' THEN '061'
            WHEN borocode = '2' THEN '005'
            WHEN borocode = '3' THEN '047'
            WHEN borocode = '4' THEN '081'
            WHEN borocode = '5' THEN '085'
          END
        || ct2020 as fips,
        boroname || ' ' || ctlabel As boronamect
      FROM nyct2020
    ) x
    WHERE
      boroct2020 LIKE '%25${string}%25'
      OR fips LIKE '%25${string}%25'
      OR LOWER(boronamect) LIKE LOWER('%25${string}%25')

    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { boroname, geolabel, fips } = feature.properties;
      return {
        label: `${boroname} ${geolabel} (${fips})`,
        feature,
        type: 'tract',
      };
    });
  });
};

module.exports = tract;
