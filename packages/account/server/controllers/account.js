'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User');

/**
 * Send logged in User account
 */
exports.account = function(req, res) {
  console.log('returning account', req.user);
  return res.json(req.user || null);
};


exports.updateAccount = function(req, res) {
  var id = req.body.update.id ;
  console.log('id', id);

  var update = { $set: req.body.update.account };
  console.log('update', update);

  User.update({_id: id}, update, function(err, account){
    console.log('error', err);
    console.log('account', account);
    if (err) return res.json({
      status:'error',
      err: err
      });
    if (account === 0) {
      return res.json({
        status: 'error',
        err: 'No account updated'
      });
    }
    return res.json({
      status: 'success',
      statusMessage: 'Account updated'
    });
  });
};
