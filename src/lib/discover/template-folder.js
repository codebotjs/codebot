'use strict';

import TemplateItem from './template-item';

/**
 * TemplateFolder define an output template folder
 */
export default class TemplateFolder extends TemplateItem {
  constructor({name, owner, $this, $parent}){
    super({name, owner, $this, $parent});

    this.folders = [];
    this.files = [];
  }
}