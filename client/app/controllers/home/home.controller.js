'use strict';

angular.module('columbyApp')
  .controller('HomeCtrl', function ($rootScope,$scope,$state,SearchSrv,DatasetSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading = true;
    $scope.search = '';
    $rootScope.title = 'columby.com | Home';

    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function listDatasets() {
      DatasetSrv.query(function(response){
        $scope.datasets = response;
        angular.forEach($scope.datasets.rows, function(value,key){
          $scope.datasets.rows[ key].account.avatar.url = $rootScope.config.filesRoot + '/image/thumbnail/' + $scope.datasets.rows[ key].account.avatar.filename;
          console.log($scope.datasets.rows[ key].account.avatar.url);
        });
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
