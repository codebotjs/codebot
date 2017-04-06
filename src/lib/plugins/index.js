'use strict';

import Q from 'q';

const target = 'plugins';

export default function({log, plugins, item, content}){
  var def = Q.defer();
  
  if (!plugins){
    def.resolve({item, content});
    return def.promise;
  }

  // apply the plugins here

  return def.promise;
}