const express = require('express');
const request = require('request');
const SphericalMercator = require('sphericalmercator');
const proj4 = require('proj4');

const merc = new SphericalMercator({
  size: 512
});

const epsg2263 = '+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs';

const router = express.Router();

router.get('/dtm/:z/:x/:y.png', (req, res) => {
  const { z, x, y } = req.params;

  const mercbbox = merc.bbox(x, y, z, true); // [w, s, e, n]
  console.log(mercbbox);

  const ws = proj4(epsg2263, [mercbbox[0], mercbbox[1]]);
  const en = proj4(epsg2263, [mercbbox[2], mercbbox[3]]);

  const bbox = `${ws[0]},${ws[1]},${ws[0] + 888.8888888},${ws[1] + 888.8888888}`;

  console.log(bbox);
  const sourceTile = `http://maps1.nyc.gov/geowebcache/service/wms/?service=WMS&request=GetMap&version=1.1.1&format=image/png&layers=dtm&srs=EPSG:2263&width=512&height=512&bbox=${bbox}`;
  console.log(sourceTile);

  request(sourceTile).pipe(res);
});

module.exports = router;
