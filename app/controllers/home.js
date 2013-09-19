var mongoose = require('mongoose'),
  Article = mongoose.model('Article');

exports.index = function(req, res){
  user = req.user 
  Article.find(function(err, articles){
    if(err) throw new Error(err);
    res.render('home/index', {
      
      title: 'Main Page',
      articles: articles
    });
  });
};
