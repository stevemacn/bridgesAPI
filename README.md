bridgesAPI
==========

Data delivery system for multiple data sources (Twitter, Rotten Tomatoes, Facebook, etc). 

#Requirements

1. Install git if you don't have it.
2. Install mongoDB. Run it in the background. 
3. [Install node and npm][nodenpm](node's package manager) 
4. Server on which you can host nodejs (nginx to proxy requests).
5. Route requests from server to node.js (running by default on port 3000)

On OSX? Install mongoDB, node, npm, and yeoman using [homebrew][hbrew] 

[hbrew]:http://brew.sh/

###Setup 

First we need our task runner, dependency manager and scaffold generators (you don't need to know what they are)

```
npm install -g yo 
```

Then we need to get BRIDGES' server code

```
git clone https://github.com/stevemacn/bridgesAPI
```  

We install it (bower needs --allow-root to be sudoed)

```
npm install
bower install
git submodule init
git submodule update
mongod & 
grunt
```    

If bower install doesn't work, try the following: 
```
git config --global url."https://".insteadOf git://
```


*Now we need to authenticate datasources and test these datasources are properly configured.*

[nodenpm]:http://www.joyent.com/blog/installing-node-and-npm


#Authenticating Datasources

[bridgesAPI][bridge] has been designed to support multiple datasources; however, currently we are only supporting [Twitter][twit], [RottenTomatoes][rt], and actors. 

Current authentication is using [passport][passport] and consequently twitter's callback must be to http://127.0.0.1 rather than [http://localhost:3000][c] if testing locally.

Basic set up

1. Rename config/keysSample.json to config/keys.json
2. Get relevant api key for each datasource
3. Enter the apikey into the keys.json file
4. Change configured from 0 to 1

[bridge]: https://github.com/stevemacn/bridgesAPI
[passport]: https://github.com/jaredhanson/passport
[twit]: http://twitter.com
[c]: http://127.0.0.1:3000
[rt]:http://www.rottentomatoes.com


###Twitter: Set up

1. Setup a twitter application and get keys. [For example instructions][twitterinstruct]
2. Edit “config/keysSample.json” with your keys
3. Save “config/keysSample.json” to “config/keys.json”

###Rotten Tomatoes: Set up

1. Setup a rotten tomatoes application and get the api key.
2. Edit “config/keysSample.json” with your keys
3. Save “config/keysSample.json” to “config/keys.json”

###Actor: Set up

You must email one of the investigators to obtain an apikey.


[twitterinstruct]: http://bridgesuncc.github.io/technical/twitter/ 

#Testing
    
From the directory containing the server typically /var/www/ run the following command. These tests are to make sure the server is accessible, and to make sure that the datasources are properly configured. 


    npm test


#Using Datasources

To use datasources, you must 

1. Log into the server (serverAddress click login in the top right)
2. Navigate to "serverAddress/home" or click on your user name in the top right of the page.
3. Click "generate api key" button. Use this apikey to access the API.

###Twitter: General usage

Routes are used as follows:

```    
    serverAddress/streams/:datasourceName/*parameters?apikey=xxxxx
```

Can only choose handles: "usgs", "earthquake", "twitscores", "twitterapi" or "wired" unless account authenticated w/ twitter

```    
form: streams/twitter.com/:followersOrTimeline/:twitterHandle/:resultCount?apikey=xxxx
```

###Twitter: Get Timelines 

```
example: http://127.0.0.1:3000/streams/twitter.com/timeline/earthquake/4?apikey=143214
```

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

###Twitter: Get Followers

```
example: http://127.0.0.1:3000/streams/twitter.com/followers/stephen_macneil/5?apikey=143214
```

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

###Rotten Tomatoes: General usage

```
form: streams/rottentomatoes.com/:movieTitle?apikey=xxxx
```
    
The result is rather long, a simplified version is shown below (only relevant feilds shown).

```
example: http://127.0.0.1:3000/streams/rottentomatoes.com/starbuck?apikey=143214
```

```json
[
    {
        "id": "771243352",
        "title":"Starbuck",
        "year":2013,
        "mpaa_rating":"R",
        "runtime":109,
        "release_dates":{
            "theater":"2013-03-22",
            "dvd":"2013-07-23"
        },
        "ratings":{
            "critics_rating":"Fresh",
            "critics_score":65,
            "audience_rating":
            "Upright","audience_score":80
        }, 
        "posters":{
            "thumbnail":"http://content6.flixster.com/movie/11/16/93/11169352_mob.jpg"
        }, 
        "abridged_cast":[
            {
                "name":"Patrick Huard",
                "id":"196088490",
                "characters":["David Wozniak"]
            },
            {
                "name":"Julie Le Breton",
                "id":"770904316",
                "characters":["Valerie"]
            },
            {
                "name":"Antoine Bertrand",
                "id":"770810073",
                "characters":["Paul"]
            }
        ]
    }
    
    ...
    
    { another movie that matches "starbuck" query },
    { another movie that matches "starbuck" query }
]
```

###Actors: General usage

```
form: streams/actors/:actorName?apikey=xxxx
```

The result is rather long, a simplified version is shown below (only relevant feilds shown).

```
example: http://127.0.0.1:3000/streams/actors/ewan mcgregor?apikey=143214
```

```json
[
  {
    "adult": false,
    "character": "Joe Taylor",
    "credit_id": "52fe422ac3a36847f80092b1",
    "id": 237,
    "original_title": "Young Adam",
    "poster_path": "/zruee1cUYJXMuGFWJfJ1o0WE7Wm.jpg",
    "release_date": "2003-09-26",
    "title": "Young Adam"
  },
  {
    "adult": false,
    "character": "Younger Ed Bloom",
    "credit_id": "52fe4258c3a36847f8016fff",
    "id": 587,
    "original_title": "Big Fish",
    "poster_path": "/6DRFdlNZpAaEt7eejsbAlJGgaM7.jpg",
    "release_date": "2003-12-10",
    "title": "Big Fish"
  },
  {
    "adult": false,
    "character": "Renton",
    "credit_id": "52fe4260c3a36847f8019913",
    "id": 627,
    "original_title": "Trainspotting",
    "poster_path": "/p1O3eFsdb0GEIYu87xlwV7P4jM1.jpg",
    "release_date": "1996-07-19",
    "title": "Trainspotting"
  },
  {
    "adult": false,
    "character": "Christian",
    "credit_id": "52fe427cc3a36847f802277d",
    "id": 824,
    "original_title": "Moulin Rouge!",
    "poster_path": "/zsphaxX7NaZyFTYpdlo2yz7q7wy.jpg",
    "release_date": "2001-05-16",
    "title": "Moulin Rouge!"
  },
  
  ...
  
  {more roles},
  {more roles}
]
```

#Submitting Assignments

After a datasource is received by the client, the user can apply manipulations to the data. These manipulations are typically, storing data into a data strucutre, applying algorthims to the datastructures, or both. After this point the manipulated data can be sent back to the server so that it can be visualized. 

**The following explains how requests work; however, the client will typically handle these requests for the user.**

###Posting an assignment

After the client has manipulated the data, the client can POST the data to server via: 

```
serverAddress/assignments/:assignmentNumber?apikey=xxxx
```

An example
```
bridges.cs.uncc.edu/assignments/0?apikey=1145327585291
```
With the following passed in the raw body of the post request.
```json
{
  "nodes" :[
    {"name":"stephen", "color":"green", "size":"10"},
    {"name":"meghna", "color":"blue"},
    {"name":"joe", "color":"yellow"},
    {"name":"hooram", "color":"red"},
    {"name":"dan", "color":"green"},
    {"name":"jeffrey"},
    {"name":"dahlia"}
    
],
  "links" : [
    {"source":1, "target":2, "width":12, "color":"steelblue", "opacity":"0.25"},
    {"source":6, "target":0, "width":11, "color":"#FF00FF", "opacity":"1"},
    {"source":0, "target":6, "width":2},
    {"source":3, "target":2, "width":3},
    {"source":3, "target":1, "width":4},
    {"source":1, "target":3, "width":5},
    {"source":4, "target":3}
]}
```
*Notice that color can be any css string (hex or name)*








    




