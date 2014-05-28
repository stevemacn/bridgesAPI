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
            assignment.data=rawBody
            assignment.assignmentID = assignmentID
            assignment.save()
            
            //notify user and log
            msg = "assignment added: "+user.email+" "+assignmentID
            console.log(msg)
            res.json({"msg":msg}) 
        })
}


exports.updateVisibility = function (req, res, next) {
    Assignment
        .findOne({
            email:req.user.email,
            assignmentID: req.params.assignmentID    
        })
        .exec(function (err, assignmentResult) {
            if (err) return next(err)
            if (!assignmentResult) 
                return next("could not find assignment")
            assignmentResult.shared=req.params.value 
            assignmentResult.save()
            res.send("OK")
        })
}


//problem because we aren't getting by username but by apikey
exports.upload = function (req, res, next) {
    
    try { rawBody = JSON.parse(req.body) } 
    catch (e) { 
        console.log(e)
        return next("invalid syntax for raw body of request")
    }

    var assignmentID = req.params.assignmentID
    
    User
        .findOne({
            apikey:req.query.apikey
        })
        .exec(function (err, user) {
            if (err) return next (err)
            if (!user) return next ("could not find user by apikey: " + 
                        req.query.apikey) 
            
            replaceAssignment(res, user, assignmentID) 
        })
}


function getAssignment (req, res, next, email, cb) {
    assignmentID = req.params.assignmentID
    next = next
    Assignment
        .findOne({
            email: email,
            assignmentID: req.params.assignmentID 
        })
        .exec(function (err, assignment) {
            if (err) return next(err) 
            if (!assignment) return next("could not find assignment") 
            
            if (assignment.shared!==true) return cb(assignment)
            return renderVis(res, assignment)         
        })
}

var sessionUser = null;

exports.next = null

exports.show = function (req, res, next) {
    this.next = next 
    
    var username = req.params.username
    var apikey = req.query.apikey 
    if (typeof req.user != "undefined") sessionUser = req.user
    User
        .findOne({username: username})
        .exec(function(err, usr){
            if (err) return next(err) 
            if (!usr) 
                return next("couldn't find the username "+username) 
           
            getAssignment(req, res, next, usr.email, function (assign) {
               
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
                if (err) return next (err)
                if (!n) return next ("Invalid apikey: "+apikey)
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
    else return next ("the data you requested is not public")
}

function renderVis (res, assignment) {
    var owner=false
    if (sessionUser) {
        if (sessionUser.email==assignment.email) owner = true; 
    } 
    return res.render ('assignments/index', {
        "user":sessionUser,
        "data":assignment.data,
        "assignmentID":assignmentID,
        "shared":assignment.shared,
        "owner":owner
    })
}
