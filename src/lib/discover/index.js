'use strict';

import Q from 'q';

const target = 'discover';

export default function({log}){
  var def = Q.defer();

  // simulation
  log.verbose(target, 'initializing');
  setTimeout(() => {
    log.verbose(target, 'ready');
    def.resolve({});
  }, 200);

  return def.promise;
}