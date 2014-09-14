'use strict';

module.exports = {

  debug: true,
  
  db: process.env.MONGOHQ_URL,

  app: {
    name: 'Columby.com'
  },

  jwt: {
    secret: process.env.JWT_SECRET,
  },

  mandrill: {
    key: process.env.MANDRILL_APIKEY,
  },

  elasticsearch: {
    host: '',
    port: ''
  },

  facebook: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  twitter: {
    clientID: 'CONSUMER_KEY',
    clientSecret: 'CONSUMER_SECRET',
    callbackURL: 'http://localhost:3000/auth/twitter/callback'
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  google: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  linkedin: {
    clientID: 'API_KEY',
    clientSecret: 'SECRET_KEY',
    callbackURL: 'http://localhost:3000/auth/linkedin/callback'
  },

  emailFrom: 'SENDER EMAIL ADDRESS', // sender address like ABC <abc@example.com>

  mailer: {
    service: 'SERVICE_PROVIDER',
    auth: {
      user: 'EMAIL_ID',
      pass: 'PASSWORD'
    }
  }
};
