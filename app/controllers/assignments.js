var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , Assignment = mongoose.model('Assignment')
    , assignmentID

function replaceAssignment (res, user, assignmentID) {

    //overwrite previous assignments by removing the original
    Assignment
        .remove({
            assignmentID: assignmentID,
            email: user.email        
        })
        .exec(function (err, resp) {
        
            //need to replace in the database...
            assignment = new Assignment()
            assignment.email = user.email
            assignment.nodes=rawBody.nodes
            assignment.links=rawBody.links
            assignment.assignmentID = assignmentID
            assignment.save()
            
            //notify user and log
            msg = "assignment added: "+user.email+" "+assignmentID
            console.log(msg)
            res.json({"msg":msg}) 
        })
}


exports.updateVisibility = function (req, res) {
    Assignment
        .findOne({
            email:req.user.email,
            assignmentID: req.params.assignmentID    
        })
        .exec(function (err, assignmentResult) {
            if (err) return res.json({"error":err})
            if (!assignmentResult) 
                return res.json({"error":"could not find assignment"})
            assignmentResult.shared=req.params.value 
            assignmentResult.save()
            res.send("OK")
        })
}


//problem because we aren't getting by username but by apikey
exports.upload = function (req, res) {
    
    try { rawBody = JSON.parse(req.body) } 
    catch (e) {return res.json({
        "error": "invalid json syntax for body"})}
    //need to add a more helpful response.
    
    var assignmentID = req.params.assignmentID
    
    User
        .findOne({
            apikey:req.query.apikey
        })
        .exec(function (err, user) {
            if (err) return res.json({"error":err})
            if (!user) 
                return res.json({"error":"could not find user"})
            
            replaceAssignment(res, user, assignmentID) 
        })
}


function getAssignment (req, res, email, cb) {
    assignmentID = req.params.assignmentID
    Assignment
        .findOne({
            email: email,
            assignmentID: req.params.assignmentID 
        })
        .exec(function (err, assignment) {
            if (err) return res.json({"error": err})
            if (!assignment) return res.json({
                "error":"couldn't find assignment"})
            
            if (assignment.shared!==true) return cb(assignment)
            return renderVis(res, assignment)         
        })
}

var sessionUser = null;

exports.show = function (req, res) {

    var username = req.params.username
    var apikey = req.query.apikey 
    
    if (typeof req.user != "undefined") sessionUser = req.user
    User
        .findOne({username: username})
        .exec(function(err, usr){
            if (err) return res.json({"error": err})
            if (!usr) return res.json({"error": 
                "could not find the username: "+username})
           
            getAssignment(req, res, usr.email, function (assign) {
               
                //Test whether user has permission to view vis
                testByUser(res, req, username, assign, function (){
                    testByKey(res, apikey, username, assign, null)
                })
            })
        })
}

//find whether there is a session, then test
function testByUser (res, req, username, assign, nextTest) {
    if (sessionUser) {
        return testAndMoveOn(
            res, sessionUser.username, username, assign, nextTest) 
    } else {
        if (nextTest) return nextTest()
        else
            return testAndMoveOn(res, true, false, assign, null) 
    }
}

//find user by key, then test
function testByKey (res, apikey, username, assign, nextTest) {
    if (apikey) {
        User
            .findOne({apikey:apikey})
            .exec(function (err, n){
                if (err) return res.json({"error":err})
                if (!n) return res.json ({"error":"invalid api key"})
                return testAndMoveOn(
                    res, n.username, username, assign, null) 
            })
    } else {
        if (nextTest) return nextTest()
        else
            return testAndMoveOn(res, true, false, assign, null) 
    }
}

//compare the usernames and move on
function testAndMoveOn (res, un1, un2, assign, nextTest) {
    console.log(un1 + " " + un2)
    if (un1 === un2) return renderVis (res, assign)

    if (nextTest) return nextTest()
    else return res.json({
        "error":"the data you requested is not public"})
}

function renderVis (res, assignment) {
    var owner=false
    if (sessionUser.email==assignment.email) owner = true; 
    return res.render ('assignments/index', {
        "user":sessionUser,
        "nodes":assignment.nodes,
        "links":assignment.links,
        "assignmentID":assignmentID,
        "shared":assignment.shared,
        "owner":owner
    })
}
