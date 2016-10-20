var gulp = require('gulp');
//var sass = require('gulp-sass');
var rename = require('gulp-rename')
//var babel = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

/*'assets',
gulp.task('assets', function () {
  gulp
    .src('assets/*')
    .pipe(gulp.dest('public'))
})*/

gulp.task('scripts', function() {
  var destDir = "./dist";
  
  return browserify([
        "./app/utilidades/validArrayProtoype.js",
        "./appInforme/informeController.js",
        "./appInforme/informeMap.service.js",
        "./app/dictionaryService.js",
        "./app/utilidades/servicioUtilidades.js",
        "./app/muestrasService.js",
        "./app/poblacionService.js",
        "./app/Muestras/Services/regressionGraph.service.js",
        "./app/Muestras/Services/distributionGraph.service.js"
        
      ])
    //.transform(babel)
    .bundle()
    .pipe(source('informeBundle.js'))
    .pipe(rename('app.js'))
    .pipe(gulp.dest(destDir))
})

gulp.task('default', ['scripts']);