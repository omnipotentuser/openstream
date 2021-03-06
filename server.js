var express	        = require('express');
var path	          = require('path');
var favicon	        = require('serve-favicon');
var methodOverride  = require('method-override');
var cookieParser    = require('cookie-parser');
var errorHandler    = require('errorhandler');
var livereload      = require('connect-livereload');
var morgan	        = require('morgan');
var io              = require('socket.io');
var stylus          = require('stylus');
var nib             = require('nib');
var compressor      = require('node-minify');
var app		          = express();
var router	        = express.Router();
var mcu		          = require(path.join(__dirname, './lib/mcu.js'));
var cssasset        = path.join(__dirname, './app/assets/css');
var pub		          = path.join(__dirname, './app/public');
var devpub		      = path.join(__dirname, './app/assets');
var views	          = path.join(__dirname, './app/server/views');
var port	          = process.env.PORT || 9990;


var jsIn = path.join(__dirname, './app/assets/js/**/*.js');
var jsUgly = path.join(__dirname, './app/public/js/openstream.min.js');
var jsGCC = path.join(__dirname, './app/public/js/openstream.min.gcc.js');

var env = process.env.NODE_ENV || 'development';

if (env === 'development'){
  console.log('development mode');
  app.use(errorHandler());
  app.use(morgan('dev'));
  app.use(express.static(devpub));
} else {
  console.log('production mode');
};

function compile(str, path){
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib());
}
app.set('port', port);
app.set('views', views);
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname,'app/assets/favicon.ico')));
app.use(cookieParser());
app.use(methodOverride());
app.use(livereload());
app.use(stylus.middleware({
  debug: true,
  src: cssasset,
  dest: pub,
  compile: compile
}));
app.use(express.static(pub));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

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

new compressor.minify({
  type: 'uglifyjs',
  fileIn: jsIn,
  fileOut: jsUgly,
  callback: function(err, min){
    console.log('running compressor uglifying JS');
    console.log('jsIn', jsIn);
    console.log('jsUgly', jsUgly);
    console.log(err);
  }
});
