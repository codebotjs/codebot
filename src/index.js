'use strict';

import async from 'async';
import Q from 'q';
import _ from 'lodash';
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
 * Codebot is an easy way to make applications from templates.
 * 
 * @param  {String|Array} options.modules path/s of modules
 * @param  {Object}       options.model   The model
 * @param  {String}       output          Destination folder
 * @param  {Array}        plugins         Plugins to apply 
 * @param  {Object}       stdout          I/O output
 * @param  {String}       loglevel        The log level (verbose, info)
 * @return {Promise}
 */
export default function({modules, model = {}, output, plugins = [], stdout=process.stderr, loglevel='verbose'} = {}) {
  let target = 'codebot';

  if (!modules){
    throw new Error(`'modules' is not defined`);
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
      discover({log, modules, output, model: ma})
        .then(res => {
          log.verbose(target, `processed ${res.length} template modules`);

          cb(null, {
            modules: res,
            model: ma
          });
        })
        .catch(cb);
    },
    _process
  ], (err, res) => {
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

    let items = _.flatten(_.map(ops.modules, m => { return m.getTemplates(); }));;
    let model = ops.model;

    log.info(target, `processing ${items.length} items`);

    try{
      async.each(
        items,
        (item, ocb) => {
          async.waterfall([
            (cb) => {
              transpiler({log, item: item, model: model})
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
