'use strict';

import Q from 'q';

const target = 'plugins';

/**
 * Apply the plugins
 * @param  {Object}       options.log      the log
 * @param  {TemplateFile} options.item     the template-file to process
 * @param  {String}       options.content  the transpiler content
 * @param  {Array}        options.plugins array of plugins to apply
   * @return {Promise}                 
 */
export default function({log, plugins, item, content}){
  const def = Q.defer();
  
  if (!plugins){
    def.resolve({item, content});
    return def.promise;
  }

  // apply the plugins here

  return def.promise;
}