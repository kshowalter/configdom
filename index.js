/**
* @fileOverview A view renderer based on a simple configuration object.
* @author Keith Showalter {@link https://github.com/kshowalter}
* @version 0.1.0
*/


/** @module SimpleDOM */
var $ = require('simpledom');


/**
* mkDOM - Makes DOM Element from a ConfigDOM config object
* @function
* @param  {object} config ConfigDOM config object
* @return {element} DOM Element
*/
var mkDOM = function(config, oldConfig){
  var _id = config._id;
  var parent_id = _id.split('.').slice(0,-1).join('.');

  var dirty = false;
  var dirtyChildren = false;
  if( config !== oldConfig ){
    dirty = true;
    if( config['children'] ){
      dirtyChildren = true;
    }
  } else {
    for( var name in config ){
      if( config[name] !== oldConfig[name] ){
        if( name === 'children' ){
          dirtyChildren = true;
        } else {
          dirty = true;
        }
      }
    }
    if( config['children'] && config['children'].length !== oldConfig['children'].length ){
      dirtyChildren = true;
    }
  }

  if( dirty ){
    var e = $(config.tag);
    var oldE = this.elements[_id];
    if( ! oldE ){
      this.elements[parent_id].append( e );
    } else {
      oldE.elem.parentNode.replaceChild(e.elem, oldE.elem);
    }
    this.elements[_id] = e;
    for( var name in config ){
      if( name === 'children'){
        continue;
      } else if( name === 'text'){
        e.text(config[name]);
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

  }

  if( dirtyChildren ){
    var e = this.elements[_id];
    e.clear();

    config['children'].forEach(function(child,i){
      if( child !== undefined ){
        if( child.constructor === Object ){
          child._id = _id + '.' + i;

          e.append( this.mkDOM(child, {} ));
        } else if( child.constructor === String ){
          child = document.createTextNode(child);
          e.append( child );
        } else if( child.constructor.prototype === HTMLElement || child.constructor.prototype === SVGGraphicsElement ) {
          console.log('raw element', child);
          e.append( child );
        }
      }
    }, this);

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
    config: {},
    elements: {
      'r': $(id)
    },
    mkDOM: mkDOM,
    load: function(newConfig){
      if( newConfig.constructor === Object ){
        newConfig._id = 'r.0';
        this.mkDOM(newConfig, this.config);
      } else if(newConfig.constructor === Array ){
        for( var i = 0; i < newConfig.length; i++ ){
          newConfig[i]._id = 'r.'+i;
          this.mkDOM(newConfig[i], this.config);
        }
      } else {
        console.log('Invalid DOM config.');
      }
    }
  };


  return C;
};
