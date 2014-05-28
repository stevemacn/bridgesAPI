var mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    request = require('request');
keys = require('../../../config/keys.json'),
api_key = keys.actors.apikey,
params = {},

configuration = {
    host: 'http://private-d9b16-themoviedb.apiary.io'
}

function searchIDbyName(name) {
    //one search name for id
    configuration.path = "/3/search/person?query=" + name + "&api_key=" + api_key
}

function searchActorsById(id) {
    //search id for movies
    configuration.path = "/3/person/" + id + "/movie_credits?api_key=" + api_key
}

exports.configured = function() {
    if (keys.actors.configured == 1) return true
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
            acct.domainProvider = "actors"
            acct.tokens.tokenSecret = api_key

            return cb(acct)
        })
}


exports.init = function(account, args, resp) {

    acct = account
    res = resp
    if (!args[0]) return res.json({
        "error": "a moview must be provided for searching"
    })
    params.actor = args[0]
    console.log(params.actor)

    var host = configuration.host
    searchIDbyName(params.actor)
    request(host + configuration.path, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            actorResponse = JSON.parse(body)
            if (actorResponse.total_results == 0) return res.json(
                503, {
                    "error": "actor was not found"
                })
            console.log(actorResponse)
            searchActorsById(actorResponse.results[0].id)
            request(host + configuration.path, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    updateActors(null, JSON.parse(body).cast)
                }
            })
        }
    })
}

function updateActors(err, corpus) {

    if (err) next(err)

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
