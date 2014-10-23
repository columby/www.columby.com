'use strict';

var search = require('../controllers/search');


module.exports = function(Columby, app, auth, database) {

  app.route('/api/v2/search').get(search.search);

};
