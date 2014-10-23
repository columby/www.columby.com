'use strict';

module.exports = {

  // Database
  db: process.env.MONGOHQ_URL,

  app: {
    name: 'Columby.com'
  },

  // Login token
  jwt: {
    secret: process.env.JWT_SECRET,
  },

  // Email service
  mandrill: {
    key: process.env.MANDRILL_APIKEY,
  },

  // Amazon AWS S3 File Storage
  aws: {
    publicKey : process.env.AWS_ACCESS_KEY_ID,
    secretKey : process.env.AWS_SECRET_ACCESS_KEY,
    bucket    : process.env.S3_BUCKET_NAME,
    endpoint  : process.env.AWS_S3_ENDPOINT
  },

  // Search service
  elasticsearch: {
    host      : process.env.BONSAI_URL,
    logging   : 'error'
  }
};
