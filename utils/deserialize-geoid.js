function convertBoroughLabelToCode(potentialBoroughLabel) {
  switch (potentialBoroughLabel) {
    case 'manhattan':
        return '1';
    case 'bronx':
        return '2';
    case 'brooklyn':
        return '3';
    case 'queens':
        return '4';
    case 'statenisland':
        return '5';
    default:
      return potentialBoroughLabel;
  }
}


function deserializeGeoid(res, geotype, geoid) {
  let lowercaseGeoid = geoid.toLowerCase();

  if (geotype === null) {
    res.status(500).send({
      status: `error: Invalid ID`,
    });
  }

  if (geotype === 'boroughs') {
    return convertBoroughLabelToCode(lowercaseGeoid);
  }

  if (geotype === 'cities') {
    switch (lowercaseGeoid) {
      case 'nyc':
        return '0';
      case 'new%20york%20city':
        return '0';
      case 'new york city':
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
