'use strict';

import Q from 'q';
import ejs from 'ejs';
import _ from 'lodash';

const target = 'transpiler';

function _resolveContext(item, model){
  let $this = {};
  let $parent = {};
  let $model = {};

  if (item.$this){
    $this = item.$this.getModel();
    if ($this.hasOwnProperty('$this')){
      $this = $this['$this'];
    }
  }
//console.log(item.$parent)
  if (item.$parent){
    console.log(item.$parent)
    $parent = item.$parent.getModel();
  }

  if (model){
    $model = model.getModel();
  }

  // set template context
  return { $this, $parent, $model };
}

export default function({log, item, model, ops}){
  const def = Q.defer();

  ops = ops || {};

  // set template context
  let context = _resolveContext(item, model);

  // add lodash to context
  context._ = _;

  log.verbose(target, `processing ${item.name}`);

  ejs.renderFile(item.templatePath(), context, ops, (err, content) => {
    if (err){
      log.error(target, err);
      return def.reject(err);
    }
    def.resolve({item, content});

  });

  return def.promise;
}