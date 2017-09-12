const express = require('express');
const rp = require('request-promise');
const carto = require('../utils/carto');

const router = express.Router();

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function mapzenSearch(string) {
  const mapzenSearchAPI = `https://search.mapzen.com/v1/autocomplete?focus.point.lat=40.7259&focus.point.lon=-73.9805&limit=5&api_key=${process.env.MAPZEN_API_KEY}&text=${string}`;

  return rp(mapzenSearchAPI)
    .then(res => JSON.parse(res))
    .then(json => json.features.map((feature) => {
      const { label, neighbourhood } = feature.properties;
      const { coordinates } = feature.geometry;

      return {
        label,
        neighbourhood,
        coordinates,
        type: 'address',
      };
    }));
}

function plutoSearch(text = '') {
  const SQL = `
    SELECT (address || ', ' ||
      CASE
        WHEN borough = 'MN' THEN 'Manhattan'
        WHEN borough = 'BX' THEN 'Bronx'
        WHEN borough = 'BK' THEN 'Brooklyn'
        WHEN borough = 'QN' THEN 'Queens'
        WHEN borough = 'SI' THEN 'Staten Island'
      END) as address, bbl FROM support_mappluto
     WHERE address LIKE '%25${text.toUpperCase()}%25' LIMIT 5`;

  return carto.SQL(SQL).then(rows =>
    rows.map((row) => {
      row.label = toTitleCase(row.address);
      row.type = 'lot';
      delete row.address;
      return row;
    }));
}

router.get('/', (req, res) => {
  const { q } = req.query;
  const mapzen = mapzenSearch(q);
  const pluto = plutoSearch(q);

  Promise.all([mapzen, pluto])
    .then((values) => {
      const [addresses, lots] = values;
      const responseArray = [];
      res.json(responseArray.concat(addresses, lots));
    }).catch((reason) => {
      console.log(reason);
    });
    // .then((mapzenResults) => {
    //   const obj = JSON.parse(mapzenResults);
    //   res.json(obj);
    // });
});

module.exports = router;
