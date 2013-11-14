var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

//Schema for data that has been manipulated by students 
            //(output from client)

var Assignment = new Schema ({

    email: { type: String, default: ''},
    
    assignmentNumber: {type: String, default: ''},
    dateCreated: {type: String, default: ''},

    //Data source content before and after being manipulated
    originalContent: {type: String, default: ''},
    updatedContent: {type: String, default: ''}
})

mongoose.model('Assignment', Assignment);
