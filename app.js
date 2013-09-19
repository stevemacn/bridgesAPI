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

//Bootstrap routes.
require('./config/routes')(app, passport)

app.listen(config.port)

exports = module.exports = app

