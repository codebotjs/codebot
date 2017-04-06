'use strict';

import Q from 'q';
import ejs from 'ejs';

const target = 'transpiler';

export default function({log, item, ops}){
  var def = Q.defer();

  ops = ops || {};

  let model = item.model || {};

  log.verbose(target, `processing ${item.name}`);

  ejs.renderFile(item.path, { $this: model }, ops, (err, content) => {
    if (err){
      log.err(target, err);
      return def.reject(err);
    }
    def.resolve({item, content});

  });

  return def.promise;
}