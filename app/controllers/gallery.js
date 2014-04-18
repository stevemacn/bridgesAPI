var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , Assignment = mongoose.model('Assignment')

exports.view = function (req, res) {
    
    Assignment
        .find({
            assignmentID: req.params.assignmentNumber,
            shared: true
        })
        .exec(function (err, assignmentResult) {
            if (err) return res.json({"error":err})
            if (!assignmentResult) 
                return res.json({"error":"could not find assignment"})
            console.log(assignmentResult.length)
            var users = []
            for (i=0; i<assignmentResult.length; i++) {
                console.log(assignmentResult[i].email)
                users.push(assignmentResult[i].email)
            }
            res.send(users) 
        })
}
