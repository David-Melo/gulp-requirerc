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
function cmd(call, opts){
  call = [call];
  for(var key in opts){
    if(opts.hasOwnProperty(key)){
      call.push([key,'=', JSON.stringify(opts[key])].join(''));
    }
  }
  return call.join(' ');
}

// Documentation from RequireJS in node.
// @see http://requirejs.org/docs/node.html
function exec(opts, file, callback){
  var optimize = !/undefined|none/.test(String(opts.optimize));
  var extension = path.extname(file.path);
  var name = path.basename(file.path, extension);
  var directory = path.dirname(file.path, extension);
  var bundleType = optimize? '.min' : '.bundle';
  var fileExclusionRegExp = new RegExp('(\\'+ bundleType +'\\'+ extension +')$');
  var baseUrl = path.relative('./', directory);
  var mainConfigFile = path.join(baseUrl, name + extension);
  var out = path.join(baseUrl, name + bundleType + extension);
  if(fileExclusionRegExp.test(file.path)) return void(0);
  opts = Object.assign({
    out:out,
    name:name,
    baseUrl:baseUrl,
    mainConfigFile:mainConfigFile,
    fileExclusionRegExp:fileExclusionRegExp
  }, opts);
  Array.isArray(opts.include) && opts.include.length && opts.include.push(name);
  opts.preview && console.log(cmd('node r.js -o', opts));
  requirejs.optimize(opts);
}

// File I/O is provided by simple wrappers around standard POSIX functions.
// @see https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
// @see https://nodejs.org/api/fs.html#fs_class_fs_writestream
function writeStream(opts, file, callback){
  var dest = path.join(file.cwd, opts.baseUrl, path.basename(file.path));
  var stream = fs.createWriteStream(dest, { flags:'w' });
  stream.write(file.contents, '', exec.bind(this, opts, file, callback));
}

// All configuration options.
// @see https://github.com/requirejs/r.js/blob/master/build/example.build.js
function requirerc(opts){
  opts = Object.assign({}, opts);
  opts.baseUrl = opts.baseUrl || './';
  return eventStream.mapSync(writeStream.bind(this, opts));
}

// Externalize dependencies.
requirerc.utils = {
  fs:fs,
  path:path,
  eventStream:eventStream,
  requirejs:requirejs
};

// Externalize `gulp-requirerc` module.
module.exports = requirerc;
