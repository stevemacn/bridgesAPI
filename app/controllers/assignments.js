    var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , Assignment = mongoose.model('Assignment')
    , treemill = require('treemill')
    , visTypes = require('./visTypes.js')

//API route to toggle the visibility of an assignment
//between private and public.
exports.updateVisibility = function (req, res, next) {

    Assignment
        .find({
            email:req.user.email,
            assignmentNumber: req.params.assignmentNumber
        })
        .exec(function (err, assignmentResult) {
            if(err) console.log(err);

            for(var i = 0; i < assignmentResult.length; i++) {
              // console.log((err) ? err : assignmentResult);
              if (err) return next(err)
              if (!assignmentResult[i])
                  return next("could not find assignment")
              assignmentResult[i].shared=req.params.value
              assignmentResult[i].save()
              //console.log("CHANGED TO " + req.params.value + " " + assignmentResult[i]);

            }
            res.send("OK")

        })
}

//API route to save the position of some (or all) node positions
exports.saveSnapshot = function(req, res, next) {
    Assignment
        .findOne({
            email:req.user.email,
            assignmentNumber: req.params.assignmentNumber
        })
        .exec(function (err, assignmentResult) {
            if (err) return next(err)
            if (!assignmentResult)
                return next("could not find assignment")
            console.log("snapshot")
            //Save JSON with modified positions
            //assignmentResult.save()
            //res.send("OK")
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
                // console.log(e)
                return next(e + " invalid syntax for raw body of request")
            } else {
                rawBody = req.body;
            }
        }
    } else {
        //console.log("OBJECT ALREADY");
        rawBody = req.body;
    }


    var version = rawBody.version;

    var assignmentID = req.params.assignmentID;
    var assignmentRaw = assignmentID.split(".");
    var assignmentNumber = assignmentRaw[0];
    var subAssignment = assignmentRaw[1];

    if (subAssignment == "0") subAssignment = "00";

    var visualizationType = rawBody.visual; //check this against possible ones



    if(version == '0.4.0') { //version with assignmentID as one string
        // set the vis to default type
        if(visualizationType != "tree" && visualizationType != "AList")
           visualizationType = "nodelink";

        //TEMP
        //visualizationType = "AList";

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

    } else {// Add version-specific options here
         var validTypes = [
            "Array",
            "Array_Stack",
            "Array_Queue",
            "LinkedListStack",
            "LinkedListQueue",
            "BinaryTree",
            "BinarySearchTree",
            "SinglyLinkedList",
            "DoublyLinkedList"
        ];


    }

    function replaceAssignment (res, user, assignmentID) {

        //if this assignment is #.0, remove all sub assignments from #
        //if(assignmentID.split('.')[1] == "0") {
//        if (((parseFloat(assignmentID)/1.0) % 1.0) == 0) {
//            if(assignmentID.split('.')[1] == "0" || assignmentID.split('.')[1] == "00") // ?????
//                //assignmentID = assignmentID.substr(0, assignmentID.indexOf('.') + 2);
//                assignmentID += "0";
//
//            Assignment.remove({
//                assignmentID: {$gte: Math.floor(parseFloat(assignmentID)), $lt: Math.floor(parseFloat(assignmentID) + 1) },
//                email: user.email
//            })
//            .exec(function (err, resp) {
//            })
//        }

        if (subAssignment == '0' || subAssignment == '00') {
             Assignment.remove({
                assignmentNumber: assignmentNumber,
                email: user.email
            })
            .exec(function (err, resp) {
                 if(err)
                    console.log(err);
                console.log("replaceAssignment() removed assignments (" + assignmentNumber + ".*) from user: \"" + user.username + "\"");

                // have to put this code to create/save assignment in both cases
                // since the removal happens asynchronously for assignments
                assignment = new Assignment()
                assignment.email = user.email
                assignment.vistype = visualizationType
                assignment.data = rawBody
                assignment.assignmentID = assignmentID
                assignment.assignmentNumber = assignmentNumber
                assignment.subAssignment = subAssignment
                assignment.schoolID = req.params.schoolID || ""
                assignment.classID = req.params.classID || ""
                assignment.save();

                User.findOne({
                    email: user.email
                }).exec(function (err, resp) {
                    res.json({"msg":assignmentID+"/"+resp.username})
                })

                //log new assignment
                console.log("assignment added: "+user.email+
                      " "+assignment)
            })
        } else {
          // have to put this code to create/save assignment in both cases
          // since the removal happens asynchronously for new assignments
          assignment = new Assignment()
          assignment.email = user.email
          assignment.vistype = visualizationType
          assignment.data = rawBody
          assignment.assignmentID = assignmentID
          assignment.assignmentNumber = assignmentNumber
          assignment.subAssignment = subAssignment
          assignment.schoolID = req.params.schoolID || ""
          assignment.classID = req.params.classID || ""
          assignment.save();

          User.findOne({
              email: user.email
          }).exec(function (err, resp) {
              res.json({"msg":assignmentID+"/"+resp.username})
          })
        }
    }
}

