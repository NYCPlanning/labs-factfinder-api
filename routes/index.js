const express = require('express');
const search = require('./search');
const selection = require('./selection');
const profile = require('./profile');
const choropleth = require('./choropleth');

const router = express.Router();

router.use('/search', search);
router.use('/selection', selection);
router.use('/profile', profile);
router.use('/choropleth', choropleth);

module.exports = router;
