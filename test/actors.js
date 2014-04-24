//packages for testing
var request = require('superagent'),
    should = require('should'),
    server = 'http://localhost:3000'

    //Get configurations
config = require('./../config/config')
console.log(config)
server = "http://localhost:" + config.port

agent1 = request.agent();
retApiKey = ""

//Test all pages
describe('Test the actors route', function() {

    it('should create a new agent', function(done) {
        agent1
            .post(server + '/users')
            .send({
                'email': "agent14@isis.com",
                "password": 'test',
                "username": 'sterling2'
            })
            .end(function(err, res) {
                if (err) console.log(err)
                console.log(res.status)
                done()
            });
    })

    it('should log in with new user', function(done) {
        agent1
            .post(server + '/users/session')
            .send({
                "username": "agent14@isis.com",
                "password": "test"
            })
            .set('Accept', 'application/json')
            .end(function(err, res) {
                if (err) console.log(err)
                done();
            });
    })

    it('should generate a new api key', function(done) {
        agent1
            .get(server + '/users/apikey')
            .end(function(err, res) {
                if (err) console.log(err)
                console.log(res.text)
                retApiKey = res.text
                done()
            })
    })
})

describe('Actor Request', function() {
    it('should get actor information', function(done) {
        agent1
            .get(server +
                "/streams/actors/norm macdonald?apikey=" +
                retApiKey)
            .end(function(err, res) {
                if (err) console.log(err)
                for (i in res.body) {
                    console.log(res.body[i].title)
                }
                done()
            })
    })
})

