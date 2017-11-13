const express = require('express');

const mapzen = require('../search-helpers/mapzen');
const neighborhoodTabulationArea = require('../search-helpers/neighborhood-tabulation-area');
const puma = require('../search-helpers/puma');

const router = express.Router();

router.get('/', (req, res) => {
  const { q } = req.query;

  Promise.all([
    mapzen(q),
    neighborhoodTabulationArea(q),
    puma(q),
  ])
    .then((values) => {
      const [addresses, ntas, pumas] = values;
      const responseArray = [];
      res.json(responseArray.concat(addresses, ntas, pumas));
    }).catch((reason) => {
      console.error(reason); // eslint-disable-line
    });
});

module.exports = router;
