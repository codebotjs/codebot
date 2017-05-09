'use strict';

/**
 * TemplateFile define an output template file
 */
export default TemplateFolder {
  constructor({name, $this}){
    this.name = name;
    this.$this = $this;
  }
  /**
   * Override the toString thing
   * @return {String} Custom output
   */
  toString(){
    return this.name;
  }
}