const carto = require('../utils/carto');

const pumaHelper = (string) => {
  const SQL = `
    SELECT DISTINCT on (a.puma)
      a.the_geom,
      a.puma,
      a.puma as geolabel,
      a.puma as geoid,
      b.puma_name,
      b.puma_roughcd_equiv
    FROM nyc_puma a
    LEFT JOIN support_census_crosswalk b
      ON a.puma = b.puma
    WHERE a.puma LIKE '%25${string}%25'
      OR LOWER(b.puma_name) LIKE LOWER('%25${string}%25')
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { puma, puma_name, puma_roughcd_equiv } = feature.properties;
      return {
        label: `PUMA ${puma} - ${puma_name} (Equivalent to ${puma_roughcd_equiv})`,
        feature,
        type: 'puma',
      };
    });
  });
};

module.exports = pumaHelper;
