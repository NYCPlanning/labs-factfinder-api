const express = require('express');

const geosearch = require('../search-helpers/geosearch');
const neighborhoodTabulationArea = require('../search-helpers/neighborhood-tabulation-area');
const tract = require('../search-helpers/tract');
const block = require('../search-helpers/block');
const cdta = require('../search-helpers/cdta');
const district = require('../search-helpers/district');
const borough = require('../search-helpers/borough');

const router = express.Router();

router.get('/', (req, res) => {
  const { q } = req.query;

  Promise.all([
    geosearch(q),
    neighborhoodTabulationArea(q),
    tract(q),
    block(q),
    cdta(q),
    district(q),
    borough(q),
  ])
    .then((values) => {
      const [addresses, ntas, tracts, blocks, cdtas, districts, boroughs] = values;
      const responseArray = [];
      res.json(responseArray.concat(addresses, ntas, tracts, blocks, cdtas, districts, boroughs));
    }).catch((reason) => {
      console.error(reason); // eslint-disable-line
    });
});

module.exports = router;
