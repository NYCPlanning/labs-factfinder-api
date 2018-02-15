const rp = require('request-promise');

const cartoDomain = 'planninglabs.carto.com';

const buildTemplate = (layergroupid, type) => { // eslint-disable-line
  return `https://${cartoDomain}/api/v1/map/${layergroupid}/{z}/{x}/{y}.${type}`;
};

const buildSqlUrl = (cleanedQuery, format = 'json', method) => { // eslint-disable-line
  let url = `https://${cartoDomain}/api/v2/sql`;
  url += method === 'get' ? `?q=${cleanedQuery}&format=${format}` : '';
  return url;
};

const Carto = {
  SQL(query, format = 'json', method = 'get') {
    const cleanedQuery = query.replace('\n', '');
    const uri = buildSqlUrl(cleanedQuery, format, method);

    let fetchOptions = {
      uri,
    };

    if (method === 'post') {
      fetchOptions = {
        uri,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `q=${cleanedQuery}&format=${format}`,
      };
    }

    return rp(fetchOptions)
      .then((response) => {
        const obj = JSON.parse(response);
        if (obj.error) console.log('SQL error ', obj.error);
        return obj.rows ? obj.rows : obj;
      })
      .catch((reason) => {
        console.log(reason);
      });
  },
};

module.exports = Carto;
