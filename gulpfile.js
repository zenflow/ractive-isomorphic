var gulp = require('gulp');
var del = require('del');
var _ = require('lodash');
var package_json = require('./package.json');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('gulp-nodemon');

var browserify_transforms = ['brfs'];
var browserify_node_modules = _.keys(package_json.dependencies); // all package dependancies for now

var cleaned = false;
gulp.task('clean', function (done) {
	if (cleaned){
		done();
	} else {
		cleaned = true;
		del(['sandbox/client/build'], done);
	}
});

gulp.task('scripts:node_modules', ['clean'], function () {
	var b = browserify({debug: true});
	browserify_node_modules.forEach(function(module_name){
		b.require(module_name);
	});
	return b.bundle()
		.pipe(source('node_modules.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./sandbox/client/build/scripts'))
});
gulp.task('scripts:index', ['clean'], function () {
	var b = browserify('./sandbox/client/src/scripts/index.js', {debug: true})
		.external(browserify_node_modules)
		.transform(browserify_transforms);
	return b.bundle()
		.pipe(source('index.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./sandbox/client/build/scripts'));
});
gulp.task('scripts', ['scripts:node_modules', 'scripts:index']);

gulp.task('assets:logo', ['clean'], function() {
	return gulp.src('./logo.svg')
		.pipe(gulp.dest('./sandbox/client/build/images'));
});
gulp.task('assets:main', ['clean'], function(){
	return gulp.src('./sandbox/client/src/assets/**')
		.pipe(gulp.dest('./sandbox/client/build'));
});
gulp.task('assets', ['assets:logo', 'assets:main']);

gulp.task('build', ['scripts', 'assets']);

gulp.task('watch', ['build'], function() {
	gulp.watch(['./lib/**', './sandbox/shared/**', './sandbox/client/src/scripts/**'], ['scripts:index']);
	gulp.watch(['./sandbox/client/src/assets/**'], ['assets']);
});

gulp.task('sandbox', ['watch'], function(cb){
	nodemon({
		script: 'sandbox/server/index.js',
		ext: 'js html',
		ignore: ['sandbox/client/**', 'gulpfile.js']
	});
});

gulp.task('default', ['sandbox']);
