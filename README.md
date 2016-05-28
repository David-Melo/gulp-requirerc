# gulp-requirerc
> Gulp adapter for RequireJS

[![dependencies status][david_dependencies_status_image]][david_dependencies_status_url] 
[![devDependency status][david_devdependencies_status_image]][david_devdependencies_status_url]

<!-- david dependencies -->
[david_dependencies_status_image]: https://david-dm.org/adriancmiranda/gulp-requirerc.png?theme=shields.io
[david_dependencies_status_url]: https://david-dm.org/adriancmiranda/gulp-requirerc "dependencies status"

<!-- david devDependencies -->
[david_devdependencies_status_image]: https://david-dm.org/adriancmiranda/gulp-requirerc/dev-status.png?theme=shields.io
[david_devdependencies_status_url]: https://david-dm.org/adriancmiranda/gulp-requirerc#info=devDependencies "devDependencies status"

<!-- sourcegraph - views -->
[sourcegraph_views_image]: https://sourcegraph.com/api/repos/github.com/adriancmiranda/gulp-requirerc/counters/views.png
[sourcegraph_views_url]: https://sourcegraph.com/github.com/adriancmiranda/gulp-requirerc "views"


## Installation

from [github](https://github.com/adriancmiranda/gulp-requirerc "Github"):

```terminal
npm i -D adriancmiranda/gulp-requirerc
````

from [npmjs](https://www.npmjs.com/package/gulp-requirerc "NPM"):

```terminal
npm i -D gulp-requirerc
````

## Usage

```javascript
// Gulp adapter for RequireJS
// @see https://github.com/adriancmiranda/gulp-requirerc
var requirerc = require('gulp-requirerc');

// All configuration options.
// @see https://github.com/requirejs/r.js/blob/master/build/example.build.js
gulp.task('scripts', function(){
  return gulp.src('source/scripts/*.js').pipe(requirerc({
    baseUrl:'static/scripts',
    uglify2:{ warnings:true },
    optimize:'uglify2',
    generateSourceMaps:true,
    preview:true, // extra option
    outDir:'bundle', // extra option
    outSuffix:'.min' // extra option
  }));
});
```

### Options
Type: `Object`

#### options.preview
Type: `Boolean`
Default: `true`

#### options.outDir
Type: `string`
Default: `''`

#### options.suffix
Type: `string`
Default: `'.bundle'`


## License
[MIT](https://github.com/adriancmiranda/gulp-requirerc/blob/master/LICENSE "MIT LICENSE")
