const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const { app } = req;

  const geoOptions = await app.db.query('SELECT geoid, geotype, label, typelabel FROM support_geoids');

  return res.send(geoOptions);
});

module.exports = router;
