window.user = {};

// local
window.config = {

  version   : '1.0.6',

  apiRoot   : 'http://localhost:8000',
  workerRoot: 'http://localhost:8500',
  filesRoot : 'http://localhost:7000',
  embedlyKey: '844b2c4d25334b4db2c327f10c70cb54',
  aws: {
   endpoint: 'https://s3.amazonaws.com/columby-dev/'
  }
};


// development
// window.config = {
//
//   version   : '1.0.6',
//
//   apiRoot   : 'https://dev-api.columby.com',
//
//   workerRoot: 'https://dev-worker.columby.com',
//
//   filesRoot : 'https://dev-files.columby.com',
//
//   embedlyKey: '844b2c4d25334b4db2c327f10c70cb54',
//
//   aws: {
//    endpoint: 'https://s3.amazonaws.com/columby-dev/'
//   }
// };
