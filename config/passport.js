//Configure passport
//Each authentication type has a different strategy
//Users are managed by the database collection 'User'

var mongoose = require('mongoose')
    , LocalStrategy = require('passport-local').Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , keys = require('./keys')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')


module.exports = function (passport, config) {

    //======================
    //passport session setup
    //======================
    
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done) {
        User.findOne({ _id: id }, function (err, user) {
            done(err, user)
        })
    })

    //======================
    //passport login setup
    //======================
    
    //Won't be called unless both user and pwd are entered.

    passport.use('local-log', new LocalStrategy({
           usernameField: 'username',
           passwordField: 'password',
           passReqToCallback: true 
    },
    
    function(req, email, password, done) {
        User.findOne({ username: email }, function (err, user) {
            if (err) { return done(err) }
            if (!user) 
                return done(null, false, 
                        req.flash('loginMessage', 'No user was found'))
    
            if (!user.authenticate(password)) 
                return done(null, false, 
                            req.flash('loginMessage', 'Invalid password'))//{ message: 'Invalid password' })
            
            return done(null, user)
        })    
    }))

    
    //======================
    //passport signup setup
    //======================
    
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function (req, email, password, done) {
        User.findOne({email: email}, function(err, user) {
            if (err) return done(err)
            if (!email)
                return done(null, false,
                        req.flash('signupMessage', 'User already associated to an email'))

        })
    }))

    //======================
    //passport twitter setup
    //======================

    twitterKeys = keys.twitter.keys
    passport.use('twitter-authz', new TwitterStrategy({
        consumerKey:    twitterKeys.consumer_key,
        consumerSecret: twitterKeys.consumer_secret,
        callbackURL:    twitterKeys.callbackURL
    },
    
    function(token, tokenSecret, profile, done) {
 
        Account.findOne({ domainProvider: 'twitter.com', uid: profile.id }, function(err, account) {
            if (err) { return done(err); }
            if (account) { return done(null, account); }                                                   
            
            var account = new Account();                  
            account.domainProvider = 'twitter.com';
            account.email = profile.email;
            account.uid = profile.id;
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

