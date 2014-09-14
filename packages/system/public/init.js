'use strict';

angular.element(document).ready(function() {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') window.location.hash = '#!';

  function initApp(){
    //Then init the app
    angular.bootstrap(document, ['mean']);
  }

  // Get user
  window.user={};
  var xmlHttp;
  var token = JSON.parse(localStorage.getItem('auth_token'));
  if (token){
    console.log('init, token found', token);
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange=function() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        var response = JSON.parse(xmlHttp.responseText);
        window.user = {
          account: response.account,
          isAuthenticated: (response.account && response.account.hasOwnProperty('_id')) ? true : false
        };
        initApp();
      }
    };
    xmlHttp.open( 'GET', '/api/v2/user/account', true );
    xmlHttp.setRequestHeader('Authorization', 'Bearer ' + token);
    xmlHttp.send( null );
  } else {
    initApp();
  }
});

// Dynamically add angular modules declared by packages
var packageModules = [];
for (var index in window.modules) {
  angular.module(window.modules[index].module, window.modules[index].angularDependencies || []);
  packageModules.push(window.modules[index].module);
}

// Default modules
var modules = ['ngCookies', 'ngResource', 'ngSanitize','ui.bootstrap', 'ui.router', 'ngAnimate', 'toaster'];
modules = modules.concat(packageModules);

// Combined modules
angular.module('mean', modules);
