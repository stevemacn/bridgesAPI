var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')

//Setup for logging in via twitter
var login = function (req, res) {
    if (req.session.returnTo) {
        res.redirect(req.session.returnTo)
        delete req.session.returnTo
        return
    }
    return res.redirect('/home')  
}

exports.authCallback = login
exports.session = login



exports.index = function (req, res) {
    user = req.user
    res.render('home/index', {})
}
exports.login = function (req, res) {
    msg = req.flash('loginMessage')
    res.render("users/login", {
        title: 'Login',
        //message: req.flash('error')
        message: msg
   })
}

exports.logout = function (req, res) {
    req.logout()
    user=""
    res.redirect("login")
}

exports.display = function (req, res) {
    
    if (!req.user) return res.redirect("login")
    
    var accounts
        , user = req.user

    Account
        .findOne({ email : user.email })
        .exec(function (err, accts) {
            if (err) return next(err)
            //if (!accts) return next(new Error('Failed to load User ' + id))
            res.render('users/index', {
                title: user.username + "'s Dashboard - Bridges",
                user: user,
                acct: accts
            })
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
