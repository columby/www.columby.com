'use strict';

describe('Controller: SigninCtrl', function () {

  // load the controller's module
  beforeEach(module('columbyApp'));

  var SigninCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SigninCtrl = $controller('SigninCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
