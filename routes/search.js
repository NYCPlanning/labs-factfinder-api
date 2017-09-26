const express = require('express');

const mapzen = require('../search-helpers/mapzen');
const neighborhoods = require('../search-helpers/neighborhood');
const pluto = require('../search-helpers/pluto');
const zoningMapAmendment = require('../search-helpers/zoning-map-amendment');

const router = express.Router();

router.get('/', (req, res) => {
  const { q } = req.query;

  Promise.all([
    mapzen(q),
    neighborhoods(q),
    pluto(q),
    zoningMapAmendment(q),
  ])
    .then((values) => {
      const [addresses, neighborhoods, lots, zmas] = values;
      const responseArray = [];
      res.json(responseArray.concat(addresses, neighborhoods, lots, zmas));
    }).catch((reason) => {
      console.error(reason); // eslint-disable-line
    });
});

module.exports = router;
