'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/columby-dev'
  },

  db:{
    dialect : process.env.DB_DIALECT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name    : process.env.DB_NAME,
    port    : process.env.DB_PORT
  },

  jwt: {
    secret: process.env.JWT_SECRET
  },

  mandrill : {
    key: process.env.MANDRILL_API
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
    logging   : 'trace'
  },

  embedly: {
    key       : process.env.EMBEDLY_KEY
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key   : process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  },

  seedDB: true
};
