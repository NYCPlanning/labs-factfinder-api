const _ = require('lodash');
const d3collection = require('d3-collection');

const { get } = _;
const { nest } = d3collection;

/*
 * add example of how this transforms data. Not obvious or easily readable
 */
function nestProfile(data, method = 'object', ...keyArgs) {
  const keys = keyArgs.length ? keyArgs : ['dataset', 'category', 'variable'];

  return keys
    .reduce(
      (nesting, currentKey) => nesting.key(d => get(d, currentKey)),
      nest(),
    )
    .rollup(d => d[0])[method](data);
}

module.exports = nestProfile;
