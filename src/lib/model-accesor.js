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
   * Define the $this object on the model 
   * 
   * @param  {String} accesor property expression
   * @return {Object}
   */
  resolveThis(accesor){
    if (!accesor){
      return null;
    }
    let props = accesor.split('.');
    let dots = props.length;

    if (dots > 1){
      props = _.dropRight(props);
    }

    let p = props.join('.');

    return _.get(this.model, p);
  }
}