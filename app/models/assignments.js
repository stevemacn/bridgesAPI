var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

//Schema for data that has been manipulated by students 
            //(output from client)

var Assignment = new Schema ({

    //For tracking submissions and route creation
    username:       {type: String, default: ''},
    email:          { type: String, default: ''},
    assignmentID:   {type: String, default: ''},
    dateCreated:    {type: Date, default: Date.now()},
    shared:         {type: Boolean, default: 'false'},//public or private
    vistype:        {type: String, default:'nodelink'},
    //use mongoose thumbnail right here....
    
    //uploaded data, nodes can be x,y as in scatteplots
    //links can be any association 
    //nodes: [Schema.Types.Mixed],
    //links: [Schema.Types.Mixed]
    data: [Schema.Types.Mixed]
    //add a before and after so that student can see changes
})

mongoose.model('Assignment', Assignment);
