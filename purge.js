'use strict';

// Rule to escape RegExp special characters
var reEscapeRegExp = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;

// Escape RegExp special characters
var escapeRegExp = function(str) {
  return str.replace(reEscapeRegExp, '\\$&');
};

var store = function(fn, value) {
  fn.storage = Array.isArray(fn.storage) ? fn.storage : [];
  fn.storage.push(value);
  return fn.storage[fn.storage.length - 1];
};

var contentsRegExp = function(opts) {
  var start = opts.escape ? escapeRegExp(opts.start) : opts.start;
  var contents = opts.escape ? escapeRegExp(opts.contents) : opts.contents;
  var end = opts.escape ? escapeRegExp(opts.end) : opts.end;
  var expression = '('+ start +')('+ contents +')('+ end +')';
  return new RegExp(expression, opts.flags);
};

var blockContentsRegExp = function(opts) {
  opts.contents = '(?:.|\\n)*';
  return contentsRegExp(opts);
};

var execBlockContents = function(str, opts) {
  var re = blockContentsRegExp(opts);
  return re.exec(str) || [];
};

var getBlockMatch = function(str, opts) {
  return execBlockContents(str, opts)[0] || '';
};

var getBlockStatement = function(str, opts) {
  return execBlockContents(str, opts)[1] || '';
};

var getBlockContents = function(str, opts) {
  return execBlockContents(str, opts)[2] || '';
};

var getBlockClosure = function(str, opts) {
  return execBlockContents(str, opts)[3] || '';
};

var findRequireMethodBlock = function(fn, str, opts) {
  return fn(str, Object.assign({
    start: 'require\\s*\\(\\s*[^{]*?\\{',
    end: '\\}\\s*\\)\\s*;?',
    flags: 'g'
  }, opts));
};

var getRequireMatch = function(str) {
  return findRequireMethodBlock(getBlockMatch, str);
};

var getRequireStatement = function(str) {
  return findRequireMethodBlock(getBlockStatement, str);
};

var getRequireContents = function(str) {
  return findRequireMethodBlock(getBlockContents, str);
};

var getRequireClosure = function(str) {
  return findRequireMethodBlock(getBlockClosure, str);
};

var findDefineMethodBlock = function(fn, str, opts) {
  return fn(str, Object.assign({
    start: 'define\\s*\\(\\s*[^{]*?\\{',
    end: '\\}\\s*\\)\\s*;?',
    flags: 'g'
  }, opts));
};

var getDefineMatch = function(str) {
  return findDefineMethodBlock(getBlockMatch, str);
};

var getDefineStatement = function(str) {
  return findDefineMethodBlock(getBlockStatement, str);
};

var getDefineContents = function(str) {
  return findDefineMethodBlock(getBlockContents, str);
};

var getDefineClosure = function(str) {
  return findDefineMethodBlock(getBlockClosure, str);
};

var replaceUseStrict = function(str, sub) {
  return str.replace(/[^{]*(\'|\")use\sstrict(\'|\")\s*;*/gi, sub);
};

var stripBlockReturns = function(str) {
  return str;
};

var replaceInstructionBlock = function(str, sub, opts) {
  store(replaceInstructionBlock, { str: str, sub: sub, opts: opts });
  return str;
};

module.exports = {
  escapeRegExp: escapeRegExp,
  
  build: function(debug, name, url, code) {
    store(this.build, { debug: debug, name: name, url: url, code: code });
    code = replaceInstructionBlock(code, '', { start: 'RCExcludeStart', end: 'RCExcludeEnd' });
    code = replaceUseStrict(code, '');
    code = stripBlockReturns(code);
    // code = getDefineContents(code);
    return code;
  },

  bundle: function(fs, file) {
    var filepath = file.path;
    file = fs.readFileSync(filepath, { encoding: 'utf8' });
    fs.writeFileSync(filepath, file);
    return file;
  }
};
