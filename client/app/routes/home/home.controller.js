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
    $scope.search = function(){
      console.log('search: ', $scope.search.searchTerm);
      SearchSrv.query({
        index: 'datasets',
        size: 50,
        body: {
          'query': {
            'match': {
              '_all': String($scope.search.searchTerm)
            }
          }
        }
      }).then(function (response) {
        console.log('re', response);
        $scope.search.hits = response.hits.hits;
      });
    };

    /* ---------- INIT ---------------------------------------------------------------------------- */
    listDatasets();

  });
