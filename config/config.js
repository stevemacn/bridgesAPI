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
    port: 3000,
    //db: 'mongodb://heroku_app27208241:lg0jm38s5r1pbl0g6e68fcbiih@ds061228.mongolab.com:61228/heroku_app27208241'
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
    port: 3000,
    db: 'mongodb://localhost/bridgesapi-production'
    //db: 'mongodb://heroku_app27208241:lg0jm38s5r1pbl0g6e68fcbiih@ds061228.mongolab.com:61228/heroku_app27208241'
  }



};


module.exports = config[env];
