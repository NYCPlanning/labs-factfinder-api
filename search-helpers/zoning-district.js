const carto = require('../utils/carto');

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const zoningMapAmendment = (string) => {
  const SQL = `
    SELECT DISTINCT zonedist
    FROM support_zoning_zd
    WHERE LOWER(zonedist) LIKE LOWER('%25${string.toLowerCase()}%25')
    LIMIT 5
  `;

  return carto.SQL(SQL).then(rows =>
    rows.map((row) => {
      row.label = row.zonedist;
      row.type = 'zoning-district';
      delete row.zonedist;
      return row;
    }));
};

module.exports = zoningMapAmendment;
