var $ = require('jquerygo');

var request = require('supertest')
    , should = require('should')
    , server = 'http://localhost:3000' 
    , mongoose = require('mongoose')
    , config = require('../config/config')
    , async = require('async')

//Test all pages
//describe('Get pages', function(){
    /*before(function (done) {
      mongoose.connection.on('open', done)
    })*/
    
    //it('can validate users for login', function(done){
        // Visit the user path and log in.  
        //$.visit('http://localhost:3000/login', function() {
        

        //================================
        //Configure the server for testing
        //================================

        var user = "signup@signup"
            , pwd = "signup"
            , server = "http://127.0.0.1:3000"

        var count = 1 

        var captureImage = function () {
            $.capture(__dirname+"/imgs/screenshot"+(count++)+".png")
        }

        var logout = function (cb) {
        
            $.visit(server, function () {
                $.waitForPage(function() {
                    captureImage()
                    $("#log").text(function(t){
                        console.log(t)
                    })
                    $('#log:eq(0)').click(function() {
                        console.log($(this))
                        $.waitForPage(function() {
                            
                            setTimeout(function() {        
                                cb()
                            }, 2500)
                        })
                    })
                })
            })
        }

        logout(run)

        //================================
        //Test the ability to log in
        //================================
       

        function run () {
                    $("a:last").text(function(t){
                        console.log(t)
                    })
        $.visit(server+'/login', function(){
            $.waitForPage(function(){
                captureImage()
                $('#user').val(user, function() {
                    $('#pwd').val(pwd, function () {
                        captureImage()
                        $('#submit').click(function() {
                            loggedIn()
                        })
                    })  
                })
            })
        })
        }
        //================================
        //Test the home page for the user
        //================================

        function loggedIn () {
            setTimeout(function() {        
            $.visit(server+'/home', function() {
                $.waitForPage(function() {
                    console.log("STATUS: Logged In")
                    captureImage()
        
                    $.close() 

/*
                    $('a').each(function(index, element, done) {
                        this.text(function(text) {
                            console.log(text)
                            done()
                        })
                    }, function() {
                        console.log('done')
                        $.close()
                    })*/
                })
            })
            }, 2500)
        }
