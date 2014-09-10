module.exports = function(app){
  app.get('/', function(req, res){
	  res.render('index', {title: 'OpenStream MCU server'});
  });

  app.get('/hallway', function(req,res){
	  res.render('index', {title: 'OpenStream MCU server'});
  });
};
