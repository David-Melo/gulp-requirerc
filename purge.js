'use strict';

var stripUseStrict = function(str){
  return str.replace(/[^{]*(\'|\")use\sstrict(\'|\")\s*;*/g, '');
};

var stripModuleReturn = function(str){
  return str;
};

var stripModuleClosure = function(str){
  return str;
};

var stripDefineStatement = function(str){
  return str;
};

var replaceInstructionBlock = function(str, sub, opts){
  return str;
};

module.exports = {
  build:function(debug, name, url, code){
    code = replaceInstructionBlock(code, '', { start:'RCExcludeStart', end:'RCExcludeEnd' });
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
