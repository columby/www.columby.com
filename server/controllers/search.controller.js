'use strict';

var config = require('../config/environment/index.js'),
    Dataset = require('../models/index').Dataset,
    Account = require('../models/index').Account,
    Sequelize = require('sequelize')
;


// Get list of searchs
exports.search = function(req, res) {
  if (!req.query.query) {
    handleError(res, 'error, no query provided');
  }

  var query = JSON.parse(req.query.query);
  var q = query.body.query.wildcard._all;

  // @todo Sequelize.or does not seem to work or I implemented it wrongly.. (marcelfw)

  var dataset_wheres = [];
  var _q = q.trim().split(" ");
  for(var idx=0; idx < _q.length; idx++) {
      dataset_wheres.push({title: { ilike: "%"+_q[idx]+"%" }});

      // disabled until Sequelize.or works..
      //dataset_wheres.push({description: { ilike: "%"+_q[idx]+"%" }});
  }

  var account_wheres = [];
  var _q = q.trim().split(" ");
  for(var idx=0; idx < _q.length; idx++) {
      account_wheres.push({name: { ilike: "%"+_q[idx]+"%" }});
  }

  var chain = new Sequelize.Utils.QueryChainer();

  new Sequelize.Utils.QueryChainer()
    .add(Dataset.findAll({where: Sequelize.or(dataset_wheres)}).on('sql', console.log))
    .add(Account.findAll({where: Sequelize.or(account_wheres)}).on('sql', console.log))
    .run()
    .success(function(_results){
        var results = [];
        // add datasets
        for(var idx=0; idx < _results[0].length; idx++) {
            var weight = 10;
            // @todo fix weight..
            results.push({title: _results[0][idx].title, description: _results[0][idx].description, weight:weight});
        }
        // add accounts
        for(var idx=0; idx < _results[1].length; idx++) {
            var weight = 5;
            // @todo fix weight..
            results.push({title: _results[1][idx].name, description: '', weight:weight});
        }
        // sort on weight
        results.sort(function(a,b){
            if (a.weight > b.weight) {
                return -1;
            }
            if (a.weight < b.weight) {
                return +1;
            }
            return 0;
        });
        return res.json(results);
    })
    .error(function(err){
        console.log(err);
        handleError(res, err);
    })
    ;

  //return res.json({status:"ok", query:query});
};


function handleError(res, err) {
  return res.send(500, err);
}
