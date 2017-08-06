'use strict';

/**
 * TemplateItem define an output template folder/file
 */
export default class TemplateItem {
  constructor({name, owner, $this, $parent}){
    this.name = name;
    this.owner = owner;
    this.$this = $this;
    this.$parent = $parent;
  }
  /**
   * Override the toString thing
   * @return {String} Custom output
   */
  toString(){
    return this.name;
  }
}