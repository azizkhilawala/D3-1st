var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: ''
    }
  });
  gulp.watch(['*.html', 'style-assests/**/*.css', 'script-assests/**/*.js'], {cwd: ''}, reload);
});
