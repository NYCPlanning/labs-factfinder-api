const express = require('express');
const doittTiles = require('../utils/doitt-tiles');

const router = express.Router();

router.get('/dtm/:z/:x/:y.png', (req, res) => {
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
