/**
* @fileOverview A view renderer based on a simple configuration object.
* @author Keith Showalter {@link https://github.com/kshowalter}
* @version 0.1.0
*/


/** @module SimpleDOM */
var $ = require('simpledom');
var SVG_attr = require('./svg');
console.log(SVG_attr);


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
  var sdom;
  if( config.constructor === Object ){ // CONFIG
    sdom = $(config.tag, {namespaceURI: config.meta.namespaceURI});
    if( config.props ){
      for( var name in config.props ){
        sdom.attr(name, config.props[name]);
      }
    }
    if( config.text ){
      sdom.text( config.text );
    }
  } else if( config.constructor === String ){ // TEXT NODE
    sdom = document.createTextNode(config);
  } else if( config.constructor.prototype === HTMLElement || config instanceof SVGElement ) { // NODE ELEMENT
    sdom = config;
  } else {
    console.warn('node config not recognized:', config);
    sdom = undefined;
  }
  return sdom;
};

var SVGize = function(config){
  console.log('svg', config);
  config.props = config.props || {};

  if( config.tag === 'svg' ){
    config.props['xmlns'] = 'http://www.w3.org/2000/svg';
    config.props['xmlns:xlink'] = 'http://www.w3.org/1999/xlink';
  }

  config.meta = config.meta || {};
  config.meta.namespaceURI = 'http://www.w3.org/2000/svg';
  config.meta.layer_attr = config.meta.layer_attr || SVG_attr.layer_attr;
  config.meta.fonts = config.meta.fonts || SVG_attr.fonts;

  config.meta.layerName = config.meta.layerName || 'base';
  config.meta.fontName = config.meta.fontName || 'base';

  if( ! (['svg'].indexOf(config.tag)+1) ){
    var layer = config.meta.layer_attr[config.meta.layerName];
    for( var name in layer ){
      config.props[name] = layer[name];
    }
  }

  if( ['text', 'textPath', 'title', 'tref', 'tspan'].indexOf(config.tag)+1 ){
    var font = config.meta.fonts[config.meta.fontName];
    for( var name in font ){
      config.props[name] = font[name];
    }
  }

  return config;
};

//if( isSVG ){
//  props.xmlns = props.xmlns || 'http://www.w3.org/2000/svg';
//  props['xmlns:xlink'] = props['xmlns:xlink'] || 'http://www.w3.org/1999/xlink';
//}


/**
* mkDOM - Makes DOM Element from a ConfigDOM config object
* @function
* @param  {object} config ConfigDOM config object
* @return {element} DOM Element
*/
var mkDOM = function mkDOM(parentConfig, newConfig, oldConfig){
  //var _id = config._id;
  //console.log(parentConfig.sdom.elem, parentConfig.sdom.elem.namespaceURI);
  newConfig.meta = newConfig.meta || {};

  console.log(newConfig);
  if( newConfig.constructor === Object &&
      ( newConfig.tag.toLocaleLowerCase()  === 'svg' ||
        parentConfig.meta.namespaceURI === 'http://www.w3.org/2000/svg' )
    ){
    newConfig = SVGize(newConfig);
    //console.log(newConfig);
  }
  //console.log(parentConfig.sdom.elem, parentConfig.sdom.elem.namespaceURI, newConfig.meta.namespaceURI);
  //var parent_id = _id.split('.').slice(0,-1).join('.');

  //var oldNode = this.elements[_id];
  //var newNode;

  //console.log('#config ', newConfig, oldConfig);


  var sdom;
  if ( newConfig && !oldConfig ) { // NEW
    sdom = mkNode(newConfig);
    newConfig.sdom = sdom;
    parentConfig.sdom.append(sdom);
  } else if( !newConfig && oldConfig ){ // DELETE
    oldConfig.sdom.elem.parentNode.removeChild(oldConfig.sdom.elem);
  } else if( configChanged(newConfig, oldConfig) ){ // CHANGE
    sdom = mkNode(newConfig);
    newConfig.sdom = sdom;
    oldConfig.sdom.elem.parentNode.replaceChild(newConfig.sdom.elem, oldConfig.sdom.elem);
  } else if( newConfig ){ // CHECK
    console.log('SAME');
  }

  var newLength = ( newConfig && newConfig.children && newConfig.children.length ) || 0;
  var oldLength = ( oldConfig && oldConfig.children && oldConfig.children.length ) || 0;

  for (var i = 0; i < newLength || i < oldLength; i++) {
    var oldChild = oldConfig && oldConfig.children[i];
    var newChild = newConfig && newConfig.children[i];
    var config = mkDOM(newConfig, newChild, oldChild);
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
    rootSDOM: $(id),
    rootConfig: {
      sdom: $(id),
      meta: {},
    },
    load: function(newConfig){
      if( newConfig.constructor === Object ){
        //newConfig._id = 'r.0';
        this.config = mkDOM(this.rootConfig, newConfig, this.config);
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
