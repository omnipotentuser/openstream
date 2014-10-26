var gulp = require('gulp');
var nib = require('nib');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');

var HTML_SRC = 'app/server/views/**/*.jade';
var HTML_DEST = 'app/server/views/';

var CSS_ASSETS = 'app/assets/css/*.styl';
var CSS_SRC = 'app/assets/css/openstream.styl';
var CSS_DEST = 'app/public/css';

var JS_SRC = 'app/assets/js/**/*.js';
var JS_DEST = 'app/public/js';

var CSS_PUB = 'app/public/css/openstream.css';
var JS_PUB = 'app/public/js/openstream.min.js';
var HTML_PUB = 'app/server/views/index.html';


gulp.task('html', function(){
  return gulp.src(HTML_SRC)
    .pipe(jade())
    //.pipe(rename('openstream.html')
    .pipe(gulp.dest(HTML_DEST));
});
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
  gulp.watch(HTML_SRC, ['html']);
  gulp.watch(HTML_PUB).on('change', livereload.changed);
  gulp.watch(CSS_PUB).on('change', livereload.changed);
  gulp.wathch(JS_PUB).on('change', livereload.changed);
});
gulp.task('livereload', function(){
  livereload.listen();
});
gulp.task('default', ['livereload', 'lint', 'js', 'css', 'html', 'watch']);
