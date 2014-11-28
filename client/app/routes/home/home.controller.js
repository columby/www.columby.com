'use strict';

angular.module('columbyApp')
  .controller('HomeCtrl', function ($window,$scope, SearchSrv, DatasetSrv) {

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

     // TODO: Marcel, zoeken op dataset titel en beschrijving van een dataset, titel van een account, tags.
     // Resultaat gegroepeerdspot
    $scope.search = function(){

      if ($scope.search.searchTerm.length>2){
        $scope.search.message = 'Searching for: ' + $scope.search.searchTerm;
        SearchSrv.query({
          text: $scope.search.searchTerm
        }).then(function (response) {
          console.log(response);
          $scope.search.hits = response.hits.hits;
          $scope.search.message = null;
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
