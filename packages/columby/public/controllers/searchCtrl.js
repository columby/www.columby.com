'use strict';

angular.module('mean.columby')

.controller('SearchCtrl', ['$rootScope', '$scope', 'toaster', 'SearchSrv',
  function($rootScope, $scope, toaster, SearchSrv) {

  /* ---------- SETUP ----------------------------------------------------------------------------- */
  $scope.contentLoading = true;
  $scope.search = '';

  /* ---------- FUNCTIONS ------------------------------------------------------------------------- */


  /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
  $scope.search = function(){
    console.log('search: ', $scope.search.searchTerm);
    SearchSrv.query({
      index: 'datasets',
      size: 50,
      body: {
        'query': {
          'match': {
            '_all': String($scope.search.term)
          }
        }
      }
    }).then(function (response) {
      console.log('re', response);
      $scope.search.hits = response.hits.hits;
    });
  };

  /* ---------- INIT ---------------------------------------------------------------------------- */


}]);
