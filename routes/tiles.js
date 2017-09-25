const express = require('express');
const request = require('request');
const SphericalMercator = require('sphericalmercator');
const proj4 = require('proj4');

const merc = new SphericalMercator({
  size: 512
});

const bounds = [
  700000.0,
  -4444.4455643044785,
  1366666.6683464567,
  440000.0,
];

const resolutions = [
  434.0277788713911,
  303.8194452099737,
  222.22222278215222,
  111.11111139107611,
  55.555555695538054,
  27.777777847769027,
  13.888888923884513,
  6.944444461942257,
  3.4722222309711284,
  1.7361111154855642,
  0.8680555577427821,
  0.43402777887139105,
  0.21701388943569552,
  0.10850694471784776,
];


const epsg2263 = '+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs';

const router = express.Router();

router.get('/dtm/:z/:x/:y.png', (req, res) => {
  const { z, x, y } = req.params;

  const mercbbox = merc.bbox(x, y, z, false); // [w, s, e, n]


  const ws = proj4(epsg2263, [mercbbox[0], mercbbox[1]]);
  const en = proj4(epsg2263, [mercbbox[2], mercbbox[3]]);

  const bbox = [
    ws[0], ws[1], en[0], en[1],
  ];

  // console.log(mercbbox, bbox);


  const widthInMeters = en[0] - ws[0];
  const metersPerPixel = widthInMeters / 256;

  // get the first resolution that is higher than that needed by this tile
  const zoomResolution = resolutions.reduce((acc, cur) => { // eslint-disable-line
    return (cur > metersPerPixel) ? cur : acc;
  });

  console.log('next highest res', zoomResolution)

  const tileBounds = getTileBounds(bbox[0], bbox[1], zoomResolution);

  res.send(`X distance: ${widthInMeters}m, ${metersPerPixel} meters/pixel`)

  const tilebbox = `${tileBounds.xmin},${tileBounds.ymin},${tileBounds.xmax},${tileBounds.ymax}`
  const sourceTile = `http://maps1.nyc.gov/geowebcache/service/wms/?service=WMS&request=GetMap&version=1.1.1&format=image/png&layers=dtm&srs=EPSG:2263&width=512&height=512&bbox=${tilebbox}`;

  console.log(sourceTile);

});
function getTileBounds(x, y, zoomResolution) {
  const tileBounds = {};

  // get x bounds
  for (let i = bounds[0]; i < bounds[2]; i += zoomResolution * 512) {
    const min = i;
    const max = i + (zoomResolution * 512);
    if ((x >= min) && (x < max)) {
      tileBounds.xmin = min;
      tileBounds.xmax = max;
      break;
    }
  }

  // get y bounds
  for (let i = bounds[1]; i < bounds[3]; i += zoomResolution * 512) {
    const min = i;
    const max = i + (zoomResolution * 512);
    if ((y >= min) && (y < max)) {
      tileBounds.ymin = min;
      tileBounds.ymax = max;
      break;
    }
  }

  return tileBounds;
}

module.exports = router;
