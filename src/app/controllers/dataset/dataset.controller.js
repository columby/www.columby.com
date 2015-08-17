'use strict';

angular.module('columbyApp')

.controller('DatasetViewCtrl', function(dataset, $window, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DistributionSrv, appConstants, DataService, UserSrv, AuthSrv, ngNotify) {
  console.log(';');
  console.log(dataset);
  if (!dataset.id) {
    console.log('nooo');
    ngNotify.set('Sorry, the requested dataset was not found. ', 'error');
    $state.go('home');
  }

  /* --------- INITIALISATION ------------------------------------------------------------ */
  $scope.dataset = angular.copy(dataset);

  if ($scope.dataset.account.avatar){
    $scope.dataset.account.avatar.url = appConstants.filesRoot + '/image/small/' + $scope.dataset.account.avatar.filename;
  }

  $scope.hostname = $location.protocol() + '://' + $location.host();
  $scope.embedUrl = $location.absUrl();

  $rootScope.title = 'columby.com | ' + $scope.dataset.title;

  $scope.dataset.canEdit= AuthSrv.hasPermission('edit dataset', dataset);
  // filter out private sources
  if (!$scope.dataset.canEdit){
    angular.forEach($scope.dataset.distributions, function(value,key){
      //console.log(value);
      if (value.private){
        $scope.dataset.distributions.splice(key,1);
      }
    });
  }

  if ($scope.dataset.headerImg  && $scope.dataset.headerImg.id) {
    updateHeaderImage();
  }

  if($scope.dataset.primary){
    processData();
  }


  /* --------- FUNCTIONS ------------------------------------------------------------------ */
  function processData(){
    if (!$scope.dataset.primary){
      console.log('No primary source. Skip creating data preview.');
      return;
    }

    var q = {
      type: 'select',
      table: 'primary_' + $scope.dataset.primary.id,
      fields: '*',
      limit: '10'
    };

    // Query string for api call example.
    $scope.dataQuery = '{"type":"select","table":"primary_' + $scope.dataset.primary.id + '","fields":"*","limit":"10"}';
    $scope.apiLink = $rootScope.config.apiRoot + '/v2/data/sql?q='+ $scope.dataQuery;

    DataService.sql(q).then(function(result){
      if (result.status === 'success') {
        $scope.datapreview = {
          header: result.rows.fields
        };
        $scope.datapreview.data = result.rows;
      }
    });
  }


  /**
   * Fetch a dataset
   *
   */
  function getDataset(){
    // transition the url from slug to id
    if ($stateParams.id !== dataset.shortid) {
      $state.transitionTo ('dataset.view', { id: dataset.shortid}, {
        location: true,
        inherit: true,
        relative: $state.$current,
        notify: false
      });
    }
  }


  /**
   * Update the header image of a dataset
   */
  function updateHeaderImage(){

    console.log($scope.dataset);
		if ($scope.dataset.headerImg) {
      console.log('updating header image');
      $scope.dataset.headerImg.url = $rootScope.config.filesRoot + '/a/' + $scope.dataset.headerImg.shortid + '/' + $scope.dataset.headerImg.filename;
      $scope.headerStyle={
        'background-image': 'linear-gradient(transparent,transparent), url(/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }
  }


  /* --------- SCOPE FUNCTIONS ------------------------------------------------------------ */
  $scope.showEmbedModal = function(){
    var modal = $modal.open({
      template: 'views/dataset/embedModal.html',
      className: 'ngDialog-theme-default fullscreenDialog embedModal',
      scope: $scope
    });
  };

});
