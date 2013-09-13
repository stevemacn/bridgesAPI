var express = require('express'),
    mongoose = require('mongoose'),
    twitterConfig = require("./config/twitterKeys.json"),
    fs = require('fs'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    config = require('./config/config');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

var app = express();
    
var TWITTER_CONSUMER_KEY = twitterConfig.consumer_key;
var TWITTER_CONSUMER_SECRET = twitterConfig.consumer_secret;

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
    },
function(token, tokenSecret, profile, done) {
      User.findOrCreate({ twitterId: profile.id }, function (err, user) {
            return done(err, user);
          });
    }
));
console.log("DONE");

require('./config/routes')(app, passport);
require('./config/express')(app, config);
app.listen(config.port);

