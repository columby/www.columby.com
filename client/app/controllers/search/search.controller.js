'use strict';

angular.module('columbyApp')
  .controller('SearchCtrl', function ($rootScope, $scope, SearchSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading = true;
    $scope.search = {};

    $rootScope.title = 'columby.com | search';


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    $scope.doSearch = function(){
      $scope.search.hits = null;
      if ($scope.search.searchTerm.length>2){
        $scope.search.message = 'Searching for: ' + $scope.search.searchTerm;
        SearchSrv.query({
          text: $scope.search.searchTerm
        }).then(function (response) {
          $scope.search.hits = response;
          $scope.search.message = null;
        }, function(err){
          $scope.search.message = 'Error: ' + err.data.message;
        });
      } else {
        $scope.search.message = 'Type at least 3 characters.';
      }
    };


    /* ---------- INIT ---------------------------------------------------------------------------- */
    // get last search result if present
    $scope.search.searchTerm = SearchSrv.queryTerm();
    $scope.search.hits = SearchSrv.result();

    console.log('search', $scope.search);

  });
