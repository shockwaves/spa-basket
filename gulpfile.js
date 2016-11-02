var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function() {
    gulp.src('source/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./assets/css'));
});

//Watch task
gulp.task('default',function() {
    gulp.watch('source/sass/*.scss',['styles']);
});