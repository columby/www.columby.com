'use strict';

var mean = require('meanio'),
    config = mean.loadConfig()
;

exports.render = function(req, res) {

  var settings = {
    aws : {
      publicKey: config.aws.publicKey,
      endpoint: config.aws.endpoint
    }
  };

  var modules = [];
  // Preparing angular modules list with dependencies
  for (var name in mean.modules) {
    modules.push({
      name: name,
      module: 'mean.' + name,
      angularDependencies: mean.modules[name].angularDependencies
    });
  }

  function isAdmin() {
    return req.user && req.user.roles.indexOf('admin') !== -1;
  }

  function initIndex
  // Send some basic starting info to the view
  res.render('index', {

    user: req.user ? {
      name: req.user.name,
      _id: req.user._id,
      username: req.user.username,
      roles: req.user.roles
    } : {},

    settings: settings,

    modules: modules,

    isAdmin: isAdmin,

    adminEnabled: isAdmin() && mean.moduleEnabled('mean-admin')
  });
};
