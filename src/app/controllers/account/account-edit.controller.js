(function() {
  'use strict';

  angular
    .module('columbyApp')

    .controller('AccountEditCtrl', function($log, account, $rootScope, $scope, $state, $stateParams, AccountSrv, ngNotify, Upload, FileSrv, RegistrySrv,appConstants,CategorySrv) {

      $scope.activePanel = 'profile';

      //
      if (!account.id){
        ngNotify.set('The requested account was not found. ','error');
        $state.go('home');
      }

      // redirect primary accout to user edit page
      if (account.primary){
        $state.go('user.edit',{slug: $stateParams.slug});
      }

      //
      //$log.debug('a', account);
      $scope.account = account;
      $scope.account.avatar.url = appConstants.filesRoot + '/image/small/' + $scope.account.avatar.filename;

      //
      $rootScope.title = 'columby.com | ' + $scope.account.displayName;

      // set reference model to check for changes
      $scope.originalAccount = angular.copy($scope.account);

      // update the header with the header image just fetched.
      if ($scope.account.headerImg) {
        updateHeaderImage();
      }

      // Get a list of registries
      $scope.registries = {
        active: [],
        inactive: []
      };

      //
      $scope.registries.active = $scope.account.registries;

      //
      function updateHeaderImage(){
        $scope.account.headerImg.url = appConstants.filesRoot + '/a/' + $scope.account.headerImg.shortid + '/' + $scope.account.headerImg.filename;
        $scope.headerStyle = {
          'background-image': 'url(/images/default-header.png), url(' + $scope.account.headerImg.url + ')',
          'background-blend-mode': 'multiply'
        };
      }


      // Change the active panel when a user clicks on a menu-link
      $scope.changePanel = function(panel) {
        $scope.activePanel = panel;
      };


      //Update an existing account
      $scope.update = function(){
        // check for update
        if (angular.equals($scope.account, $scope.originalAccount) === false){
          // send to server
          AccountSrv.update({id: $scope.account.id},$scope.account, function(result){
            if (result.status==='success'){
              $scope.originalAccount = angular.copy($scope.account);
              $scope.account.avatar.url = appConstants.filesRoot + '/image/thumbnail/' + $scope.account.avatar.filename;
              ngNotify.set('Account updated.','notice');
            } else {
              ngNotify.set('There was an error updating the account name.','error');
            }
          });
        }
      };

      $scope.openFileBrowser = function() {
        $rootScope.$broadcast('openFileManager', {
          type:'image',
          account_id: $scope.account.id,
          select: true,
          action: 'updateAccountAvatar'
        });
      };

      $scope.$on('fileManagerSelected', function(event,data){
        if (data.action === 'updateAccountAvatar') {
          $scope.account.avatar_id = data.file.id;
          $scope.account.avatar = data.file;
          $scope.update();
        }
      });


      // REGISTRY FUNCTIONS
      // Validate key for a registry
      $scope.validateRegistry = function(registry){
        var apikey= registry.account_registries.apikey;

        RegistrySrv.validate(registry.id, {apikey:apikey}, function(result){
          if (result.statusCode===403){
            ngNotify.set('Key is not valid', 'error');
          } else {
            var r = registry.account_registries;
            r.valid = true;
            r.active = true;
            r.statusMessage = 'Validated at ' + new Date();
            //$log.debug(r);
            ngNotify.set('Key is valid!', 'success');
            AccountSrv.updateRegistry(r);
          }
        });
      };


      //
      $scope.updateRegistry = function($index, registry){
        AccountSrv.updateRegistry(registry.account_registries).then(function(result){
          if (result.id){
            ngNotify.set('Registry settings updated. ', 'success');
            $scope.registries.active[ $index].account_registries = result;
          } else {
            ngNotify.set('Something went wrong ' + result, 'error');
          }
        });
      };

      // Category functions
      $scope.addCategory = function(category) {
        $log.debug('add category: ' + category);
        var c = {
          account_id: account.id,
          name: category
        };
        CategorySrv.save(c, function(result){
          $scope.account.categories.push(result);
          $log.debug(result);
        });
      };

      $scope.showStandardCategoriesModal = function(){
        $log.debug('show');
      };
      $scope.deleteCategory = function(index){
        $log.debug(index);
        CategorySrv.delete({id:$scope.account.categories[ index].id}, function(result){
          $scope.account.categories.splice(index, 1);
        });
      };
    });
  })();


(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('AccountEditOptionsCtrl', function() {});
  })();
