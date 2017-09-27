const carto = require('../utils/carto');

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function format(ntaname, string) {
  const nabes = ntaname.split('-');
  return toTitleCase(nabes.filter(nabe => nabe.toLowerCase().indexOf(string.toLowerCase()) !== -1)[0]);
}

const neighborhood = (string) => {
  const SQL = `
    SELECT
      ST_Centroid(the_geom) as the_geom,
      ntaname,
      ntacode
    FROM support_admin_ntaboundaries
    WHERE
      LOWER(ntaname) LIKE LOWER('%25${string}%25')
      AND ntaname NOT ILIKE 'park-cemetery-etc%25'
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { geometry, properties } = feature;
      return {
        label: format(properties.ntaname, string),
        coordinates: geometry.coordinates,
        type: 'neighborhood',
      };
    });
  });
};

module.exports = neighborhood;
