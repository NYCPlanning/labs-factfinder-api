const express = require('express');

const geosearch = require('../search-helpers/geosearch');
const neighborhoodTabulationArea = require('../search-helpers/neighborhood-tabulation-area');
const puma = require('../search-helpers/puma');
const tract = require('../search-helpers/tract');
const block = require('../search-helpers/block');
const district = require('../search-helpers/district');

const router = express.Router();

router.get('/', (req, res) => {
  const { q } = req.query;

  Promise.all([
    geosearch(q),
    neighborhoodTabulationArea(q),
    puma(q),
    tract(q),
    block(q),
    district(q),
  ])
    .then((values) => {
      const [addresses, ntas, pumas, tracts, blocks, districts] = values;
      const responseArray = [];
      res.json(responseArray.concat(addresses, ntas, pumas, tracts, blocks, districts));
    }).catch((reason) => {
      console.error(reason); // eslint-disable-line
    });
});

module.exports = router;
