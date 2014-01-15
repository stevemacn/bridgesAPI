var mongoose = require('mongoose')
    , Account = mongoose.model('Account')
    , ntwitter = require('ntwitter')
    , keys = require('../../../config/twitterKeys.json')
    , params    
    , maxTweets = 200
    , foundTweets = 0
    , corpus
    , twit
    , acct
    , res
    , mode = 'timeline'
    , publicSources = {'earthquake':1, 'usgs':1, 'ieeevis':1}


/* Checks cache for screenname, count and date.
 *
 * This should use maxid if date is stale so that the 
 * full record doesn't need to be fetched...
 * 
 * */

exports.checkCache = function (acct, args) {
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
        if (at.screen_name==sn && at.mode == mode && at.count>=ct && at.dateRequested>=dt) {
            console.log(at)
            return at
        }
    }
    return null
}

exports.init = function (account, args, resp) {
    
    acct    = account
    res     = resp
    corpus  = "{"
    mode    = args[0]
    foundTweets=0

    var key = keys
        , isPublic = true

    //check to see whether the account is associated with twitter
    if (acct) {
        if (!(acct.email=='public')) isPublic = false
        if (acct.tokens) {
            key.access_token_key = acct.tokens.token
            key.access_token_secret = acct.tokens.tokenSecret
        }
    } else return res.json ({"error":"no account could be found or used"})

    twit = new ntwitter(key)

    //set up parameters for timeline or followers
    if (args) {
        if (args[2]) maxTweets=args[2]
        if (mode=='timeline') {
            corpus = {"tweets":[]}
            params = {
                screen_name: args[1],
                count: 200,
                include_rts:true
            }
            startGettingTweets(getTweets, isPublic, args[1])
        } else if (mode=='followers') {
            
            params = {
                screen_name: args[1],
                count: (args[2]) ? args[2] : 5 
            }
            startGettingTweets(getFollowersById, isPublic, args[1])
        } else { 
            return res.json({"error":"Must query for either timeline or followers"})
        }
    }
}

function startGettingTweets (cb, isPublic, source) {
    //if the account is not associated, ensure request is a "public" feed 
    if (isPublic) {
        if (!(source in publicSources)) { 
            var srcs = ""
            for (i in publicSources) {
                srcs+=i+" "
            }
            return res.json({"Error":source+" isn't supported without " +
                            "authenticating via twitter; public sources include: " + srcs})
        }
    }
    cb(null, "") 
}


function getFollowersById(blank, tweets) { 
    
    var corpus = {"followers":[]}
    
    twit.getFollowersIds(params.screen_name, function (err, data) {
        data = data.slice(0, params.count)
        twit.showUser(data, function (err, data) {
            for (var i=0; i<data.length; i++){
                corpus.followers.push(data[i].screen_name)
            }
            updateTweets(corpus)
        })
    })
}


function getTweets(maxid, tweets) {
    if (maxid) params.max_id = maxid
    
    if ((maxTweets-foundTweets)<params.count) params.count = maxTweets-foundTweets
    

    twit.getUserTimeline(params, function (err, data) {
        if (err) {
            res.json({"error":err}) 
            return err
        }
        if ( data.length > 1 && maxTweets > foundTweets ) {
            //foundTweets=foundTweets+200; //200 tweets per request, less accurate, but faster
            var tweetID = countRT = countT = 0
            data.forEach(function(tweet) {
                if (tweet.retweeted_status) {
                    retweet = tweet.retweeted_status
                    corpus.tweets.push({
                        "date":retweet.created_at,
                        "tweet":retweet.text
                    })
                    countRT++
                } else {
                    corpus.tweets.push({
                        "date":tweet.created_at,
                        "tweet":tweet.text
                    })
                    countT++
                }
                tweetID = tweet.id
            });
            foundTweets = countRT + countT + foundTweets
            console.log(countRT+" retweets and "+countT+" tweets")
            getTweets(tweetID, "") 
        
        } else {
            updateTweets(corpus)
        }
    })
    return true
}

function updateTweets (corpus) {

    console.log(corpus)
    res.json(corpus)

    var updateDate = {
        'screen_name':params.screen_name,
        'count':maxTweets,
        'content':JSON.stringify(corpus),
        'dateRequested':Date.now(),
        'maxid':0,
        'mode':mode
    }
   
    replaceCache = function (acct, sn, data) {
        for (a in acct.streams) {
            if (acct.streams[a].screen_name==sn) {
                acct.streams.splice(a)
                acct.streams.push(data)
                return acct
            }
        }
        acct.streams.push(data)
        return acct
    }
    acct = replaceCache(acct, params.screen_name, updateDate)
    acct.save(function (err) {
        if (err) console.log(err)
    })
}
