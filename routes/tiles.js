const express = require('express');
const rp = require('request-promise');
const SphericalMercator = require('sphericalmercator');
const proj4 = require('proj4');
const mergeImages = require('merge-images');
const Canvas = require('canvas');
const Jimp = require('jimp');

const merc = new SphericalMercator({
  size: 512,
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


const epsg2263 = '+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs';
const router = express.Router();

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
  for (let i = bounds[3]; i > bounds[1]; i -= zoomResolution * 512) {
    const max = i;
    const min = i - (zoomResolution * 512);
    if ((y >= min) && (y < max)) {
      tileBounds.ymin = min;
      tileBounds.ymax = max;
      break;
    }
  }

  return tileBounds;
}

function bboxDifferent(a, b) {
  return (JSON.stringify(a) !== JSON.stringify(b));
}

function getAllTileBounds(bbox, zoomResolution) {
  // start with nw
  // wsen 0123
  const allTileBounds = {};
  const nw = getTileBounds(bbox[0], bbox[3], zoomResolution);
  allTileBounds.nw = nw;

  const ne = getTileBounds(bbox[2], bbox[3], zoomResolution);
  if (bboxDifferent(ne, nw)) allTileBounds.ne = ne;

  const sw = getTileBounds(bbox[0], bbox[1], zoomResolution);
  if (bboxDifferent(sw, nw)) allTileBounds.sw = sw;

  const se = getTileBounds(bbox[2], bbox[1], zoomResolution);
  if (allTileBounds.ne && allTileBounds.sw) allTileBounds.se = se;

  return allTileBounds;
}

router.get('/dtm/:z/:x/:y.png', (req, res) => {
  const { z, x, y } = req.params;

  const mercbbox = merc.bbox(x, y, z, false); // [w, s, e, n]


  const ws = proj4(epsg2263, [mercbbox[0], mercbbox[1]]);
  const en = proj4(epsg2263, [mercbbox[2], mercbbox[3]]);

  const bbox = [
    ws[0], ws[1], en[0], en[1],
  ];

  console.log(mercbbox, bbox);


  const widthInFeet = en[0] - ws[0];
  const feetPerPixel = widthInFeet / 256;

  // get the first resolution that is higher than that needed by this tile
  const zoomResolution = resolutions.reduce((acc, cur) => { // eslint-disable-line
    return (acc < feetPerPixel) ? acc : cur;
  });

  console.log('next highest res', zoomResolution);

  const allTileBounds = getAllTileBounds(bbox, zoomResolution);

  console.log(allTileBounds);

  const imagePromises = [];
  const imageIds = [];

  Object.keys(allTileBounds).forEach((key) => {
    const tileBounds = allTileBounds[key];
    const tilebbox = `${tileBounds.xmin},${tileBounds.ymin},${tileBounds.xmax},${tileBounds.ymax}`;
    const tileURL = `http://maps1.nyc.gov/geowebcache/service/wms/?service=WMS&request=GetMap&version=1.1.1&format=image/png&layers=dtm&srs=EPSG:2263&width=512&height=512&bbox=${tilebbox}`;
    console.log(tileURL)

    imagePromises.push(rp({ url: tileURL, encoding: null }));
    imageIds.push(key);
  });

  Promise.all(imagePromises).then((imgBuffers) => {
    const images = imgBuffers.map((buffer, i) => {
      const id = imageIds[i];

      // const img = new Canvas.Image();
      // img.onerror = err => console.log(err);
      // img.onload = () => console.log('success');
      // img.src = ;
      return {
        src: new Buffer(buffer, 'binary'),
        x: (id === 'nw' || id === 'sw') ? 0 : 512,
        y: (id === 'nw' || id === 'ne') ? 0 : 512,
      };
    });

    // console.log(images)

    mergeImages(images, {
      Canvas,
      width: (allTileBounds.ne || allTileBounds.se) ? 1024 : 512,
      height: (allTileBounds.sw || allTileBounds.se) ? 1024 : 512,
    })
      .then((b64) => {
        const im = b64.split(',')[1];
        const buf = Buffer.from(im, 'base64');

        Jimp.read(buf, (err, image) => {
          console.log(err)
          // crop by bounds of the tile we want
          // x, y of nw corner, 256, 256

            const cropX = (bbox[0] - allTileBounds.nw.xmin) / zoomResolution;
            const offset = ((bbox[2] - allTileBounds.nw.xmin) / zoomResolution) - cropX;
            const cropY = 512 - ((bbox[3] - allTileBounds.nw.ymin) / zoomResolution);
          console.log('x', cropX, 'y', cropY, 'offset', offset)

          image.crop(cropX, cropY, offset, offset);

          image.getBuffer(Jimp.MIME_PNG, (err, resImage) => {
            res.writeHead(200, {
              'Content-Type': 'image/png',
              'Content-Length': resImage.length,
            });
            res.end(resImage);
          });
        });
      });
  });
  // res.send(images);
});


module.exports = router;
