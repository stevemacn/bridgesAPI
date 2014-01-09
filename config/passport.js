//Configure passport
//Each authentication type has a different strategy
//Users are managed by the database collection 'User'

var mongoose = require('mongoose')
    , LocalStrategy = require('passport-local').Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , twitterKeys = require('./twitterKeys')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')


exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/login')
}

module.exports = function (passport, app, config) {

    var users = require('../app/controllers/users')

    app.post('/users/session',
        passport.authenticate('local', {
            successRedirect: '/home',
            failureRedirect: '/login',
            failureFlash: "User name or password incorrect"
        }), 
        users.session)

    app.get('/connect/twitter',
        passport.authorize('twitter-authz', { failureRedirect: '/login' })
    );

    app.get('/auth/twitter/callback',
        passport.authorize('twitter-authz', { failureRedirect: '/login' }),
        function(req, res) {
            var user = req.user
            var account = req.account
            // Associate the Twitter account with the logged-in user.
            account.email = user.email
            console.log(account)
            account.save(function(err) {
                if (err) {  return (err); }
                res.redirect('/home');

            });
        }
    );
    
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

