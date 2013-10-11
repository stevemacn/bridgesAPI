// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Authenticate Schema
var Account = new Schema ({
    domain: { type: String, default: ''},
    uid:    { type: String, default: ''},
    email:  { type: String, default: ''},
    tokens: {  
        kind :      {type: String, default: ''},
        token :     {type: String, default: ''},
        tokenSecret:{type: String, default: ''}
    }
})


mongoose.model('Account', Account);
