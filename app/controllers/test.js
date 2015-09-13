var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment')

exports.try = function(req, res) {
  Assignment
      .find({
      })
      .exec(function(err, assignmentResult) {
        if(err) return next(err);

        var ID = [];
        var Numbers = {};

        var both, one, neither;
        both = one = neither = 0;

        for(assignment in assignmentResult) {
          if(assignmentResult[assignment].assignmentNumber == "" && assignmentResult[assignment].subAssignment == "")
            both++;
          else if(assignmentResult[assignment].assignmentNumber == "" || assignmentResult[assignment].subAssignment == "") {
            one++;
          } else
            neither++;

          ID.push(assignmentResult[assignment].assignmentID)

          if(Numbers.hasOwnProperty(assignmentResult[assignment].assignmentNumber)) {
            Numbers[assignmentResult[assignment].assignmentNumber] += 1;
          } else {
            Numbers[assignmentResult[assignment].assignmentNumber] = 0;
          }
        }

        console.log("Unique IDs " + ID.length)
        // for(i in ID) {
        //   console.log(ID[i])
        // }

        console.log("Groups of Assignment IDS ")
        for(var i in Numbers) {
          console.log(i, Numbers[i]);
        }

        console.log("--");
        console.log("With both: ", both)
        console.log("With one: ", one)
        console.log("With neither: ", neither)

      })
}

exports.testing = function(req, res, next) {

  Assignment
      .find({
        "assignmentNumber": {$exists: false},
        "subAssignment": {$exists: false},
        "email": "dburlins@uncc.edu"
      })
      .limit(100)
      .exec(function(err, assignmentResult) {
        if(err) return next(err);

        //return next(assignmentResult.length);

        var numUpdated = 0;
        var numDeleted = 0;
        var numTotal = assignmentResult.length;
        var numToModify = 0;
        var numShouldDelete = 0;
        var numShouldUpdate = 0;
        var numSkipped = 0;

        for(assignment in assignmentResult) {
          if(assignmentResult[assignment].assignmentNumber == "" || assignmentResult[assignment].subAssignment == "") {
            numToModify++;
            var assignmentID = assignmentResult[assignment].assignmentID;
            var assignmentRaw = assignmentID.split(".");

            if(assignmentRaw.length < 2) {
              numSkipped++;
              continue;
            }

            var assignmentNumber = assignmentRaw[0];
            var subAssignment = assignmentRaw[1];

            return next("(num skipped:) " + numSkipped +" "+ assignmentResult[assignment] +" "+ assignmentID +" "+ assignmentNumber +" "+ subAssignment)

              // Update assignments, deleting any with erroneous assignmentID

              if(subAssignment.length > 2) {
                numShouldDelete++;
                 //remove all assignments with ridiculous decimal subAssignment
                Assignment
                  .remove({
                    "assignmentID": assignmentID
                  })
                  .exec(function(err, result){
                      if(err) return next(err)
                      numDeleted++;
                  })
                } else {

                numShouldUpdate++;
                //Update assignments to all use assignmentNumber and subAssignment number! (Won't delete anything)
                Assignment
                  .update(
                      {
                        assignmentID: assignmentID
                      },
                      {
                        $set:
                        {
                          assignmentNumber: assignmentNumber,
                          subAssignment: subAssignment
                        }
                      }
                    )
                    .exec(function(err, result) {
                      if(err) return next(err)
                      //console.log("updated assignment ", assignmentID)
                      numUpdated++;

                    })

                }
              }
        }

        return next("Num skipped: " + numSkipped + ", Num to modify: " + numToModify + ", Num should delete: " + numShouldDelete + ", Num deleted " + numDeleted + ", Number should Update: " + numShouldUpdate + ", Number updated " + numUpdated)
      });

}

exports.frustrated = function(req, res, next) {
  res.send(200);
  // "assignmentNumber": {$exists: false},
  // "subAssignment": {$exists: false},
  Assignment
      .find({
        "email": "krs@uncc.edu"
      })
      .exec(function(err, assignmentResult) {
        if(err){
          return next(err);
          console.log(err);
        }

        var numUpdated = 0;
        var numDeleted = 0;
        var numTotal = assignmentResult.length;
        var numToModify = 0;
        var numShouldDelete = 0;
        var numShouldUpdate = 0;
        var numSkipped = 0;
var county = 0;
var county1 = 0;
        var ids = "";
        var id = [];

        for(assignment in assignmentResult) {
          //if(assignmentResult[assignment].assignmentNumber == "" || assignmentResult[assignment].subAssignment == "") {
            numToModify++;
            var assignmentID = assignmentResult[assignment].assignmentID;
            var assignmentRaw = assignmentID.split(".");

            if(assignmentRaw.length < 2) {
              numSkipped++;
              continue;
            }

            // var assignmentNumber = assignmentRaw[0];
            // var subAssignment = assignmentRaw[1];
            //
            // if(subAssignment == "0") subAssignment = "00";

            ids += assignmentID + " ";
            id.push(assignmentID);
        //  }
        }
        var stuff = "";
        for(x in id) {
          var assignmentRaw = id[x];
          var assignmentSplit = assignmentRaw.split(".");
          var num = assignmentSplit[0];
          var sub = assignmentSplit[1];
          if(sub == "0" || sub == "") sub = "00";

          Assignment
            .update(
                {
                  "email": "krs@uncc.edu",
                  "assignmentID": assignmentRaw
                },
                {
                  $set:
                  {
                    "assignmentNumber": num,
                    "subAssignment": sub
                  }
                }
              )
              .exec(function(err, result) {
                if(err) {
                  return next(err)
                  console.log(err)
                }
                stuff += assignmentRaw + ", ";
              })
        }
        console.log("I DID A THING: ", ids);
        //return next(county + "/" + county1 +" updated");
        //var stuff = "to modify: (" + id.length + ") " + ids;


      });

}
