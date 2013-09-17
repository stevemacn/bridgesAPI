var mongoose = require('mongoose'),
  Article = mongoose.model('Article');

exports.index = function(req, res){
  Article.find(function(err, articles){
    if(err) throw new Error(err);
    res.render('users/signup', {
      title: 'Main Page',
      articles: articles
    });
  });
};

exports.register = function (req, res) {
    console.log("HERE");
    res.send('id: ' +req.query);
}


exports.signup = function (req, res) {
  res.render('users/signup', {
      title: 'Sign up',
      //user: new User()
      
    })
}
