# gulp-requirerc
> Gulp adapter for RequireJS

## Installation

```terminal
npm install --save-dev adriancmiranda/gulp-requirerc
````

## Usage

```node
// Gulp adapter for RequireJS
// @see https://github.com/adriancmiranda/gulp-requirerc
var requirerc = require('gulp-requirerc');

gulp.task('scripts', function(){
  return gulp.src('source/scripts/*.js').pipe(requirerc({
    baseUrl:'static/scripts',
    uglify2:{ warnings:true },
    optimize:'uglify2',
    generateSourceMaps:true,
    preview:true,
    suffix:'.bundle'
  })).pipe(gulp.dest('static/scripts'));
});
```

## Dependencies

* [event-stream](https://www.npmjs.com/package/event-stream)
* [requirejs](https://www.npmjs.com/package/requirejs)

