'use strict';

import Q from 'q';
import fs from 'fs-extra';
import path from 'path';

const target = 'writer';

export default function({log, item, content, simulate}){
  const def = Q.defer();
  
  let dir = path.dirname(item.fullname);

  // create forlder
  fs.ensureDirSync(dir);

  let rel = path.join(item.relative, item.name);

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
}