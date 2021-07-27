const chai = require('chai');
const chaiHttp = require('chai-http');

// const { expect } = chai;
chai.use(chaiHttp);
const should = chai.should();

const dotenv = require('dotenv');

dotenv.load();

const server = require('../../app');

// describe('GET /search', () => {
//   it('returns a JSON array with objects', (done) => {
//     chai.request(server)
//       .get('/search?q=new%20dorp')
//       .end((err, res) => {
//         should.not.exist(err);
//         res.status.should.equal(200);
//         res.type.should.equal('application/json');

//         const array = res.body;
//         // response should be an array
//         array.length.should.be.above(0);
//         // first element in array should be an object
//         (typeof array[0]).should.equal('object');
//         done();
//       });
//   });

  // geosearch no longer takes blank params
  // it('requires q as a query param', (done) => {
  //   chai.request(server)
  //     .get('/search')
  //     .end((err, res) => {
  //       const array = res.body;
  //       // response should be an array
  //       array.length.should.equal(0);
  //       done();
  //     });
  // });

  // it('returns results if q is null', (done) => {
  //   chai.request(server)
  //     .get('/search?q=')
  //     .end((err, res) => {
  //       const array = res.body;
  //       // response should be an array
  //       array.length.should.be.above(0);
  //       done();
  //     });
  // });
// });
