'use strict';

/**
 * @ngdoc function
 * @name columbyworkerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the columbyworkerApp
 */
angular.module('columbyworkerApp')

  .controller('MainController', function ($scope, WorkerService) {

    $scope.totalItems = 0;
    $scope.currentPage = 0;
    $scope.itemsPerPage = 10;

    $scope.filter = {
      active: false,
      done: false,
      error: false,
      processing: false
    }


    function fetchJobs(){
      var params = {
        offset: $scope.currentPage * $scope.itemsPerPage,
        limit: $scope.itemsPerPage
      }
      WorkerService.jobs(params).then(function(result){
        console.log(result);
        $scope.totalItems = result.count;
        $scope.jobs = result.rows;
      });
    }


    WorkerService.stats().then(function(result){
      $scope.stats = result;
    });

    $scope.changeStatus = function(){
      console.log('change');
      console.log($scope.filter);
    }

    $scope.pageChanged = function() {
      console.log('Page changed to: ' + $scope.currentPage);
      fetchJobs();
    };

    fetchJobs();

  });
