var mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    rotten = require('tomatoes'),
    keys = require('../../../config/keys.json'),
    params = {}

exports.configured = function() {
    if (keys.rotten.configured == 1) return true
    else return false
}

exports.checkCache = function(acct, args) {
    //no way to access cache
    if (!acct.streams) return null
    if (!args) return null
    if (args[0]) params.movie = args[0]
    var dt = new Date();
    dt.setMinutes(dt.getMinutes() - 1500);
    for (var index in acct.streams) {
        var at = acct.streams[index]
        if (at.screen_name == params.movie && at.dateRequested >= dt) {
            return at
        }
    }
    return null
}

exports.getPublicFeeds = function(domain, cb) {
    Account
        .findOne({
            email: "public",
            domainProvider: domain
        })
        .exec(function(err, acct) {
            if (acct) return cb(acct)
            //caution what if this account becomes invalidated?
            acct = new Account();
            acct.email = "public"
            acct.domainProvider = "rottentomatoes.com"
            acct.tokens.tokenSecret = keys.rotten.apikey

            return cb(acct)
        })
}


exports.init = function(account, args, resp) {

    acct = account
    res = resp
    if (!args[0]) return res.json({
        "error": "a moview must be provided for searching"
    })
    params.movie = args[0]
    try {
        movies = rotten(keys.rotten.apikey)
    } catch (exception) {
        return res.json({
            "error": exception
        })
    }
    console.log(params.movie)
    movies.search(params.movie, updateTomatoes)
        //updateTomatoes)
}

function updateTomatoes(err, corpus) {

    if (err) return next(err) 
    
    console.log("added " + params.movie +
        " to the cache on " + Date())
    
    res.json(corpus)

    var updateDate = {
        'screen_name': params.movie,
        'count': 1,
        'content': JSON.stringify(corpus),
        'dateRequested': Date.now(),
        'maxid': 0,
        'mode': 0
    }
    replaceCache = function(acct, sn, data) {

        for (a in acct.streams) {
            if (acct.streams[a].screen_name == sn) {
                acct.streams.splice(a)
                acct.streams.push(data)
                return acct
            }
        }
        acct.streams.push(data)
        return acct
    }
    acct = replaceCache(acct, params.movie, updateDate)
    acct.save(function(err) {
        if (err) console.log(err)
        return true;
    })
}
