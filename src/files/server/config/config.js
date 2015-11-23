'use strict';
var path = require('path');

//var p = require('./../../../../package.json');
console.log(p.appVersion);

module.exports = {
  //appVersion: p.appVersion,

  root: path.normalize(__dirname + '/../..'),

  env: process.env.NODE_ENV || 'development',

  port: process.env.NODE_FILES_PORT || 8500,

  db: {
    cms: {
      uri: process.env.DATABASE_CMS_URL
    },
    postgis: {
      uri: process.env.DATABASE_POSTGIS_URL
    }
  },

  aws: {
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    s3url: process.env.AWS_S3_ENDPOINT
  },

  jwt: {
    secret: process.env.JWT_SECRET
  },

  mandrill: {
    key: process.env.MANDRILL_API_KEY
  },

  auth0: {
    domain: process.env.AUTH0_DOMAIN
  }
};
