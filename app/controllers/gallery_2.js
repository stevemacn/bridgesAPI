var mongoose = require('mongoose'),
User = mongoose.model('User'),
Account = mongoose.model('Account'),
Assignment = mongoose.model('Assignment')

exports.view = function(req, res) {
    
    var getAssignments = function(assig, assignmentsRes, cb) {
        if (assig.length == 0) return cb(assignmentsRes)
            var assID = assig.pop()
            Assignment
            .findOne({
                     "assignmentID": assID
                     })
            .exec(function(err, assID) {
                  if (err) return null;
                  if (assID) assignmentsRes.push(assID)
                  getAssignments(assig, assignmentsRes, cb)
                  })
            }

    if (!req.params.userNameRes)
        return next("no user name provided")
        
        Assignment
        .find({
              email: req.params.userNameRes,
              //shared: true
              })
        .exec(function(err, assignmentResult) {
              if (err) return next(err)
              
              if (!assignmentResult) return next("could not find " +
                                                 "assignment " + req.params.userNameRes)
              
              var assig = []
              for (i = 0; i < assignmentResult.length; i++)
              assig.push(assignmentResult[i].assignmentID)
              
             getAssignments(assig, [], function(assignmentsRes) {
                          
                          return res.render('assignments/gallery_2', {
                                            "title": "Assignment gallery",
                                            "user":req.user,
                                            "usernames": req.params.userNameRes,
                                            "assignments":assignmentsRes
                                            })
                          })
              })
}
