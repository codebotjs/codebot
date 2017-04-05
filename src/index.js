'use strict';

import async from 'async';
import Q from 'q';
// actors
import Log from './lib/log';
import discover from './lib/discover';
import transpiler from './lib/transpiler';
import _plugins from './lib/plugins';
import writer from './lib/writer';
import ModelAccesor from './lib/model-accesor';

// set the async parallel limit
process.env.ASYNC_LIMIT = process.env.ASYNC_LIMIT || 5;

process.on('uncaughtException', function (err) {
  console.log(err);
})

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

  // create a model accesor
  var ma = new ModelAccesor(model);

  // make happens
  async.waterfall([
    cb => {
      discover({log, sources, output, model: ma})
        .then(res => {
          cb(null, res);
        })
        .catch(cb);
    },
    (res, cb) => {
      transpiler({log, output, model: ma, templates: res})
        .then(res => {
          cb(null, res);
        })
        .catch(cb);
    },
    (res, cb) => {
      _plugins({log})
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
  ], (err, res) => {
    // do something
    if (err){
      return def.reject(err);
    }
    def.resolve(res);
  });

  return def.promise;
}
