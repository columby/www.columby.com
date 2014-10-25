'use strict';

describe('Service: AuthSrv', function () {

  // load the service's module
  beforeEach(module('columbyApp'));

  // instantiate service
  var AuthSrv;
  beforeEach(inject(function (_AuthSrv_) {
    AuthSrv = _AuthSrv_;
  }));

  it('should do something', function () {
    expect(!!AuthSrv).toBe(true);
  });

});
