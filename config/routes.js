module.exports = function(app,passport){

	//home route
	var home = require('../app/controllers/home');
	app.get('/', home.index);


    app.get('/auth/twitter',
         passport.authenticate('twitter'));

    app.get('/auth/twitter/callback', 
        passport.authenticate('twitter', { failureRedirect: '/login' }),
        function(req, res) {
             //Successful authentication, redirect home.
              res.redirect('/');
        }
    );


    //app.get /assignment#/username;


    app.get('/twitter', function(req, res){
        res.send('id: ' + req.query.id);
    });
};
