var $ = require('SimpleDOM');

var mkDOM = function mkDOM(config, dispatch){
  var e = $(config.tag);
  var _id = config._id || 'r';
  config.title = _id;

  for( var name in config){
    //console.log(name);
    if( name === 'text'){
      e.text(config[name]);
    } else if( name === 'children'){
      config[name].forEach(function(child,i){
        if( child.constructor === Object ){ // type = 'config';
          child._id = _id + '.' + i
          e.append( mkDOM(child, dispatch) );
        } else if( child.constructor === String ){ // type = 'textNode';
          child = document.createTextNode(child);
          e.append( child );
        } else if( child.constructor.prototype === HTMLElement ) { // type = 'element';
          e.append( child );
        }
      });
    } else if( name === 'append'){
      config[name].forEach(function(elem){
        e.append( elem );
      });
    } else if( name === 'textNode'){
      e.append( config[name] );
    } else {
      e.attr(name, config[name]);
    }
  }

  return e;
};

module.exports = function(id){ // DOM id
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
