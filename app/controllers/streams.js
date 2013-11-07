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
        
        // Can we load this stream? Is it implemented?
        if (account.domain in stream_loaders) {
            // There is no loader for this domain (yet)
            return next(new Error(
                "Stream loading for " + account.domain + " not supported"));
        } else {
            var loader = stream_loaders[account.domain];
        }
        
        // Does this stream have any data yet?
        var stream = account.streams.filter(function(s) {
            return s.name == req.params.stream_name
        })[0];
        if (stream) {
            if (stream.last_updated < 15*60*1000) {
                // It was updated at least 15 minutes ago. Launch an async refresh.
                process.nextTick(function() {
                    stream_loaders[account_domain](req.params.stream_name, function(err) {
                        if (err) next(err);
                    }); 
                });
            }
            // Even if it is out of date, prefer the response we can give now
            res.send(stream.content);
        } else {
            // This is the first time it has been loaded. Load it.
            // This process is slow and will only give a response after
            //   the stream has loaded.
            stream_loaders[account_domain](req.params.stream_name, function(err) {
                if (err) next(err);
                res.send(stream.content);
                //TODO: will this return correctly for the first load?
            });
        }
        
    });
}