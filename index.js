'use strict';

var purge = require('./purge');

// File I/O is provided by simple wrappers around standard POSIX functions.
// @see https://nodejs.org/api/fs.html
var fs = require('fs-extra');

// This module contains utilities for handling and transforming file paths.
// @see https://nodejs.org/api/path.html
var path = require('path');

// Utility functions for gulp plugins.
// @see https://www.npmjs.com/package/gulp-util
var vinyl = require('vinyl');
var err = require('plugin-error');

// Construct pipes of streams of events.
// @see https://www.npmjs.com/package/through2
var through = require('through2');

// Node adapter for RequireJS, for loading AMD modules. Includes RequireJS optimizer.
// @see https://www.npmjs.com/package/requirejs
var requirejs = require('requirejs');

// Computer protocol command that does nothing
var noop = Function.prototype;

// The PluginError object represents an error when a value is not of the expected type.
// @see https://www.npmjs.com/package/gulp-util#new-pluginerrorpluginname-message-options
function createError(message) {
  return new err('gulp-requirerc', message, { showStack: true });
}

// Method that creates a virtual file format.
// @see https://www.npmjs.com/package/gulp-util#new-fileobj
function createFile(filename, output, buildResponse, sourceMap) {
  var newFile = new vinyl({ path: filename, contents: new Buffer(output) });
  newFile.buildResponse = buildResponse.replace('FUNCTION', filename);
  if (sourceMap) newFile.sourceMap = JSON.parse(sourceMap);
  return newFile;
}

// All configuration options.
// @see https://github.com/requirejs/r.js/blob/master/build/example.build.js
function config(file, settings) {
  var opts = Object.assign({}, settings);
  var extension = path.extname(file.path);
  var name = path.basename(file.path, extension);
  var directory = path.dirname(file.path, extension);
  var optimize = /^(undefined|null|none)$/.test(opts.optimize) ? 'none' : opts.optimize;
  var suffix = typeof opts.outSuffix === 'string' ? opts.outSuffix : '.bundle';
  var fileExclusionRegExp = new RegExp(purge.escapeRegExp(suffix) + purge.escapeRegExp(extension) +'$');
  var baseUrl = typeof opts.baseUrl === 'string' ? opts.baseUrl : path.relative('.', directory);
  var outDir = typeof opts.outDir === 'string' ? opts.outDir : baseUrl;
  var out = typeof opts.out === 'string' ? opts.out : path.join(outDir, name + suffix + extension);
  var onBundle = typeof opts.onModuleBundleComplete === 'function' ? opts.onModuleBundleComplete : noop;
  var onWrite = typeof opts.onBuildWrite === 'function' ? opts.onBuildWrite : null;
  var preview = !!opts.preview;
  opts.optimize = optimize;
  opts.name = typeof opts.name === 'string' ? opts.name : name;
  opts.baseUrl = baseUrl;
  opts.mainConfigFile = typeof opts.mainConfigFile === 'string' ? opts.mainConfigFile : path.join(baseUrl, name + extension);
  opts.fileExclusionRegExp = typeof opts.fileExclusionRegExp === 'regexp' ? opts.fileExclusionRegExp : fileExclusionRegExp;
  opts.out = out;
  if (Array.isArray(opts.include) && opts.include.length) {
    opts.include.push(opts.name);
  }
  opts.onBuildWrite = function onBuildWrite(name, path, contents) {
    if (onWrite) contents = onWrite(name, path, contents);
    return opts.purge ? purge.build(preview, name, path, contents) : contents;
  };
  opts.onModuleBundleComplete = function onModuleBundleComplete(outputFile) {
    return opts.purge ? purge.bundle(fs, outputFile) : onBundle(outputFile);
  };
  return opts;
}

// Method that helps to assemble the call and parameters for debugging.
function cmd(call, opts) {
  call = [call];
  for (var key in opts) {
    if (opts.hasOwnProperty(key)) {
      call.push([key,'=', JSON.stringify(opts[key])].join(''));
    }
  }
  return call.join(' ');
}

// Documentation from RequireJS in node.
// @see http://requirejs.org/docs/node.html
function exec(opts, done) {
  var filename = opts.out;
  var output = null;
  var sourceMapOutput = null;
  opts.out = function out(text, sourceMapText) {
    output = text;
    sourceMapOutput = sourceMapText;
  };
  requirerc.compiler.optimize(opts, function onOptimizeResolve(buildResponse) {
    var file = createFile(filename, output, buildResponse, sourceMapOutput);
    done(null, file, opts);
  }, done);
}

// File I/O is provided by simple wrappers around standard POSIX functions.
// @see https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
// @see https://nodejs.org/api/fs.html#fs_class_fs_writestream
function writeStream(opts, file, callback) {
  exec(opts, function onExec(err, outputFile) {
    if (err) callback(createError(err));
    if (opts.preview) console.log(cmd('node r.js -o', opts));
    fs.ensureDirSync(path.join(outputFile.cwd, path.dirname(outputFile.path)));
    var stream = fs.createWriteStream(outputFile.path);
    stream.write(outputFile.contents);
    callback(null, outputFile);
  });
}

// Gulp adapter for RequireJS.
// @see https://www.npmjs.com/package/requirejs
// @see https://www.npmjs.com/package/gulp-requirerc
function requirerc(settings) {
  return through.obj(function onTransform(file, encoding, done) {
    var opts = config(file, settings);
    if (typeof opts.out !== 'string') {
      return done(createError('If `out` is supplied, it must be a string'));
    }
    if (file.isNull()) {
      return done(null, file);
    }
    if (file.isStream()) {
      return done(createError('Streaming not supported'));
    }
    if (typeof opts !== 'object') {
      return done(createError('Options function must produce an options object'));
    }
    writeStream(opts, file, encoding, done);
  });
}

// Externalize dependencies.
requirerc.util = {
  purge: purge,
  fs: fs,
  path: path,
  through: through,
  noop: noop
};

// Log errors nicely.
requirerc.logError = function logError(error) {
  var message = createError(error.messageFormatted).toString();
  process.stderr.write(message + '\n');
  this.emit('end');
};

// Store compiler in a prop.
requirerc.compiler = requirejs;

// Externalize `gulp-requirerc` module.
module.exports = requirerc;
