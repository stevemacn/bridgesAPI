bridgesAPI
==========

Data delivery system for multiple data sources (Twitter, Rotten Tomatoes, Facebook, etc). 

Requirements
--

1. Install mongoDB. Run it in the background. 
2. [Install node and npm][nodenpm](node's package manager) 
2. Server on which you can host nodejs (nginx to proxy requests).
3. Route requests from server to node.js (running by default on port 3000)

On OSX? Install mongoDB, node, npm, and yeoman using [homebrew][hbrew] 

[hbrew]:http://brew.sh/

Setup 
---
    
First we need our task runner, dependency manager and scaffold generators (you don't need to know what they are)

    npm install -g yo 

Then we need to get BRIDGES' server code

    git clone https://github.com/stevemacn/bridgesAPI
  
We install it (bower needs --allow-root to be sudoed)

    npm install
    bower install
    git submodule init
    git submodule update
    mongod & 
    grunt

[nodenpm]:http://www.joyent.com/blog/installing-node-and-npm

=======
Testing
--

*This should be done after authenticating datasources. We mention it here to keep in mind after sources are authenticated.*

=======
Authenticating Datasources
--    
[bridgesAPI][bridge] has been designed to support multiple datasources; however, currently we are only supporting [Twitter][twit], [RottenTomatoes][rt], and actors. 

Current authentication is using [passport][passport] and consequently twitter's callback must be to http://127.0.0.1 rather than [http://localhost:3000][c] if testing locally.

[bridge]: https://github.com/stevemacn/bridgesAPI
[passport]: https://github.com/jaredhanson/passport
[twit]: http://twitter.com
[c]: http://127.0.0.1:3000
[rt]:http://www.rottentomatoes.com


Twitter: Set up
--

1. Setup a twitter application and get keys. [For example instructions][twitterinstruct]
2. Edit “config/twitterKeysSample.json” with your keys
3. Save “config/twitterKeysSample.json” to “config/twitterKeys.json”

[twitterinstruct]: http://bridgesuncc.github.io/technical/twitter/ 

=======
Using Datasources
--  


Routes are used as follows:
    
    serverAddress/streams/:datasourceName/*parameters?apikey=xxxxx

Can only choose handles: "usgs", "earthquake", "twitscores", "twitterapi" or "wired" unless account authenticated w/ twitter
    
    form: streams/twitter.com/:followersOrTimeline/:twitterHandle/:resultCount?apikey=xxxx

Twitter: Get Timelines 
--
    example: http://127.0.0.1:3000/streams/twitter.com/timeline/earthquake/4?apikey=143214
    
Sample output for the above querry    
    
```json
{
    "tweets": [
    {
        "date": "Mon Jan 13 04:11:10 +0000 2014",
        "tweet": "#earthquake M 5.5, Puerto Rico region Jan 13, 2014 04:01:06 UTC http://t.co/psn2ygRxLl"
    },
    {
        "date": "Mon Jan 13 04:11:10 +0000 2014",
        "tweet": "#earthquake M 6.4, Puerto Rico region Jan 13, 2014 04:00:58 UTC http://t.co/ACW0oLMKHz"
    },
    {
        "date": "Thu Jan 09 21:22:25 +0000 2014",
        "tweet": "#earthquake M 5.0, Cuba region Jan  9, 2014 20:57:47 UTC http://t.co/rea0KzZPbZ"
    },
    {
        "date": "Wed Jan 01 16:22:47 +0000 2014",
        "tweet": "#earthquake M 6.6, Vanuatu Jan  1, 2014 16:03:31 UTC http://t.co/AUNcjtRaIH"
    }
    ]
}
```

Twitter: Get Followers
--
   
    example: http://127.0.0.1:3000/streams/twitter.com/followers/stephen_macneil/5?apikey=143214


```json
{
  "followers": [
    "dataScienceRet",
    "bilalalsallakh",
    "RachelShadoan",
    "geovisual",
    "kanitw"
  ]
}

```
