'use strict';
var gulp = require('gulp');
var del = require('del');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var useref = require('gulp-useref');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var server = require('gulp-server-livereload');


gulp.task('clean', function () {
  return del([
    'public/**/*'
  ]);
});


gulp.task('assets', [ 'clean'], function () {
  return gulp.src(['src/fonts/*', 'src/images/*'], {base: 'src'})
    .pipe(gulp.dest('public/assets'));
});


gulp.task("index", ['clean'], function() {
  var jsFilter = filter("**/*.js", { restore: true });
  var cssFilter = filter("**/*.css", { restore: true });
  var indexHtmlFilter = filter(['**/*', '!**/index.html'], { restore: true });
  return gulp.src("src/index.html")
    .pipe(useref())      // Concatenate with gulp-useref
    .pipe(jsFilter)
    .pipe(uglify())             // Minify any javascript sources
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe(csso())              // Minify any CSS sources
    .pipe(cssFilter.restore)
    .pipe(indexHtmlFilter)
    .pipe(rev())                // Rename the concatenated files (but not index.html)
    .pipe(indexHtmlFilter.restore)
    .pipe(revReplace())      // Substitute in new filenames
    .pipe(gulp.dest('public'));
});




gulp.task('serve', function() {
  gulp.src('src')
    .pipe(server({
      livereload: true,
      // directoryListing: true,
      open: true
    }));
});


gulp.task('build', ['clean', 'assets', 'index']);


gulp.task('watch', function() {
    gulp.watch('src/**/*', {debounceDelay: 100}, ['build']);
});

