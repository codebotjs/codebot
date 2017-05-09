'use strict';

import fs from 'fs-extra';
import SourceItem from './source-item';

/**
 * The SourceFile define a template
 */
export default class SourceFile extends SourceItem{
  /**
   * Instance a new SourceFile
   * 
   * @param  {String}         options.dir    template fullname
   * @param  {String}         options.output destination folder
   * @param  {SourceFolder} options.owner  owner folder as instance of SourceFolder
   * @param  {ModelAccesor}   options.model  the model tuned by ModelAccesor
   */
  constructor({dir, model, output, owner}){
    super({dir, model, output, owner});
  }
}