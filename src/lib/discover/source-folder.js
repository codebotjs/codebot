'use strict';

import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import SourceItem from './source-item';
import SourceFile from './source-file';

/**
 * The SourceFolder define a folder of templates
 */
export default class SourceFolder extends SourceItem{
  /**
   * Instance a new SourceFolder
   * 
   * @param  {String}         options.dir    source folder
   * @param  {String}         options.output destination folder
   * @param  {SourceFolder} options.owner  owner folder as instance of SourceFolder
   * @param  {ModelAccesor}   options.model  the model tuned by ModelAccesor
   */
  constructor({dir, model, output, owner}){
    super({dir, model, output, owner});

    this.folders = [];
    this.files = [];

    this._explore();
  }
  /**
   * Walkthrough the source folder searching templates
   */
  _explore(){
    let nfiles = fs.readdirSync(this.dir);
    let items = _.map(nfiles, f => {
      let fullname = path.resolve(this.dir, f);
      let s = fs.statSync(fullname);
      return {
        fullname: fullname,
        stat: s
      }
    });
    items.forEach(i => {
      if (i.stat.isDirectory()){
        let tfolder = new SourceFolder({
          dir: i.fullname,
          model: this.model,
          output: this.output,
          owner: this
        });
        this.folders.push(tfolder);
      } else if (i.stat.isFile()){
        let tfile = new SourceFile({
          dir: i.fullname,
          model: this.model,
          output: this.output,
          owner: this
        });
        this.files.push(tfile);
      }
    });
  }
}