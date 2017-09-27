const express = require('express');

const mapzen = require('../search-helpers/mapzen');
const neighborhood = require('../search-helpers/neighborhood');
const pluto = require('../search-helpers/pluto');
const zoningDistrict = require('../search-helpers/zoning-district');
const zoningMapAmendment = require('../search-helpers/zoning-map-amendment');

const router = express.Router();

router.get('/', (req, res) => {
  const { q } = req.query;

  Promise.all([
    mapzen(q),
    neighborhood(q),
    pluto(q),
    zoningDistrict(q),
    zoningMapAmendment(q),
  ])
    .then((values) => {
      const [addresses, neighborhoods, lots, zoningDistricts, zmas] = values;
      const responseArray = [];
      res.json(responseArray.concat(addresses, neighborhoods, lots, zoningDistricts, zmas));
    }).catch((reason) => {
      console.error(reason); // eslint-disable-line
    });
});

module.exports = router;
