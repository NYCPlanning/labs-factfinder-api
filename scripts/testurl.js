const xmin = 700000.0;
const ymin = 440000;
const resolution = 13.888888923884513;

const xmax = xmin + (resolution * 512);
const ymax = ymin + (resolution * 512);

const url = `http://maps1.nyc.gov/geowebcache/service/wms/?service=WMS&request=GetMap&version=1.1.1&format=image/png&layers=dtm&srs=EPSG:2263&width=512&height=512&bbox=${xmin},${ymin},${xmax},${ymax}`;

console.log(url)
