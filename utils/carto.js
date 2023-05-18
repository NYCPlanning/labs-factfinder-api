const axios = require('axios');

const cartoUsername = process.env.CARTO_USERNAME || 'planninglabs';

const cartoDomain = `${cartoUsername}.carto.com`;

const buildSqlUrl = (cleanedQuery, format = 'json', method) => { // eslint-disable-line
  let url = `https://${cartoDomain}/api/v2/sql`;
  url += method === 'get' ? `?q=${cleanedQuery}&format=${format}` : '';
  return url;
};

const Carto = {
  SQL(query, format = 'json', method = 'get') {
    const cleanedQuery = query.replace('\n', '');
    const url = buildSqlUrl(cleanedQuery, format, method);

    let axiosOptions = {
      url,
    };

    if (method === 'post') {
      axiosOptions = {
        url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        data: `q=${cleanedQuery}&format=${format}`,
      };
    }

    return axios(
      axiosOptions,
    ).then((response) => {
      const obj = response.data;
      if (obj.error) console.log('SQL error ', obj.error); // eslint-disable-line
      return obj.rows ? obj.rows : obj;
    })
      .catch((reason) => {
        console.log(reason); // eslint-disable-line
      });
  },
};

module.exports = Carto;
