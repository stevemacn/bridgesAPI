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

    // C++ version posts JSON as object, JAVA posts as plain string
    if(typeof req.body != "object") {
        //console.log("STRING: PARSING");
        try { rawBody = JSON.parse(req.body) } 
        catch (e) { 

            if(typeof req.body != 'object') {
                console.log(e)
                return next(e + " invalid syntax for raw body of request")
            } else {
                rawBody = req.body;   
            }
        }
    } else { 
        //console.log("OBJECT ALREADY"); 
        rawBody = req.body;
    }
    

    var assignmentID = req.params.assignmentID;
    var visualizationType = rawBody.visual;
    
    if(visualizationType != "tree")
	visualizationType = "nodelink";
    
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
        
        //if this assignment is #.0, remove all sub assignments from #
        //console.log(((parseFloat(assignmentID)/1.0) % 1.0) == 0);
        
        //if(assignmentID.split('.')[1] == "0") {
        if (((parseFloat(assignmentID)/1.0) % 1.0) == 0) {
            if(assignmentID.split('.')[1] == "0")
                //assignmentID = assignmentID.substr(0, assignmentID.indexOf('.') + 2);
                assignmentID += "0";
            
            Assignment.remove({
                assignmentID: {$gte: Math.floor(parseFloat(assignmentID)), $lt: Math.floor(parseFloat(assignmentID) + 1) },
                email: user.email        
            })
            .exec(function (err, resp) {
            })
        }
        
        //remove previously uploaded assignment if exists
        Assignment.remove({
            assignmentID: assignmentID,
            email: user.email        
        })
        .exec(function (err, resp) {

            //create a new assignment in the database
            assignment = new Assignment()
            assignment.email = user.email
            assignment.vistype = visualizationType
            assignment.data = rawBody
            assignment.assignmentID = assignmentID
            assignment.schoolID = req.params.schoolID || ""
            assignment.classID = req.params.classID || ""
            assignment.save()
            
            
            //log new assignment
            //console.log("assignment added: "+user.email+
              //  " "+assignmentID)
            
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
    //var query = Assignment.find({'username': 'test'});
    //console.log(query);

    this.next = next 
    var assignmentID = req.params.assignmentID
    var schoolID = req.params.schoolID
    var classID = req.params.classID
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
        
        //db.products.find( { qty: { $gt: 25 } }, { item: 1, qty: 1 } )
        Assignment
            .find({
                email: email, 
                assignmentID: {$gte: Math.floor(parseFloat(assignmentID)), $lt: Math.floor(parseFloat(assignmentID) + 1)}
                
            })
            .sort({ 
                assignmentID: 1 
            })
            .exec(function(err, assignments) {
                if (err) return next(err);
                if (!assignments || assignments.length == 0) {
                         return next("Could not find assignment " + assignmentID);   
                } else if (assignments.length == 1) {
                    //console.log(assignments[0]);
                    return renderVis(res, assignments[0]);
                } else 
                    return renderMultiVis(res, assignments);
            });
           // console.log(assignmentID, username);
        
        // OLD CODE
        // Searches for the unique ID rather than the range
//        Assignment
//            .findOne({
//                email: email,
//                assignmentID: req.params.assignmentID 
//            })
//            .exec(function (err, assignment) {
//                if (err) return next(err) 
//                if (!assignment) return next("could not find assignment") 
//                
//                if (assignment.shared!==true) return cb(assignment)
//                //return renderVis(res, assignment)         
//            })
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
        
        //for(var i = 0; i < assignment.length(); i++)
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
            "schoolID":assignment.schoolID,
            "classID":assignment.classID,
            "vistype":vistype,
            "shared":assignment.shared,
            "owner":owner
        })
    }

    function renderMultiVis (res, assignments) {
        var owner=false
        var allAssigns = {};
        if (sessionUser) {
            if (sessionUser.email==assignments[0].email) owner = true; 
        }
    
        //default visualization
        //if (!assignments.vistype) assignments.vistype = "nodelink" 
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
        
        for(var i = 0; i < assignments.length; i++) {
            data = assignments[i].data.toObject()[0]
            //console.log("----DATA", data);
            //data = data[0]
        
            if (assignments[i].vistype == "tree") data = unflatten(data)   
            else data = flatten(data) 
        
            vistype = assignments[i].vistype 
            if ("error" in data) vistype = "error" 
            
            allAssigns[i] = data;
            
            //console.log("reading ", i);

        }
        
        return res.render ('assignments/assignmentMulti', {
            "title":"assignmentMulti",
            "user":sessionUser,
            "data":allAssigns,
            "extent":Object.keys(allAssigns).length,
            "assignmentID":assignmentID,
            "schoolID":assignments[0].schoolID,
            "classID":assignments[0].classID,
            "vistype":vistype,
            "shared":assignments[0].shared,
            "owner":owner
        })
    }
    

}

