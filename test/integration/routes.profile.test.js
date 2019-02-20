const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
chai.use(chaiHttp);
const should = chai.should();

const dotenv = require('dotenv');

dotenv.load();

const server = require('../../app');

describe('GET /profile', () => {
  it('gets a response', (done) => {
    chai.request(server)
      .get('/profile/1/demographic?compare=0')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        done();
      });
  });
});

describe('Special variables', () => {
  it('top-bottom codes variables correctly', (done) => {
    chai.request(server)
      .get('/profile/726/economic?compare=0')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');

        const rowObject = res.body
          .find(obj => obj.variable === 'mdfaminc' && obj.dataset === 'y2013_2017');

        // it should have two properties in it, "sum" and "previous_est"
        // this gets the keys of the thresholds object and counts them
        // to make sure
        expect(Object.keys(rowObject.codingThresholds).length).to.equal(2);
        done();
      });
  });
});

describe('normal variables with complex case logic', () => {
  it('data with 0-estimate current should get pct change calculations: lgfrlep1 change_percentage_point should be calculated', (done) => {
    chai.request(server)
      .get('/profile/733/social?compare=4104')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');

        const rowObject = res.body.find(obj => obj.variable === 'lgfrlep1' && obj.dataset === 'y2013_2017');
        expect(!!rowObject.change_percentage_point).to.equal(true);
        done();
      });
  });

  it('data with 0-estimate previous should get pct change calculations: lgthalep1 change_percentage_point should be calculated', (done) => {
    chai.request(server)
      .get('/profile/733/social?compare=4104')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');

        const rowObject = res.body.find(obj => obj.variable === 'lgthalep1' && obj.dataset === 'y2013_2017');
        expect(!!rowObject.change_percentage_point).to.equal(true);
        done();
      });
  });

  // lgmkhm1
  it('data with at least one non-null percentage point should be calculated: lgmkhm1 difference_percentage should be calculated', (done) => {
    chai.request(server)
      .get('/profile/733/social?compare=4104')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');

        const rowObject = res.body.find(obj => obj.variable === 'lgmkhm1' && obj.dataset === 'y2013_2017');
        expect((rowObject.difference_percentage === null)).to.equal(false);
        done();
      });
  });

  // lgmkhm1
  it('data with at least one non-null percentage point should be calculated: lgmkhm1 difference_percentage should be calculated', (done) => {
    chai.request(server)
      .get('/profile/843/social?compare=4104')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');

        const rowObject = res.body.find(obj => obj.variable === 'lgmkhm1' && obj.dataset === 'y2013_2017');
        expect((rowObject.difference_percentage === null)).to.equal(false);
        done();
      });
  });
});

// oscasia
it('data with both 0 estimates should be percentage point null: oscasia difference_percentage should be calculated', (done) => {
  chai.request(server)
    .get('/profile/733/social?compare=4104')
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(200);
      res.type.should.equal('application/json');

      const rowObject = res.body.find(obj => obj.variable === 'oscasia' && obj.dataset === 'y2013_2017');
      expect(rowObject.previous_est).to.equal(0);
      expect(rowObject.sum).to.equal(0);
      expect(rowObject.change_percentage_point).to.equal('0.0000');
      done();
    });
});

// oscasia, single geog
it('data with both 0 estimates should be percentage point null: oscasia difference_percentage should be calculated', (done) => {
  chai.request(server)
    .get('/profile/843/social?compare=4104')
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(200);
      res.type.should.equal('application/json');

      const rowObject = res.body.find(obj => obj.variable === 'oscasia' && obj.dataset === 'y2013_2017');
      expect(rowObject.previous_est).to.equal(0);
      expect(rowObject.sum).to.equal(0);
      expect(rowObject.change_percentage_point).to.equal(0);
      done();
    });
});


// pop30t34
// https://github.com/NYCPlanning/labs-nyc-factfinder/issues/541
it('pop30t34 change pct pt significance should be coded a true', (done) => {
  chai.request(server)
    .get('/profile/735/demographic?compare=SI07')
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(200);
      res.type.should.equal('application/json');

      const rowObject = res.body.find(obj => obj.variable === 'pop30t34' && obj.dataset === 'y2013_2017');
      expect(rowObject.change_percentage_point_reliable).to.equal(false);
      done();
    });
});


// https://github.com/NYCPlanning/labs-factfinder-api/issues/29
// Change percent MOE should only be null if previous estimate is 0
// cw_crpld
it('cw_crpld Change percent MOE should only be null if previous estimate is 0', (done) => {
  chai.request(server)
    .get('/profile/851/economic')
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(200);
      res.type.should.equal('application/json');

      const rowObject = res.body.find(obj => obj.variable === 'cw_crpld' && obj.dataset === 'y2013_2017');

      // change_percent_moe should be present bc change_percent is
      expect((rowObject.change_percent !== null)).to.equal(true);
      expect((rowObject.change_percent_moe !== null)).to.equal(true);
      done();
    });
});

// https://github.com/NYCPlanning/labs-nyc-factfinder/issues/545
// single geog: percentage point difference not all always graying
// sthrnafr
it('sthrnafr single geog: percentage point difference not all always graying', (done) => {
  chai.request(server)
    .get('/profile/735/social?compare=SI07')
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(200);
      res.type.should.equal('application/json');

      const rowObject = res.body.find(obj => obj.variable === 'sthrnafr' && obj.dataset === 'y2013_2017');

      // change_percent_moe should be present bc change_percent is
      expect(rowObject.change_percent_reliable).to.equal(false);
      done();
    });
});
