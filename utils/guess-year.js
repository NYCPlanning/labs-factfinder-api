function guessYear(data, foundBins) {
  const [earlySet, laterSet] = foundBins;

  // guess which year it is
  const [firstObject] = Object.keys(data) || [];
  const yearValue = data[firstObject].dataset;
  const thisYear = yearValue.slice(-4);

  if (thisYear === '2016') {
    return laterSet;
  }

  return earlySet;
}

module.exports = guessYear;
