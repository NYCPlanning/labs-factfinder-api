// @create-index

const classOfWorker = require('./class-of-worker');
const commuteToWork = require('./commute-to-work');
const earnings = require('./earnings');
const employmentStatus = require('./employment-status');
const healthInsuranceCoverage = require('./health-insurance-coverage');
const incomeAndBenefits = require('./income-and-benefits');
const incomeInPast12MonthsIsBelowThePovertyLevel = require('./income_in_past_12_months_is_below_the_poverty_level');
const industry = require('./industry');
const occupation = require('./occupation');
const ratioOfIncomeToPovertyLevel = require('./ratio-of-income-to-poverty-level');

module.exports = {
  classOfWorker,
  commuteToWork,
  earnings,
  employmentStatus,
  healthInsuranceCoverage,
  incomeAndBenefits,
  incomeInPast12MonthsIsBelowThePovertyLevel,
  industry,
  occupation,
  ratioOfIncomeToPovertyLevel,
};
