'use strict';

angular.module('columbyApp')
  .controller('SearchCtrl', function ($window, $scope, SearchSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading = true;
    $scope.search = '';

    $window.document.title = 'columby.com | search';

    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    $scope.search = function(){
      if ($scope.search.searchTerm.length>2){
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
          $scope.search.hits = response.hits.hits;
          $scope.search.message = 'Search result: ' + response.hits.hits.length + ' results';
        }, function(err){
          $scope.search.message = 'Error: ' + err.data.message;
        });
      } else {
        $scope.search.message = 'Type at least 3 characters. ';
      }
    };

    /* ---------- INIT ---------------------------------------------------------------------------- */
  });
