const express = require('express');
const { DECENNIAL_LATEST_TABLE_FULL_PATH, ACS_LATEST_TABLE_FULL_PATH } = require('../special-calculations/data/constants');

const router = express.Router();

/*
 * Helper function to calculate totals
 * @param{Object} data - the data to calculate totals with
 * @param{Object} variableNames - the variable names to calculate totals for
 */
function summarizeData(data) {
  var summarizedData = {};
  data.forEach((item) => { summarizedData[item.variable] = item.sum });
  return summarizedData;
}

/*
 * Checks that the summary query parameter is a valid summary type
 * @param{string} summary - The summary type
 * @returns{Boolean}
 */
function isInvalidSummary(summary) {
  const validSummaryNames = ['decennial', 'acs'];
  if (validSummaryNames.includes(summary)) return false;
  return true;
}

router.get('/:summary/:summaryvars/:geoids/', async (req, res) => {
  const { app } = req;

  const { summary, summaryvars, geoids: _geoids } = req.params;

  const varString = "'" + summaryvars.split(',').join("','") + "'";
  const idString = "'" + _geoids.split(',').join("','") + "'";

  if (isInvalidSummary(summary)) res.status(400).send({ error: 'Invalid summary name. Summary must be acs or decennial' });
  const table = (summary === 'decennial') ? DECENNIAL_LATEST_TABLE_FULL_PATH : ACS_LATEST_TABLE_FULL_PATH;
  const valueField = (summary === 'decennial') ? 'value' : 'estimate';

  try {  
    const summaryData = await app.db.query(`SELECT "variable",SUM(${valueField}) FROM ${table} WHERE "geoid" IN (${idString}) and "variable" IN (${varString}) GROUP BY "variable"`);
    const totals = summarizeData(summaryData);
    return res.send({ totals: totals });
  } catch (e) {
    res.status(500).send({
      status:  [`Failed to find selection for summary ${summary}, summaryvars ${varString}, geoids ${idString}. ${e}`],
    });
  }
  
});

router.post('/:summary/:summaryvars', async (req, res) => {
  const { app } = req;
  const geoids = req.body;
  const { summary, summaryvars } = req.params;

  console.log('reqreqreq', req);
  console.log("geoids", geoids, typeof(geoids));

  const varString = "'" + summaryvars.split(',').join("','") + "'";
  const idString = "'" + geoids.join("','") + "'";

  if (isInvalidSummary(summary)) res.status(400).send({ error: 'Invalid summary name. Summary must be acs or decennial' });
  const table = (summary === 'decennial') ? DECENNIAL_LATEST_TABLE_FULL_PATH : ACS_LATEST_TABLE_FULL_PATH;
  const valueField = (summary === 'decennial') ? 'value' : 'estimate';

  try {
    const summaryData = await app.db.query(`SELECT "variable",SUM(${valueField}) FROM ${table} WHERE "geoid" IN (${idString}) and "variable" IN (${varString}) GROUP BY "variable"`);
    const totals = summarizeData(summaryData);
    return res.send({ totals: totals });
  } catch (e) {
    res.status(500).send({
      status:  [`Failed to find selection for summary ${summary}, summaryvars ${varString}, geoids ${idString}. ${e}`],
    });
  }

});

module.exports = router;
