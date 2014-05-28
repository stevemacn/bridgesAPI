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

agentManager = (function(request, server) {

    var manager = {
        request: request,
        server: server,
        agents: [],
        count: 0
    }
    //create a single agent
    manager.createAgent = function(cb) {
        
        var currentAgent = {
            "agent": this.request.agent(),
            "cred": {
                "email": "agent00" + this.count + "@oss.com",
                "password": "hubert",
                "username": "OSS11" + this.count++
            }
        }
        //use the create route to make a new agent 
        agents = this.agents
        currentAgent.agent
            .post(this.server + '/users')
            .send(currentAgent.cred)
            .end(function(err, res) {
                if (err) {
                    console.log(err)
                    return null
                }
                agents.push(currentAgent)
                cb(currentAgent)
            })
    }

    manager.stealKey = function(agent, cb) {}

    //login a single agent
    manager.login = function(agent, cb) {
        var cred = {
            "username": agent.cred.email,
            "password": agent.cred.password
        }

        agent.agent
            .post(this.server + "/users/session")
            .send(cred)
            .end(function(err, res) {
                cb(err, res)
            })
    }

    //delete a single agent
    manager.sendBurnNotice = function(agent, cback) {
        console.log(agent.cred.email)
        agent.agent
            .post(this.server + '/users/' + agent.cred.email)
            .send({
                "_method": "delete"
            })
            .end(function(err, res) {
                cback() 
            })
    }

    //send agents to log in and be authenticated!
    manager.dispatchAgents = function(cb) {
        var count = this.agents.length
        for (i in this.agents) {
            this.login(this.agents[i], function() {
                if (--count==0)return callback()
            })
        }
    }

    //delete all known agents
    manager.disavowAgents = function(callback) {
        var count = this.agents.length
        for (i in this.agents) {
            this.sendBurnNotice(this.agents[i], function(){
                if (--count==0) return callback() 
            })
        }
        this.agents=[]
    }

    return manager;

})(request, server);

var localAgent
var localAgent2
//Test all pages
describe('Test the actors route', function() {

    it('should create agent 1', function(done) {
        agentManager.createAgent(function(la) {
            localAgent = la
            done()
        })
    })

    it('should create agent 2', function(done) {
        agentManager.createAgent(function(la) {
            localAgent2 = la
            done()
        })
    })



    it('should create a session for agent 1', function(done) {
        agentManager.login(localAgent, done)
    })

    it('should create a session for agent 2', function(done) {
        agentManager.login(localAgent2, done)
    })

    it('should generate a new api key', function(done) {
        localAgent.agent
            .get(server + '/users/apikey')
            .end(function(err, res) {
                if (err) console.log(err)
                console.log(localAgent.cred.username + " gets new "+
                    "apikey: " + res.text)
                retApiKey = res.text
                done()
            })
    })

    it('should generate a new api key', function(done) {
        localAgent2.agent
            .get(server + '/users/apikey')
            .end(function(err, res) {
                if (err) console.log(err)
                console.log(localAgent2.cred.username + " gets new "+
                    "apikey: " + res.text)
                retApiKey = res.text
                done()
            })
    })
})

describe('Actor Request', function() {
    it('should get actor information', function(done) {
        localAgent.agent
            .get(server +
                "/streams/actors/adrien brody?apikey=" +
                retApiKey)
            .end(function(err, res) {
                if (err) console.log(err)
                for (i in res.body.slice(0,5)) {
                    console.log(res.body[i].title)
                }
                done()
            })
    })
})

describe('RottenTomatoes Request', function() {
    it('should get batman movie info', function(done) {
        localAgent2.agent
            .get(server +
                "/streams/rottentomatoes.com/batman begins")
            .end(function(err, res) {
                var jsonResp = JSON.parse(res.text)
                console.log(jsonResp[0].title)
                console.log(jsonResp[0].year)
                done()
            })
    })
})

describe('Remove all new users', function() {
    it('should burn all agents in the field', function(done) {
        agentManager.disavowAgents(function() {
            //console.log(agentManager)
            done()})

    })
})


describe('Make two more agents for manual testing', function() {
    manualAgent = null
    it('should create agent 1', function(done) {
        agentManager.createAgent(function(la) {
            manualAgent = la
            done()
        })
    })
    it('should create a session for agent 2', function(done) {
        agentManager.login(manualAgent, done)
    })

    it('should generate a new api key', function(done) {
        manualAgent.agent
            .get(server + '/users/apikey')
            .end(function(err, res) {
                if (err) console.log(err)
                console.log(localAgent.cred.username + " gets new "+
                    "apikey: " + res.text)
                retApiKey = res.text
                done()
            })
    })
})
