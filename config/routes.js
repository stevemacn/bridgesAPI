
module.exports = function(app, pass, streamable){

    //user routes
    var users = require('../app/controllers/users')
    app.get('/signup', users.signup)
    app.post('/users', users.create)
   
    app.get('/login', users.login)
    app.get('/home' ,users.display)
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
};
