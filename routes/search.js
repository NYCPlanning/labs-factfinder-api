const express = require('express');

const mapzen = require('../search-helpers/mapzen');
const neighborhoodTabulationArea = require('../search-helpers/neighborhood-tabulation-area');

const router = express.Router();

router.get('/', (req, res) => {
  const { q } = req.query;

  Promise.all([
    mapzen(q),
    neighborhoodTabulationArea(q),
  ])
    .then((values) => {
      const [addresses, ntas] = values;
      const responseArray = [];
      res.json(responseArray.concat(addresses, ntas));
    }).catch((reason) => {
      console.error(reason); // eslint-disable-line
    });
});

module.exports = router;
