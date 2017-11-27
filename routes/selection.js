const express = require('express');
const sha1 = require('sha1');

const Selection = require('../models/selection');

const router = express.Router();

router.get('/:id', (req, res) => {
  const { id: _id } = req.params;
  Selection.findOne({ _id })
    .then((match) => {
      if (match) {
        const { type, geoids, _id: id } = match;
        res.send({
          status: 'success',
          id,
          type,
          geoids,
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

// hash submission => check to see if hash already exists in database =>
// if it does, return looked up hash, if not return new hash
