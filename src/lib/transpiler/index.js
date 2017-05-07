'use strict';

import Q from 'q';
import ejs from 'ejs';

const target = 'transpiler';

export default function({log, item, model, ops}){
  var def = Q.defer();

  ops = ops || {};

  let context = { 
    $this: item.$this,
    $parent: item.$parent,
    $model: model
  };

  log.verbose(target, `processing ${item.name}`);

  ejs.renderFile(item.path, context, ops, (err, content) => {
    if (err){
      log.err(target, err);
      return def.reject(err);
    }
    def.resolve({item, content});

  });

  return def.promise;
}