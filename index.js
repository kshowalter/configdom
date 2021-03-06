/**
* @fileOverview A view renderer based on a simple configuration object.
* @author Keith Showalter {@link https://github.com/mechkit}
* @version 0.2.0
*/


/** @module SimpleDOM */
var $ = require('simpledom');


var configChanged = function(newSpecs, oldSpecs){
  if( newSpecs !== oldSpecs ){
    return true;
  } else if( newSpecs.tag !== oldSpecs.tag ){
    return true;
  } else if( newSpecs.props !== oldSpecs.props ){
    return true;
  } else if( newSpecs.children !== oldSpecs.children ){
    return true;
  } else {
    return false;
  }
};

var mkNode = function(specs){
  var sdom;

  if( specs.tag === 'elem' ) { // NODE ELEMENT
    sdom = $(specs.elem);
  } else if( specs.constructor === Object ){ // CONFIG
    specs.meta = specs.meta || {};
    sdom = $(specs.tag, {
      namespaceURI: specs.meta.namespaceURI,
      textNode: specs.tag === 'textNode',
      text: specs.text
    });
    if( specs.props ){
      for( var name in specs.props ){
        sdom.attr(name, specs.props[name]);
      }
    }
    if( specs.text ){
      sdom.text( specs.text );
    }
  } else if( specs.constructor.prototype === HTMLElement || specs instanceof SVGElement ) { // NODE ELEMENT
    sdom = $(specs);
  } else {
    console.warn('node specs not recognized:', specs);
    //sdom = document.createTextNode(specs);
    sdom = undefined;
  }
  return sdom;
};




/**
* mkDOM - Makes DOM Element from a ConfigDOM specs object
* @function
* @param  {object} specs ConfigDOM specs object
* @return {element} DOM Element
*/
var mkDOM = function mkDOM(newParentSpecs, newSpecs, oldParentSpecs, oldSpecs){

  if(newSpecs){
    if( newSpecs.constructor === Number ){
      newSpecs = newSpecs.toString();
    }
    if( newSpecs.constructor === String ){
      //sdom = document.createTextNode(specs);
      newSpecs = {
        tag: 'textNode',
        text: newSpecs
      };
    }
    if( newSpecs.constructor.prototype === HTMLElement || newSpecs instanceof SVGElement ) { // NODE ELEMENT
      newSpecs = {
        tag: 'elem',
        elem: newSpecs
      };
    }
  }
  var sdom;
  if( newSpecs && !oldSpecs ) { // NEW
    sdom = mkNode(newSpecs);
    newParentSpecs.sdom.append(sdom);
  } else if( !newSpecs && oldSpecs ){ // DELETE
    oldParentSpecs.sdom.elem.removeChild(oldSpecs.sdom.elem);
  } else if( newSpecs && configChanged(newSpecs, oldSpecs) ){ // CHANGE
    oldParentSpecs.sdom.elem.removeChild(oldSpecs.sdom.elem);
    sdom = mkNode(newSpecs);
    newParentSpecs.sdom.append(sdom);
  } else if( newSpecs ){ // CHECK
    //console.log('SAME');
  }

  if( newSpecs && newSpecs.constructor === Object ){
    newSpecs.children = newSpecs.children || {};
    if( sdom ) newSpecs.sdom = sdom;
  }

  var newLength = ( newSpecs && newSpecs.children && newSpecs.children.length ) || 0;
  var oldLength = ( oldSpecs && oldSpecs.children && oldSpecs.children.length ) || 0;

  for (var i = 0; i < newLength || i < oldLength; i++) {
    var oldChild = oldSpecs && oldSpecs.children && oldSpecs.children[i];
    var newChild = newSpecs && newSpecs.children && newSpecs.children[i];
    //var oldChild = ( oldSpecs && oldSpecs.children && oldSpecs.children[i] ) || undefined;
    //var newChild = ( newSpecs && newSpecs.children && newSpecs.children[i] ) || undefined;
    //console.log(newSpecs, newChild, oldSpecs, oldChild);
    var specs = mkDOM(newSpecs, newChild, oldSpecs, oldChild);
    if( newSpecs && newSpecs.constructor === Object ){
      newSpecs.children[i] = specs;
    }
  }

  return newSpecs;
};

module.exports = function(target){
  target = target || document.body;
  var C = {
    specs: undefined,
    rootSDOM: $(target),
    rootSpecs: {
      sdom: $(target),
      meta: {}
    },
    load: function(newSpecs){
      if( ! newSpecs ){
        console.warn('specDOML: no specs provided');
        return false;
      }
      if( newSpecs.constructor === Object ){
        //newSpecs._id = 'r.0';
        this.specs = mkDOM(this.rootSpecs, newSpecs, this.rootSpecs, this.specs);
      } else if( newSpecs.constructor === Array ){
        newSpecs = {
          tag: 'div',
          children: newSpecs,
        };
        for( var i = 0; i < newSpecs.length; i++ ){
          newSpecs.children.push( mkDOM(this.rootSpecs, newSpecs[i], this.rootSpecs, this.specs) );
        }
        this.specs = mkDOM(this.rootSpecs, newSpecs, this.rootSpecs, this.specs);
      } else {
        console.log('Invalid DOM specs.');
        return false;
      }
      return true;
    }
  };


  return C;
};
