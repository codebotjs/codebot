'use strict';

import Q from 'q';

const target = 'transpiler';

export default function({log, output, model, templates}){
  var def = Q.defer();

  // simulation
  log.verbose(target, 'initializing');
  setTimeout(() => {
    log.verbose(target, 'ready');
    def.resolve({});
  }, 200);

  return def.promise;
}