'use strict';

// File I/O is provided by simple wrappers around standard POSIX functions.
// @see https://nodejs.org/api/fs.html
var fs = require('fs');

// This module contains utilities for handling and transforming file paths.
// @see https://nodejs.org/api/path.html
var path = require('path');

// Construct pipes of streams of events.
// @see https://www.npmjs.com/package/event-stream
var eventStream = require('event-stream');

// Node adapter for RequireJS, for loading AMD modules. Includes RequireJS optimizer.
// @see https://www.npmjs.com/package/requirejs
var requirejs = require('requirejs');

// Method that helps to assemble the call and parameters for debugging.
function cmd(call, options){
  call = [call];
  for(var key in options){
    if(options.hasOwnProperty(key)){
      call.push([key,'=', JSON.stringify(options[key])].join(''));
    }
  }
  return call.join(' ');
}

// Documentation from RequireJS in node.
// @see http://requirejs.org/docs/node.html
function exec(options, file, callback){
  var name = path.basename(file.path).replace(path.extname(file.path), '');
  var outPath = path.join(options.baseUrl, name + '.js');
  options = Object.assign({ name:name, out:outPath }, options);
  options.preview && console.log(cmd('node r.js -o', options));
  requirejs.optimize(options);
}

// File I/O is provided by simple wrappers around standard POSIX functions.
// @see https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
// @see https://nodejs.org/api/fs.html#fs_class_fs_writestream
function writeStream(options, file, callback){
  var dest = path.join(file.cwd, options.baseUrl, path.basename(file.path));
  var stream = fs.createWriteStream(dest, { flags:'w' });
  stream.write(file.contents, '', exec.bind(this, options, file, callback));
}

// All configuration options.
// @see https://github.com/requirejs/r.js/blob/master/build/example.build.js
module.exports = function(options){
  return eventStream.mapSync(writeStream.bind(this, options));
};
