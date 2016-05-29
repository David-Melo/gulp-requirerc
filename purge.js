'use strict';

var store = function(fn, value){
  fn.storage = Array.isArray(fn.storage)? fn.storage : [];
  fn.storage.push(value);
  return fn.storage[fn.storage.length - 1];
};

var stripUseStrict = function(str){
  str = str.replace(/[^{]*(\'|\")use\sstrict(\'|\")\s*;*/g, '');
  return store(stripUseStrict, str);
};

var stripModuleReturn = function(str){
  return store(stripModuleReturn, str);
};

var stripModuleClosure = function(str){
  return store(stripModuleClosure, str);
};

var stripModuleStatement = function(str){
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
