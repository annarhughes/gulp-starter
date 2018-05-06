var gulp = require('gulp');
var sass = require('gulp-sass'); // convert sass files to css
var useref = require('gulp-useref'); // concatinate js/css files
var gulpIf = require('gulp-if'); //  ensure file type
var uglify = require('gulp-uglify'); // minify js files
var cssnano = require('gulp-cssnano'); // minify css files
var imagemin = require('gulp-imagemin'); // optimize images
var cache = require('gulp-cache'); // cache optimized images locally
var runSequence = require('run-sequence'); // run tasks in order
var del = require('del'); // cleaning/deleting unused files
var sourcemaps = require('gulp-sourcemaps'); // sourcemaps for js
var babel = require('gulp-babel'); // compile es6
var concat = require('gulp-concat'); //
var browserSync = require('browser-sync').create(); // sync and reload browser

// build function to optimize project build
gulp.task('build', function(callback) {
    runSequence('clean:dist', ['sass', 'es6', 'useref', 'images'], callback);
});

// default task for production serving runs browser sync and reloads on files changes
gulp.task('default', function(callback) {
    runSequence(['sass', 'es6', 'browserSync', 'watch'], callback);
});

// Converts all Sass files to CSS with gulp-sass
gulp.task('sass', function() {
    return gulp
        .src('app/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/css'))
        .pipe(
            browserSync.reload({
                stream: true
            })
        );
});

// Compile es6 js
gulp.task('es6', function() {
    return gulp
        .src('app/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

// Optimise images and cache them to save processing time
gulp.task('images', function() {
    return (
        gulp
            .src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
            // Caching images that ran through imagemin
            .pipe(
                cache(
                    imagemin({
                        interlaced: true
                    })
                )
            )
            .pipe(gulp.dest('dist/images'))
    );
});

// Initialises Browser Sync
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    });
});

// Watches scss/html/js files and on save, reloads Browser Sync
// Runs sass task when a Sass file is saved
gulp.task('watch', function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

// Concatinate and minify js and css files
gulp.task('useref', function() {
    return gulp
        .src('app/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
});

// Cleaning/deleting dist folder to be rebuilt without unused files
gulp.task('clean:dist', function() {
    return del.sync('dist');
});
