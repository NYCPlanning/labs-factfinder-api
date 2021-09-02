const decennial = require('./decennial');
const demographic = require('./demographic');
const economic = require('./economic');
const housing = require('./housing');
const social = require('./social');

/*
 * Special calculation configuration for variables requiring special handling. Configuration objects are like:
 * {
 *   variable: 'variablename',
 *   specialType: 'type of special handling required',
 *   options: {},
 * }
 * where:
 * variable name is the lower-cased variable name
 * options is an object containing variable-specific values; it looks different depending on the specialType but may always include:
 *  - transform: an object defining a transformation to apply to the estimate. For more information see DataIngestor.applyTransform().
 *  - noChangePercents: a boolean flag indicating that change_percent and change_percent_m values should not be calculated for this variable
 * special type is one of: ['median', 'mean', 'ratio', 'rate', 'noPercentOnly']
 *  - median: estimate is a median, and is recalculated via `interpolate` util.
 *    MOE is recalculated with `calculate-median-error` util.
 *    options for median values includes:
 *     - designFactor: a constant used in calculating median error
 *  - mean: estimate is a mean, and is recalculated using the `sum` formula. MOE is recalculated using `m` formula.
 *    options for mean values includes:
 *     - args: arguments to be passed to the sum and m formulas in order [aggSum, universe]; expected argument
 *       ordering can be confirmed by looking at the formula definitions in `utils/formulas.js`
 *  - ratio: estimate is a special type of mean calculation, and is recalculated using the `sum_ratio` formula.
 *  - rate: estimate is a special type of mean calculation, and MOE is recalculated using the `m_rate` formula.
 *  - noPercentOnly: estimate is not a special value, and does not need to be recalculated, nor does MOE. However,
 *    like all other special variables, these variables should not have percent or percent_m values calculated.
 */
module.exports = {
  decennial,
  acs: [
    ...demographic,
    ...economic,
    ...housing,
    ...social,
  ]
};
