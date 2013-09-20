//Configure passport
//Each authentication type has a different strategy
//Users are managed by the database collection 'User'

var mongoose = require('mongoose')
    , LocalStrategy = require('passport-local').Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , twitterKeys = require('./twitterKeys')
    , User = mongoose.model('User')

module.exports = function (passport, config) {

    passport.serializeUser(function(user, done) {
        done(null, user.id)
      })

    passport.deserializeUser(function(id, done) {
        User.findOne({ _id: id }, function (err, user) {
            done(err, user)
        })
    })

    passport.use(new LocalStrategy({
           usernameField: 'username',
           passwordField: 'password'
    },
        
        function(email, password, done) {
            User.findOne({ email: email }, function (err, user) {
                if (err) { return done(err) }
            if (!user) {
                return done(null, false, { message: 'Unknown user' })
            }
            if (!user.authenticate(password)) {
                return done(null, false, { message: 'Invalid password' })
            }
                return done(null, user)
            })    
        }
    ))
    
    passport.use(new TwitterStrategy({
        consumerKey:    twitterKeys.consumer_key,
        consumerSecret: twitterKeys.consumer_secret,
        callbackURL:    twitterKeys.callbackURL
    },
    function(token, tokenSecret, profile, done) {
       console.log("HERE") 
       console.log(profile) 
      User.findOne({ 'twitter.id': profile.id }, function (err, user) {
        console.log(user)
        if (err) { return done(err) }
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.username,
            provider: 'twitter',
            twitter: profile._json
          })
          user.save(function (err) {
            if (err) console.log(err)
            return done(err, user)
          })
        }
        else {
          return done(err, user)
        }
      })
    }
  ))
}

