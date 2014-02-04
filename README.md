bridgesAPI
==========

Data delivery system for multiple data sources (Twitter, Facebook, etc). 

Requirements
--
1. Install mongoDB. Run it in the background
2. Add your own twitter developer keys 
3. Edit "config/twitterKeysSample.json" with your keys
4. Save "config/twitterKeysSample.json" to "config/twitterKeys.json"

Setup 
---
    git clone git@github.com:stevemacn/bridgesAPI.git
    
    npm install
    bower install
    git submodule init
    git submodule update
    grunt

For the uninitiated, [install node and npm][nodenpm], then to get grunt, yo and bower...
[nodenpm]:http://www.joyent.com/blog/installing-node-and-npm

    npm install -g yo 

or individually...
    
    npm install -g grunt-cli
    npm install -g bower

=======
Authenticating Datasources
--    
[bridgesAPI][bridge] has been designed to support multiple datasources; however, currently we are only supporting [Twitter][twit]. 

Current authentication is using [passport][passport] and consequently twitter's callback must be to http://127.0.0.1 if testing locally. This has some implications: when testing locally the url must be http://127.0.0.1:3000 rather than [http://localhost:3000][c]

[bridge]: https://github.com/stevemacn/bridgesAPI
[passport]: https://github.com/jaredhanson/passport
[twit]: http://twitter.com
[c]: http://127.0.0.1:3000

Get Timelines 
--
Can only choose handles: "usgs", "earthquake", or "cltweather" unless account authenticated w/ twitter
    
    form: stream/:source/:twitterHandle/:requestType/:resultCount
    
    example: http://127.0.0.1:3000/streams/twitter.com/timeline/earthquake/4
    
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

Get Followers
--
   
    form: stream/:source/:twitterHandle/:requestType/:resultCount
    
    example: http://127.0.0.1:3000/streams/twitter.com/followers/stephen_macneil/5


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
