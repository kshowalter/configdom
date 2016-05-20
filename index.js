/**
 * @fileOverview A view renderer based on a simple configuration object.
 * @author Keith Showalter {@link https://github.com/kshowalter}
 * @version 0.1.0
 */


/** @module SimpleDOM */
var $ = require('SimpleDOM');


/**
* mkDOM - Makes DOM Element from a ConfigDOM config object
* @function
* @param  {object} config ConfigDOM config object
* @return {element} DOM Element
*/
var mkDOM = function mkDOM(config){
  var e = $(config.tag);
  var _id = config._id || 'r';
  config.title = _id;

  for( var name in config){
    //console.log(name);
    if( name === 'text'){
      e.text(config[name]);
    } else if( name === 'children'){
      config[name].forEach(function(child,i){
        if( child !== undefined ){
          if( child.constructor === Object ){ // type = 'config';
            child._id = _id + '.' + i
            e.append( mkDOM(child) );
          } else if( child.constructor === String ){ // type = 'textNode';
            child = document.createTextNode(child);
            e.append( child );
          } else if( child.constructor.prototype === HTMLElement ) { // type = 'element';
            e.append( child );
          }
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



/**
 * ConfigDOM constructor
 * @exports test
 * @constructor ConfigDOM
 * @param  {string} id id of the parent element
 * @return {object} ConfigDOM object
 */
module.exports = function(id){
  //module.exports = function(id){ // DOM id
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
