'use strict';

import path from 'path';
import Q from 'q';
import async from 'async';
import fs from 'fs-extra';
import TemplateModule from './template-module';

const target = 'discover';

/**
 * This module walk through the `modules` paths and
 * make the template tree
 * 
 * @param  {Object}       options.log     the log
 * @param  {String|Array} options.modules path/s of modules
 * @param  {String}       options.output  destination folder
 * @param  {ModelAccesor} options.model   the model tuned by ModelAccesor
 * @return {Promise}
 */
export default function({log, modules, output, model}) {
  const def = Q.defer();

  async.mapSeries(
    modules,
    (dir, cb) => {
      dir = path.resolve(dir);

      if (!fs.existsSync(dir)){
        return cb(new Error(`Unknown path '${dir}'`));
      }

      let cfile = path.join(dir, 'codebot.json');
      if (!fs.existsSync(cfile)){
        log.warn(target, `missing config file at ${dir}`);
      }
      cb(null, new TemplateModule({dir, model, output}));
    }, (err, items) => {
      if (err){
        return def.reject(err);
      }
      def.resolve(items);
    });

  return def.promise;
}