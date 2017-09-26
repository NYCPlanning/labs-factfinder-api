const carto = require('../utils/carto');

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const pluto = (string) => {
  const tenDigits = string.match(/^\d{10,14}$/);
  const lotClause = tenDigits ? `OR bbl = ${string}` : '';

  const SQL = `
    SELECT (address || ', ' ||
      CASE
        WHEN borough = 'MN' THEN 'Manhattan'
        WHEN borough = 'BX' THEN 'Bronx'
        WHEN borough = 'BK' THEN 'Brooklyn'
        WHEN borough = 'QN' THEN 'Queens'
        WHEN borough = 'SI' THEN 'Staten Island'
      END) as address, bbl FROM support_mappluto
     WHERE (address LIKE '${string.toUpperCase()}%25')
     ${lotClause}
     LIMIT 5
  `;

  return carto.SQL(SQL).then(rows =>
    rows.map((row) => {
      row.label = toTitleCase(row.address);
      row.type = 'lot';
      delete row.address;
      return row;
    }));
};

module.exports = pluto;
