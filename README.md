# gulp-requirerc
> Gulp adapter for RequireJS

## Installation

```terminal
npm install --save-dev gulp-rjs
````

## Usage

```node
var requirerc = require('gulp-requirerc');
gulp.task('scripts', function(){
  gulp.src('source/scripts/*.js').pipe(requirerc({
    baseUrl:'static/scripts'
  })).pipe(gulp.dest('static/scripts'));
});
```

