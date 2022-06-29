const rp = require('request-promise');

const geosearch = (string) => {
  const geoSearchAPI = `https://geosearch.planninglabs.nyc/v2/autocomplete?text=${string}`;

  return rp(geoSearchAPI)
    .then(res => JSON.parse(res))
    .then(json => json.features.filter(feature => feature.properties.borough))
    .then(json => json.map((feature) => {
      const { label } = feature.properties;
      const { coordinates } = feature.geometry;

      return {
        label,
        coordinates,
        type: 'address',
      };
    }))
    .then(json => json.slice(0, 5));
};

module.exports = geosearch;
