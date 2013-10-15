var users = require('../app/controllers/users')

module.exports = function(app,passport){

    //home route
    var home = require('../app/controllers/home');
    app.get('/', home.index);

    //user routes
    var users = require('../app/controllers/users')
    app.get('/signup', users.signup)
    app.post('/users', users.create)
   
    app.get('/login', users.login)
    app.get('/home', users.display)
    app.get('/home/:userId', users.display)

    app.get('/logout', users.logout)

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
            var user = req.user;
            var account = req.account;
            // Associate the Twitter account with the logged-in user.
            account.email = user.email;
            console.log(account);
            account.save(function(err) {
                if (err) {  return (err); }
                res.redirect('/home');

            });
        }
    );
    


    //Gallery Routes (D3 pages, gallery)

    //app.get /assignment#/username;

    app.get('/twitter', function(req, res){
        res.send('id: ' + req.query.id);
    });
};
