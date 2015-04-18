module.exports = function(app){
  var env = process.env.NODE_ENV || 'development';
  console.log('rendering', env);
  app.get('/', function(req, res){
    var host = req.get('host');
    var origin = req.get('origin');
    console.log('HOST -- '+host);
    console.log('ORIGIN -- '+origin);
	  res.render('index', 
      { title: 'OpenStream - Lobby',
        env: env
      });
  });

  app.get('/hallway', function(req,res){
	  res.render('index',
      { title: 'OpenStream - Lobby',
        env : env
      });
  });
  app.get('/lavatory', function(req,res){
	  res.render('index',
      { title: 'OpenStream - Lobby',
        env : env
      });
  });
  app.get('/lounge', function(req,res){
	  res.render('index',
      { title: 'OpenStream - Lobby',
        env : env
      });
  });
  app.get('/livereload.js', function(req, res){
    res.redirect('/js/livereload.js');
  });
};
