var mongoose = require('mongoose')
      , User = mongoose.model('User')
      , Account = mongoose.model('Account');
      

exports.read = function(req, res) {
    Account.findOne({
        uid: req.user._id,
        domain: req.account_domain
    }, function(err, account) {
        if (err)
            return next(err);
        var stream = account.streams.filter(function(s) {
            return s.name == res.stream_name})[0]
        if (!stream)
            return next(new Error("Could not find stream " + res.stream_name));
        if (stream.last_updated < 15*60*1000)
            // 15 minutes
            process.nextTick(function() {
                // TODO: fire off update if the cache is stale  
            });
        res.send(stream.content);
    });
}
