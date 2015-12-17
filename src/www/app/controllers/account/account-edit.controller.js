(function() {
  'use strict';

  angular
    .module('columbyApp')

    .controller('AccountEditCtrl', function($log, account, $rootScope, $scope, $state, $stateParams, AccountSrv, ngNotify, Upload, FileSrv, RegistrySrv,appConstants,CategorySrv,$modal) {

      // Initialization
      $scope.activePanel = 'profile';
      $scope.newCategory = {};

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
      $log.debug('a', account);
      $scope.account = account;
      //$scope.account.avatar.url = appConstants.filesRoot + '/image/small/' + $scope.account.avatar.filename;

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


      // Set rolename for people
      if (account.people.length > 0) {
        angular.forEach(account.people, function(value,key){
          if (value.role === 2) {
            account.people[ key].roleName = 'Admin';
            if ($rootScope.user.primary.id === value.id) {
              $scope.isAdmin=true;
            }
          } else if (value.role === 3) {
            account.people[ key].roleName = 'Editor';
            if ($rootScope.user.primary.id === value.id) {
              $scope.isEditor=true;
            }
          }
        });
      }



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



      $scope.openInviteForm = function() {
        $scope.showInviteForm = true;
      };
      $scope.invite = {
        username: null
      };

      $scope.doSearch = function(){
        $log.debug('search ' + $scope.invite.username);
        AccountSrv.search({username: $scope.invite.username}, function(result) {
          $log.debug(result);
          $scope.invite.result=result.users;
        });
      };

      $scope.addPerson = function(user) {
        AccountSrv.addUser({id:account.id}, {
          account_id: account.id,
          primary_id: user.id
        }, function(result){
          if (result.id) {
            var a = {
              displayname: user.displayName,
              slug: user.slug,
              role: 3,
              roleName: 'Editor',
              id: user.id
            };
            if (user.avatar && user.avatar.url) {
              a.avatar_url = user.avatar.url;
            }
            account.people.push(a);
            delete $scope.invite.username;
            $scope.invite.result = {};
            delete $scope.showInviteForm;
            ngNotify.set(user.displayName + ' was added as an editor to the publication account ' + account.displayName, 'success');
          } else {
            $log.debug(result);
            ngNotify.set(user.displayName + ' is already an editor for the publication account ' + account.displayName, 'warning');
          }
        });
      };

      $scope.revokeUserAccess = function(user){
        AccountSrv.removeUser({id: account.id}, {
          primary_id: user.id
        }, function(result){
          console.log(result);
          var idx = $scope.account.people.indexOf(user);
          console.log(idx);
          $scope.account.people.splice(idx, 1);
          ngNotify.set('Revoked access for user ' + user.displayname + ' for the publication account ' + account.displayName, 'success');
        });
      };


      $scope.openFileBrowser = function() {
        $rootScope.$broadcast('fm-open', {
          type:'image',
          account_id: $scope.account.id,
          select: true,
          action: 'updateAccountAvatar'
        });
      };

      $scope.$on('fm-selected', function(event,data){
        $log.debug('Acoount edit: File selected: ', data);
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
      $scope.addCategory = function() {
        // Set a flag to prevent double deletion
        if ($scope.addCategoryInProgress) {
          $log.debug('inprogress');
          return;
        }
        $scope.addCategoryInProgress = true;

        $log.debug('add category: ', $scope.newCategory);
        var category = $scope.newCategory;
        var c = {
          account_id: account.id,
          name: category.name,
          parent_id: category.parent
        };

        CategorySrv.save(c, function(result){
          // Add to right spot in the categories list
          if (!c.parent_id) {
            $scope.account.categories.push(result);
          } else {
            var keepGoing=true;
            angular.forEach($scope.account.categories, function(value, key){
              if (parseInt(value.id) === parseInt(c.parent_id)) {
                $scope.account.categories[ key].children = $scope.account.categories[ key].children || [];
                $scope.account.categories[ key].children.push(result);
              }
            });
          }

          $scope.newCategory = {};
          delete $scope.addCategoryInProgress;

          ngNotify.set('Category added.','notice');

        });
      };

      $scope.showStandardCategoriesModal = function(){
        $modal.open({
          templateUrl: 'views/account/modals/standardCategories.html',
          size: 'lg',
          backdrop: 'static',
          keyboard: false,
        }).result.then(function() {
          AccountSrv.addDefaultCategories({id:$scope.account.id}, {standard:'overheid-nl'}, function(result){
            $log.debug(result);
            if (result.status==='success') {
              AccountSrv.get({slug: $scope.account.slug},function(account){
                $log.debug(account);
              });
            }
          });
        }, function () {
          //$log.debug('cancel');
          //modalOpened=false;
        });
      };

      $scope.deleteCategory = function(category) {
        // Set a flag to prevent double deletion
        if ($scope.deleteInProgress) {
          $log.debug('inprogress');
          return;
        }
        $scope.deleteInProgress = true;

        // Delete the category from the server
        CategorySrv.delete({ id: category.id }, function(result){
          // Check the result

          // Delete the category from the scope
          var keepGoing = true;
          angular.forEach($scope.account.categories, function(value, key){
            if(keepGoing) {
              if (parseInt(value.id) === parseInt(category.id)) {
                $scope.account.categories.splice(key, 1);
                keepGoing=false;
              }
              if ($scope.account.categories[ key] && $scope.account.categories[ key].children){
                angular.forEach($scope.account.categories[ key].children, function(v,k){
                  if(keepGoing) {
                    if (parseInt(v.id) === parseInt(category.id)) {
                      $scope.account.categories[ key].children.splice(k, 1);
                      keepGoing=false;
                    }
                  }
                });
              }
            }
          });
          // Turn of the flag
          delete $scope.deleteInProgress;
          ngNotify.set('Category deleted.','notice');
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
