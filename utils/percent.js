function percent(row, base) {
  const sum = row.get('sum');
  const baseSum = base.sum;

  if(exists(sum) && exists(base_sum) && base_sum !== 0) {
    row.set('percent', sum / base_sum);
  }
}
