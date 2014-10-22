var gulp = require('gulp');
var nib = require('nib');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var nodemon = require('gulp-nodemon');

var CSS_ASSETS = 'app/assets/css/*.styl';
var CSS_SRC = 'app/assets/css/style.styl';
var CSS_DEST = 'app/public/css';

var JS_SRC = 'app/assets/js/**/*.js';
var JS_DEST = 'app/public/js';

gulp.task('css', function(){
  return gulp.src(CSS_SRC)
    .pipe(stylus({use:nib(), compress: true}))
    .pipe(gulp.dest(CSS_DEST));
});
gulp.task('js', function(){
  return gulp.src(JS_SRC)
    .pipe(concat('openstream.js'))
    .pipe(gulp.dest(JS_DEST))
    .pipe(rename('openstream.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(JS_DEST));
});
gulp.task('lint', function(){
  return gulp.src(JS_SRC)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});
gulp.task('watch', function(){
  gulp.watch(CSS_ASSETS, ['css']);
  gulp.watch(JS_SRC, ['lint', 'js']);
});
gulp.task('daemon', function(){
  nodemon({
    script: 'server.js',
    ext: 'js',
    env: {'NODE_ENV':'development'}
  })
    .on('start', ['watch'])
    .on('change', ['watch'])
    .on('restart', function(){
      console.log('restarted!');
    });
});
gulp.task('default', ['daemon']);
