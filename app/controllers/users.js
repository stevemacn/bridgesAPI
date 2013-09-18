var mongoose = require('mongoose')
      , User = mongoose.model('User')
      , Article = mongoose.model('Article');
  
exports.index = function(req, res){
  Article.find(function(err, articles){
    if(err) throw new Error(err);
    res.render('users/signup', {
      title: 'Main Page',
      articles: articles
    })
  })
}

exports.register = function (req, res) {
    console.log("HERE");
    res.send('id: ' +req.query)
}




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
