'use strict';

import TemplateItem from './template-item';

/**
 * TemplateFile define an output template file
 */
export default class TemplateFile extends TemplateItem {
  constructor({name, owner, $this, $parent, isAuto, isInject}){
    super({name, owner, $this, $parent});
    this.isAuto = isAuto === true;
    this.isInject = isInject === true;
  }
  templatePath(){
    return this.owner.dir;
  }
}