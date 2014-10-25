'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /ap1/v2/accounts', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/ap1/v2/accounts')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});