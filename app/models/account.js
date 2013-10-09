// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Authenticate Schema

var Account = new Schema ({
    domain: { type: String, default: ''},
    uid:    { type: String, default: ''},
    email:  { type: String, default: ''},
    tokens: { type: [ String ]}
})


mongoose.model('Account', Account);
