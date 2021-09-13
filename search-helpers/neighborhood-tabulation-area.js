const carto = require('../utils/carto');

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function format(ntaname) {
  const nabes = ntaname.split('-');
  const titleNabes = nabes.map(nabe => toTitleCase(nabe));
  return titleNabes.join(', ');
}

const neighborhood = (string) => {
  const SQL = `
    SELECT
      the_geom,
      ntaname,
      nta2020,
      nta2020 as geolabel,
      nta2020 as geoid
    FROM pff_2020_ntas_21c
    WHERE
      (
        LOWER(ntaname) LIKE LOWER('%25${string}%25')
        AND ntaname NOT ILIKE 'park-cemetery-etc%25'
      )
      OR LOWER(nta2020) LIKE LOWER('%25${string}%25')
    LIMIT 5
  `;

  return carto.SQL(SQL, 'geojson').then((FeatureCollection) => { // eslint-disable-line
    return FeatureCollection.features.map((feature) => {
      const { nta2020, ntaname } = feature.properties;
      return {
        label: `${nta2020} - ${format(ntaname)}`,
        feature,
        type: 'nta',
      };
    });
  });
};

module.exports = neighborhood;
