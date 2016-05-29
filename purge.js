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

var getDefineMatch = function(str){
  return getMatch(str, {
    start:'define\\s*\\(\\s*[^{]*?\\{',
    end:'\\}\\s*\\)\\s*;?',
    flags:'g'
  });
};

var getDefineStatement = function(str){
  return getStatement(str, {
    start:'define\\s*\\(\\s*[^{]*?\\{',
    end:'\\}\\s*\\)\\s*;?',
    flags:'g'
  });
};

var getDefineContent = function(str){
  return getContent(str, {
    start:'define\\s*\\(\\s*[^{]*?\\{',
    end:'\\}\\s*\\)\\s*;?',
    flags:'g'
  });
};

var getDefineClosure = function(str){
  return getClosure(str, {
    start:'define\\s*\\(\\s*[^{]*?\\{',
    end:'\\}\\s*\\)\\s*;?',
    flags:'g'
  });
};

var stripUseStrict = function(str){
  return str.replace(/[^{]*(\'|\")use\sstrict(\'|\")\s*;*/gi, '');
};

var stripModuleReturn = function(str){
  return store(stripModuleReturn, str);
};

var stripModuleClosure = function(str){
  return store(stripModuleClosure, str);
};

var stripModuleStatement = function(str){
  // str = str.replace((define\s*\()((?:.|\n)*)(\)\s*;?), '$2');
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
