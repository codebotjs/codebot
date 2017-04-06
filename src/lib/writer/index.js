'use strict';

import Q from 'q';
import fs from 'fs-extra';
import path from 'path';

const target = 'writer';

export default function({log, item, content}){
  var def = Q.defer();
  
  var dir = path.dirname(item.output);

  // create forlder
  fs.ensureDirSync(dir);

  log.verbose(target, `writing ${item.output}`);
  fs.writeFile(item.output, content, (err) => {
    if (err){
      log.error(target, err);
      return def.reject(err);
    }

    return def.resolve(item);
  });

  return def.promise;
}