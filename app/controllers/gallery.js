var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment')

exports.view = function(req, res) {

    var assignmentNumber, assignmentNumber_old
    
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

    // This section allows the gallery to look for assignments with either an old or a new suffix (#.0 or #.00) regardless of how the number is submitted. 
    // Note: the assignment number will always be positive and whole, we just need to check the trailing zeros
    assignmentNumber = assignmentNumber_old = req.params.assignmentNumber.substr(0,req.params.assignmentNumber.indexOf(".") + 3);   

    if(assignmentNumber.substr(assignmentNumber.indexOf(".")).length !== 3) {
        if(assignmentNumber.indexOf(".") < 0 ) {
            assignmentNumber += ".00";
            assignmentNumber_old += ".0";
        // if there is a decimal, but not enough trailing zeros
        } else {//if(assignmentNumber.indexOf(".") > 0 && assignmentNumber.indexOf(".") < 3) {
            assignmentNumber_old += "0";
        }
    } else {
        assignmentNumber_old = assignmentNumber_old.substr(0, assignmentNumber_old.indexOf(".") + 2);
    }
     
    Assignment
        .find({
            //assignmentID: req.params.assignmentNumber,
            $or: [{assignmentID: assignmentNumber}, {assignmentID: assignmentNumber_old} ],
            shared: false //? should this not be true?
        })
        .exec(function(err, assignmentResult) {
            if (err) return next(err)
                
            if (!assignmentResult) return next("could not find " +
                "assignment " + req.params.assignmentNumber)

            
            if(assignmentResult == 0) {
                return res.render('assignments/gallery', {
                    "title": "Assignment gallery",
                    "user":req.user,
                    "usernames": "",
                    "assignmentID":-1
                })
            }
            
            if(assignmentResult.length <= 0) {
                return res.redirect('/username/'+req.user.username);
            }
            
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
