'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var urlAdjuster = require('gulp-css-url-adjuster');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var webpack = require('webpack-stream');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var bs = require('browser-sync').create();

// ######
// STYLES
// ######

gulp.task('styles', function() {
	return gulp.src('src/style.less')
		.pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'styles',
                    message: err.message
                };
            })
        }))
        .pipe(sourcemaps.init())
		.pipe(less())
		.pipe(autoprefixer({
			browsers: [
				'last 2 version',
				'> 5%',
				'ie > 8'
			]
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('assets'));
});

// #######
// SCRIPTS
// #######

gulp.task('scripts', function() {
	return gulp.src('src/scripts/demo.js')
		.pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'scripts',
                    message: err.message
                };
            })
        }))
		.pipe(webpack({
			module: {
				loaders: [
					{test: /\.js$/, loader: 'babel'}
				]
			},
			devtool: 'inline-source-map'
		}))
		.pipe(rename('script.js'))
		.pipe(gulp.dest('assets'));
});

// gulp.task('scripts', function() {
// 	return gulp.src([
// 		'src/scripts/Payment.util.js',
// 		'src/scripts/Payment.Emitter.js',
// 		'src/scripts/Payment.Observable.js',
// 		'src/scripts/Payment.SmartForm.js',
// 		'src/scripts/Payment.SmartForm.Behavior.js',
// 		'src/scripts/Payment.SmartForm.MaskedBehavior.js',
// 		'src/scripts/Payment.SmartForm.NumberBehavior.js',
// 		'src/scripts/demo.js'
// 	])
// 		.pipe(sourcemaps.init())
// 		.pipe(concat('script.js'))
// 		.pipe(sourcemaps.write())
// 		.pipe(gulp.dest('assets'));
// });

// ###########
// DEVELOPMENT
// ###########

gulp.task('watch', function() {
	gulp.watch(['src/style.less', 'src/style/*.less'], gulp.series('styles'));
	gulp.watch('src/scripts/**/*.js', gulp.series('scripts'));
});

gulp.task('browsersync', function() {
	bs.init({
		server: {
			baseDir: '.'
		}
	});

	gulp.watch('assets/*.js').on('change', bs.reload);
	gulp.watch('assets/*.css').on('change', bs.reload);
	gulp.watch('index.html').on('change', bs.reload);
});

// ############
// USEFUL TASKS
// ############

gulp.task('default', gulp.parallel('styles', 'scripts'));

gulp.task('dev', gulp.series(
	'default',
	gulp.parallel('watch', 'browsersync')
));
