var $ = require('SimpleDOM');

var mkDOM = function mkDOM(config, dispatch){
  var e = $(config.type);
  var _id = config._id || 'r';
  config.title = _id;

  for( var name in config){
    //console.log(name);
    if( name === 'text'){
      e.html(config[name]);
    } else if( name === 'children'){
      config[name].forEach(function(childConfig,i){
        childConfig._id = _id + '.' + i
        e.append( mkDOM(childConfig) );
      });
    } else if( name === 'append'){
      config[name].forEach(function(elem){
        e.append( elem );
      });
    } else {
      e.attr(name, config[name]);
    }
  }

  return e;
};

module.exports = function(id){
  var C = {
    anchorID: id,
    dom: $(id),
    load: function(config){
      this.dom.clear();
      this.dom.append( mkDOM(config) );
    }
  }

  return C;
}
