module.exports = function(app){
  app.get('/', function(req, res){
	  res.render('index', {title: 'OpenStream - Lobby'});
  });

  app.get('/hallway', function(req,res){
	  res.render('index', {title: 'OpenStream - Hallway'});
  });
  app.get('/lavatory', function(req,res){
	  res.render('index', {title: 'OpenStream - Lavatory'});
  });
  app.get('/lounge', function(req,res){
	  res.render('index', {title: 'OpenStream - Lounge'});
  });
  app.get('/livereload.js', function(req, res){
    res.redirect('/js/livereload.js');
  });
};
