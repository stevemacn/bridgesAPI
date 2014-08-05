var mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    ntwitter = require('twit'),
    keys = require('../../../config/keys.json'),
    params, maxTweets = 200,
    foundTweets = 0,
    corpus, twit, acct, res, mode = 'timeline',
    publicSources = {
        'earthquake': 1,
        'usgs': 1,
        'ieeevis': 1,
        'twitscores':1,
        'wired':1,
        'twitterapi':1
    }
    
    /* Checks cache for screenname, count and date.
     *
     * This should use maxid if date is stale so that the
     * full record doesn't need to be fetched...
     *
     * */

exports.configured = function() {
    if (keys.twitter.configured==1) return true
    else return false
}

exports.checkCache = function(acct, args) {
    //no way to access cache
    if (!acct.streams) return null
    if (!args) return null

    var sn = ct = mode = null
    if (args[0]) mode = args[0]
    if (args[1]) sn = args[1]
    if (args[2]) ct = args[2]
    var dt = new Date();
    dt.setMinutes(dt.getMinutes() - 15);

    for (var index in acct.streams) {
        var at = acct.streams[index]
        if (at.screen_name == sn && at.mode == mode 
            && at.count >= ct && at.dateRequested >= dt) {
            
            content = JSON.parse(at.content)
            //ghetto fix when you have time!
            for (i in content) {
                content[i] = content[i].slice(0, ct)
            }
            at.content = JSON.stringify(content)
            return at
        }
    }
    return null
}
//create public accounts for each datasource
exports.getPublicFeeds = function (domain, cb) {
    //twitter-public
    Account
        .findOne({
            email : "public",
            domainProvider: domain 
        })
        .exec(function (err, acct) {
            if (acct) return cb(acct)    
            //caution what if this account becomes invalidated?
            keys = require('../../../config/keys.json'),
            config = keys.twitter.keys
            , acct = new Account();
            
            acct.email="public" 
            acct.domainProvider="twitter.com"
            acct.tokens.token = config.access_token_key
            acct.tokens.tokenSecret = config.access_token_secret 
            
            return cb(acct)
        })
} 


exports.init = function(account, args, resp) {

    acct = account
    res = resp
    corpus = "{"
    mode = args[0]
    foundTweets = 0
    
    var key = keys.twitter.keys, isPublic = true
    //check to see whether the account is associated with twitter
    if (acct) {
        if (!(acct.email == 'public')) isPublic = false
        if (acct.tokens==null) {
            key.access_token = acct.tokens.token
            key.access_token_secret = acct.tokens.tokenSecret
        }
    } else return res.json({
        "error": "no account could be found or used"
    })
    try { twit = new ntwitter(key) }
    catch (err) {
        acct.tokens=null
        acct.save()
        console.log(err)
        return res.json(503, {
            "error":"contact server admin, twitter hasn't been configured properly."})
    }
    //set up parameters for timeline or followers
    if (args) {
        if (args[2]) maxTweets = args[2]
        if (mode == 'timeline') {
            corpus = {
                "tweets": []
            }
            params = {
                screen_name: args[1],
                count: 200,
                include_rts: true
            }
            startGettingTweets(getTweets, isPublic, args[1])
        } else if (mode == 'followers') {

            params = {
                screen_name: args[1],
                count: (args[2]) ? args[2] : 5
            }
            startGettingTweets(getFollowersById, isPublic, args[1])
        } else {
            return res.json({
                "error": "Must query for either timeline or followers"
            })
        }
    }
}

function startGettingTweets(cb, isPublic, source) {
    //if the account is not associated, ensure request is a "public" feed 
    if (isPublic) {
        if (!(source in publicSources)) {
            var srcs = ""
            for (i in publicSources) {
                srcs += i + " "
            }
            return res.json({
                "error": source + " isn't supported as a publically available " +
                "Twitter source. You can solve this by adding the Twitter " +
                "datasource online at http://bridges-cs.herokuapp.com/home " + 
                "or choosing a publically available source from the following: " +
                srcs
            })
        }
    }
    cb(null, "")
}


function getFollowersById(blank, tweets) {

    var corpus = {
        "followers": []
    }, param = {
        "screen_name": params.screen_name
    }

    twit.get('followers/ids', param, function(err, data) {
        if (err) return res.json(503, {
            "error": err.message
        })

        if (!data) return res.json({
            "error": "no results found"
        })
        //only take as many as was requested
        data = data.ids.slice(0, params.count)
        param = {
            "user_id": data.toString()
        }

        twit.get('/users/lookup', param, function(err, processed) {
            if (err) return res.json({"err":err})
            if (!processed) return res.json({
                "err":"the number of items you "+
                "requested appears to be to large"})
            for (var i = 0; i < processed.length; i++) {
                corpus.followers.push(processed[i].screen_name)
            }
            updateTweets(corpus)
        })
    })
}


function getTweets(maxid, tweets) {
    if (maxid) params.max_id = maxid

    if ((maxTweets - foundTweets) < params.count)
        params.count = maxTweets - foundTweets

    twit.get("/statuses/user_timeline", params, function(err, data) {
        if (err) return res.json({
            "error": err
        })

        if (data.length > 1 && maxTweets > foundTweets) {

            var tweetID = countRT = countT = 0
            data.forEach(function(rawtweet) {
                if (rawtweet.retweeted_status) {
                    tweet = rawtweet.retweeted_status
                    countRT++
                } else {
                    tweet = rawtweet
                    countT++
                }
                corpus.tweets.push({
                    "date": tweet.created_at,
                    "tweet": tweet.text
                })
                tweetID = tweet.id
            });
            foundTweets = countRT + countT + foundTweets
            console.log(countRT + " retweets and " + countT + " tweets")
            getTweets(tweetID, "")

        } else {
            updateTweets(corpus)
        }
    })
}

function updateTweets(corpus) {

    console.log(corpus)
    res.json(corpus)

    var updateDate = {
        'screen_name': params.screen_name,
        'count': maxTweets,
        'content': JSON.stringify(corpus),
        'dateRequested': Date.now(),
        'maxid': 0,
        'mode': mode
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
    acct = replaceCache(acct, params.screen_name, updateDate)
    acct.save(function(err) {
        if (err) console.log(err)
        return true;
    })
}
