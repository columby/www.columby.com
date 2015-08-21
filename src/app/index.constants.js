(function() {
  'use strict';

  angular
    .module('columbyApp')
    .constant('appConstants', {
      appTitle: 'Columby',
      debug: true,
      apiRoot: 'https://api.columby.com',
      //apiRoot: 'http://localhost:8000',
      filesRoot: 'https://files.columby.com'
    });
})();
