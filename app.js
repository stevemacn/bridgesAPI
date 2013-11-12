//Modules used.
var express = require('express')
    , fs = require('fs')
    , passport = require('passport')
    , config = require('./config/config')
//Set up database
var mongoose = require('mongoose')
mongoose.connect(config.db)
var db = mongoose.connection
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db)
})

//Bootstrap models.
var modelsPath = __dirname + '/app/models'
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file)
  }
})

//Bootstrap express
var app = express()
require('./config/express')(app, config, passport)

//Bootstrap passport
require('./config/passport')(passport, config)

var server = app.listen(config.port)
var io = require('socket.io').listen(server);
var streamable = require('streamable').streamable(io);


//Bootstrap routes.
require('./config/routes')(app, passport, streamable)

exports = module.exports = app

