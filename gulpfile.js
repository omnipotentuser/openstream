var gulp = require('gulp');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var nib = require('nib');

gulp.task('stylus', function(){
  return gulp.src('app/public/css/style.styl')
    .pipe(stylus({use:nib(), compress: true}))
    .pipe(minifycss())
    .pipe(gulp.dest('./build/css/'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('./build/css/'));
});

gulp.task('default', ['stylus']);
