const express = require('express');
const search = require('./search');
const tiles = require('./tiles');

const router = express.Router();

router.use('/search', search);
router.use('/tiles', tiles);

module.exports = router;
