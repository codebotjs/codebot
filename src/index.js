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
          cb(null, {items: res, model: ma});
        })
        .catch(cb);
    },
    _process
  ], (err, res) => {
    // do something
    if (err){
      return def.reject(err);
    }
    def.resolve(res);
  });

  return def.promise;

  //
  // Helpers
  function _process(ops, callback){
    let limit = process.env.ASYNC_LIMIT || 2;
    let target = 'codebot';

    let items = ops.items;
    let model = ops.model;

    log.info(target, `processing ${items.length} items`);

    try{
      async.each(
        items,
        (item, ocb) => {
          
          async.waterfall([
            (cb) => {
              transpiler({log, item: item, model})
                .then(res => {
                  cb(null, res);
                })
                .catch(cb);
            },
            (res, cb) => {
              _plugins({log, item: res.item, content: res.content})
                .then(res => {
                  cb(null, res);
                })
                .catch(cb);
            },
            (res, cb) => {
              writer({log, item: res.item, content: res.content})
                .then(res => {
                  cb(null, res);
                })
                .catch(cb);
            }
          ], (err, res) => {
            // do something
            if (err){
              return ocb(err);
            }
            ocb(null, res);
          });

        },
        (err) => {
          if (err){
            return callback(err);
          }

          callback(null, results);
        }
      );
    } catch(err){
      console.log(err);
      callback(err);
    }
  }
}
