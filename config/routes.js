module.exports = function(app, passport, streamable) {

    //user routes
    var users = require('../app/controllers/users')
    app.get('/signup', users.signup)
    app.post('/users', users.create)

    app.get('/login', users.login)
    app.get('/home', isLoggedIn, users.display)
    app.get('/home/:username', isLoggedIn, users.display)

    app.delete('/users/:id', isLoggedIn, users.deletePerson)
    app.get('/users/apikey', users.getkey)
    app.get('/logout', users.logout)

    //general routes
    app.get('/', users.index);

    //stream routes

    var streams = require('../app/controllers/streams.js')
    app.get('/streams/:domain/*', hasAccess, streamable, streams.getSource)
    app.get('/streams/:domain', hasAccess, streamable, streams.getSource)

    //assignment routes
    var assignments = require('../app/controllers/assignments.js')
    app.post('/assignments/', assignments.upload)
    //app.get('/assignments/:username/:assignmentNumber', assignments.viewD3)

    //gallery routes
    //var gallery = require('../app/controllers/gallery.js')
    //app.get('/assignments/', gallery.view)
    //app.get('/assignments/:username', gallery.view)

    app.post('/users/session',
        passport.authenticate('local-log', {
            successRedirect: '/home',
            failureRedirect: '/login',
            failureFlash: true
        }))
    //, 
    //users.session)

    app.get('/connect/twitter',
        passport.authorize('twitter-authz', {
            failureRedirect: '/login'
        })
    )

    app.get('/auth/twitter/callback',
        passport.authorize('twitter-authz', {
            failureRedirect: '/login'
        }),
        function(req, res) {
            var user = req.user
            var account = req.account
            // Associate the Twitter account with the logged-in user.
            account.email = user.email
            account.save(function(err) {
                if (err) return (err)
                res.redirect('/home')

            })
        }
    )

}

//Allows users to by pass authentication to api requests
//if they have a valid api key.
function hasAccess(req, res, next) {
   
    //authenticated
    if (req.isAuthenticated()) return next()
    //not authenticated and no api key, use public
    if (!req.params[0]) return res.json({
        "error":"you must have an account to access the api"})
    
    //use api key
    var query = req.params[0].split("/")
    
    if (!query[3]) return res.json({
        "error":"because you are not logged in you must use an api key"})
    
    var mongoose = require('mongoose'),
        User = mongoose.model('User')

    User
        .findOne({
            apikey: query[3]
        })
        .exec(function(err, user) {
            if (!user) return res.json({ 
                "error":"you're api key is invalid"})
            
            req.user = user
            return next()
        })
}

//authentication
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next()
    res.redirect("/login")
}
