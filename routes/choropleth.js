const express = require('express');
const ntas = require('../data/ntas.json');

const router = express.Router();

router.get('/', (req, res) => {
  const { app } = req;

  const SQL = `
    SELECT
      popu181.geoid as ntacode,
      popu181,
      pop65pl1,
      ea_bchdh,
      ea_bchdh_p,
      fb1_p,
      lgoenlep,
      pbwpv,
      pbwpv_p,
      mdgr,
      popperacre
    FROM (
        SELECT geoid, e as popu181 FROM demographic
        WHERE dataset = 'Y2012-2016' AND variable = 'PopU181' AND geotype = 'NTA2010'
      ) popu181

      LEFT JOIN (
        SELECT geoid, e as pop65pl1 FROM demographic
        WHERE dataset = 'Y2012-2016' AND variable = 'Pop65pl1' AND geotype = 'NTA2010'
      ) pop65pl1 on popu181.geoid = pop65pl1.geoid

      LEFT JOIN (
        SELECT geoid, e as ea_bchdh FROM social
        WHERE dataset = 'Y2012-2016' AND variable = 'EA_BchDH' AND geotype = 'NTA2010'
      ) ea_bchdh on popu181.geoid = ea_bchdh.geoid

      LEFT JOIN (
        SELECT geoid, p as ea_bchdh_p FROM social
        WHERE dataset = 'Y2012-2016' AND variable = 'EA_BchDH' AND geotype = 'NTA2010'
      ) ea_bchdh_p on popu181.geoid = ea_bchdh_p.geoid

      LEFT JOIN (
        SELECT geoid, p as fb1_p FROM social
        WHERE dataset = 'Y2012-2016' AND variable = 'Fb1' AND geotype = 'NTA2010'
      ) fb1_p on popu181.geoid = fb1_p.geoid

      LEFT JOIN (
        SELECT geoid, e as lgoenlep FROM social
        WHERE dataset = 'Y2012-2016' AND variable = 'LgOEnLEP1' AND geotype = 'NTA2010'
      ) lgoenlep on popu181.geoid = lgoenlep.geoid

      LEFT JOIN (
        SELECT geoid, e as pbwpv FROM economic
        WHERE dataset = 'Y2012-2016' AND variable = 'PBwPv' AND geotype = 'NTA2010'
      ) pbwpv on popu181.geoid = pbwpv.geoid

      LEFT JOIN (
        SELECT geoid, p as pbwpv_p FROM economic
        WHERE dataset = 'Y2012-2016' AND variable = 'PBwPv' AND geotype = 'NTA2010'
      ) pbwpv_p on popu181.geoid = pbwpv_p.geoid

      LEFT JOIN (
        SELECT geoid, e as mdgr FROM housing
        WHERE dataset = 'Y2012-2016' AND variable = 'MdGR' AND geotype = 'NTA2010'
      ) mdgr on popu181.geoid = mdgr.geoid

      LEFT JOIN (
        SELECT geoid, value as popperacre FROM decennial
        WHERE year = '2010' AND variable = 'PopPerAcre' AND geoid ~ '[A-Z]{2}[0-9]{2}'
      ) population_density on popu181.geoid = population_density.geoid
  `;

  app.query(SQL)
    .then((data) => {
      // join ntas geojson with properties from postgresql
      ntas.features.forEach((feature) => {
        const { geoid } = feature.properties;
        const row = data.find(d => d.ntacode === geoid);
        Object.assign(feature.properties, row);
      });

      res.send(ntas);
    })
    .catch((error) => { res.status(500).send({ error }); });
});

module.exports = router;
