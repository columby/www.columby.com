(function() {
  'use strict';

  angular
    .module('columbyApp')
    .constant('appConstants', {
      appTitle: 'Columby',
      apiRoot: 'https://dev-api.columby.com',
      filesRoot: 'https://dev-files.columby.com'
    });
})();
