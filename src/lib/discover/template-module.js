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
    let sourceFolder = path.resolve(this.dir, this.config.src);
    // the source folder
    this.sourceRoot = new SourceFolder({dir: sourceFolder, model, output});
    // expand the tree of templates
    let expanded = this.sourceRoot.expand(/*$this*/model);
    this.root = (expanded && expanded.length) ? expanded[0] : null;
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
    if (type === 'output-tree'){
      return this._printOutputTree(colored);
    }
    return this.name;
  }
  /**
   * Print the output as tree directory
   * @return {String}
   */
  _printOutputTree(colored){
    let lines = [];
    let name = `[${this.name}]`;
    name = colored ? chalk.green(name) : name;

    lines.push(name);
    
    // now print folders
    this._printOutputFolder(this.root, 0, lines, colored, true);

    return lines.join('\n');
  }
  /**
   * Print a template  folder
   * @param  {SourceFolder}   folder  the template folder
   * @param  {Integer}          level   tree level
   * @param  {Array}            lines   output lines
   * @param  {Boolean}          colored use colors?
   * @param  {Boolean}          is the root folder?
   */
  _printOutputFolder(folder, level, lines, colored=false, isRoot=false){
    // first print this folder
    if (!isRoot){
      let l = this._tabs(level) + `-${folder.name}`;
      l = colored ? chalk.cyan(l) : l;
      lines.push(l);
    }

    // now print folders
    folder.folders.forEach( f => {
      this._printOutputFolder(f, level+1, lines, colored);
    });
    // now print files
    folder.files.forEach( f => {
      let l = this._tabs(level+1) + `-${f.name}`;
      l = colored ? chalk.blue(l) : l;
      lines.push(l);
    });
  }
  /**
   * Print the source as tree directory
   * @return {String}
   */
  _printSourceTree(colored){
    let lines = [];
    let name = `[${this.name}]`;
    name = colored ? chalk.green(name) : name;

    lines.push(name);
    
    // now print folders
    this._printSourceFolder(this.sourceRoot, 0, lines, colored, true);

    return lines.join('\n');
  }
  /**
   * Print a template  folder
   * @param  {SourceFolder}   folder  the template folder
   * @param  {Integer}          level   tree level
   * @param  {Array}            lines   output lines
   * @param  {Boolean}          colored use colors?
   * @param  {Boolean}          colored use colors?
   */
  _printSourceFolder(folder, level, lines, colored=false, isRoot=false){
    
    if (!isRoot){
      // first print this folder
      let l = this._tabs(level) + `-${folder.name}`;
      l = colored ? chalk.cyan(l) : l;
      lines.push(l);
    }
    
    // now print folders
    folder.folders.forEach( f => {
      this._printSourceFolder(f, level+1, lines, colored);
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