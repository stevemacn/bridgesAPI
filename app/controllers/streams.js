var mongoose = require('mongoose')
      , User = mongoose.model('User')
      , Account = mongoose.model('Account');

var stream_loaders = {
    //TODO: write parsers
};

exports.read = function(req, res, next) {
    Account.findOne({
        uid: req.user._id,
        domain: req.params.account_domain
    }, function(err, account) {
        if (err) // Query Failed
            return next(err);
        if (!account) // Account doesn't exist
            return next(new Error(
                "Could not find an account with " + req.params.account_domain));
        
        // Sanitize the stream name
        var stream = account.streams.filter(function(s) {
            return s.name == req.params.stream_name})[0]
        if (!stream) {
            // This is the first time is has been loaded. Load it.
            if (stream_loaders.indexOf(account.domain) < 0)
                return next(new Error(
                    "Stream loading for " + account.domain + " not supported"));
            stream_loaders[account_domain](req.params.stream_name, function(err) {
                if (err) next(err);
                res.send(stream.content);
            });
        }
        if (stream.last_updated < 15*60*1000)
            // 15 minutes
            process.nextTick(function() {
                stream_loaders[account_domain](req.params.stream_name, function(err) {
                    if (err) next(err);
                    res.send(stream.content);
                }); 
            });
    });
}