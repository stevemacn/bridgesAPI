// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Authenticate Schema
var Account = new Schema ({
    domain: { type: String, default: ''},
    // Deprecated: use user
    uid:    { type: String, default: ''},
    user:   { type: Schema.Types.ObjectId, ref: 'User' },
    email:  { type: String, default: ''},
    streams: [{
        name: { type: String, default: ''},
        // Content is unformatted it is probably JSON
        content: { type: String, default: ''},
        last_updated: { type: Date, default: Date.now() },
    }],
    tokens: {  
        kind :      {type: String, default: ''},
        token :     {type: String, default: ''},
        tokenSecret:{type: String, default: ''}
    }
})


mongoose.model('Account', Account);
