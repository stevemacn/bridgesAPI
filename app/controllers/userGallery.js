var mongoose = require('mongoose'),
    Assignment = mongoose.model('Assignment');

exports.view = function(req, res, next) {
  Assignment
      .find({
          email: req.user.email,
          subAssignment: "00"
      }, {
          assignmentID: 1,
          assignmentNumber: 1,
          "data.visual": 1,
          vistype: 1,
          shared: 1
      })
      //Do we want to load every single whole number assignment, or just some? Query might be time intensive.
      .limit( 25 )
      .exec(function(err, assignmentResult) {
          if (err) return next(err);
          if (!assignmentResult) return next("could not find " + "assignment " + req.params.userNameRes);

          // sort on assignment ID since assignmentID could be String
          assignmentResult.sort(function(a, b) {
              return parseFloat(a.assignmentID) - parseFloat(b.assignmentID);
          });

          return res.render('assignments/userGallery', {
            "title": "Assignment gallery",
            "user":req.user,
            "usernames": req.params.userNameRes,
            "assignments":assignmentResult
          });
      });
};
