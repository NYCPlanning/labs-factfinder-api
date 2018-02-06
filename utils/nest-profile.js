const _ = require('lodash');
const d3collection = require('d3-collection');

const { get } = _;
const { nest } = d3collection;

function nestProfile(data, ...keys) {
  const { length } = keys;
  let allKeys = ['dataset', 'category', 'variable'];

  if (length) {
    allKeys = keys;
  }

  return allKeys
    .reduce(
      (nesting, currentKey) => nesting.key(d => get(d, currentKey)),
      nest(),
    )
    .rollup(d => d[0])
    .object(data);
}

module.exports = nestProfile;
