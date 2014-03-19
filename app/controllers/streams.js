var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , account
    , sourceHandlers = {
            'twitter.com':'twitter.js'
    }

//Example Request:  /streams/twitter.com/timeline/usgs/200
                //  /streams/twitter.com/followers/usgs/200

exports.getSource = function (req, res, next) {
    
    console.log("User: "+req.user.email+" requests "+req.params.domain)
    console.log("Params: "+req.params)

    if (!req.params.domain)
        return res.json ({"error": "No datasource was specified"})
    if (!(req.params.domain in sourceHandlers))
        return res.json (
            {"error": "Requested datasource not yet supported: " + req.params.domain,
            "tip":"Currently supported datasources: twitter.com"}) 
     
    Account
        .findOne({
            email : req.user.email,
            domainProvider: req.params.domain 
        })
        .exec(function (err, acct) {
            if (err) return next(err)
           
            cb = function (acct) {
                var src = './sourceHandlers/'+sourceHandlers[req.params.domain]
                var srcHandler = require(src)
                if (!srcHandler.configured()) 
                    return res.json({"error":"data source "+req.params.domain+" not yet implemented"})  
                cachedStream = srcHandler.checkCache(acct, req.params[0].split('/'))
                if (cachedStream==null) { //if acct date is valid give the cache...
                    srcHandler.init(acct, req.params[0].split('/'), res)
                } else {
                    console.log("Cache Hit")
                    console.log(cachedStream.content)
                    //console.log(cachedStream.screen_name + " " + cachedStream.count)
                    
                    res.json(JSON.parse(cachedStream.content))
                }
            }

            if (!acct)
                //should be more general to twitter or whatever not just 
                //twitter.
                acct = getPublicFeeds(req.params.domain, cb)
            else 
                cb(acct)
        })
}


//create public accounts for each datasource
function getPublicFeeds (domain, cb) {
    //twitter-public
    Account
        .findOne({
            email : "public",
            domainProvider: domain 
        })
        .exec(function (err, acct) {
            if (acct) return cb(acct)    
            //caution what if this account becomes invalidated?
            var config = require ("../../config/twitterKeys.json")  
            , acct = new Account();
            
            acct.email="public" 
            acct.domainProvider="twitter.com"
            acct.tokens.token = config.access_token_key
            acct.tokens.tokenSecret = config.access_token_secret 
            
            return cb(acct)
        })
} 
