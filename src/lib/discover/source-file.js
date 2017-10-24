'use strict';

import fs from 'fs-extra';
import _ from 'lodash';

import SourceItem from './source-item';
import TemplateFile from './template-file';
import ModelAccesor from '../model-accesor';
import utils from './utils';

const {resolveModifier} = utils;

/**
 * The SourceFile define a template
 */
export default class SourceFile extends SourceItem{
  /**
   * Instance a new SourceFile
   * 
   * @param  {String}         options.dir    template fullname
   * @param  {String}         options.output destination folder
   * @param  {SourceFolder}   options.owner  owner folder as instance of SourceFolder
   * @param  {ModelAccesor}   options.model  the model tuned by ModelAccesor
   */
  constructor({dir, model, output, owner}){
    super({dir, model, output, owner});
  }
  /**
   * Expand the file
   * @param  {ModelAccesor} submodel  current model
   * @return {Array}                  expanded files
   */
  expand(submodel){
    let model = submodel;
    if (!(submodel instanceof ModelAccesor)){
      model = new ModelAccesor(submodel);
    }
    
    if (this.isDynamic){
      return this._expandAsDynamic(submodel);
    }
    // expand as single file
    let name = this.isAuto === true ? 
                    this.name.replace(/^@/i, '') 
                  : this.name;

    if (this.isInject){
      name = this.name.replace(/^!/i, '');
    }

    return [new TemplateFile({
      name: name,
      owner: this,
      isAuto: this.isAuto,
      isInject: this.isInject,
      $this: model,
      $parent: model.$parent
    })];
  }
  /**
   * Expand dynamics files such as ${}
   * @param  {ModelAccesor|Object} submodel current model
   * @return {Array}               expanded folders
   */
  _expandAsDynamic(submodel){
    let model = submodel;
    if (!(submodel instanceof ModelAccesor)){
      model = new ModelAccesor(submodel);
    }

    let obj = model.resolveDynamic(this.accesor);
    // if is an array of values
    if (typeof obj.values === 'object'){
      if (obj.values instanceof Array){
        return this._expandAsArray(obj, model)
      }
      
      let childs = _.get(obj.values, obj.path);
      if (childs instanceof Array){
        return this._expandAsArrayOfThis(obj, model);
      }
      if (typeof childs === 'object'){
        return this._expandAsArrayOfObject(childs, obj, model);
      }
    }
    let name = _.get(obj.values, obj.path);
    if (this.modifier){
      name = resolveModifier(this.modifier, name);
    }
    name = this.getName(name);

    return [new TemplateFile({
      name: name,
      owner: this,
      isAuto: this.isAuto,
      isInject: this.isInject,
      $this: model,
      $parent: model.$parent
    })];
  }
  /**
   * Expand dynamics files such as ${$this.otherItems}
   * @param  {Object} obj                   resolved object accesor
   * @param  {ModelAccesor|Object} submodel current model
   * @return {Array}                        expanded files
   */
  _expandAsArrayOfThis(obj, submodel){
    let childs = _.get(obj.values, obj.path);
    return _.map(childs, key => {
      var name = key;
      if (this.modifier){
        name = resolveModifier(this.modifier, key);
      }
      let mm = { 
        $this: {
          $key: key
        },
        $parent: submodel
      };
      return new TemplateFile({
        name: this.getName(name),
        owner: this,
        $this: new ModelAccesor(mm),
        isAuto: this.isAuto,
        isInject: this.isInject
      });
    });
  }
  /**
   * Expand dynamics files such as ${target.name}
   * @param  {Object} obj                   resolved object accesor
   * @param  {ModelAccesor|Object} submodel current model
   * @return {Array}                        expanded files
   */
  _expandAsArray(obj, submodel){
    return _.map(obj.values, item => {
      let name = name = _.get(item, obj.path);
      if (typeof name === 'object'){
        if (name instanceof Array){
          return this._expandAsArrayOfArray(name, obj, submodel);
        }
        return this._expandAsArrayOfObject(name, obj, submodel);
      }

      if (this.modifier){
        name = resolveModifier(this.modifier, name);
      }
      let mm = { 
        $this: item,
        $parent: submodel
      };
      return new TemplateFile({
        name: this.getName(name),
        owner: this,
        $this: new ModelAccesor(mm),
        isAuto: this.isAuto,
        isInject: this.isInject
      });
    });
  }
  /**
   * Expand dynamics files such as ${target.arrayObject}
   * @param  {Object} child                 the child object
   * @param  {String} obj                   the resolved object
   * @param  {ModelAccesor|Object} submodel current model
   * @return {Array}                        expanded files
   */
  _expandAsArrayOfArray(child, obj, submodel){
    return _.map(child, item => {
      if (this.modifier){
        item = resolveModifier(this.modifier, item);
      }
      let mm = { 
        $this: item,
        $parent: submodel
      };
      return new TemplateFile({
        name: this.getName(item),
        owner: this,
        $model: new ModelAccesor(mm),
        isAuto: this.isAuto,
        isInject: this.isInject
      });
    });
  }
  /**
   * Expand dynamics files such as ${target.object}
   * @param  {Object} child                 the child object
   * @param  {String} obj                   the resolved object
   * @param  {ModelAccesor|Object} submodel current model
   * @return {Array}                        expanded files
   */
  _expandAsArrayOfObject(child, obj, submodel){
    return _.map(_.keys(child), key => {
      var name = key;
      if (this.modifier){
        name = resolveModifier(this.modifier, key);
      }
      let mm = { 
        $this: {
          $key: key
        },
        $parent: submodel
      };
      mm.$this = Object.assign({}, mm.$this, child[key]);
      return new TemplateFile({
        name: this.getName(name),
        owner: this,
        $this: new ModelAccesor(mm),
        isAuto: this.isAuto,
        isInject: this.isInject
      });
    });
  }
  /**
   * Convert a directive such as ${target.name}.js -> value.js
   * @param  {String} value   the value
   * @return {String}         resolved directive
   */
  getName(value){
    return this.name.replace(this.directive, value);
  }
}