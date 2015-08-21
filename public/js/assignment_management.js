




function delete_assig() {
    var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , Assignment = mongoose.model('Assignment')
    , treemill = require('treemill');
    
    Assignment
                .find({
                         //assignmentID: '1.0'
                 })
    
    $("#delete_assignment").click(function() {
                        //document.body.innerHTML = assignmentID + Assignment;
//                        document.body.innerHTML = Assignment;
                        Assignment
                                  .remove({
                                          assignmentID:assignmentID
                                          });
                                  
                           });
}