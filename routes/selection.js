const express = require('express');
const sha1 = require('sha1');
const carto = require('../utils/carto');
const getGeotypeFromIdPrefix = require('../utils/geotype-from-id-prefix');

const Selection = require('../models/selection');
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

router.get('/:id', (req, res) => {
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
    Selection.findOne({ _id: selectionId })
      .then((match) => {
        if (match) {
          const { type, geoids } = match;

          getFeatures(type, geoids)
            .then((features) => {
              res.send({
                status: 'success',
                id: _id,
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
      })
      .catch((err) => {
        res.status(500).send({
          status: `error: ${err}`,
        });
      });
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


router.post('/', (req, res) => {
  const { body } = req;
  const { type, geoids } = body;

  body.geoids.sort();

  const hash = sha1(JSON.stringify(body));

  const selection = new Selection({
    type,
    geoids,
    hash,
  });

  // lookup hash in db
  Selection.findOne({ hash })
    .then((match) => {
      if (match) {
        const { _id } = match;
        res.send({
          status: 'existing selection found',
          id: `SID_${_id}`,
        });
      } else {
        selection.save()
          .then(({ _id }) => {
            res.send({
              status: 'new selection saved',
              id: `SID_${_id}`,
              hash,
            });
          })
          .catch(((err) => {
            res.status(500).send({
              status: `error: ${err}`,
            });
          }));
      }
    })
    .catch((err) => {
      res.status(500).send({
        status: `error: ${err}`,
      });
    });
});

module.exports = router;
