'use strict';

module.exports = {
  build:function(debug, name, url, code){
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
