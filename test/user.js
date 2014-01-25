var request = require('supertest')
    , should = require('should')
    , server = 'http://localhost:3000' 
    , mongoose = require('mongoose')
    , config = require('../config/config')


//Test all pages
describe('Get all pages', function(){
    /*before(function (done) {
      mongoose.connection.on('open', done)
    })*/
    
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
                res.should.have.status(302)
                done()
            })
    })
    it ('GET /logout', function(done) {
        request(server)
            .get('/logout')
            .end(function(err, res) {
                res.should.have.status(302)
                done()
            })
    })
/*
    //inspired by https://gist.github.com/joaoneto/5152248
    it('should create user session for valid user', function (done) {
        request(server)
            .post('/users/session')
            .set('Accept','application/json')
            .send({"email": "signup@signup", "password": "signup"})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                console.log(res)
                
                res.body.short_name.should.equal('Test user');
                res.body.email.should.equal('user_test@example.com');
                // Save the cookie to use it later to retrieve the session
                Cookies = res.headers['set-cookie'].pop().split(';')[0];
                done();
            });
               
    })
*/

 })



