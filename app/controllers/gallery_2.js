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
          shared: 1
      })
      .limit( 25 )   //Do we want to load every single whole number assignment, or just some? Query might be time intensive.
      .sort({
          assignmentID: 1
      })
      .exec(function(err, assignmentResult) {
          if (err) return next(err);
          if (!assignmentResult) return next("could not find " + "assignment " + req.params.userNameRes);

          return res.render('assignments/gallery_2', {
            "title": "Assignment gallery",
            "user":req.user,
            "usernames": req.params.userNameRes,
            "assignments":assignmentResult
          });


      });
};
