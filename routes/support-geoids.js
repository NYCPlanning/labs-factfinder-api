const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const { app } = req;
  const supportGeoids = await app.db.query('SELECT geoid, geotype, label, typelabel FROM support_geoids');
  return res.send({ supportGeoids });
});

module.exports = router;
