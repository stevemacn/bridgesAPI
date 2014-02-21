var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Account = mongoose.model('Account')
    , Assignment = mongoose.model('Assignment')

//Setup for logging in via twitter
exports.upload = function (req, res) {
    res.json("success") 
}

exports.show = function (req, res) {
    res.render ('assignments/index', {})
}
