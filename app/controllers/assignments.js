var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    treemill = require('treemill'),
    visTypes = require('./visTypes.js');

// Array of possible assignment types. Can refactor into a new file and import as object.
var assignmentTypes = [
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
              if (err) return next(err);
              if (!assignmentResult[i])
                  return next("could not find assignment");
              assignmentResult[i].shared=req.params.value;
              assignmentResult[i].save();
              //console.log("CHANGED TO " + req.params.value + " " + assignmentResult[i]);
            }
            res.send("OK");

        });
};

//API route to save the position of some (or all) node positions
exports.saveSnapshot = function(req, res, next) {
    Assignment
        .findOne({
            email:req.user.email,
            assignmentNumber: req.params.assignmentNumber
        })
        .exec(function (err, assignmentResult) {
            if (err) return next(err);
            if (!assignmentResult)
                return next("could not find assignment");
            console.log("snapshot");
            //Save JSON with modified positions
            //assignmentResult.save()
            //res.send("OK")
        });
};

//API route for uploading assignment data. If the
//assignment already exists it will be replaced.
exports.upload = function (req, res, next) {
    // C++ version posts JSON as object, JAVA posts as plain string
    if(typeof req.body != "object") {
        //console.log("STRING: PARSING");
        try { rawBody = JSON.parse(req.body); }
        catch (e) {

            if(typeof req.body != 'object') {
                // console.log(e)
                return next(e + " invalid syntax for raw body of request");
            } else {
                rawBody = req.body;
            }
        }
    } else {
        //console.log("OBJECT ALREADY");
        rawBody = req.body;
    }

    // Handle assignment number
    var assignmentID = req.params.assignmentID;
    console.log("->", assignmentID);
    var assignmentRaw = assignmentID.split(".");
    var assignmentNumber = assignmentRaw[0];
    var subAssignment = assignmentRaw[1];
    if (subAssignment == "0") subAssignment = "00";

    // validate visualization type
    var visualizationType = visTypes.getVisType(rawBody.visual);

    //get username from apikey
    User.findOne({
        apikey:req.query.apikey
    })
    .exec(function (err, user) {
        if (err) return next (err);
        if (!user) return next ("could not find user by apikey: " + req.query.apikey);

        //if username found, upload or replace
        replaceAssignment(res, user, assignmentID);
    });

    function replaceAssignment (res, user, assignmentID) {

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
                assignment = new Assignment();
                assignment.email = user.email;
                assignment.vistype = visualizationType;
                assignment.data = rawBody;
                assignment.assignmentID = assignmentID;
                assignment.assignmentNumber = assignmentNumber;
                assignment.subAssignment = subAssignment;
                assignment.schoolID = req.params.schoolID || "";
                assignment.classID = req.params.classID || "";
                assignment.save();

                User.findOne({
                    email: user.email
                }).exec(function (err, resp) {
                    res.json( { "msg":assignmentID+"/"+resp.username } );
                });

                //log new assignment
                console.log( "assignment added: " + user.email + " " + assignment );
            });
        } else {
          // have to put this code to create/save assignment in both cases
          // since the removal happens asynchronously for new assignments
          assignment = new Assignment();
          assignment.email = user.email;
          assignment.vistype = visualizationType;
          assignment.data = rawBody;
          assignment.assignmentID = assignmentID;
          assignment.assignmentNumber = assignmentNumber;
          assignment.subAssignment = subAssignment;
          assignment.schoolID = req.params.schoolID || "";
          assignment.classID = req.params.classID || "";
          assignment.save();

          User.findOne({
              email: user.email
          }).exec(function (err, resp) {
              res.json( { "msg":assignmentID + "/" + resp.username } );
          });
        }
    }
};

exports.next = null;

