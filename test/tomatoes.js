var should = require('should');

var tomatoes = require('tomatoes');
var config = require('./../config/keys.json')
var movies = tomatoes(config.rotten.apikey);

var DIRECT = {
  id: '10598',
  title: 'Batman Returns',
  ratings: {
    critics_rating: 'Certified Fresh',
    critics_score: 78,
    audience_rating: 'Upright',
    audience_score: 68
  }
};
describe('Rotten Tomatoes', function() {
  describe('Search for a movied title', function() {
    it('should return the match', function(done) {
      movies.search('Batman Returns', function(err, results) {
        should.not.exist(err);
        results[0].id.should.eql(DIRECT.id);
        results[0].title.should.eql(DIRECT.title);
        return done();
      });
    });
  });

});
