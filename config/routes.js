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
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: "User name or password incorrect"
        }), users.session)

    app.get('/auth/twitter',
         passport.authenticate('twitter'));

    app.get('/auth/twitter/callback', 
        passport.authenticate('twitter', { failureRedirect: '/login' }),
        function(req, res) {
             //Successful authentication, redirect home.
              return res.redirect('/');
        }
    );
  



    //Gallery Routes (D3 pages, gallery)

    //app.get /assignment#/username;

    app.get('/twitter', function(req, res){
        res.send('id: ' + req.query.id);
    });
};
