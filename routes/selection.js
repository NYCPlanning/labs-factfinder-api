const express = require('express');
const sha1 = require('sha1');
const carto = require('../utils/carto');
const getGeotypeFromIdPrefix = require('../utils/geotype-from-id-prefix');

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

function convertBoroughLabelToCode(potentialBoroughLabel) {
  switch (potentialBoroughLabel) {
    case 'NYC':
        return '0';
    case 'Manhattan':
        return '1';
    case 'Bronx':
        return '2';
    case 'Brooklyn':
        return '3';
    case 'Queens':
        return '4';
    case 'StatenIsland':
        return '5';
    default:
      return potentialBoroughLabel;
  }
}

router.get('/:id', async (req, res) => {
  const { app } = req;
  let { id: _id } = req.params;

  let [ idPrefix, selectionId ] = _id.split('_');

  const geotype = getGeotypeFromIdPrefix(idPrefix);

  if (geotype === null) {
    res.send({
      status: `error: Invalid ID`,
    });
  }

  if (geotype === 'boroughs') {
    selectionId = convertBoroughLabelToCode(selectionId);
  }

  if (geotype === 'selection') {
    try {
      const selection =  await app.db.query('SELECT * FROM selection WHERE hash = ${selectionId}', { selectionId });

      if (selection && selection.length > 0) {
        const {
          _type: type,
          geoids
        } = selection[0];

        getFeatures(type, geoids)
          .then((features) => {
            res.send({
              status: 'success',
              id: selectionId,
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
    } catch (e) {
      res.status(500).send({
        status:  [`Failed to find selection for hash ${selectionId}. ${e}`],
      });
    }
  } else {
    getFeatures(geotype, [ selectionId ])
      .then((features) => {
        res.send({
          status: 'success',
          id: _id,
          type: geotype,
          features,
        });
      })
      .catch((err) => {
        console.log('err', err); // eslint-disable-line
      });
  }
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
          id: `SID_${_id}`,
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
            res.status(500).send({
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
