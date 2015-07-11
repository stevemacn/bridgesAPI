module.exports = function(app, passport, streamable) {

    //Allows users to by pass authentication to api requests
    //if they have a valid api key.
    var hasAccess = function(req, res, next) {

        //authenticated
        if (req.isAuthenticated()) {
            return next()
        }

        var mongoose = require('mongoose'),
            User = mongoose.model('User')

            if (!req.query.apikey) return next(
                "Not logged in: you must provide" +
                " an apikey as a query variable")

            User
                .findOne({
                    apikey: req.query.apikey
                })
                .exec(function(err, user) {
                    if (!user)
                        return next("your api key is invalid")
                    req.user = user
                    return next()
                })
    }

    //authentication
    var isLoggedIn = function(req, res, next) {

        if (req.isAuthenticated()){
            //res.redirect("/username/"+req.user.username)
            //res.redirect("/home/")
            return next()
        }
        res.redirect("/login")
    }
    
    var isLoggedInGallery = function(req, res, next) {
        if (req.isAuthenticated()){
            return res.redirect("/username/"+req.user.username)
            //res.redirect("/home/")
            //return next()
        }
        res.redirect("/login")
    }

    var handleError = function(err, req, res, next) {
       
        //if provided an object
        if (err.err) return errObj(err) 
       
        //else provided a string
        return res.json(503, {
            "error": err
        })
       
        function errObj(err) {
            
            var msg = {} 

            if (err.tip) msg.tip = err.tip
            if (err.err) msg.error = err.err

            return res.json(503, msg)
        }
    }

    //user routes
    var users = require('../app/controllers/users')
    //var assignments = require('../app/controllers/assignments.js')
    app.get('/signup', users.signup, handleError)
    app.post('/users', users.create, handleError)

    app.get('/login', users.login, handleError)
    app.get('/home', isLoggedIn, users.display, handleError)
    app.get('/username', isLoggedInGallery, users.display, handleError)
    app.get('/home/:username', isLoggedIn, users.display, handleError)

    app.delete('/users/:id', isLoggedIn, users.deletePerson)
    app.get('/users/apikey', users.getkey, handleError)
    app.get('/logout', users.logout)

    //general routes
    app.get('/', users.index);
    

    //stream routes

    var streams = require('../app/controllers/streams.js')
    app.get('/streams/:domain/*',
        hasAccess, streamable, streams.getSource, handleError)
    app.get('/streams/:domain',
        hasAccess, streamable, streams.getSource, handleError)

    //assignment routes
    var assignments = require('../app/controllers/assignments.js')
    app.post('/assignments/:assignmentID',
        hasAccess, assignments.upload, handleError)
    app.post('/assignments/:assignmentID/share/:value',
        hasAccess, assignments.updateVisibility, handleError)
    app.post('/assignments/:assignmentID/vistype/:value',
        hasAccess, assignments.updateVistype, handleError)
    app.get('/assignments/:assignmentID/:username',
             hasAccess, assignments.show, handleError)
    app.get('/assignments/:assignmentID/:username',
        assignments.show, handleError)

    //gallery routes
    var gallery = require('../app/controllers/gallery.js')
    app.get('/assignments/:assignmentNumber', gallery.view, handleError)
    
    //gallery routes
    var gallery_2 = require('../app/controllers/gallery_2.js')
    app.get('/username/:userNameRes', isLoggedIn, gallery_2.view, handleError)

    app.post('/users/session',
        passport.authenticate('local-log', {
            successRedirect: '/username/',
            failureRedirect: '/login',
            failureFlash: true
        }))
    
    // -------------------------------------------------------
    //
    //  Search Routes
    //
    // -------------------------------------------------------
    
    app.post('/search', function(req, res, next) {
        var id = req.body.assignmentID;
//        if(id.indexOf(".") < 0) id+=".00";
        res.redirect('/assignments/'+id);
    });
    
    
    app.get('/search/:assignmentID', function(req, res) {
        //console.log(req.params.assignmentID);
        res.redirect('/assignments/'+req.params.assignmentID);
    });
    
    
    // -------------------------------------------------------
    //
    //  Authentication Routes
    //
    // -------------------------------------------------------

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
