//Configures mongo database depending upon the environment type

var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 5000,
    db: 'mongodb://localhost/bridgesapi-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 3000,
    db: 'mongodb://localhost/bridgesapi-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 5000,
    //db: 'mongodb://localhost/bridgesapi-production'
    db: 'mongodb://ds061228.mongolab.com:61228/heroku_app27208241'
  }



};


module.exports = config[env];
