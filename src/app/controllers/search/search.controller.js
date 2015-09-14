(function() {
  'use strict';

  angular.module('columbyApp')
    .controller('SearchCtrl', function($log,$rootScope, $scope, SearchSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading = true;
    $scope.search = {};

    $rootScope.title = 'columby.com | search';

    $scope.pagination = {
      itemsPerPage: 20,
      datasets:{
        currentPage: 1
      },
      accounts:{
        currentPage: 1
      },
      tags:{
        currentPage: 1
      }
    };

    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    $scope.doSearch = function(){
      $scope.search.hits = null;
      if ($scope.search.searchTerm.length>2){
        $scope.search.message = 'Searching for: ' + $scope.search.searchTerm;
        SearchSrv.query({
          text: $scope.search.searchTerm,
          limit: $scope.pagination.itemsPerPage
        }).then(function (response) {
          $scope.search.hits = response;
          $scope.search.message = null;

          $scope.pagination.datasets.numPages =  response.datasets.count / $scope.pagination.itemsPerPage;
          $scope.pagination.accounts.numPages =  response.accounts.count / $scope.pagination.itemsPerPage;
          $scope.pagination.tags.numPages =  response.tags.count / $scope.pagination.itemsPerPage;

        }, function(err){
          $scope.search.message = 'Error: ' + err.data.message;
        });
      } else {
        $scope.search.message = 'Type at least 3 characters.';
      }
    };


    /* ---------- INIT ---------------------------------------------------------------------------- */
    if ($rootScope.searchTerm){
      $scope.search.searchTerm = $rootScope.searchTerm;
      $log.debug($scope.search.searchTerm);
      delete $rootScope.searchTerm;
      $log.debug($scope.search.searchTerm);
      $scope.doSearch();
    }
  });
})();
