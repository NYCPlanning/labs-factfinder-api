const express = require('express');
const rp = require('request-promise');
const carto = require('../utils/carto');

const router = express.Router();

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function mapzenSearch(string) {
  const mapzenSearchAPI =
   `https://search.mapzen.com/v1/autocomplete?focus.point.lat=40.7259&focus.point.lon=-73.9805&limit=5&api_key=${process.env.MAPZEN_API_KEY}&boundary.rect.min_lon=-74.292297&boundary.rect.max_lon=-73.618011&boundary.rect.min_lat=40.477248&boundary.rect.max_lat=40.958123&text=${string}`;

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
    }))
    .then(json => json.slice(1, 6));
}

function plutoSearch(string) {
  const SQL = `
    SELECT (address || ', ' ||
      CASE
        WHEN borough = 'MN' THEN 'Manhattan'
        WHEN borough = 'BX' THEN 'Bronx'
        WHEN borough = 'BK' THEN 'Brooklyn'
        WHEN borough = 'QN' THEN 'Queens'
        WHEN borough = 'SI' THEN 'Staten Island'
      END) as address, bbl FROM support_mappluto
     WHERE address LIKE '%25${string.toUpperCase()}%25' LIMIT 5
  `;

  return carto.SQL(SQL).then(rows =>
    rows.map((row) => {
      row.label = toTitleCase(row.address);
      row.type = 'lot';
      delete row.address;
      return row;
    }));
}

function zmaSearch(string) {
  const SQL = `
    SELECT
      project_na,
      ulurpno
    FROM support_nyzma
    WHERE
      project_na LIKE '%25${string.toUpperCase()}%25' OR LOWER(ulurpno) LIKE LOWER('%25${string}%25')
    LIMIT 5
  `;

  return carto.SQL(SQL).then(rows =>
    rows.map((row) => {
      row.label = toTitleCase(row.project_na);
      row.type = 'zma';
      delete row.project_na;
      return row;
    }));
}

router.get('/', (req, res) => {
  const { q } = req.query;

  Promise.all([
    mapzenSearch(q),
    plutoSearch(q),
    zmaSearch(q),
  ])
    .then((values) => {
      const [addresses, lots, zmas] = values;
      const responseArray = [];
      res.json(responseArray.concat(addresses, lots, zmas));
    }).catch((reason) => {
      console.error(reason); // eslint-disable-line
    });
});

module.exports = router;
