// grab our packages
var gulp   = require('gulp'),
    jshint = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    minifyCSS = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    concatCss = require('gulp-concat-css'),
    merge = require('merge-stream'),
    less = require('gulp-less'),
    ngAnnotate = require('gulp-ng-annotate'),
    clean = require('gulp-clean');

gulp.task('webserver', function() {
  connect.server({
      livereload: true
  });
});

gulp.task('default', ['webserver', 'build-css', 'build-js-app', 'watch',]);
gulp.task('build', ['build-js-angular', 'build-css-template', 'copy-fonts', 'build-css', 'build-js-app', 'build-js-angular-addons',
                    'build-js-bootstrap','build-js-jquery','build-js-other']);

// configure the jshint task
gulp.task('jshint', function() {
  return gulp.src('app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('copy-fonts', function() {
    return gulp.src(['assets/fonts/*.*'])
            .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('build-css-template', function(){
    var lessStream = gulp.src('assets/styles/*.less')
        .pipe(less())
        .pipe(concat('less-files.less'));

    var cssStream = gulp.src('assets/styles/*.css')
        .pipe(concat('css-files.css'));

    var mergedStream = merge(lessStream, cssStream)
        .pipe(concat('template.min.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/styles'));

    return mergedStream;
});

gulp.task('build-css', function(){
    var lessStream = gulp.src('app/**/*.less')
        .pipe(less())
        .pipe(concat('less-files.less'));

    var cssStream = gulp.src('app/**/*.css')
        .pipe(concat('css-files.css'));

    var mergedStream = merge(lessStream, cssStream)
        .pipe(concat('app.min.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/styles'));

    return mergedStream;
});

gulp.task('build-js-app', function() {
  return gulp.src('app/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
      .pipe(ngAnnotate())
      //only uglify if gulp is ran with '--type production'
      .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('build-js-angular', function() {
  return gulp.src('libs/angular/*.js')
    .pipe(sourcemaps.init())
      .pipe(concat('vendor.angular.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('build-js-angular-addons', function() {
  return gulp.src('libs/angular-addons/*.js')
    .pipe(sourcemaps.init())
      .pipe(concat('vendor.angular.addons.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('build-js-bootstrap', function() {
  return gulp.src('libs/bootstrap/*.js')
    .pipe(sourcemaps.init())
      .pipe(concat('vendor.bootstrap.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('build-js-jquery', function() {
  return gulp.src('libs/jquery/*.js')
    .pipe(sourcemaps.init())
      .pipe(concat('vendor.jquery.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('build-js-other', function() {
  return gulp.src('libs/*.js')
    .pipe(sourcemaps.init())
      .pipe(concat('vendor.other.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/scripts'));
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
  gulp.watch('app/**/*.js', ['jshint','build-js-app']);
  gulp.watch('app/**/*.css', ['build-css']);
  gulp.watch('app/**/*.less', ['build-css']);
  gulp.watch('assets/styles/*.css', ['build-css-template']);
  gulp.watch('libs/angular/*.js', ['build-js-angular']);
  gulp.watch('libs/jquery/*.js', ['build-js-jquery']);
  gulp.watch('libs/bootstrap/*.js', ['build-js-bootstrap']);
  gulp.watch('libs/*.js', ['build-js-other']);
});
