var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , Assignment = mongoose.model('Assignment')
    , treemill = require('treemill') 

//API route for ajax requests to change the visual 
//representation of the data they uploaded.
exports.updateVistype = function (req, res, next) {
    
    console.log('update vistype for ' + req.user.email + 
        ' '+req.params.assignmentID)

    Assignment
        .findOne({
            email:req.user.email,
            assignmentID: req.params.assignmentID    
        })
        .exec(function (err, assignmentResult) {
            if (err) return next(err)
            if (!assignmentResult) 
                return next("could not find assignment")
            //validate the vis type is implemented..
            vistypes = ["nodelink", "tree", "queue"]
            if (vistypes.indexOf(req.params.value) == -1) 
                return next("specified vistype is not implemented")
            assignmentResult.vistype=req.params.value 
            assignmentResult.save()
            res.send("OK")
        })
}

//API route to toggle the visibility of an assignment 
//between private and public.
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

//API route for uploading assignment data. If the 
//assignment already exists it will be replaced.
exports.upload = function (req, res, next) {
    
    try { rawBody = JSON.parse(req.body) } 
    catch (e) { 
        console.log(e)
        return next("invalid syntax for raw body of request")
    }

    var assignmentID = req.params.assignmentID
   
    //get username from apikey 
    User.findOne({
        apikey:req.query.apikey
    })    
    .exec(function (err, user) {    
        if (err) return next (err)    
        if (!user) return next ("could not find user by apikey: " + 
                        req.query.apikey)

        //if username found, upload or replace 
        replaceAssignment(res, user, assignmentID) 
    })

    function replaceAssignment (res, user, assignmentID) {
        
        //remove previously uploaded assignment if exists
        Assignment.remove({
            assignmentID: assignmentID,
            email: user.email        
        })
        .exec(function (err, resp) {
            //create a new assignment in the database
            assignment = new Assignment()
            assignment.email = user.email
            assignment.data = rawBody
            assignment.assignmentID = assignmentID
            assignment.save()
            
            //log new assignment
            console.log("assignment added: "+user.email+
                " "+assignmentID)
            
            //report to client
            User.findOne({
                email: user.email
            }).exec(function (err, resp) {
                res.json({"msg":assignmentID+"/"+resp.username}) 
            })
        })
    }
}

var sessionUser = null;

exports.next = null

exports.show = function (req, res, next) {
    
    this.next = next 
    var assignmentID = req.params.assignmentID
    var username = req.params.username
    var apikey = req.query.apikey 
    sessionUser = null
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
    
        //default visualization
        if (!assignment.vistype) assignment.vistype = "nodelink" 
        //check data for flat vs unflattened representation
        
        var unflatten = function (data) { 
            //check whether the data is already hierachical
            if ("children" in data) return data
            tm = treemill() 
            tree = tm.unflatten(data)       
            return tree
        }
    
        var flatten = function (data) {
            //check whether the data is already flat
            if ("nodes" in data) return data 
            tm = treemill() 
            tree = tm.flatten(data)       
            return tree 
        }
        data = assignment.data.toObject()
        data = data[0]
        
        if (assignment.vistype == "tree") data = unflatten(data)   
        else data = flatten(data) 
        
        vistype = assignment.vistype 
        if ("error" in data) vistype = "error"  
            
        return res.render ('assignments/assignment', {
            "title":"assignment",
            "user":sessionUser,
            "data":data,
            "assignmentID":assignmentID,
            "vistype":vistype,
            "shared":assignment.shared,
            "owner":owner
        })
    }


}

