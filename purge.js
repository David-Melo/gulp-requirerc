'use strict';

var store = function(fn, value){
  fn.storage = Array.isArray(fn.storage)? fn.storage : [];
  fn.storage.push(value);
  return fn.storage[fn.storage.length - 1];
};

var escapeRegExp = function(str){
  return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
};

var contentsRegExp = function(opts){
  var start = opts.escape? escapeRegExp(opts.start) : opts.start;
  var end = opts.escape? escapeRegExp(opts.end) : opts.end;
  var expression = '('+ start +')((?:.|\\n)*)('+ end +')';
  return new RegExp(expression, opts.flags);
};

var execContents = function(str, opts){
  var re = contentsRegExp(opts);
  return re.exec(str) || [];
};

var getMatch = function(str, opts){
  return execContents(str, opts)[0] || '';
};

var getStatement = function(str, opts){
  return execContents(str, opts)[1] || '';
};

var getContents = function(str, opts){
  return execContents(str, opts)[2] || '';
};

var getClosure = function(str, opts){
  return execContents(str, opts)[3] || '';
};

var findRequireMethodBlock = function(fn, str, opts){
  return fn(str, Object.assign({
    start:'require\\s*\\(\\s*[^{]*?\\{',
    end:'\\}\\s*\\)\\s*;?',
    flags:'g'
  }, opts));
};

var findDefineMethodBlock = function(fn, str, opts){
  return fn(str, Object.assign({
    start:'define\\s*\\(\\s*[^{]*?\\{',
    end:'\\}\\s*\\)\\s*;?',
    flags:'g'
  }, opts));
};

var getDefineMatch = function(str){
  return findDefineMethodBlock(getMatch, str);
};

var getDefineStatement = function(str){
  return findDefineMethodBlock(getStatement, str);
};

var getDefineContent = function(str){
  return findDefineMethodBlock(getContent, str);
};

var getDefineClosure = function(str){
  return findDefineMethodBlock(getClosure, str);
};

var replaceUseStrict = function(str, sub){
  return str.replace(/[^{]*(\'|\")use\sstrict(\'|\")\s*;*/gi, sub);
};

var replaceInstructionBlock = function(str, sub, opts){
  return store(replaceInstructionBlock, str);
};

module.exports = {
  build:function(debug, name, url, code){
    code = replaceInstructionBlock(code, '', { start:'RCExcludeStart', end:'RCExcludeEnd' });
    code = replaceUseStrict(code, '');
    return code;
  },

  readFile:function(fs, filepath){
    return fs.readFileSync(filepath, { encoding:'utf8' });
  },

  bundle:function(fs, file){
    var filepath = file.path;
    file = this.readFile(fs, filepath);
    fs.writeFileSync(filepath, file);
    return file;
  }
};
