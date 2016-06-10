/**
* @fileOverview A view renderer based on a simple configuration object.
* @author Keith Showalter {@link https://github.com/kshowalter}
* @version 0.1.0
*/


/** @module SimpleDOM */
var $ = require('simpledom');


var configChanged = function(newConfig, oldConfig){
  if( newConfig !== oldConfig ){
    return true;
  } else if( newConfig.tag !== oldConfig.tag ){
    return true;
  } else if( newConfig.props !== oldConfig.props ){
    return true;
  } else if( newConfig.children !== oldConfig.children ){
    return true;
  } else {
    return false;
  }
};

var mkNode = function(config){
  var node;
  if( config.constructor === Object ){ // CONFIG
    node = $(config.tag);
    if( config.props ){
      for( var name in config.props ){
        node.attr(name, config.props[name]);
      }
    }
    if( config.text ){
      node.text( config.text );
    }
  } else if( config.constructor === String ){ // TEXT NODE
    node = document.createTextNode(config);
  } else if( config.constructor.prototype === HTMLElement || config instanceof SVGElement ) { // NODE ELEMENT
    node = config;
  } else {
    console.warn('node config not recognized:', config);
    node = undefined;
  }
  return node;
}


/**
* mkDOM - Makes DOM Element from a ConfigDOM config object
* @function
* @param  {object} config ConfigDOM config object
* @return {element} DOM Element
*/
var mkDOM = function mkDOM(parentNode, newConfig, oldConfig){
  //var _id = config._id;
  //var parent_id = _id.split('.').slice(0,-1).join('.');

  //var oldNode = this.elements[_id];
  //var newNode;

  console.log('#config ', newConfig, oldConfig);

  var newNode;

  if ( newConfig && !oldConfig ) { // NEW
    newNode = mkNode(newConfig);
    newConfig.node = newNode;
    parentNode.append(newNode);
  } else if( !newConfig && oldConfig ){ // DELETE
    oldConfig.node.elem.parentNode.removeChild(oldConfig.node.elem);
  } else if( configChanged(newConfig, oldConfig) ){ // CHANGE
    newNode = mkNode(newConfig);
    newConfig.node = newNode;
    oldConfig.node.elem.parentNode.replaceChild(newConfig.node.elem, oldConfig.node.elem);
  } else if( newConfig ){ // CHECK
    console.log('SAME');
  }


  var newLength = ( newConfig && newConfig.children && newConfig.children.length ) || 0;
  var oldLength = ( oldConfig && oldConfig.children && oldConfig.children.length ) || 0;

  for (var i = 0; i < newLength || i < oldLength; i++) {
    var oldChild = oldConfig && oldConfig.children[i];
    var newChild = newConfig && newConfig.children[i];
    var config = mkDOM(newNode, newChild, oldChild);
    newConfig.children[i] = config;
  }

  return newConfig;
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
    config: undefined,
    //elements: {
    //  'r': $(id)
    //},
    rootNode: $(id),
    //mkDOM: mkDOM,
    load: function(newConfig){
      if( newConfig.constructor === Object ){
        //newConfig._id = 'r.0';
        this.config = mkDOM(this.rootNode, newConfig, this.config);
      } else if(newConfig.constructor === Array ){
        for( var i = 0; i < newConfig.length; i++ ){
          //newConfig[i]._id = 'r.'+i;
          this.mkDOM(newConfig[i], this.config);
        }
      } else {
        console.log('Invalid DOM config.');
      }
    }
  };


  return C;
};
