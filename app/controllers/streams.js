var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , account
    , sourceHandlers = {
            'twitter.com':'twitter.js',
            'rottentomatoes.com':'rotten.js',
            'actors':'actors.js'
    }

//Example Request:  /streams/twitter.com/timeline/usgs/200
                //  /streams/twitter.com/followers/usgs/200

exports.getSource = function (req, res, next) {
  
    console.log(req.user.email)

    //gets previous data from the cache if it exists
    var getFromCache = function (srcHandler, acct) {
       
        try { rout = req.params[0].split('/') }
        catch (e) {
            return next("invalid route supplied for selected source")
        }
        
        cachedStream = srcHandler.checkCache(acct, rout)
        //if acct date is valid give the cache...
        if (cachedStream==null) srcHandler.init(acct, rout, res) 
        else {
            console.log("CACHE HIT: "+cachedStream.screen_name)
            res.json(JSON.parse(cachedStream.content))
        }
    }
    //gets the appropriate source handler based upon the request 
    var getSourceHandler = function (domain, cb) {
        var src = './sourceHandlers/'+sourceHandlers[domain]
        var srcHandler = require(src)
        if (!srcHandler.configured()) 
            return next("data source "+domain+" not yet implemented") 
        
        cb(srcHandler)
    }


    console.log("User: "+req.user.email+" requests "+req.params.domain)
    console.log("Params: "+req.params)

    if (!req.params.domain)
        return next("No data-source was specified")
    if (!(req.params.domain in sourceHandlers))
        return res.json (503, 
            {"error": "Requested datasource not yet supported: " + req.params.domain,
            "tip":"Currently supported datasources: twitter.com"}) 
     
    Account
        .findOne({
            email : req.user.email,
            domainProvider: req.params.domain 
        })
        .exec(function (err, acct) {
            if (err) return next(err)
            
            reqDomain = req.params.domain
    
            getSourceHandler(reqDomain, function (srcHandler) {
                if (!acct) {
                    srcHandler.getPublicFeeds(reqDomain, function (acct) {
                        getFromCache(srcHandler, acct)
                    })
                } else getFromCache(srcHandler, acct)
            })
        })

}
