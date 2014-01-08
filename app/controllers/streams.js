var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , sourceHandlers = {
            'twitter.com':'twitter.js'
    }

//Example Request:  /streams/twitter.com/timeline/usgs/200
                //  /streams/twitter.com/followers/usgs/200

exports.getSource = function (req, res, next) {
    
    console.log("User: "+req.user.email+" requests "+req.params.domain)
    console.log("Params: "+req.params)

    if (!req.params.domain)
        return next(new Error('No datasource was specified'))
    if (!(req.params.domain in sourceHandlers))
        return next(new Error(
            'Requested datasource not yet available: '+req.params.domain))
     
    Account
        .findOne({
            email : req.user.email,
            domainProvider: req.params.domain 
        })
        .exec(function (err, acct) {
            if (err) return next(err)
            var src = './sourceHandlers/'+sourceHandlers[req.params.domain]
            var srcHandler = require(src)
            
            if (!acct) { //should access public feeds... 
                srcHandler.init(null, req.params[0].split('/'), res)
        
            } else {
                cachedStream = srcHandler.checkCache(acct, req.params[0].split('/'))
                if (cachedStream==null) { //if acct date is valid give the cache...
                    srcHandler.init(acct, req.params[0].split('/'), res)
                } else {
                    console.log("Cache Hit")
                    console.log(cachedStream)
                    res.send(cachedStream.content)
                }
            }
        })
}
