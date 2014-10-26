'use strict';

describe('Controller: DatasetCtrl', function () {

  // load the controller's module
  beforeEach(module('columbyApp'));

  var DatasetCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DatasetCtrl = $controller('DatasetCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
