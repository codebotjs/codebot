'use strict';

/**
 * TemplateFolder define an output template folder
 */
export default class TemplateFolder {
  constructor({name, $this}){
    this.name = name;
    this.$this = $this;

    this.folders = [];
    this.files = [];
  }
  /**
   * Override the toString thing
   * @return {String} Custom output
   */
  toString(){
    return this.name;
  }
}