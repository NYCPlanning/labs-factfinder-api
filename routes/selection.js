const express = require('express');
const sha1 = require('sha1');

const Selection = require('../models/selection');

const router = express.Router();

router.get('/:hash', (req, res) => {
  const { hash } = req.params;
  Selection.findOne({ hash })
    .then((match) => {
      const { type, geoids } = match;
      res.send({
        type,
        geoids,
      });
    });
});


router.post('/', (req, res) => {
  const { body } = req;
  const { type, geoids } = body;

  body.geoids.sort();

  const hash = sha1(JSON.stringify(body)).substring(0, 8);
  const selection = new Selection({
    type,
    geoids,
    hash,
  });

  // lookup hash in db
  Selection.findOne({ hash })
    .then((match) => {
      if (match) {
        res.send({
          status: 'existing selection found',
          hash,
        });
      } else {
        selection.save()
          .then(() => {
            res.send({
              status: 'new selection saved',
              hash,
            });
          })
          .catch(((err) => {
            res.send({
              status: `error: ${err}`,
            });
          }));
      }
    });
});

module.exports = router;

// hash submission => check to see if hash already exists in database =>
// if it does, return looked up hash, if not return new hash
