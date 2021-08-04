function getGeotypeFromIdPrefix(idPrefix) {
  switch (idPrefix) {
    case 'SID':
        return 'selection';
    case 'NTA':
        return 'ntas';
    case 'TRACT':
        return 'tracts';
    case 'CDTA':
        return 'cdtas';
    case 'DIST':
        return 'districts';
    case 'BLOCK':
        return 'blocks';
    case 'BORO':
        return 'boroughs';
    default:
      return null;
  }
}

module.exports = getGeotypeFromIdPrefix;
