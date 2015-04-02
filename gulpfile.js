var gulp = require('gulp');
var del = require('del');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('gulp-nodemon');

var browserify_transforms = [
	'brfs'
];
var browserify_node_modules = [
	'lodash',
	'ractive',
	'es6-promise',
	'obs-router',
	'waitr'
];

var cleaned = false;
gulp.task('clean', function (done) {
	if (cleaned){
		done();
	} else {
		cleaned = true;
		del(['test/client/build'], done);
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
		.pipe(gulp.dest('./test/client/build/scripts'))
});

gulp.task('scripts:index', ['clean'], function () {
	var b = browserify('./test/client/src/scripts/index.js', {debug: true})
		.external(browserify_node_modules)
		.transform(browserify_transforms);
	return b.bundle()
		.pipe(source('index.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./test/client/build/scripts'));
});

gulp.task('scripts', ['scripts:node_modules', 'scripts:index']);

gulp.task('assets', ['clean'], function(){
	return gulp.src('./test/client/src/assets/**')
		.pipe(gulp.dest('./test/client/build'));
});
gulp.task('build', ['scripts', 'assets']);

gulp.task('watch', ['build'], function() {
	gulp.watch(['./lib/**', './test/client/src/scripts/**'], ['scripts:index']);
});

gulp.task('serve', ['watch'], function(cb){
	nodemon({
		script: 'test/server/index.js',
		ext: 'js html',
		ignore: ['test/client/**', 'gulpfile.js']
	});
});

gulp.task('default', ['serve']);
