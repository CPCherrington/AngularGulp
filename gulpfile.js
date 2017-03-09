var gulp      	  = require('gulp')
var concat    	  = require('gulp-concat')
var order     	  = require('gulp-order')
var annotate  	  = require('gulp-ng-annotate')
var uglify    	  = require('gulp-uglify')
var minify 		  = require('gulp-clean-css')
var autoprefix 	  = require('gulp-autoprefixer')
var rename 		  = require('gulp-rename')
var stylus 		  = require('gulp-stylus')
var sass 		  = require('gulp-sass')
var plumber 	  = require('gulp-plumber')
var notify 		  = require('gulp-notify')
var gulpif 		  = require('gulp-if')
var addsrc        = require('gulp-add-src')
var templateCache = require('gulp-angular-templatecache')
var path 		  = require('path')


var paths = {
	angular: {
		files: ['public/angular/*.js', 'public/angular/**/*.js'],
		views: ['public/angular/*.html', 'public/angular/**/*.html'],
		main: 'public/angular.js'
	},
	css: {
		files: 'resources/assets/stylus/*.styl',
		main: 'resources/assets/stylus/style.styl'
	},
	output: 'public/dist/'
}

var plumberOpts = {
	errorHandler: notify.onError("Error: <%= error.message %>")
}

gulp.task('angular', function() {

	var stream = gulp.src(paths.angular.views)
		.pipe(plumber(plumberOpts))
		.pipe(templateCache('views.js', {module: 'app.views'}))
		.pipe(addsrc(paths.angular.files)) // load all js files
		.pipe(order([paths.angular.main]))     // put app.js first
		.pipe(annotate())                      // let angular code survive minification
		.pipe(uglify())                        // minify the js code
		.pipe(concat('app.min.js'))            // jam all the code together into one file
		.pipe(gulp.dest(paths.output))         // save the file to the dist folder

	return stream
})

gulp.task('css', function() {
	var stream = gulp.src(paths.css.main)
		.pipe(plumber(plumberOpts))
		.pipe(gulpif(path.extname(paths.css.main) == '.styl', stylus()))
		.pipe(gulpif(path.extname(paths.css.main) == '.scss', sass()))
		.pipe(autoprefix())
		.pipe(gulp.dest(paths.output))
		.pipe(minify())
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest(paths.output))
		
	return stream
})

gulp.task('watch', ['angular', 'css'], function() {
	gulp.watch([paths.angular.files, paths.angular.views], ['angular'])
	gulp.watch(paths.css.files, ['css'])
})

gulp.task('default', ['angular', 'css'])