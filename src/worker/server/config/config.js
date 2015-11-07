'use strict';

var path = require('path');

module.exports = {

  root           : path.normalize(__dirname + '/../..'),
  env            : process.env.NODE_ENV || 'development',
  port           : process.env.NODE_WORKER_PORT || 7000,

  db: {
    cms: {
      uri        : process.env.DATABASE_CMS_URL,
      dialect    : process.env.DATABASE_CMS_DIALECT || 'postgres'
    },
    postgis: {
      uri        : process.env.DATABASE_POSTGIS_URL
    }
  },

  jwt: {
    secret       : process.env.JWT_SECRET
  },

  mandrill : {
    key          : process.env.MANDRILL_API_KEY
  },

  fortes: {
    url          : process.env.FORTES_LINK,
    username     : process.env.FORTES_USERNAME,
    password     : process.env.FORTES_PASSWORD
  }
};
