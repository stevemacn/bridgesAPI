var request = require('supertest')
    , should = require('should')
    , server = 'http://localhost:3000' 
    , mongoose = require('mongoose')
    , config = require('../config/config')


//Test all pages
describe('Get all pages', function(){
    it('GET /', function(done){
        request(server)
            .get('/')
            .end(function(err, res){
                res.should.have.status(200)
                done()
            })
    })
    it ('GET /login', function(done) {
        request(server)
            .get('/login')
            .end(function(err, res) {
                res.should.have.status(200)
                done()
            })
    })
    it ('GET /signup', function(done) {
        request(server)
            .get('/signup')
            .end(function(err, res) {
                res.should.have.status(200)
                done()
            })
    })
    it ('GET /home', function(done) {
        request(server)
            .get('/home')
            .end(function(err, res) {
                res.should.have.status(200)
                done()
            })
    })
    it ('GET /logout', function(done) {
        request(server)
            .get('/home')
            .end(function(err, res) {
                res.should.have.status(200)
                done()
            })
    })


 })



