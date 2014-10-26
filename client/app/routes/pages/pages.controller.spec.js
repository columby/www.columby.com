'use strict';

describe('Controller: PagesCtrl', function () {

  // load the controller's module
  beforeEach(module('columbyApp'));

  var PagesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PagesCtrl = $controller('PagesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
