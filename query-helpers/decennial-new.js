const { DECENNIAL_CUR_YEAR, DECENNIAL_PREV_YEAR } = require('../special-calculations/data/constants');

function stringifyIds(ids) {
  if (Array.isArray(ids)) return `'${ids.join("','")}'`;
  return `'${ids}'`;
}

const censusProfileSQL = (ids, isPrevious = false) => `
SELECT
FROM (
  SELECT 
    ${ids.length} as numGeoids,
    sum(value) as sum,
    relation,
    category,
    variable 
   
  FROM (
    SELECT *
    FROM decennial d
    INNER JOIN decennial_dictionary dd
    ON d.variable = dd.variablename
    WHERE geoid IN (`${stringifyIds(ids)}`)
    
  ) decennial
)
  
`;
