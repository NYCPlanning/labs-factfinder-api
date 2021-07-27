const chai = require('chai');
const chaiHttp = require('chai-http');
const geojsonValidation = require('geojson-validation');

// const { expect } = chai;
chai.use(chaiHttp);
const should = chai.should();

const dotenv = require('dotenv');

dotenv.load();

const server = require('../../app');

describe('GET /selection/:selectionid', () => {
  it('gets a response', (done) => {
    chai.request(server)
      .get('/selection/1')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        done();
      });
  });

  it('responds with status: success', (done) => {
    chai.request(server)
      .get('/selection/1')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');

        res.body.status.should.equal('success');
        done();
      });
  });

  it('has valid geojson features', (done) => {
    chai.request(server)
      .get('/selection/1')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');

        const { features } = res.body;
        geojsonValidation.valid(features[0]).should.equal(true);
        done();
      });
  });

  it('returns the correct id', (done) => {
    chai.request(server)
      .get('/selection/3')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');

        const { id } = res.body;
        id.should.equal(3);
        done();
      });
  });
});

// describe('POST /selection/', () => {
//   it('finds an existing selection', (done) => {
//     chai.request(server)
//       .post('/selection')
//       .set('content-type', 'application/json')
//       .send({ type: 'tracts', geoids: ['1008300', '1008900', '1009300'] })
//       .end((err, res) => {
//         should.not.exist(err);
//         res.status.should.equal(200);
//         res.type.should.equal('application/json');

//         const { status, id } = res.body;
//         status.should.equal('existing selection found');
//         id.should.equal(5643);
//         done();
//       });
//   });
// });
