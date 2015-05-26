
var express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , pkg = require('../package.json')
  , flash = require('connect-flash')

module.exports = function (app, config, passport) {

    app.set('showStackError', true)

    // should be placed before express.static
    app.use(express.compress({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
        },
        level: 9
    }))

    app.use(express.favicon(config.root + '/public/img/favicon.ico'));
    app.use(express.static(config.root + '/public'))

    // don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(express.logger('dev'))
    }

    // set views path, template engine and default layout
    app.set('views', config.root + '/app/views')
    app.set('view engine', 'jade')

    app.configure(function () {
    // expose package.json to views
    app.use(function (req, res, next) {
        res.locals.pkg = pkg
        next()
    })

    // cookieParser should be above session
    app.use(express.cookieParser())

    //custom middleware from https://gist.github.com/shesek/4651267
    //to get rawbody from request.
    app.use(function(req, res, next) {
      if (!req.is('text/plain')) {
          return next();
        }
      req.body = '';
      req.on('data', function(data) {
          return req.body += data;
        });
      return req.on('end', next);
    })

    // bodyParser should be above methodOverride
    app.use(express.bodyParser())
    app.use(express.methodOverride())

    // express/mongo session storage
    app.use(express.session({
        secret: 'noobjs',
        store: new mongoStore({
            url: config.db,
            collection : 'sessions'
        })
    }))

    // use passport session
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    
//http://stackoverflow.com/questions/13516898/disable-csrf-validation-for-some-requests-on-express
    app.use(function (req, res, next) {

        needCSRF = false;
        if (req.url.indexOf("/assignments")==-1) needCSRF=true
        
        if (needCSRF) {
            express.csrf()(req, res, function () {
                res.locals.csrftoken = req.csrfToken();
                next ();
            });
        } else {
            next();
        }
    })

    // routes should be at the last
    app.use(app.router)

    app.use(function(err, req, res, next){
      // treat as 404
      if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next()
      }
      // send emails if you want
      console.error(err.stack)
      // error page
      res.status(500).render('500', { error: err.stack })
    })

    // assume 404 since no middleware responded
    app.use(function(req, res, next){
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      })
    })
  })

  // development env config
  app.configure('development', function () {
    app.locals.pretty = true
  })
}
