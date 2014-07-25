var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment')

exports.view = function(req, res) {

    var getUsername = function(users, usernames, cb) {
        if (users.length == 0) return cb(usernames)
        var user = users.pop()
        User
            .findOne({
                "email": user
            })
            .exec(function(err, user) {
                if (err) return null;
                if (user) usernames.push(user.username)
                getUsername(users, usernames, cb)
            })
    }

    if (!req.params.assignmentNumber) 
        return next("no assignment number provided") 

    Assignment
        .find({
            assignmentID: req.params.assignmentNumber,
            shared: true
        })
        .exec(function(err, assignmentResult) {
            if (err) return next(err)
                
            if (!assignmentResult) return next("could not find " +
                "assignemnt " + req.params.assignmentNumber)

            var users = []
            for (i = 0; i < assignmentResult.length; i++)
                users.push(assignmentResult[i].email)

            getUsername(users, [], function(usernames) {

                return res.render('assignments/gallery', {
                    "title": "Assignment gallery",
                    "user":req.user,
                    "usernames": usernames,
                    "assignmentID":req.params.assignmentNumber
                })
            })
        })
}
