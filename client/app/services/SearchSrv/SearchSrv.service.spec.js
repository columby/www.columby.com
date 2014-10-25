'use strict';

describe('Service: SearchSrv', function () {

  // load the service's module
  beforeEach(module('columbyApp'));

  // instantiate service
  var SearchSrv;
  beforeEach(inject(function (_SearchSrv_) {
    SearchSrv = _SearchSrv_;
  }));

  it('should do something', function () {
    expect(!!SearchSrv).toBe(true);
  });

});
