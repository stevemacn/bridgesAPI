var mongoose = require('mongoose')
      , User = mongoose.model('User')
      , Account = mongoose.model('Account');
      

exports.read = function(req, res) {
    Account.findOne({
        uid: req.user._id,
        domain: req.account_domain
    }, function(err, account) {
        // STUB
    });
}
