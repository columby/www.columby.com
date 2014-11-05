'use strict';

describe('Controller: CollectionCtrl', function () {

  // load the controller's module
  beforeEach(module('columbyApp'));

  var CollectionCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CollectionCtrl = $controller('CollectionCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
