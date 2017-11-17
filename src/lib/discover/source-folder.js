'use strict';

import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import SourceItem from './source-item';
import SourceFile from './source-file';
import TemplateFolder from './template-folder';
import ModelAccesor from '../model-accesor';
import utils from './utils';

const {resolveModifier} = utils;

/**
 * The SourceFolder define a folder of templates
 */
export default class SourceFolder extends SourceItem{
  /**
   * Instance a new SourceFolder
   * 
   * @param  {String}         options.dir    source folder
   * @param  {String}         options.output destination folder
   * @param  {SourceFolder}   options.owner  owner folder as instance of SourceFolder
   * @param  {ModelAccesor}   options.model  the model tuned by ModelAccesor
   */
  constructor({dir, model, $this, output, owner, isRoot}){
    super({dir, model, output, owner});

    this.isRoot = isRoot === true;
    //
    //Walkthrough the source folder searching templates
    //
    // map the files/folders stats
    let nfiles = fs.readdirSync(this.dir);
    let items = _.map(nfiles, f => {
      let fullname = path.resolve(this.dir, f);
      let s = fs.statSync(fullname);
      return {
        fullname: fullname,
        stat: s,
        isDirectory: s.isDirectory(),
        isFile: s.isFile(),
      }
    });
    // gets folders
    this.folders = _.map(_.filter(items, 'isDirectory'), i => {
      return new SourceFolder({
              dir: i.fullname,
              model: this.model,
              output: this.output,
              owner: this
            });
    });
    // gets files
    this.files = _.map(_.filter(items, 'isFile'), i => {
      return new SourceFile({
              dir: i.fullname,
              model: this.model,
              output: this.output,
              owner: this
            });
    });
  }
  /**
   * Expand the folder
   * @param  {ModelAccesor} submodel  current model
   * @return {Array}                  expanded folder
   */
  expand(submodel){
    let model = submodel;
    if (!(submodel instanceof ModelAccesor)){
      model = new ModelAccesor(submodel);
    }

    // is a layer ?
    if (this.isLayer){
      return this._expandAsLayer();
    }
    // is dynamic ?
    if (this.isDynamic){
      return this._expandAsDynamic(model);
    }

    let nf = new TemplateFolder({name: this.name, owner: this, $this: model});
    // expand the childs
    this._expandChilds(nf, model);
    return [nf];
  }
  /**
   * Expand dynamics folder such as ${}
   * @param  {ModelAccesor|Object} submodel current model
   * @return {Array}                        expanded folders
   */
  _expandAsDynamic(submodel){
    let model = submodel;
    if (!(submodel instanceof ModelAccesor)){
      model = new ModelAccesor(submodel);
    }
    // gets the model
    let obj = model.resolveDynamic(this.accesor);
    if (!obj){
      throw new Error(`can't access to ${folder.accesor} on ${folder.name}`);
    }
    // map the result
    return _.map(obj.values, item => {
      let name = _.get(item, obj.path);
      // have a modifier?
      if (this.modifier){
        name = resolveModifier(this.modifier, name);
      }
      let nf = new TemplateFolder({
        name: name,
        owner: this,
        $this: model
      });
      let mm = { $this: item };

      // expand the childs with the submodel
      this._expandChilds(nf, mm);

      return nf;
    });
    
  }
  /**
   * Expand as layer
   * @return {Array} expanded folder
   */
  _expandAsLayer(){
    // resolve the layer with the root model
    let name = this.model.getLayer(this.layer);
    if (!name){
      // if the layer is not defined in the model
      // exclude the module
      return [];
      //throw new Error(`Invalid layer '#${this.layer}'`);
    }
    let nf = new TemplateFolder({
      name: name,
      owner: this
    });
    // expand the childs
    this._expandChilds(nf, this.model);
    return [ nf ];
  }
  /**
   * Expand childs
   * @param  {TemplateFolder}      tfolder
   * @param  {ModelAccesor|Object} submodel current model
   */
  _expandChilds(tfolder, submodel){
    let mm = submodel;
    if (!(submodel instanceof ModelAccesor)){
      mm = new ModelAccesor(submodel);
    }
    tfolder.folders = _.flattenDeep(_.map(this.folders, f => {
      return f.expand(submodel);
    }));
    tfolder.files = _.flattenDeep(_.map(this.files, f => {
      return f.expand(submodel);
    }));
  }
}