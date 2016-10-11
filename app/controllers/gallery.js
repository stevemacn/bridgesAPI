var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment')
    visTypes = require('./visTypes.js');

exports.view = function(req, res) {
    var assignmentNumber

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

    var getAssignmentsEmailAndUsernameMap = function(users, usernamesmap, cb) {
        if (users.length == 0) return cb(usernamesmap)
        var user = users.pop()
        User
            .findOne({
                "email": user
            })
            .exec(function(err, user) {
                if (err) return null;
                if (user){
                  // usernames.push(user.username)
                  usernamesmap[user.email] = user.username
                }
                getAssignmentsEmailAndUsernameMap(users, usernamesmap, cb)
            })
    }

    if (!req.params.assignmentNumber) {
      return next("No assignment number given");


    } else {

      assignmentNumber = req.params.assignmentNumber;

      Assignment
          .find({
              assignmentNumber: assignmentNumber,
              subAssignment: "00",
              shared: true
          })
          .exec(function(err, assignmentResult) {

              if (err) return next(err)
              if (!assignmentResult) return next("could not find " +
                  "assignment " + req.params.assignmentNumber)

              if(assignmentResult.length == 0) {
                  return res.render('assignments/gallery', {
                      "title": "Assignment gallery",
                      "user":req.user,
                      "assignments": "",
                      "assignmentNumber":-1
                  })
              }

              if(assignmentResult.length <= 0) {
                  return res.redirect('/username/'+req.user.username);
              }

              var users = []
              for (i = 0; i < assignmentResult.length; i++)
                  users.push(assignmentResult[i].email)

              // getUsername(users, [], function(usernames) {
              //
              //     return res.render('assignments/gallery', {
              //         "title": "Assignment gallery",
              //         "user":req.user,
              //         "usernames": usernames,
              //         "assignmentNumber":req.params.assignmentNumber,
              //         "assignments":assignmentResult
              //     })
              // })

              var usernamesmap = {};
              getAssignmentsEmailAndUsernameMap(users, usernamesmap, function(usernamesmap) {

                  for(assignmentResultItem in assignmentResult){
                      assignmentResult[assignmentResultItem]['username'] = usernamesmap[assignmentResult[assignmentResultItem]['email']];
                      assignmentResult[assignmentResultItem]['vistype'] = visTypes.getVisType(assignmentResult[assignmentResultItem]['data'][0].visual);
                      // assignmentResult[assignmentResultItem]['thumbnail'] = assignmentResult[assignmentResultItem]['vistype'];
                  }

                  return res.render('assignments/gallery', {
                      "title": "Assignment gallery",
                      "user":req.user,
                      "assignmentNumber":req.params.assignmentNumber,
                      "assignments":assignmentResult
                  })
              })
          })
        }
}
