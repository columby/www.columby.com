'use strict';

describe('Directive: updateTitle', function () {

  // load the directive's module
  beforeEach(module('columbyApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<update-title></update-title>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the updateTitle directive');
  }));
});