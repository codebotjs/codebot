'use strict';

import Q from 'q';
import ejs from 'ejs';
import _ from 'lodash';

const target = 'transpiler';

/**
 * Transpile the files
 * @param  {Object}       options.log   the log
 * @param  {TemplateFile} options.item  the template-file to process
 * @param  {ModelAccesor} options.model the model tuned by ModelAccesor
 * @param  {Object}       options.ops   other settings
 * @return {Promise}               
 */
export default function({log, item, model, ops}){
  ops = ops || {};

  // set template context
  let context = _resolveContext(item, model);

  // add lodash to context
  context._ = _;

  log.verbose(target, `processing ${item.name}`);
  if (!item.isInject){
    return _renderAsFile({item, context, ops, log});
  }

  return _renderAsInject({item, context, ops, log});
}

function _resolveContext(item, model){
  let $this = {};
  let $parent = {};
  let $model = {};

  if (item.$this){
    $this = item.$this.getModel();
    //
    if ($this.hasOwnProperty('$parent')){
      $parent = $this.$parent.getModel();
    }
    if ($parent.hasOwnProperty('$this')){
      $parent = $parent['$this'];
    }
    if ($this.hasOwnProperty('$this')){
      $this = $this['$this'];
    }
  }

  if (item.$parent){
    $parent = item.$parent;
  }

  if (model){
    $model = model.getModel();
  }

  // set template context
  return { $this, $parent, $model };
}

function _renderAsFile({item, context, ops, log}){
  const def = Q.defer();
  ejs.renderFile(item.templatePath(), context, ops, (err, content) => {
    if (err){
      log.error(target, err);
      return def.reject(err);
    }
    def.resolve({item, content});

  });

  return def.promise;
}

function _renderAsInject({item, context, ops, log}){
  const def = Q.defer();
  ejs.renderFile(item.templatePath(), context, ops, (err, content) => {
    if (err){
      log.error(target, err);
      return def.reject(err);
    }
    def.resolve({item, content});

  });

  return def.promise;
}