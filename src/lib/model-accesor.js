'use strict';

export default class ModelAccesor {
  constructor(model){
    this.model = model || {};
  }
  getLayer(name){
    if (!this.model.hasOwnProperty('layer')){
      throw new Error('no layers defined on the model');
    }

    return this.model.layer[name];
  }
  getModel(){
    return this.model;
  }
}