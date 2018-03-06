const expect  = require('chai').expect;
const request = require('request');

const dotenv = require('dotenv');
dotenv.load();

const app = require('../app');

app.listen(8080);

it('get a response', function(done) {
  request('http://localhost:8080/profile/1/demographic?compare=0' , function(error, response, body) {
    const [json] = JSON.parse(body);
    expect(response.statusCode).to.equal(200);
    done();
  });
});

describe('Special variables', function() {
  it('top-bottom codes variables correctly', function(done) {
    request('http://localhost:8080/profile/726/economic?compare=0' , function(error, response, body) {
      const medianFamInc = JSON.parse(body).find(obj => {
        return obj.variable === 'mdfaminc' && obj.dataset === 'y2012_2016';
      });
      expect(Object.keys(medianFamInc.codingThresholds).length).to.equal(2);
      done();
    });
  })
});
