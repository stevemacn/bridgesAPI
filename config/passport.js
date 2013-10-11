//Configure passport
//Each authentication type has a different strategy
//Users are managed by the database collection 'User'

var mongoose = require('mongoose')
    , LocalStrategy = require('passport-local').Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , twitterKeys = require('./twitterKeys')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')

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
   
    passport.use('twitter-authz', new TwitterStrategy({
        consumerKey:    twitterKeys.consumer_key,
        consumerSecret: twitterKeys.consumer_secret,
        callbackURL:    twitterKeys.callbackURL
    },
    
    function(token, tokenSecret, profile, done) {
 
        Account.findOne({ domain: 'twitter.com', uid: profile.id }, function(err, account) {
            if (err) { return done(err); }
            if (account) { return done(null, account); }                                                   
            var account = new Account();                  
            account.domain = 'twitter.com';
            account.email = profile.email;
            account.uid = profile.id;
            console.log(token);
            console.log(tokenSecret);
            var t = { 
                kind: 'oauth',
                token: token,
                tokenSecret: tokenSecret 
            }
            console.log(t);
            account.tokens = t;
            return done(null, account);
      });
  }
));

}

