'use strict';

angular.module('columbyApp')
  .controller('DatasetCreateCtrl', function($rootScope, $scope, $modal, $state, DatasetSrv, ngNotify){

    console.log('Initiating new dataset.');
    $scope.dataset = {
      title: null,
      description: null,
      account_id: $rootScope.user.primary.id,
      account: $rootScope.user.primary,
      private: 1
    };

    // if user can also publish on organisation accounts, show the account-selector.
    if ($rootScope.user.organisations.length > 0) {
      showAccountSelector();
    }

    function showAccountSelector(){

      var modalInstance = $modal.open({
        templateUrl: 'views/account/partials/selector.html',
        controller: 'AccountSelectorCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          organisations: function () {
            return $rootScope.user.organisations;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        updateDatasetOwner(selectedItem);
      }, function () {
        // modal dismissed
      });
    }


    // Change the owner of the dataset.
    function updateDatasetOwner(id){
      var account_id;
      var datasetAccount;
      if (id === 'primary') {
        account_id = $rootScope.user.primary.id;
        datasetAccount = $rootScope.user.primary;
      } else {
        account_id = $rootScope.user.organisations[ id].id;
        datasetAccount = $rootScope.user.organisations[ id];
      }

      $scope.dataset.account = datasetAccount;
      $scope.dataset.account_id = account_id;
    }


    $scope.showAccountSelector = function(){
      showAccountSelector();
    };


    //Create a new dataset
    $scope.create = function() {
      console.log('Sending dataset: ', $scope.dataset);
      DatasetSrv.save($scope.dataset, function(res){
        console.log(res);
        console.log('New dataset received: ' + res.id);
        if (res.id) {
          ngNotify.set('Your dataset is published. Now go and add some data!');
          console.log('go to ' + res.shortid);
          $state.go('dataset.edit', {id:res.shortid});
        } else {
          ngNotify.set('There was an error creating the dataset. (message: ' + res.message + ' )');
        }
      });
    };
});
