var mongoose = require('mongoose')
      , User = mongoose.model('User')
      , Article = mongoose.model('Article');
 

//Set up the log in
var login = function (req, res) {
  if (req.session.returnTo) {
      res.redirect(req.session.returnTo)
      delete req.session.returnTo
      return
    }
  res.redirect('/')
}

exports.authCallback = login
exports.session = login

exports.login = function (req, res) {
    res.render("users/login", {
        title: 'Login',
        message: req.flash('error')

   })
}

exports.display = function (req, res) {
    var user = req.user

    console.log(req.user)
  res.render('users/index', {
      title: user,
      user: user
    })
}


//set up the signup
exports.signup = function (req, res) {
  res.render('users/signup', {
      title: 'Sign up',
      user: new User()
  })
}

exports.create = function (req, res) {
  var user = new User(req.body)
  user.provider = 'local'
  user.save(function (err) {
      if (err) {
            return res.render('users/signup', {
                    errors: (err.errors),
                    user: user,
                    title: 'Sign up'
             })
      }
  
      // manually login the user once successfully signed up
      req.logIn(user, function(err) {
          if (err) return next(err)
                  return res.redirect('/')
      })
  })
}

exports.user = function (req, res, next, id) {
  User
    .findOne({ _id : id })
    .exec(function (err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('Failed to load User ' + id))
      req.profile = user
      next()
    })
}
