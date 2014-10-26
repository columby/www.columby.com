'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/columby-dev'
  },

  jwt: {
    secret: process.env.JWT_SECRET
  },
  
  mandrill : {
    key: process.env.MANDRILL_KEY
  },

  seedDB: true
};
