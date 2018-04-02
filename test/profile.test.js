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
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'mdfaminc' && obj.dataset === 'y2012_2016';
      });

      // it should have two properties in it, "sum" and "previous_sum"
      // this gets the keys of the thresholds object and counts them
      // to make sure
      expect(Object.keys(rowObject.codingThresholds).length).to.equal(2);
      done();
    });
  });
});

describe('normal variables with complex case logic', function() {
  it('data with 0-estimate current should get pct change calculations: lgfrlep1 change_percentage_point should be calculated', function(done) {
    request('http://localhost:8080/profile/733/social?compare=4104' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'lgfrlep1' && obj.dataset === 'y2012_2016';
      });
      expect(!!rowObject.change_percentage_point).to.equal(true);
      done();
    });
  });

  it('data with 0-estimate previous should get pct change calculations: lgthalep1 change_percentage_point should be calculated', function(done) {
    request('http://localhost:8080/profile/733/social?compare=4104' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'lgthalep1' && obj.dataset === 'y2012_2016';
      });
      expect(!!rowObject.change_percentage_point).to.equal(true);
      done();
    });
  });

  // lgmkhm1
  it('data with at least one non-null percentage point should be calculated: lgmkhm1 difference_percentage should be calculated', function(done) {
    request('http://localhost:8080/profile/733/social?compare=4104' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'lgmkhm1' && obj.dataset === 'y2012_2016';
      });
      expect((rowObject.difference_percentage === null)).to.equal(false);
      done();
    });
  });

  // lgmkhm1
  it('data with at least one non-null percentage point should be calculated: lgmkhm1 difference_percentage should be calculated', function(done) {
    request('http://localhost:8080/profile/843/social?compare=4104' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'lgmkhm1' && obj.dataset === 'y2012_2016';
      });
      expect((rowObject.difference_percentage === null)).to.equal(false);
      done();
    });
  });

  // oscasia
  it('data with both 0 estimates should be percentage point null: oscasia difference_percentage should be calculated', function(done) {
    request('http://localhost:8080/profile/733/social?compare=4104' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'oscasia' && obj.dataset === 'y2012_2016';
      });
      expect(rowObject.previous_sum).to.equal(0);
      expect(rowObject.sum).to.equal(0);
      expect(rowObject.change_percentage_point).to.equal('0.0000');
      done();
    });
  });

  // oscasia, single geog
  it('data with both 0 estimates should be percentage point null: oscasia difference_percentage should be calculated', function(done) {
    request('http://localhost:8080/profile/843/social?compare=4104' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'oscasia' && obj.dataset === 'y2012_2016';
      });
      expect(rowObject.previous_sum).to.equal(0);
      expect(rowObject.sum).to.equal(0);
      expect(rowObject.change_percentage_point).to.equal(0);
      done();
    });
  });

  // pop30t34
  // https://github.com/NYCPlanning/labs-nyc-factfinder/issues/541
  it('pop30t34 change pct pt significance should be coded a true', function(done) {
    request('http://localhost:8080/profile/735/demographic?compare=SI07' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'pop30t34' && obj.dataset === 'y2012_2016';
      });
      expect(rowObject.change_percentage_point_significant).to.equal(false);
      done();
    });
  });

  // https://github.com/NYCPlanning/labs-factfinder-api/issues/29
  // Change percent MOE should only be null if previous estimate is 0
  // cw_crpld
  it('cw_crpld Change percent MOE should only be null if previous estimate is 0', function(done) {
    request('http://localhost:8080/profile/851/economic' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'cw_crpld' && obj.dataset === 'y2012_2016';
      });

      // change_percent_m should be present bc change_percent is
      expect((rowObject.change_percent !== null)).to.equal(true);
      expect((rowObject.change_percent_m !== null)).to.equal(true);
      done();
    });
  });

  // https://github.com/NYCPlanning/labs-nyc-factfinder/issues/545
  // single geog: percentage point difference not all always graying
  // sthrnafr
  it('sthrnafr single geog: percentage point difference not all always graying', function(done) {
    request('http://localhost:8080/profile/735/social?compare=SI07' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'sthrnafr' && obj.dataset === 'y2012_2016';
      });

      // change_percent_m should be present bc change_percent is
      expect(rowObject.percent_significant).to.equal(false);
      done();
    });
  });

  it('single geog top-coded variables do not get Difference and change calcs', function(done) {
    request('http://localhost:8080/profile/599/housing?compare=MN12' , function(error, response, body) {
      const rowObject = JSON.parse(body).find(obj => {
        return obj.variable === 'mdvl' && obj.dataset === 'y2012_2016';
      });

      // change_percent_m should be present bc change_percent is
      expect(rowObject.difference_sum).to.equal(null);
      expect(rowObject.difference_m).to.equal(null);
      expect(rowObject.change_sum).to.equal(null);
      expect(rowObject.change_percent).to.equal(null);
      expect(rowObject.change_percentage_point).to.equal(null);
      expect(rowObject.difference_percent).to.equal(null);
      done();
    });
  });
});
