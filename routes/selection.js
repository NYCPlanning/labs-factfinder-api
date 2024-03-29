const express = require('express');
const sha1 = require('sha1');
const carto = require('../utils/carto');

const summaryLevels = require('../selection-helpers/summary-levels');
const deserializeGeoid = require('../utils/deserialize-geoid');

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

router.get('/:geotype/:geoid', async (req, res) => {
  const { app } = req;
  let { geotype, geoid } = req.params;

  geoid = deserializeGeoid(res, geotype, geoid);

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
      console.error(`Failed to find selection for hash ${geoid}. ${e}`);

      res.status(500).send({
        status:  [`Failed to find selection for hash`],
      });
    }
  } else if (!Object.keys(summaryLevels).includes(geotype)) {
    const message = `${geotype} is not a valid geotype.`;
    console.error(message);
    res.status(400).send({
      status:  [message],
    });
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

router.post('/:geotype', async (req, res) => {
  const { app } = req;
  let { geotype } = req.params;
  let { geoid } = req.body;

  geoid = deserializeGeoid(res, geotype, geoid);

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
            /* eslint-disable-next-line no-console */
            console.log('err', err);
          });
      } else {
        res.status(404).send({
          status: 'not found',
        });
      }
    } catch (e) {
      console.error(`Failed to find selection for hash ${geoid}. ${e}`)

      res.status(500).send({
        status:  [`Failed to find selection`],
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
        /* eslint-disable-next-line  no-console */
        console.error('err', err);
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
          console.error(`Error finding newly inserted selection for new hash ${hash}: ${e}`);

          res.status(500).send({
            status:  [`Error finding newly inserted selection`],
          });
        }
      } catch (e) { // on INSERT new Selection error
        console.error(`Error creating new selection for geoids ${geoids}: ${e}`);

        res.status(500).send({
          status:  [`Error creating new selection`],
        });
      }
    }
  } catch (e) {
    console.error(`Error checking for existing selection from geoids ${geoids}. ${e}`);

    res.status(500).send({
      status:  [`Error checking for existing selection`],
    });
  }
});

module.exports = router;
