var mongoose = require('mongoose'),
User = mongoose.model('User'),
Account = mongoose.model('Account'),
Assignment = mongoose.model('Assignment')

exports.view = function(req, res) {
 
    var getAssignments = function(assig, assignmentsRes, cb) {
        //console.log(assig, assignmentsRes);
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
      
        //Look up user to get email; assignments are associated with email
        User
            .findOne({
                username: req.params.userNameRes,
            })
            .exec(function(err, userResult){
                if(err) return next(err)
                
                if(!userResult) return next("could not find user")
                
                
//            })

        Assignment
            .find({
                  //email: req.params.userNameRes,
                email: userResult.email,
                $or: [{assignmentID: /.00$/}, {assignmentID: /.0$/}] //Search for assignments with whole numbers
                  //shared: true
            })
//            .limit( 5 )   //Do we want to load every single whole number assignment, or just some? Query might be time intensive. 
            .sort({ 
                assignmentID: -1 
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
        })
}
