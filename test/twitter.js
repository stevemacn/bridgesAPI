//These tests have been taken from the twit project 
//and trimmed as needed.

var assert = require('assert')
  , Twit = require('twit')
  , keys = require('./../config/keys.json')
  , config1 = keys.keys
  , util = require('util')
  , async = require('async')

    var config1 = keys.twitter.keys

describe('Twitter API', function () {
  var twit = new Twit(config1)

  it('GET `account/verify_credentials`', function (done) {
    twit.get('account/verify_credentials', function (err, reply, response) {
      checkReply(err, reply)
      assert.notEqual(reply.followers_count, undefined)
      assert.notEqual(reply.friends_count, undefined)
      assert.ok(reply.id_str)

      checkResponse(response)

      assert(response.headers['x-rate-limit-limit'])

      done()
    })
  })

  it('GET `statuses/home_timeline`', function (done) {
    twit.get('statuses/home_timeline', function (err, reply, response) {
      checkReply(err, reply)
      checkTweet(reply[0])

      checkResponse(response)

      done()
    })
  })

  it('GET `statuses/mentions_timeline`', function (done) {
    twit.get('statuses/mentions_timeline', function (err, reply, response) {
      checkReply(err, reply)
      checkTweet(reply[0])
      done()
    })
  })

  it('GET `statuses/user_timeline`', function (done) {
    var params = {
      screen_name: 'tolga_tezel'
    }

    twit.get('statuses/user_timeline', params, function (err, reply, response) {
      checkReply(err, reply)
      checkTweet(reply[0])

      checkResponse(response)

      done()
    })
  })

  it('GET `search/tweets` { q: "grape", since_id: 12345 }', function (done) {
    var params = { q: 'grape', since_id: 12345 }
    twit.get('search/tweets', params, function (err, reply, response) {
      checkReply(err, reply)
      assert.ok(reply.statuses)
      checkTweet(reply.statuses[0])

      checkResponse(response)

      done()
    })
  })

  it('GET `search/tweets` { q: "banana since:2011-11-11" }', function (done) {
    var params = { q: 'banana since:2011-11-11', count: 100 }
    twit.get('search/tweets', params, function (err, reply, response) {
      checkReply(err, reply)
      assert.ok(reply.statuses)
      checkTweet(reply.statuses[0])

      console.log('\nnumber of banana statuses:', reply.statuses.length)

      checkResponse(response)

      done()
    })
  })

  it('GET `search/tweets`, using `q` array', function (done) {
    var params = {
      q: [ 'banana', 'mango', 'peach' ]
    }

    twit.get('search/tweets', params, function (err, reply, response) {
      checkReply(err, reply)
      assert.ok(reply.statuses)
      checkTweet(reply.statuses[0])

      checkResponse(response)

      done()
    })
  })

  it('GET `search/tweets` with count set to 100', function (done) {
    var params = {
      q: 'happy',
      count: 100
    }

    twit.get('search/tweets', params, function (err, reply, res) {
      checkReply(err, reply)
      console.log('\nnumber of tweets from search:', reply.statuses.length)
      // twitter won't always send back 100 tweets if we ask for 100,
      // but make sure it's close to 100
      assert(reply.statuses.length > 95)

      done()
    })
  })

  it('GET `search/tweets` with geocode', function (done) {
    var params = {
      q: 'apple', geocode: [ '37.781157', '-122.398720', '1mi' ]
    }

    twit.get('search/tweets', params, function (err, reply) {
      checkReply(err, reply)

      done()
    })
  })

  it('GET `followers/ids`', function (done) {
    twit.get('followers/ids', function (err, reply, response) {
      checkReply(err, reply)
      assert.ok(Array.isArray(reply.ids))

      checkResponse(response)

      done()
    })
  })

  it('GET `followers/ids` of screen_name tolga_tezel', function (done) {
    twit.get('followers/ids', { screen_name: 'tolga_tezel' },  function (err, reply, response) {
      checkReply(err, reply)
      assert.ok(Array.isArray(reply.ids))

      checkResponse(response)

      done()
    })
  })

  // 1.1.8 usage
  it('GET `users/suggestions/:slug`', function (done) {
    twit.get('users/suggestions/:slug', { slug: 'funny' }, function (err, reply, res) {
      checkReply(err, reply)
      assert.equal(reply.slug, 'funny')
      done()
    })
  })

  // 1.1.8 usage
  it('GET `users/suggestions/:slug/members`', function (done) {
    twit.get('users/suggestions/:slug/members', { slug: 'funny' }, function (err, reply, res) {
      checkReply(err, reply)

      assert(reply[0].id_str)
      assert(reply[0].screen_name)

      done()
    })
  })

  // 1.1.8 usage
  it('GET `geo/id/:place_id`', function (done) {
    var placeId = 'df51dec6f4ee2b2c'

    twit.get('geo/id/:place_id', { place_id: placeId }, function (err, reply, res) {
      checkReply(err, reply)

      assert(reply.country)
      assert(reply.bounding_box)
      assert.equal(reply.id, placeId)

      done()
    })
  })
})

/**
 * Basic validation to verify we have no error and reply is an object
 *
 * @param  {error} err   error object (or null)
 * @param  {object} reply reply object received from twitter
 */
function checkReply (err, reply) {
  assert.equal(err, null, 'reply err:'+util.inspect(err, true, 10, true))
  assert.equal(typeof reply, 'object')
}

/**
 * check the http response object and its headers
 * @param  {object} response  http response object
 */
function checkResponse (response) {
  assert(response)
  assert(response.headers)
}

/**
 * validate that @tweet is a tweet object
 *
 * @param  {object} tweet `tweet` object received from twitter
 */
function checkTweet (tweet) {
  assert.ok(tweet)
  assert.equal('string', typeof tweet.id_str, 'id_str wasnt string:'+tweet.id_str)
  assert.equal('string', typeof tweet.text)

  assert.ok(tweet.user)
  assert.equal('string', typeof tweet.user.id_str)
  assert.equal('string', typeof tweet.user.screen_name)
}

