function medianOfRanges(ranges) {
  const rangeGroups = (() => {
    let upper = 0;

    return ranges.map((range) => {
      const lower = upper;
      upper += range.quantity;

      return { lower, upper };
    });
  })();

  const avg = ranges.map(range => range.quantity).reduce((a, b) => a + b) / 2;

  const medianGroupNum = (() => {
    let groupNum = null;

    rangeGroups.some((group, i) => {
      if (group.lower <= avg && avg <= group.upper) {
        groupNum = i;
        return true;
      }
      return false;
    });

    return groupNum;
  })();

  const medianRange = ranges[medianGroupNum];
  const medianRangeGroup = rangeGroups[medianGroupNum];

  const medianLocation = (
    (avg - medianRangeGroup.lower) / medianRange.quantity
  );

  const medianLocationMultiplier =
    Math.abs(medianRange.bounds.upper - medianRange.bounds.lower) + 1;

  const naturalMedian = medianRange.bounds.lower + (medianLocation * medianLocationMultiplier);

  return naturalMedian;
}

module.exports = medianOfRanges;
