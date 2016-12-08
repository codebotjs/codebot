'use strict';

import async from 'async';
import Q from 'q';
// actors
import Log from './lib/log';
import discover from './lib/discover';
import transpiler from './lib/transpiler';
import plugins from './lib/plugins';
import writer from './lib/writer';

/**
 * Codebot
 * 
 * @param {Object} Options
 * @return {Object}
 */
export default function({sources, model = {}, output, plugins = [], stdout=process.stderr, loglevel='verbose'} = {}) {
  
  if (!sources){
    throw new Error(`'sources' is not defined`);
  }

  if (!output){
    throw new Error(`'output' is not defined`);
  }

  var def = Q.defer();

  var log = Log({ stdout, level: loglevel});

  // make happens
  async.waterfall([
    cb => {
      discover({log})
        .then(res => {
          cb(null, res);
        })
        .catch(cb);
    },
    (res, cb) => {
      transpiler({log})
        .then(res => {
          cb(null, res);
        })
        .catch(cb);
    },
    (res, cb) => {
      plugins({log})
        .then(res => {
          cb(null, res);
        })
        .catch(cb);
    },
    (res, cb) => {
      writer({log})
        .then(res => {
          cb(null, res);
        })
        .catch(cb);
    }
  ], (err) => {
    // do something
    if (err){
      return def.reject(err);
    }
    def.resolve({});
  });

  return def.promise;
}
