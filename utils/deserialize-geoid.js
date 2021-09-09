function convertBoroughLabelToCode(potentialBoroughLabel) {
  switch (potentialBoroughLabel) {
    case 'Manhattan':
        return '1';
    case 'Bronx':
        return '2';
    case 'Brooklyn':
        return '3';
    case 'Queens':
        return '4';
    case 'StatenIsland':
        return '5';
    default:
      return potentialBoroughLabel;
  }
}


function deserializeGeoid(res, geotype, geoid) {
  if (geotype === null) {
    res.status(500).send({
      status: `error: Invalid ID`,
    });
  }

  if (geotype === 'boroughs') {
    return convertBoroughLabelToCode(geoid);
  }

  if (geotype === 'cities') {
    switch (geoid) {
      case 'NYC':
        return '0';
      case 'New%20York%20City':
        return '0';
      case 'New York City':
        return '0';
      case '0':
        break;
      default:
        res.status(500).send({
          status: `error: Invalid ID`,
        });
    }
  }
}

module.exports = deserializeGeoid;
