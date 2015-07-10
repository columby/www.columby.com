'use strict';

angular.module('columbyApp')
  .controller('HomeCtrl', function ($window,$scope,$state,SearchSrv,DatasetSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading = true;
    $scope.search = '';
    $window.document.title = 'columby.com | Home';

    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function listDatasets() {
      DatasetSrv.query(function(response){
        $scope.datasets = response;
        $scope.contentLoading = false;
      });
    }


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    $scope.doSearch = function(){

      if ($scope.search.searchTerm.length>2){
        $scope.search.message = 'Searching for: ' + $scope.search.searchTerm;
        SearchSrv.query({
          text: $scope.search.searchTerm
        }).then(function (response) {
          $state.go('search');
        }, function(err){
          $scope.search.message = 'Error: ' + err.data.message;
        });
      } else {
        $scope.search.message = 'Type at least 3 characters.';
      }
    };

    /* ---------- INIT ---------------------------------------------------------------------------- */
    listDatasets();

  });
