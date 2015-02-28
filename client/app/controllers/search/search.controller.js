'use strict';

angular.module('columbyApp')
  .controller('SearchCtrl', function ($window, $scope, SearchSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading = true;
    $scope.search = {};

    $window.document.title = 'columby.com | search';

    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */


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

    $scope.checkLink = function(item){
      if (item.contentType === 'dataset'){
        return item.contentType + '({id: \'' + item.shortid + '\'})';
      } else if (item.contentType === 'account'){
        return item.contentType + '({slug: \'' + item.slug + '\'})';
      } else {
        return '';
      }
    };

    
    /* ---------- INIT ---------------------------------------------------------------------------- */
    // get last search result if present
    $scope.search.searchTerm = SearchSrv.queryTerm();
    $scope.search.hits = SearchSrv.result();
    //console.log('search', $scope.search.hits);

  });
