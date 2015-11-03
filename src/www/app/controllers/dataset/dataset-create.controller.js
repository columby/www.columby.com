(function () {
  'use strict';

  angular.module('columbyApp').controller('DatasetCreateCtrl', function ($log, $rootScope, $scope, $modal, $state, DatasetSrv, ngNotify) {
    $log.debug('Initiating new dataset.');

    /**
     * Initiate the dataset
     * Start with a blank title and description,
     * primary account and
     * private dataset
     **/
    $scope.dataset = {
      title: null,
      description: null,
      account_id: $rootScope.user.primary.id,
      account: $rootScope.user.primary,
      private: 1
    };

    // if user can also publish on organisation accounts,
    // show the account-selector.
    if ($rootScope.user.organisations.length > 0) {
      showAccountSelector();
    }

    // Show the user's account selector
    // (Publication accounts connected to this user).
    function showAccountSelector () {
      $modal.open({
        templateUrl: 'views/account/modals/accountSelector.html',
        controller: 'AccountSelectorCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          organisations: function () {
            return $rootScope.user.organisations;
          },
          selectedAccount: function () {
            return $scope.dataset.account_id;
          }
        }
      }).result.then(function (account) {
        // Modal submit
        updateDatasetOwner(account);
      }, function () {
        // modal dismissed
      });
    }

    // Change the owner of the dataset.
    function updateDatasetOwner (account) {
      $scope.dataset.account = account;
      $scope.dataset.account_id = account.id;
    }

    // Show the account selector from the UI
    $scope.showAccountSelector = function () {
      showAccountSelector();
    };

    // Create a new dataset
    $scope.create = function () {
      $log.debug('Sending dataset: ', $scope.dataset);
      DatasetSrv.save($scope.dataset, function (res) {
        $log.debug(res);
        $log.debug('New dataset received: ' + res.id);
        if (res.id) {
          ngNotify.set('Your dataset is published. Now go and add some data!');
          $log.debug('go to ' + res.shortid);
          $state.go('dataset.edit', {id: res.shortid});
        } else {
          ngNotify.set('There was an error creating the dataset. (message: ' + res.message + ' )');
        }
      });
    };
  });
})();
