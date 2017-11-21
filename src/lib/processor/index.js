'use strict';

import async from 'async';
import _ from 'lodash';
import fs from 'fs';

import transpiler from '../transpiler';
import plugins from '../plugins';
import _writer from '../writer';

/**
 * Precessing all the items
 * @param  {Object} options.log        the log
 * @param  {Boolean} options.simulate  define if is a simulation
 * @param  {Function} options.writer   A callback function(item, content) to customize the file writes
 * @return {Promise}                 
 */
export default function({log, simulate, writer}) {
	let target = 'processor';
	// always not override
	let ignoreOverride = false; 

	return (ops, callback) => {
	  let limit = process.env.ASYNC_LIMIT || 2;

	  try{
		  let items = _.flatten(_.map(ops.modules, m => { return m.getTemplates(); }));;
	  	let model = ops.model;

	  	// filter auto, inject and newfiles
	  	if (!ignoreOverride){
		  	items = _.filter(items, i => {
		  		return (i.isAuto || i.isInject) || !fs.existsSync(i.fullname);
		  	});
	  	}

	  	log.info(target, `processing ${items.length} items`);

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
	            plugins({log, item: res.item, content: res.content})
	              .then(res => {
	                cb(null, res);
	              })
	              .catch(cb);
	          },
	          (res, cb) => {
	            _writer({log, item: res.item, content: res.content, simulate: simulate})(writer)
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
	      (err, results) => {
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
	};
}