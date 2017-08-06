'use strict';

import TemplateItem from './template-item';

/**
 * TemplateFile define an output template file
 */
export default class TemplateFile extends TemplateItem {
  constructor({name, owner, $this, $parent, isAuto}){
    super({name, owner, $this, $parent});
    this.isAuto = isAuto;
  }
  templatePath(){
    return this.owner.dir;
  }
}