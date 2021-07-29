const express = require('express');
const sha1 = require('sha1');
const carto = require('../utils/carto');

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

  _id = convertBoroughLabelToCode(_id);

  if (_id.slice(0,3) === 'SID') {
    const selectionId = _id.slice(3);

    Selection.findOne({ _id: selectionId })
      .then((match) => {
        if (match) {
          const { type, geoids, _id: id } = match;

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
      })
      .catch((err) => {
        res.send({
          status: `error: ${err}`,
        });
      });
    } else  {
      const geoidFilter = {
        geoids: [ _id ]
      }

      Selection.findOne(geoidFilter)
        .then((match) => {
          if (match) {
            const { type, geoids, _id: id } = match;

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
        })
        .catch((err) => {
          res.send({
            status: `error: ${err}`,
          });
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
        const { _id: id } = match;
        res.send({
          status: 'existing selection found',
          id,
        });
      } else {
        selection.save()
          .then(({ _id: id }) => {
            res.send({
              status: 'new selection saved',
              id,
              hash,
            });
          })
          .catch(((err) => {
            res.send({
              status: `error: ${err}`,
            });
          }));
      }
    })
    .catch((err) => {
      res.send({
        status: `error: ${err}`,
      });
    });
});

module.exports = router;
