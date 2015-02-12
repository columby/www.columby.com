'use strict';

angular.module('columbyApp')

  .controller('DatasetViewCtrl', function($window, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DistributionSrv, DatasetReferenceSrv, AuthSrv, toaster, ngDialog, configSrv, DataService) {

    /* --------- INITIALISATION ------------------------------------------------------------ */
    $scope.hostname = $location.protocol() + '://' + $location.host();
    $scope.embedUrl = $location.absUrl();
    $window.document.title = 'columby.com';
    $scope.datasetLoading = true;


    /* --------- FUNCTIONS ------------------------------------------------------------------ */
    function processData(){
      if (!$scope.dataset.primary){
        console.log('No primary source. Skip creating data preview.')
        return;
      }

      var q = {
        type: 'select',
        table: 'primary_' + $scope.dataset.primary.id,
        fields: '*',
        limit: '10'
      };

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
      console.log('Fetching dataset', $stateParams.id);;
      DatasetSrv.get({
        id: $stateParams.id
      }, function(dataset) {
        if (!dataset.id){
          toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
          $state.go('home');
          return;
        }
        // add acquired dataset to the scope
        $scope.datasetLoading = false;
        $scope.dataset = dataset;
        $scope.pageTitle = 'columby.com | ' + dataset.title;
        $window.document.title = $scope.pageTitle;

        // transition the url from slug to id
        if ($stateParams.id !== dataset.shortid) {
          $state.transitionTo ('dataset', { id: dataset.shortid}, {
            location: true,
            inherit: true,
            relative: $state.$current,
            notify: false
          });
        }

        // // create summary
        // var summary = '<p>';
        // // check for file source
        // if (!dataset.sources) {
        //   summary += 'There is no data for this dataset available yet. ';
        // } else if (!dataset.sources.primary) {
        //   summary += 'There is no primary source for this dataset yet. ';
        // } else if (dataset.sources.primary.type) {
        //   summary += 'This dataset if of the type <strong>' + dataset.sources.primary.type + '</strong>.';
        // }
        // $scope.summary = summary + '</p>';

        $scope.dataset.canEdit= AuthSrv.canEdit('dataset', dataset);

        // filter out private sources
        if (!$scope.dataset.canEdit){
          angular.forEach($scope.dataset.distributions, function(value,key){
            console.log(value);
            if (value.private){
              $scope.dataset.distributions.splice(key,1);
            }
          });
        }

        if ($scope.dataset.headerImg && $scope.dataset.headerImg.url) {
          updateHeaderImage();
        }

        if($scope.dataset.primary){
          processData();
        }
      });
    }

    /**
     * Update the header image of a dataset
     */
    function updateHeaderImage(){
			if ($scope.dataset.headerImg) {
        $scope.dataset.headerImg.url = configSrv.apiRoot + '/v2/file/' + $scope.dataset.headerImg.id + '?style=large';
        $scope.headerStyle={
	        'background-image': 'linear-gradient(transparent,transparent), url(/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
	        'background-blend-mode': 'multiply'
	      };
	    }
    }


    /* --------- SCOPE FUNCTIONS ------------------------------------------------------------ */
    $scope.showEmbedModal = function(){
      ngDialog.open({
        template: 'views/dataset/embedModal.html',
        className: 'ngDialog-theme-default fullscreenDialog embedModal',
        scope: $scope
      });
    };


    /* --------- ROOTSCOPE EVENTS ------------------------------------------------------------ */


    /* --------- INIT ------------------------------------------------------------------------ */
    if ($stateParams.id) {
      getDataset();
    } else {
      toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
      $state.go('home');
    }
  })

;
