var express	        = require('express');
var path	          = require('path');
var stylus	        = require('stylus');
var nib		          = require('nib');
var bodyParser	    = require('body-parser');
var favicon	        = require('static-favicon');
var methodOverride  = require('method-override');
var cookieParser    = require('cookie-parser');
var errorHandler    = require('errorhandler');
var morgan	        = require('morgan');
var io              = require('socket.io');
var app		          = express();
var router	        = express.Router();
var mcu		          = require(path.join(__dirname, './lib/mcu.js'));
var pub		          = path.join(__dirname, './app/public');
var views	          = path.join(__dirname, './app/server/views');
var port	          = process.env.PORT || 19000;

function compile(str, path){
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib());
}

var env = process.env.NODE_ENV || 'development';

if (env === 'development'){
  console.log('development mode');
  app.use(errorHandler());
  app.use(morgan('dev'));
} else {
  console.log('production mode');
};

app.set('port', port);
app.set('views', views);
app.set('view engine', 'jade');
app.set(favicon());
app.use(bodyParser());
app.use(cookieParser());
app.use(methodOverride());
app.use(stylus.middleware({
  src: pub,
  compile: compile
}));
app.use(express.static(pub));

router.use(function(req, res, next){
  console.log('something is happening');
  next();
});

require(path.join(__dirname, './app/server/router.js'))(app);

var server = app.listen(port, function(){
    console.log('Express 4 listening on port ' + app.get('port'));
});

console.log('Magic happens on port ' + port);
mcu.init(io(server));
