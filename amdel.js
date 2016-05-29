'use strict';

module.exports = {
  modules:[],
  build:function(name, path, contents){
    this.modules.push({ name:name, path:path, contents:contents });
    return contents;
  },
  bundle:function(file){
    this.modules = [];
    return file;
  }
};
