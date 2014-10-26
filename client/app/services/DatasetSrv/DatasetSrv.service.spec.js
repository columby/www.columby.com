'use strict';

describe('Service: DatasetSrv', function () {

  // load the service's module
  beforeEach(module('columbyApp'));

  // instantiate service
  var DatasetSrv;
  beforeEach(inject(function (_DatasetSrv_) {
    DatasetSrv = _DatasetSrv_;
  }));

  it('should do something', function () {
    expect(!!DatasetSrv).toBe(true);
  });

});
