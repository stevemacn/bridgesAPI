// Example model
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Authenticate Schema
var Account = new Schema ({
    //conflict with node so changed from domain
    domainProvider: { type: String, default: ''},
    uid:    { type: String, default: ''},
    // Could this be better?
    //user:   { type: Schema.Types.ObjectId, ref: 'User' },
    // Is email duplicated with User? 
    email:  { type: String, default: ''},
    tokens: {  
        kind :      {type: String, default: ''},
        token :     {type: String, default: ''},
        tokenSecret:{type: String, default: ''}
    },
    streams: [{
        screen_name: { type: String, default: ''},
        maxid: { type: Number, default: 0}, // Used by twitter
        count: { type: Number, default: 200}, // Entry Limit 
        content: { type: String, default: ''},
        dateRequested: { type: Date, default: Date.now() },
        mode: {type: String, default:'timeline'}
    }]      
})


mongoose.model('Account', Account);
