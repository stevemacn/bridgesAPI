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
   
    var sn = ct = null 
    if (args[0]) sn = args[0]
    if (args[1]) ct = args[1]

    var dt = new Date();
    dt.setMinutes(dt.getMinutes() - 15); 
    
    for (var index in acct.streams) {
        var at = acct.streams[index]
        if (at.screen_name==sn && at.count>=ct && at.dateRequested>=dt) {
            return at
        }
    }
    return null
}

exports.init = function (account, args, resp) {
    
    acct    = account
    res     = resp
    corpus  = ""
    foundTweets=0

    if (acct.tokens) {
        var key = keys
        key.access_token_key = acct.tokens.token
        key.access_token_secret = acct.tokens.tokenSecret
        console.log(key)
    }
    //use account keys rather than global keys...
    twit = new ntwitter(keys)

    if (args) {
        if (args[1]) maxTweets=args[1]
        //is it streaming or user feed
        if (args[0]) {
            params = {
                screen_name: args[0],
                count: 200,
                include_rts:true
            }
            res.writeHead(200, {'Content-Type':'application/json'})
            res.write("[")
            getTweets(null, "") 
        } else {
            res.send("streaming is not yet supported")
        }
    
        //getTweets(null, "")
        //instead of null pass maxid from cache, 
        //then concat with cache
        //in this case... subtract cache count from maxTweet count?
    }
}


function getTweets(maxid, tweets) {
     
    if (maxid) params.max_id = maxid
    
    twit.getUserTimeline(params, function (err,data) {
        if (err) {
            res.json(err) 
            return err
        }
        if ( data.length > 1 && maxTweets > foundTweets ) {
            //foundTweets=foundTweets+200; //200 tweets per request, less accurate, but faster
            
            var tweetID = countRT = countT = 0
            data.forEach(function(tweet) {
                if (tweet.retweeted_status) {
                    retweet = tweet.retweeted_status
                    tweets = tweets.concat(
                        JSON.stringify({
                            date : retweet.created_at,
                            tweet: retweet.text
                        })+","
                    )
                    countRT++
                } else {
                    tweets = tweets.concat(
                        JSON.stringify({
                            date : tweet.created_at,
                            tweet: tweet.text
                        })+","
                    )
                    countT++
                }
                tweetID = tweet.id
            });
            foundTweets = countRT + countT + foundTweets
            console.log(countRT+" retweets and "+countT+" tweets")
            var comma=""
            if (foundTweets>200)
                comma=","
            res.write(comma+"["+tweets.substring(0, tweets.length-1)+"]")

            corpus = corpus.concat(tweets)
            getTweets(tweetID, "") 
        
        } else {
            var updateDate = {
                'screen_name':params.screen_name,
                'count':maxTweets,
                'content':corpus,
                'dateRequested':Date.now(),
                'maxid':0 
            }
            
            replaceCache = function (acct, sn, data) {
                for (a in acct.streams) {
                    if (acct.streams[a].screen_name==sn) {
                        acct.streams.splice(a)
                        acct.streams.push(data)
                        return acct;
                    }
                }
                acct.streams.push(data)
                return acct
            }
            acct = replaceCache(acct, params.screen_name, updateDate)
            res.write("]")
            res.end()

            acct.save(function (err) {
                if (err) console.log(err)
            })
            console.log(foundTweets)

        }
    })
    return true
}



    //var filterParams = {
        //locations:'-10.371,48.812,2.192,60.892',
        //track:"bridges"};

    //var stream;
    //twit.stream('statuses/filter', filterParams, function(_stream) {
    //    stream = _stream;
    //});
    //stream.on('data', function(data){
        //console.log(data.text);
        /*io.sockets.volatile.emit('streams/twitter', {
            user: data.user.screen_name,
            text: data.text,
            created_at: data.created_at
        });*/
    //   res.json(data.text);
    //})
//}
