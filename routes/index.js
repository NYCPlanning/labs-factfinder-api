const express = require('express');
const search = require('./search');
const selection = require('./selection');

const router = express.Router();

router.use('/search', search);
router.use('/selection', selection);

module.exports = router;
