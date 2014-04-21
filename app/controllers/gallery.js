var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , Assignment = mongoose.model('Assignment')

exports.view = function (req, res) {
   
    var getUsername = function(users, usernames, cb) {
        if (users.length==0) return cb(usernames)
        var user = users.pop()
        User
            .findOne({"email":user})
            .exec(function (err, user) {
                if (err) return null;
                if (user) usernames.push(user.username)
                getUsername(users, usernames, cb)
            })
    }

    Assignment
        .find({
            assignmentID: req.params.assignmentNumber,
            shared: true
        })
        .exec(function (err, assignmentResult) {
            if (err) return res.json({"error":err})
            if (!assignmentResult) 
                return res.json({"error":"could not find assignment"})
            
            var users = []
            for (i=0; i<assignmentResult.length; i++) 
                users.push(assignmentResult[i].email)

            getUsername(users, [], function(usernames) {
                res.send(usernames) 
            })
        })
}
