const express = require('express');
const Selection = require('../models/selection');

const router = express.Router();

router.get('/:selectionid', (req, res) => {
  res.send(`GOT ${req.params.selectionid}`);
});

router.post('/', (req, res) => {
  const { type, geoids } = req.body;

  const selection = new Selection({
    type,
    geoids,
  });

  selection.save((err) => {
    if (err) throw err;

    console.log('Selection saved successfully!');
    res.send('Saved!')
  });
});

module.exports = router;
