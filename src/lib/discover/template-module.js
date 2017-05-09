'use strict';

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import _ from 'lodash';
import SourceFolder from './source-folder';

/**
 * The TemplateModule define a group of templates
 */
export default class TemplateModule {
  /**
   * Instance a new TemplateModule
   * 
   * @param  {String}       options.dir    source folder
   * @param  {String}       options.output destination folder
   * @param  {ModelAccesor} options.model  the model tuned by ModelAccesor
   */
  constructor({dir, model, output}){
    this.dir = dir;
    this.model = model;
    this.output = output;
    this.config = { src: 'src' };

    // define the default name
    let p = path.parse(this.dir);
    this.config.name = p.name;

    // if exists an config file readed
    this.cfile = path.resolve(this.dir, 'codebot.json');
    if (fs.existsSync(this.cfile)){
      let json = fs.readJsonSync(this.cfile);
      this.config = Object.assign({}, this.config, json);
    }
    
    this.name = this.config.name;

    // resolve the source folder
    this.sourceFolder = path.resolve(this.dir, this.config.src);
    // the source folder
    this.sourceRoot = new SourceFolder({dir: this.sourceFolder, model, output});
    this._expand();
  }

  /**
   * Expand the output tree
   */
  _expand(){
    this.root = this._expandFolder(this.sourceRoot);
  }
  /**
   * Expand a folder
   * @param  {SourceFolder}   folder
   * @return {TemplateFolder} expanded folder
   */
  _expandFolder(folder){

  }
  /**
   * Expand file 
   * @param  {SourceFile} file
   * @return {Array} expanded files
   */
  _expandFile(file){
    
  }
  /**
   * Override the toString thing
   * @param  {Boolean}          colored use colors?
   * @return {String} Custom output
   */
  toString(colored=true, type='name'){
    if (type === 'source-tree'){
      return this._printSourceTree(colored);
    }
    return this.name;
  }
  /**
   * Print as tree directory
   * @return {String}
   */
  _printSourceTree(colored){
    let lines = [];
    let name = `[${this.name}]`;
    name = colored ? chalk.bold.green(name) : name;

    lines.push(name);
    
    // now print folders
    this.sourceRoot.folders.forEach( f => {
      this._printFolder(f, 1, lines, colored);
    });

    return lines.join('\n');
  }
  /**
   * Print a template  folder
   * @param  {SourceFolder}   folder  the template folder
   * @param  {Integer}          level   tree level
   * @param  {Array}            lines   output lines
   * @param  {Boolean}          colored use colors?
   */
  _printFolder(folder, level, lines, colored=false){
    // first print this folder
    let l = this._tabs(level) + `-${folder.name}`;
    // TODO: delete me
    if (folder.dynamic){
      //l += ` [${folder.accesor} ${folder.modifier} ${folder.directive}]`;
    }
    l = colored ? chalk.cyan(l) : l;
    lines.push(l);

    // now print folders
    folder.folders.forEach( f => {
      this._printFolder(f, level+1, lines, colored);
    });
    // now print files
    folder.files.forEach( f => {
      let l = this._tabs(level+1) + `-${f.name}`;
      // TODO: delete me
      if (f.dynamic){
        //l += ` [${f.accesor} ${f.modifier} ${f.directive}]`;
      }
      l = colored ? chalk.blue(l) : l;
      lines.push(l);
    });
  }
  /**
   * Convert numbers to tabs
   * @param  {Integer} level  number of tabs
   * @return {String}        
   */
  _tabs(level){
    return _.repeat('  ', level);
  }
}