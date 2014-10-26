'use strict';

describe('Directive: embedly', function () {

  // load the directive's module
  beforeEach(module('columbyApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<embedly></embedly>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the embedly directive');
  }));
});