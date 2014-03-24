/*global require*/

(function () {

    // Enable strict mode.
    'use strict';

    // Require Gulp and it's plugins.
    var gulp = require('gulp'),
        wiredep = require('wiredep').stream,
        es = require('event-stream'),
        $ = require('gulp-load-plugins')();

    // Workaround for broken connect plugin.
    $.connect = require('gulp-connect');

    // Styles
    gulp.task('styles', function () {
        return es.concat(
            gulp.src('app/styles/main.less')
                .pipe($.recess()),
            gulp.src('app/styles/**/*.less')
                .pipe($.less())
                .pipe($.autoprefixer('last 1 version'))
                .pipe(gulp.dest('app/styles'))
                .pipe($.size())
        )
    });

    // Scripts
    gulp.task('scripts', function () {
        return gulp.src('app/scripts/**/*.coffee')
            .pipe($.coffeelint())
            .pipe($.coffeelint.reporter())
            .pipe($.coffee())
            .pipe(gulp.dest('app/scripts'))
            .pipe($.size());
    });

    // Templates
    gulp.task('templates', function () {
        return gulp.src('app/*.jade')
            .pipe($.jade({ pretty: true }))
            .pipe(gulp.dest('app'))
            .pipe($.size());
    });

    // HTML
    gulp.task('html', function () {
        return gulp.src('app/*.html')
            .pipe($.useref())
            .pipe(gulp.dest('dist'))
            .pipe($.size());
    });

    // Images
    gulp.task('images', function () {
        return gulp.src('app/images/**/*')
            .pipe($.cache($.imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            })))
            .pipe(gulp.dest('dist/images'))
            .pipe($.size());
    });

    // Other files
    gulp.task('files', function () {
        return gulp.src(['app/*.txt', 'app/*.ico', 'app/.htaccess']).pipe(gulp.dest('dist'));
    });

    // Clean
    gulp.task('clean', function () {
        return gulp.src(['dist'], {read: false}).pipe($.clean());
    });

    // Bundle
    gulp.task('bundle', ['styles', 'scripts'], $.bundle('./app/*.html'));

    // Build
    gulp.task('build', ['html', 'bundle', 'images', 'files']);

    // Default task
    gulp.task('default', ['clean', 'templates'], function () {
        gulp.start('build');
    });

    // Connect
    gulp.task('connect', $.connect.server({
        root: ['app'],
        port: 9000,
        livereload: true,
        open: {
            browser: 'Google Chrome'
        }
    }));

    // Inject Bower components
    gulp.task('wiredep', function () {
        gulp.src('app/styles/*.less')
            .pipe(wiredep({
                directory: 'app/bower_components',
                ignorePath: 'app/bower_components/'
            }))
            .pipe(gulp.dest('app/styles'));

        gulp.src('app/*.html')
            .pipe(wiredep({
                directory: 'app/bower_components',
                ignorePath: 'app/'
            }))
            .pipe(gulp.dest('app'));
    });

    // Watch
    gulp.task('watch', ['styles', 'scripts', 'templates', 'connect'], function () {
        // Watch for changes in `app` folder
        gulp.watch([
            'app/*.html',
            'app/styles/**/*.css',
            'app/scripts/**/*.js',
            'app/images/**/*'
        ], function (event) {
            return gulp.src(event.path)
                .pipe($.connect.reload());
        });

        // Watch .less files
        gulp.watch('app/styles/**/*.less', ['styles']);

        // Watch .jade files
        gulp.watch('app/**/*.jade', ['templates']);

        // Watch .coffee files
        gulp.watch('app/scripts/**/*.coffee', ['scripts']);

        // Watch image files
        gulp.watch('app/images/**/*', ['images']);

        // Watch bower files
        gulp.watch('app/bower_components/*', ['wiredep']);
    });

}());
