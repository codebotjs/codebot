'use strict';

import _ from 'lodash';

/**
 * ModelAccesor is an easy way to access through the model
 */
export default class ModelAccesor {
  /**
   * The constructor
   * @param  {Object} model the model it self
   */
  constructor(model){
    this.model = model || {};
  }
  /**
   * Resolve layers like #layer
   * 
   * @param  {String} name the layer name
   */
  getLayer(name){
    if (!this.model.hasOwnProperty('layer')){
      return null;
    }

    return this.model.layer[name];
  }
  /**
   * Get the original model
   * @return {Object} returns the original model
   */
  getModel(){
    return this.model;
  }
  /**
   * Define dynamics object on the model 
   * 
   * @param  {String} accesor property expression
   * @return {Object}
   */
  resolveDynamic(accesor){
    if (!accesor){
      return null;
    }
    let props = accesor.split('.');
    let dots = props.length;
    let value;

    if (dots > 1){
      value = _.tail(props).join('.');
      props = _.dropRight(props);
    }

    let p = props.join('.');

    return {
      $this: props[0],
      path: value,
      values: _.get(this.model, p)
    };
  }
  /**
   * Resolve the value
   * @param  {String} prop 
   * @return {Object}      the value of the property
   */
  getValue(prop){
    _.get(this.model, prop);
  }
}