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

function convertBoroughLabelToCode(potentialBoroughLabel) {
  switch (potentialBoroughLabel) {
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

router.get('/:geotype/:geoid', async (req, res) => {
  const { app } = req;
  let { geotype, geoid } = req.params;

  if (geotype === null) {
    res.status(500).send({
      status: `error: Invalid ID`,
    });
  }

  if (geotype === 'boroughs') {
    geoid = convertBoroughLabelToCode(geoid);
  }

  if (geotype === 'cities') {
    switch (geoid) {
      case 'NYC':
        geoid = '0';
      case 'New%20York%20City':
        geoid = '0';
      case 'New York City':
        geoid = '0';
      case '0':
        break;
      default:
        res.status(500).send({
          status: `error: Invalid ID`,
        });
    }
  }

  if (geotype === 'selection') {
    try {
      const selection =  await app.db.query('SELECT * FROM selection WHERE hash = ${geoid}', { geoid });

      if (selection && selection.length > 0) {
        const {
          geotype: selectionGeotype,
          geoids: selectionGeoids
        } = selection[0];

        getFeatures(selectionGeotype, selectionGeoids)
          .then((features) => {
            res.send({
              status: 'success',
              id: geoid,
              type: selectionGeotype,
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
        status:  [`Failed to find selection for hash ${geoid}. ${e}`],
      });
    }
  } else {
    getFeatures(geotype, [ geoid ])
      .then((features) => {
        res.send({
          status: 'success',
          id: geoid,
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

  body.geoids.sort();

  const {
    geotype,
    geoids
  } = body;

  const hash = sha1(JSON.stringify(body));

  let selection = null;

  // lookup hash in db
  try {
    selection = await app.db.query('SELECT * FROM selection WHERE hash = ${hash}', { hash });

    if (selection && selection.length > 0) {
      const { hash } = selection[0];

      res.send({
        status: 'existing selection found',
        id: hash,
      });
    } else {
      try {
        await app.db.tx(t => t.none(
          'INSERT INTO selection(geotype, geoids, hash) VALUES(${geotype}, ${geoids}, ${hash})',
          { geotype, geoids, hash },
        ));

        try {
          selection = await app.db.query('SELECT * FROM selection WHERE hash = ${hash}', { hash })

          if (selection && selection.length > 0) {
            const { hash } = selection[0];

            res.send({
              status: 'New Selection saved',
              id: hash,
              hash,
            });
          } else {
            res.status(500).send({
              status:  [`Failed to find newly inserted selection for new hash ${hash}. ${e}`],
            });
          }
        } catch (e) {
          res.status(500).send({
            status:  [`Error finding newly inserted selection for new hash ${hash}: ${e}`],
          });
        }
      } catch (e) { // on INSERT new Selection error
        res.status(500).send({
          status:  [`Error creating new selection for geoids ${geoids}: ${e}`],
        });
      }
    }
  } catch (e) {
    res.status(500).send({
      status:  [`Error checking for existing selection from geoids ${geoids}. ${e}`],
    });
  }
});

module.exports = router;
