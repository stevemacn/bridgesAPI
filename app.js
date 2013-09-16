

//Modules used.
var express = require('express')
    , fs = require('fs')
    , passport = require('passport')
    , config = require('./config/config')

//Set up database
var mongoose = require('mongoose')
mongoose.connect(config.db)
var db = mongoose.connection
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db)
})

//Bootstrap models.
var modelsPath = __dirname + '/app/models'
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file)
  }
})

//Bootstrap passport
require('./config/passport')(passport, config)

//Bootstrap express
var app = express()
require('./config/express')(app, config, passport)

//Bootstrap routes.
require('./config/routes')(app, passport)

app.listen(config.port)

exports = module.exports = app




/*
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
*/
