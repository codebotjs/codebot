'use strict';

import path from 'path';
import XRegExp from 'xregexp';
import utils from './utils';

const {regex} = utils;

/**
 * The SourceItem define a folder or file of templates
 */
export default class SourceItem {
  /**
   * Instance a new SourceItem
   * 
   * @param  {String}         options.dir    source folder
   * @param  {String}         options.output destination folder
   * @param  {SourceFolder} options.owner  owner folder
   * @param  {ModelAccesor}   options.model  the model tuned by ModelAccesor
   */
  constructor({dir, model, output, owner}){
    this.dir = dir;
    this.model = model;
    this.output = output;
    this.owner = owner;

    let p = path.parse(this.dir);
    this.name = p.base;

    this.isDynamic = regex.isDynamic.test(this.name);

    if (this.isDynamic){
      let match = XRegExp.exec(this.name, regex.dynamic);
      let md = XRegExp.exec(this.name, regex.directive);
      this.accesor = match.accesor;
      this.modifier = match.modifier;
      this.directive = md.directive;
    }
    
    this.isLayer = regex.isLayer.test(this.name);

    if (regex.isLayer.test(this.name)){
      let match = XRegExp.exec(this.name, regex.layer);
      this.layer = match.accesor;
    }

    this.isAuto = regex.isAuto.test(this.name);
    this.isInject = regex.isInject.test(this.name);
  }
  /**
   * Override the toString thing
   * @return {String} Custom output
   */
  toString(){
    return this.name;
  }
}