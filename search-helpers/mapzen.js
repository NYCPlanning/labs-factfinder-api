const rp = require('request-promise');

const mapzen = (string) => {
  const mapzenSearchAPI =
   `https://search.mapzen.com/v1/autocomplete?&api_key=${process.env.MAPZEN_API_KEY}&boundary.rect.min_lon=-74.292297&boundary.rect.max_lon=-73.618011&boundary.rect.min_lat=40.477248&boundary.rect.max_lat=40.958123&text=${string}`;

  return rp(mapzenSearchAPI)
    .then(res => JSON.parse(res))
    .then(json => json.features.filter(feature => feature.properties.borough))
    .then(json => json.map((feature) => {
      const { label, neighbourhood } = feature.properties;
      const { coordinates } = feature.geometry;

      return {
        label,
        neighbourhood,
        coordinates,
        type: 'address',
      };
    }))
    .then(json => json.slice(0, 5)); // limit to first 5 results
};

module.exports = mapzen;
