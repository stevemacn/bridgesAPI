
module.exports = function(app,passport, streamable){

    //user routes
    var users = require('../app/controllers/users')
    app.get('/signup', users.signup)
    app.post('/users', users.create)
   
    app.get('/login', users.login)
    app.get('/home', users.display)
    app.get('/home/:username', users.display)

    app.get('/logout', users.logout)

    //general routes
	app.get('/', users.index);

    //stream routes
    
    var streams = require('../app/controllers/streams.js')
    app.get('/streams/:domain/*', streamable, streams.getSource)
    app.get('/streams/:domain', streamable, streams.getSource)
    //assignment routes
    //var assignments = require('../app/controllers/assignments.js')
    //app.post('/assignments/:assignmentNumber', assignments.upload)
    //app.get('/assignments/:username/:assignmentNumber', assignments.viewD3)
    
    //gallery routes
    //var gallery = require('../app/controllers/gallery.js')
    //app.get('/assignments/', gallery.view)
    //app.get('/assignments/:username', gallery.view)


    //authentication
    app.post('/users/session',
        passport.authenticate('local', {
            successRedirect: '/home',
            failureRedirect: '/login',
            failureFlash: "User name or password incorrect"
        }), users.session)

        app.get('/connect/twitter',
            passport.authorize('twitter-authz', { failureRedirect: '/login' })
        );

        app.get('/auth/twitter/callback',
            passport.authorize('twitter-authz', { failureRedirect: '/login' }),
            function(req, res) {
                console.log("enter")
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
};
