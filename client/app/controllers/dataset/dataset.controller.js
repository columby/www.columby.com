'use strict';

angular.module('columbyApp')

  .controller('DatasetViewCtrl', function($window, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DistributionSrv, DatasetReferenceSrv, AuthSrv, toaster, ngDialog) {

    /* --------- INITIALISATION ------------------------------------------------------------ */
    $scope.hostname = $location.protocol() + '://' + $location.host();
    $scope.embedUrl = $location.absUrl();
    $window.document.title = 'columby.com';


    /* --------- FUNCTIONS ------------------------------------------------------------------ */
    /**
     * Fetch a dataset
     *
     */
    function getDataset(){
      $scope.contentLoading = true;  // show loading message while loading dataset
      DatasetSrv.get({
        id: $stateParams.id
      }, function(dataset) {
        if (!dataset.id){
          toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
          $state.go('home');
          return;
        }
        // add acquired dataset to the scope
        $scope.contentLoading = false;
        $scope.dataset = dataset;
        $window.document.title = 'columby.com | ' + dataset.title;

        // transition the url from slug to id
        if ($stateParams.id !== dataset.shortid) {
          $state.transitionTo ('dataset.view', { id: dataset.shortid}, {
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

        if ($scope.dataset.headerImg && $scope.dataset.headerImg.url) {
          updateHeaderImage();
        }
      });
    }

    /**
     * Update the header image of a dataset
     */
    function updateHeaderImage(){
			if ($scope.dataset.headerImg) {
        $scope.dataset.headerImg.url = '/api/v2/file/' + $scope.dataset.headerImg.id + '?style=large';
        console.log('Updating header image: ', $scope.dataset.headerImg.url);

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
  });
