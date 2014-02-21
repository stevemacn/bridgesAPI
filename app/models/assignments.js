var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

//Schema for data that has been manipulated by students 
            //(output from client)

var Assignment = new Schema ({

    //For tracking submissions and route creation
    email:          { type: String, default: ''},
    assignmentID:   {type: String, default: ''},
    dateCreated:    {type: Date, default: Date.now()},
    shared:         {type: Boolean, default: 'false'},//public or private
    
    //uploaded data, nodes can be x,y as in scatteplots
    //links can be any association 
    nodes: [Schema.Types.Mixed],
    links: [{ 
        to:     {type: String, default: ''},
        from:   {type: String, default: ''},
        value:  {type: String, default: ''}
    }]
    //add a before and after so that student can see changes
})

mongoose.model('Assignment', Assignment);
