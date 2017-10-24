'use strict';

import Q from 'q';
import fs from 'fs-extra';
import path from 'path';

const target = 'writer';

/**
 * File output writer
 * @param  {Object}       options.log      the log
 * @param  {TemplateFile} options.item     the template-file to process
 * @param  {String}       options.content  the transpiler content
 * @param  {Boolean}      options.simulate define if is a simulation
 * @return {Function}                      callback function(item, content)
 */
export default function({log, item, content, simulate}){
  let dir = path.dirname(item.fullname);

  let rel = path.join(item.relative, item.name);

  return (writeFunc) => {
    const def = Q.defer();
    // if is passed a writer function
    if (writeFunc){
      writeFunc.apply(this, [item, content])
      def.resolve(item);
      return def.promise;
    }
    //
    // if not run local
    fs.ensureDirSync(dir); // create forlder
    log.verbose(target, `writing ${rel}`);
    if (!simulate){
      fs.writeFile(item.fullname, content, (err) => {
        if (err){
          log.error(target, err);
          return def.reject(err);
        }

        return def.resolve(item);
      });
    } else {
      def.resolve(item);
    }
    return def.promise;
  };

}