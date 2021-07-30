const express = require('express');
const sha1 = require('sha1');
const carto = require('../utils/carto');

const summaryLevels = require('../selection-helpers/summary-levels');

const router = express.Router();

const getFeatures = (type, geoids) => {
  const inString = geoids.map(geoid => `'${geoid}'`).join(',');
  const selectionClause = summaryLevels[type](false);
  const SQL = `
    SELECT * FROM (${selectionClause}) normalized
    WHERE geoid in (${inString})`;

  return carto.SQL(SQL, 'geojson', 'post')
    .then(FC => FC.features);
};

router.get('/:id', async (req, res) => {
  const { app, params } = req;
  const { id: _id } = params;
  await app.db.query(
    'SELECT _id as id, _type as type, geoids, hash FROM selection WHERE _id = ${_id}',
    { _id },
  ).then((match) => {
    if (match.length > 0) {
      const { type, geoids, id } = match[0];
      getFeatures(type, geoids)
        .then((features) => {
          res.send({
            status: 'success',
            id,
            type,
            features,
          });
        })
        .catch((err) => {
          console.log('err', err); // eslint-disable-line
        });
    } else {
      res.status(404).send({
        status: 'not found',
      });
    }
  }).catch((err) => {
    res.send({
      status: `error: ${err}`,
    });
  });
});


router.post('/', async (req, res) => {
  const { app, body } = req;
  const { type, geoids } = body;
  body.geoids.sort();

  const hash = sha1(JSON.stringify(body));

  // lookup hash in db
  await app.db.query('SELECT * FROM selection WHERE hash = ${hash}', { hash })
    .then(async (match) => {
      if (match.length > 0) {
        const { _id: id } = match[0];
        res.send({
          status: 'existing selection found',
          id,
        });
      } else {
        await app.db.tx(t => t.none(
          'INSERT INTO selection(_type, geoids, hash) VALUES(${type}, ${geoids}, ${hash})',
          { type, geoids, hash },
        ))
          .then(async () => {
            await app.db.query('SELECT _id as id FROM selection WHERE hash = ${hash}', { hash })
              .then((match) => {
                const { id } = match[0];
                if (match.length > 0) {
                  return res.send({
                    status: 'new selection saved',
                    id,
                    hash,
                  });
                }
              })
              .catch(((err) => {
                res.send({
                  status: `error: ${err}`,
                });
              }));
          })
          .catch(((err) => {
            res.send({
              status: `error: ${err}`,
            });
          }));
      }
    }).catch((err) => {
      res.send({
        status: `error: ${err}`,
      });
    });
});

module.exports = router;