var sessionUser = null;

exports.next = null

exports.show = function (req, res, next) {

    //var query = Assignment.find({'username': 'test'});

    this.next = next
    var assignmentNumber = req.params.assignmentNumber
    // var schoolID = req.params.schoolID
    // var classID = req.params.classID
    var username = req.params.username
  //
    sessionUser = null
    if (typeof req.user != "undefined") sessionUser = req.user

    var apikey = (sessionUser) ? req.query.apikey : null;


    User
        .findOne({username: username})
        .exec(function(err, usr){
            if (err) return next(err)
            if (!usr)
                return next("couldn't find the username "+username)

            getAssignment(req, res, next, usr.email, function (assign) {

                //Test whether user has permission to view vis
                return testByUser(res, req, username, assign, function (){
                    return testByKey(res, apikey, username, assign, null)
                })
            })
        })

    function getAssignment (req, res, next, email, cb) {
        assignmentNumber = req.params.assignmentNumber;
        next = next

        var version = "0.4.0";

        findAssignmentNew(assignmentNumber)

        // Finds assignments based on assignmentID
        function findAssignmentOld(id) {
            Assignment.findOne({
                email: email,
                assignmentID: id
            })
            .exec(function(err, ass) {
                if (err) return next(err);
                if (!ass || ass.length == 0) {
                    return next("Could not find assignment " + id);
                }

                //If assignmentNumber is set, the assignment is up-to-date
                if(ass.assignmentNumber == "")
                    getAssignmentOld();
                else
                    getAssignmentNew();
            });
        }

        // finds assignments based on assignmentNumber
        function findAssignmentNew(id) {
          console.log(email, id);
            Assignment.findOne({
                email: email,
                assignmentNumber: id
            })
            .exec(function(err, assignment) {
                if (err) return next(err);
                 console.log(assignment);
                if (!assignment || assignment.length == 0) {
                    //findAssignmentOld(id); // <-- Try old version too
                    return next ("the assignment was not found");
                }

                // If the assignment is not public, see if user has access to private assignment
                if(!assignment.shared) {
                    if(!cb(assignment))
                      return next ("the assignment data you requested is not public")
                }

                //If assignmentNumber is set, the assignment is up-to-date
                if(assignment.assignmentNumber == "")
                    getAssignmentOld();
                else
                    getAssignmentNew();
            });
        }


        //Old method for finding all sub assignments
        function getAssignmentOld() {
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
        }

        //New method for finding all sub assignments
        function getAssignmentNew() {
            // assignmentNumber = assignmentNumber.split(".")[0];

            Assignment
            .find({
                email: email,
                assignmentNumber: assignmentNumber
            })
            .sort({
                subAssignment: 1  // TODO: only sorts based on strings since we don't store numbers as integers...
            })
            .exec(function(err, assignments) {
                if (err) return next(err);
                if (!assignments || assignments.length == 0) {
                         return next("Could not find assignment " + assignmentNumber);
                } else if (assignments.length == 1) {
                      return renderVis(res, assignments[0]);
                  } else
                      return renderMultiVis(res, assignments);
            });
        }
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
        // console.log(un1 + " " + un2)
        if (un1 === un2) {
            // console.log(assign)
            // return;
        //  return renderVis (res, assign)
          return true;
        }
        if (nextTest) return nextTest()
        //else return next ("the assignment data you requested is not public")
        else return false;
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
            "assignmentNumber":assignmentNumber,
            "schoolID":assignment.schoolID,
            "classID":assignment.classID,
            "vistype":vistype,
            "shared":assignment.shared,
            "owner":owner,
            "map": true
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
            "assignmentNumber":assignmentNumber,
            "schoolID":assignments[0].schoolID,
            "classID":assignments[0].classID,
            "vistype":vistype,
            "shared":assignments[0].shared,
            "owner":owner,
            "map": true
        })
    }


        exports.deleteAssignment = function (req, res) {
            // console.log("here")
            as = req.assginment
            console.log("Deleting assignment with ID: " + as.assignmentID)

            Assignment
                .find({assignmentID: as.assignmentID})
                .exec(function(err, assign) {
                          if (err) return next(err)
                          for (i in assign) {
                              console.log(assign[i].assignmentID)
                              assign[i].remove()
                          }
                      })

            //return res.redirect("gallery_2")
        }



}
