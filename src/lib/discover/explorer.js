'use strict';

import fs from 'fs';
import _path from 'path';
import Q from 'q';
import async from 'async';
import XRegExp from 'xregexp';

const regex = {
  isLayer: /^#.+$/i,
  layer: XRegExp('^[#]{1}(?<accesor>.+$)', 'x'),
  isAuto: /^@.*$/i,
  isDynamic: /^@?\$(:?[cklsu]{1})?{[\$\w\.]+}.*$/i,
  dynamic: XRegExp('^@?\\$(?<modifier>[cklsu]{1})?{(?<accesor>[\\$\\w\\.]+)}.*$', 'x'),
  directive: XRegExp('(?<directive>^@?\\$(:?[cklsu]{1})?{[\\$\\w\\.]+}).*$', 'x')
};

export default function(path){
  return explore(path);
}

function explore(path){
  const def = Q.defer();

  const name = _path.basename(path);
  const item = { path, name };

  if (regex.isDynamic.test(name)){
    let match = XRegExp.exec(name, regex.dynamic);
    let md = XRegExp.exec(name, regex.directive);
    item.dynamic = true;
    item.accesor = match.accesor;
    item.modifier = match.modifier;
    item.directive = md.directive;
  }

  fs.stat(path, (err, stats) => {
    if (err){
      return def.reject(err);
    }

    if (stats.isFile()) {
      // process the filename
      const ext = _path.extname(path).toLowerCase();
      item.ext = ext;
      item.isFile = true;
      if (regex.isAuto.test(name)){
        item.auto = true;  
      }
      
      return def.resolve(item);
    } else if (stats.isDirectory()) {
      item.isDirectory = true;
      if (regex.isLayer.test(name)){
        let match = XRegExp.exec(name, regex.layer);
        item.layer = match.accesor;
      }

      fs.readdir(path, (err, files) => {
          async.map(files, (file, cb) => {
            explore(_path.join(path, file))
              .then(item => {
                cb(null, item);
              })
              .catch(cb);
          }, (err, results) => {
            if (err) {
              return def.resolve(err);
            }
            item.children = results;
            def.resolve(item);
          }
        );
      });
    } else {
      return def.resolve(null);
    }

  });

  return def.promise;
}