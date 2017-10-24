'use strict';

import async from 'async';
import _ from 'lodash';
import fs from 'fs';

import transpiler from '../transpiler';
import plugins from '../plugins';
import writer from '../writer';

export default function(log, simulate) {
	let target = 'processor';

	return (ops, callback) => {
	  let limit = process.env.ASYNC_LIMIT || 2;

	  try{
		  let items = _.flatten(_.map(ops.modules, m => { return m.getTemplates(); }));;
	  	let model = ops.model;

	  	// filter auto, inject and newfiles
	  	items = _.filter(items, i => {
	  		return (i.isAuto || i.isInject) || !fs.existsSync(i.fullname);
	  	});

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
	            writer({log, item: res.item, content: res.content, simulate: simulate})
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
	};
}