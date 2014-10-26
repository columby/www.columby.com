'use strict';

describe('Service: embedlySrv', function () {

  // load the service's module
  beforeEach(module('columbyApp'));

  // instantiate service
  var embedlySrv;
  beforeEach(inject(function (_embedlySrv_) {
    embedlySrv = _embedlySrv_;
  }));

  it('should do something', function () {
    expect(!!embedlySrv).toBe(true);
  });

});
