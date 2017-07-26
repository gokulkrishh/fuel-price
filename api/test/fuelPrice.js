process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");

const should = chai.should(); /* eslint no-unused-vars: 0 */
chai.use(chaiHttp); // Use HTTP

describe("/GET fuel price", () => {
  it("GET all the states fuel prices", (done) => {
    chai.request(server)
      .get("/fuelprice/all")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        done();
      });
  });

  it("GET one state fuel price", (done) => {
    chai.request(server)
      .get("/fuelprice/ka")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(1);
        done();
      });
  });

  it("GET current location", (done) => {
    chai.request(server)
      .get("/location")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      });
	});
});

