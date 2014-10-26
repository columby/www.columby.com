'use strict';

describe('Directive: accountSwitcher', function () {

  // load the directive's module and view
  beforeEach(module('columbyApp'));
  beforeEach(module('app/directives/accountSwitcher/accountSwitcher.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<account-switcher></account-switcher>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the accountSwitcher directive');
  }));
});