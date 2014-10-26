'use strict';

describe('Service: accountSrv', function () {

  // load the service's module
  beforeEach(module('columbyApp'));

  // instantiate service
  var accountSrv;
  beforeEach(inject(function (_accountSrv_) {
    accountSrv = _accountSrv_;
  }));

  it('should do something', function () {
    expect(!!accountSrv).toBe(true);
  });

});
