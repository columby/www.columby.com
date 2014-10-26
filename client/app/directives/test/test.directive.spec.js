'use strict';

describe('Directive: test', function () {

  // load the directive's module and view
  beforeEach(module('columbyApp'));
  beforeEach(module('app/directives/test/test.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<test></test>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the test directive');
  }));
});