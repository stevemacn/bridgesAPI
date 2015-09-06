module.exports = function(app, passport, streamable) {



    /**
     *  isPublic - allows public access to public assignments
     *  @req - requests
     *  @res - response
     *  @next - passing controller to the next handler
     */
    var isPublic = function(req, res, next){
        //return res.send("hello");
        var mongoose = require('mongoose'),
        Assignment = mongoose.model('Assignment'),
        User = mongoose.model('User');
        var a_user = false;


        User
            .findOne({
                     username: req.params.username
                     })
            .exec(function(err, user_local) {
                    if (err)
                        return next()
                    if (!user_local)
                        return next("there is no user with the username: " + req.params.username)
                  //authenticated
                    if (req.isAuthenticated()) {
                        a_user = true
                    }
                  })



        Assignment
            .findOne({
                     assignmentID: req.params.assignmentID
                     })
            .exec(function(err, assig){
                  //return res.send(a_user)
                  if (!assig)
                      return next("there is no assignment with this id")
                  else if (assig & a_user)
                    return next()
                  else if (assig.shared)
                      return next()
                  else if (!assig.shared & !a_user)
                        return next("the assignment is private")
                  else return next();
                //res.send(assig.shared)
                  })
    }

    //Allows users to by pass authentication to api requests
    //if they have a valid api key.
    var hasAccess = function(req, res, next) {

        //authenticated
        if (req.isAuthenticated()) {
            return next()
        }

        var mongoose = require('mongoose'),
            User = mongoose.model('User')
            var found = req.query.apikey;
            if (!found) return next(
                "Not logged in: you must provide" +
               " an apikey as a query variable")

            User
                .findOne({
                    apikey: found
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

    // -------------------------------------------------------
    //
    //  User Routes
    //
    // -------------------------------------------------------
    var users = require('../app/controllers/users')

    app.get('/', users.index);

    app.get('/signup', users.signup, handleError)
    app.post('/users', users.create, handleError)

    app.get('/login', users.login, handleError)
    app.get('/home', isLoggedIn, users.display, handleError)
    app.get('/profile', isLoggedIn, users.profile, handleError)
    app.get('/username', isLoggedInGallery, users.display, handleError)   //Login
    app.get('/home/:username', isLoggedIn, users.display, handleError)

    app.delete('/users/:id', isLoggedIn, users.deletePerson)
    app.get('/users/apikey', users.getkey, handleError)
    app.get('/logout', users.logout)



    // -------------------------------------------------------
    //
    //  Stream Routes
    //
    // -------------------------------------------------------
    var streams = require('../app/controllers/streams.js')

    app.get('/streams/:domain/*',
        hasAccess, streamable, streams.getSource, handleError)
    app.get('/streams/:domain',
        hasAccess, streamable, streams.getSource, handleError)



    // -------------------------------------------------------
    //
    //  Assignment Routes
    //
    // -------------------------------------------------------
    var assignments = require('../app/controllers/assignments.js')

    app.post('/assignments/:assignmentID',
        hasAccess, assignments.upload, handleError)
    app.post('/assignments/:assignmentNumber/share/:value',
        hasAccess, assignments.updateVisibility, handleError)


    //app.get('/assignments/:assignmentID/:username',
    //         isPublic, assignments.show, handleError)

    app.post('assignments/:assignmentNumber/saveSnapshot/', //allows user to save a snapshot of the positions of a graph.
              hasAccess, assignments.saveSnapshot, handleError)

    app.get('/assignments/:assignmentNumber/:username',
              assignments.show, handleError)


    // -------------------------------------------------------
    //
    //  Gallery Routes
    //
    // -------------------------------------------------------
    var gallery = require('../app/controllers/gallery.js')      // Public gallery
    var gallery_2 = require('../app/controllers/gallery_2.js')  // Private user gallery

    app.get('/assignments/:assignmentNumber', gallery.view, handleError)
    app.get('/assignments/', gallery.view, handleError)
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

    app.post('/search/', function(req, res, next) {
        var id = req.body.assignmentID;
        res.redirect('/assignments/'+id);
    });


    app.get('/search/:searchTerm', function(req, res) {
        //console.log(parseFloat(req.params.searchTerm), typeof parseFloat(req.params.searchTerm))
        res.redirect('/assignments/'+req.params.searchTerm);
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

    // -------------------------------------------------------
    //
    //  Test Routes
    //
    // -------------------------------------------------------
    var test = require('../app/controllers/test.js')      // Mongo Tests
    app.get('/testing', test.frustrated, handleError)

}
