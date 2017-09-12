const express = require('express');
const search = require('./search');

const router = express.Router();

router.use('/search', search);

module.exports = router;