exports.show = function (req, res, next) {
    this.next = next;
    var assignmentNumber = req.params.assignmentNumber.split('.')[0],
        username = req.params.username,
        sessionUser = null;

    if (typeof req.user != "undefined") sessionUser = req.user;

    var apikey = (sessionUser) ? req.query.apikey : null;

    User
        .findOne( { username: username } )
        .exec( function( err, usr ){
            if (err) return next(err);
            if (!usr)
                return next("couldn't find the username " + username);

            getAssignment(req, res, next, usr.email, function (assign) {
                //Test whether user has permission to view vis
                return testByUser(res, req, username, assign, function (){
                    return testByKey(res, apikey, username, assign, null);
                });
            });
        });

    function getAssignment (req, res, next, email, cb) {
        next = next;

        Assignment.findOne({
            email: email,
            assignmentNumber: assignmentNumber
        })
        .exec(function(err, assignment) {
            if (err) return next(err);

            if (!assignment || assignment.length === 0) {
                return next ("the assignment was not found");
            }

            // If the assignment is not public, see if user has access to private assignment
            if(!assignment.shared) {
                if(!cb(assignment))
                  return next ("the assignment data you requested is not public");
            }

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
                if (!assignments || assignments.length === 0)
                  return next("Could not find assignment " + assignmentNumber);
                return renderMultiVis( res, assignments );
            });
        });
    }

    //find whether there is a session, then test
    function testByUser (res, req, username, assign, nextTest) {
        if (sessionUser) {
            return testAndMoveOn(
                res, sessionUser.username, username, assign, nextTest);
        } else {
            if (nextTest) return nextTest();
            else
                return testAndMoveOn(res, true, false, assign, null);
        }
    }

    //find user by key, then test
    function testByKey (res, apikey, username, assign, nextTest) {
        if (apikey) {
            User
              .findOne({apikey:apikey})
              .exec(function (err, n){
                  if (err) return next (err);
                  if (!n) return next ("Invalid apikey: "+apikey);
                  return testAndMoveOn(
                      res, n.username, username, assign, null);
              });
        } else {
            if (nextTest) return nextTest();
            else
                return testAndMoveOn(res, true, false, assign, null);
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
        if (nextTest) return nextTest();
        //else return next ("the assignment data you requested is not public")
        else return false;
    }

    function renderMultiVis (res, assignments) {
        var owner=false,
            allAssigns = {},
            mapData = [],
            map;

        if (sessionUser) {
            if (sessionUser.email==assignments[0].email) owner = true;
        }

        var unflatten = function (data) {
            //check whether the data is already hierachical
            if ("children" in data) return data;
            tm = treemill();
            tree = tm.unflatten(data);
            return tree;
        };

        var flatten = function (data) {
            //check whether the data is already flat
            if ("nodes" in data) return data;
            tm = treemill();
            tree = tm.flatten(data);
            return tree;
        };

        /* parse and store all subassignments */
        for(var i = 0; i < assignments.length; i++) {

            data = assignments[i].data.toObject()[0];

            // pull out all coordinates from JSON
            // data.nodes.forEach(function(d) {
            //   if(d.location && d.location[0] !== 0 && d.location[1] !== 0)
            //     mapData.push( { "lat": d.location[0], "long": d.location[1] } );
            // });
            mapData = [];

            // Client should send trees as hierarchical representation now..
            // This captures the data from the OLD flat tree representation
            if((data.visual == "tree") && !("nodes" in data && "children" in data.nodes)) {
              data = unflatten(data);
            }
            // This captures the data from the NEW hierarchical tree representation
            if("nodes" in data && "children" in data.nodes) {
              data = data.nodes;
            }

            allAssigns[i] = data;
        }

        return res.render ('assignments/assignmentMulti', {
            "title":"assignmentMulti",
            "user":sessionUser,
            "data":allAssigns,
            "extent":Object.keys(allAssigns).length,
            "assignmentNumber":assignmentNumber,
            "schoolID":assignments[0].schoolID,
            "classID":assignments[0].classID,
            "vistype":assignments[0].vistype,
            "shared":assignments[0].shared,
            "owner":owner,
            "createMap": (function() { return (mapData.length > 0) ? true : false; })(),
            "mapData": mapData
        });
      }
  };

exports.testJSON = function (req, res, next) {
    console.log('test JSON data for assignment upload');
    // this.next = next;

    var owner=false,
        allAssigns = {},
        mapData = [],
        map;

    // Add test JSON here
    var JSONdata = {"version":"0.4.0","visual":"BinarySearchTree","nodes":[{"color":[255,0,255,255],"shape":"circle","size":10,"name":"Hi","key":"5.4","children":[{"linkProperties":{"color":[0,0,0,255],"thickness":1.000000},"color":[0,255,0,255],"shape":"circle","size":10,"name":"Hello","key":"1.4","children":[{"name":"NULL"},{"name":"NULL"}]},{"linkProperties":{"color":[0,0,0,255],"thickness":1.000000},"color":[0,255,0,255],"shape":"circle","size":10,"name":"World","key":"1.12","children":[{"name":"NULL"},{"linkProperties":{"color":[0,0,0,255],"thickness":1.000000},"color":[0,255,0,255],"shape":"circle","size":10,"name":"World","key":"4.3","children":[{"name":"NULL"},{"name":"NULL"}]}]}]}]};

    return res.render ('assignments/assignmentMulti', {
        "title":"testJSON",
        "user":"test",
        "data":[JSONdata.nodes[0]],
        "extent":1,
        "assignmentNumber":1,
        "schoolID":null,
        "classID":null,
        "vistype":"tree",
        "shared":false,
        "owner":"test",
        "createMap": false,
        "mapData": null
    });

  };

// TODO: implement interface and logic for deletion
exports.deleteAssignment = function (req, res) {
    as = req.assginment;
    console.log("Deleting assignment with ID: " + as.assignmentID);

    Assignment
        .find({assignmentID: as.assignmentID})
        .exec(function(err, assign) {
                  if (err) return next(err);
                  for (var i in assign) {
                      console.log(assign[i].assignmentID);
                      assign[i].remove();
                  }
              });

    // return res.redirect("gallery_2")
    res.send("OK");
};
