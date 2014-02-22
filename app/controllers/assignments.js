var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , Assignment = mongoose.model('Assignment')

function checkKey (query) {
    if (typeof req.query.apikey === 'undefined') 
        return res.json({"error":"apikey is not valid"})
    if (!req.query.apikey) 
        return res.json({"error":"apikey must be used"})

}


//Setup for logging in via twitter
exports.upload = function (req, res) {
    
    try { rawBody = JSON.parse(req.body) } 
    catch (e) {return res.json({
        "error": "invalid json syntax for body"})}
    //need to add a more helpful response.
      
    
    User
        .findOne({
            apikey:req.query.apikey
        })
        .exec(function (err, user) {
            if (err) return res.json({"error":err})
            if (!user) 
                return res.json({"error":"could not find user"})
            if (!user.email)
                return res.json({"error":"invalid user"})
           
            //need to replace in the database...
            assignment = new Assignment()
            assignment.email = user.email
            assignment.nodes=rawBody.nodes
            assignment.links=rawBody.links
            assignment.assignmentID = req.params.assignmentID
            assignment.save()
            console.log("new assignment added for "+
                user.email+ " "+req.params.assignmentID)
            res.json("success") 
        })
}


function getAssignment (res, email) {
    Assignment
        .findOne({
            email: email
        })
        .exec(function (err, assignment) {
            console.log(err)
            console.log(assignment)
            return res.render ('assignments/index', {
                "nodes":assignment.nodes,
                "links":assignment.links})
        })
}


exports.show = function (req, res) {
    
    console.log("User: "+req.user.email)

    if (!req.user && !req.query.apikey)
        return res.json({"error":"not authorized to view this page"})
  
    if (req.user) {
        return getAssignment(res, req.user.email)
    }

    User
        .findOne({
            apikey:req.query.apikey,
        })
        .exec(function (err, user) {
            if (!user) return res.json({"msg":"no user found"})
            getAssignment(res, user.email) 
        })
    
    //get data from databse...
    //get based upon request...

}
