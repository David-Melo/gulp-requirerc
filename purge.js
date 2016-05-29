'use strict';

var store = function(fn, value){
  fn.storage = Array.isArray(fn.storage)? fn.storage : [];
  fn.storage.push(value);
  return fn.storage[fn.storage.length - 1];
};

var escapeRegExp = function(str){
  return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
};

var getContentsRegExp = function(opts){
  var start = opts.escape? escapeRegExp(opts.start) : opts.start;
  var end = opts.escape? escapeRegExp(opts.end) : opts.end;
  return new RegExp('\\s*'+ start +'(.+)'+ end);
};

var getContents = function(str, opts){
  str = str.match(getContentsRegExp(opts)) || [];
  return str[1] || '';
};

var stripUseStrict = function(str){
  return str.replace(/[^{]*(\'|\")use\sstrict(\'|\")\s*;*/g, '');
};

var stripModuleReturn = function(str){
  return store(stripModuleReturn, str);
};

var stripModuleClosure = function(str){
  return store(stripModuleClosure, str);
};

var stripModuleStatement = function(str){
  // replace(\s*define\s*\((.+)\)(;?)+, $1);
  return store(stripDefineStatement, str);
};

var replaceInstructionBlock = function(str, sub, opts){
  return store(replaceInstructionBlock, str);
};

module.exports = {
  build:function(debug, name, url, code){
    code = replaceInstructionBlock(code, '', { start:'RCExcludeStart', end:'RCExcludeEnd' });
    code = stripModuleStatement(code);
    code = stripUseStrict(code);
    code = stripModuleReturn(code);
    code = stripModuleClosure(code);
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
