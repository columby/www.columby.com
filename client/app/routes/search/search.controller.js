'use strict';

angular.module('columbyApp')
  .controller('SearchCtrl', function ($window, $scope, SearchSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading = true;
    $scope.search = '';;
    
    $window.document.title = 'columby.com | search';
    
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
  });
