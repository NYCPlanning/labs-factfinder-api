const express = require('express');
const apicache = require('apicache');

const doittTiles = require('../utils/doitt-tiles');

const router = express.Router();
const cache = apicache.middleware


router.get('/dtm/:z/:x/:y.png', cache('10080 minutes'), (req, res) => {
  const { z, x, y } = req.params;
  doittTiles.getTile('dtm', x, y, z, (err, png) => {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': png.length,
    });
    res.end(png);
  });
});

module.exports = router;
