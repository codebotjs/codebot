'use strict';

import path from 'path';
import Q from 'q';
import async from 'async';
import _ from 'lodash';
import fs from 'fs-extra';
import explorer from './explorer';

const target = 'discover';

export default function({log, sources, output, model}){
  var def = Q.defer();

  // convert sources to array if is an string
  if ('string' === typeof sources){
    sources = [sources];
  }

  async.waterfall([
    _explore,
    _expand,
    _transform,
    _reduce
  ], (err, results) => {
    if (err){
      return def.reject(err);
    }

    def.resolve(results);
  });

  return def.promise;

  //
  // Helpers
  function _explore(callback){
    let limit = process.env.ASYNC_LIMIT || 2;

    var templates = {};

    async.eachLimit(
      sources,
      limit,
      (s, cb) => {
        let ss = path.join(s, 'src');

        if (!fs.existsSync(ss)){
          return cb(new Error(`${s} is not a valid source`));
        }

        log.verbose(target, `exploring ${s}`);

        explorer(ss)
          .then(items => {
            // exclude the src
            templates[s]  = items;
            cb(null);  
          })
          .catch(cb);
      },
      (err) => {
        if (err){
          return callback(err);
        }
        //fs.writeJsonSync('./tmp.json', templates);
        //console.log(templates);
        callback(null, templates);
    });
  }

  function _expand(items, callback){
    let limit = process.env.ASYNC_LIMIT || 2;

    try{
      async.eachLimit(
      _.keys(items),
        limit,
        (key, cb) => {

          _expandItem(items[key], model.getModel())
            .then(() => {
              cb(null);
            })
            .catch(cb);

        },
        (err) => {
          if (err){
            return callback(err);
          }
          //fs.writeJsonSync('./expand.json', items);
          //console.dir(res);
          callback(null, items);
        }
      );
    } catch(err){
      console.log(err);
    }
  }

  function _expandItem(item, $model){
    let limit = process.env.ASYNC_LIMIT || 2;

    const def = Q.defer();

    if (item.children && item.children.length === 0) {
      def.resolve();
      return def.promise;
    }

    // get dynamic folder
    var dyn = _.filter(item.children, i => {
      return i.isDirectory && i.dynamic;
    });


    if (dyn.length){
      item.children = _.filter(item.children, i => {
        return i.isFile || !i.dynamic;
      });

      // work with dynamic children
      var expanded = [];
      _.each(dyn, d => {
        let items = _resolveAccesor(d.accesor, $model);
        let keys = _.keys(items);

        _.each(keys, i => {
          let ac = `${d.accesor}.${i}`;

          var nd = _.cloneDeep(d);
          delete nd.dynamic;
          delete nd.path;
          delete nd.directive;
          delete nd.accesor;
          nd.name = nd.name.replace(d.directive, i);

          // resolve children
          _.each(nd.children, c => {
            if (c.dynamic){
              if (c.accesor === '$this'){
                c.name = c.name.replace(c.directive, i);
                delete c.accesor;
                delete c.directive;
                delete c.dynamic;
              } else {
                c.name = c.name.replace('$this', ac);
                c.accesor = c.accesor.replace('$this', ac);
                c.directive = c.directive.replace('$this', ac);  
              }
            }
          });

          expanded.push(nd);
        });
      });

      item.children = item.children.concat(expanded);
    }
  
    // get directories
    var dirs = _.filter(item.children, i =>{
      return i.isDirectory;
    });

    async.eachLimit(
      dirs,
      limit,
      (item, cb) => {
        _expandItem(item, $model)
          .then(() => {
            cb();
          })
          .catch(cb);
      },
      (err) => {
        if (err){
          def.reject(err);
        }

        def.resolve();
      }
    );

    return def.promise;
  }

  function _transform(items, callback){
    let limit = process.env.ASYNC_LIMIT || 2;

    var res = {};

    try {
      async.eachLimit(
        _.keys(items),
        limit,
        (key, cb) => {
          
          _transformItem(items[key], model.getModel())
            .then(() => {
              cb(null);
            })
            .catch(cb);

        },
        (err) => {
          if (err){
            return callback(err);
          }
          //fs.writeJsonSync('./transform.json', items);
          //console.dir(res);
          callback(null, items);
        }
      );
    } catch(err){
      callback(err);
    }
  }

  function _transformItem(item, $model){
    const def = Q.defer();
    let limit = process.env.ASYNC_LIMIT || 2;

    let res = item;

    // resolve files
    _tranformFiles(item, $model);

    // get directories
    var dirs = _.filter(item.children, i =>{
      return i.isDirectory;
    });

    async.eachLimit(
      dirs,
      limit,
      (item, cb) => {
        _transformItem(item, $model)
          .then(() => {
            cb();
          })
          .catch(cb);
      },
      (err) => {
        if (err){
          def.reject(err);
        }

        def.resolve();
      }
    );

    return def.promise;
  }

  function _tranformFiles(item, $model){

    var dyn = _.filter(item.children, c => {
      return c.isFile && c.dynamic === true;
    });

    item.children = _.filter(item.children, c => {
      return !c.isFile || !c.dynamic;
    });

    _.each(item.children, f => {
      if (f.isFile === true){
        if (f.auto){
          f.name = f.name.replace(/^@/i, '');
        } else {
          f.name = f.name;
        }
      }
    });

    _.each(dyn, f => {
      var items = _resolveAccesor(f.accesor, $model);

      var nfiles = _.map(_.keys(items), nn => {
        var nf = _.cloneDeep(f);

        nf.name = f.name.replace(f.directive, nn);
        
        nf.model = items[nn];

        delete nf.accesor;
        delete nf.directive;
        delete nf.dynamic;
        return nf;
      });

      //console.log(nfiles)

      item.children = item.children.concat(nfiles);
    });
  }

  function _reduce(items, callback){
    let limit = process.env.ASYNC_LIMIT || 2;

    var res = [];

    try {
      async.eachLimit(
        _.keys(items),
        limit,
        (key, cb) => {
          
          _reduceItem(items[key], './', res)
            .then(() => {
              cb(null);
            })
            .catch(cb);

        },
        (err) => {
          if (err){
            return callback(err);
          }
          //fs.writeJsonSync('./outputs.json', res);
          //console.dir(res);
          callback(null, res);
        }
      );
    } catch(err){
      callback(err);
    }
  }

  function _reduceItem(item, relative, files){
    let limit = process.env.ASYNC_LIMIT || 2;

    const def = Q.defer();

    _.each(item.children, c => {
      if (c.isFile === true) {
        c.output = path.join(output, relative, c.name);
        files.push(c);
      }
    });

    // get directories
    var dirs = _.filter(item.children, i =>{
      return i.isDirectory;
    });

    async.eachLimit(
      dirs,
      limit,
      (item, cb) => {
        let rel = path.join(relative, item.name);

        if (item.layer){
          let l = model.getLayer(item.layer);
          rel = path.join(relative, l);
        }

        _reduceItem(item, rel, files)
          .then(() => {
            cb();
          })
          .catch(cb);
      },
      (err) => {
        if (err){
          def.reject(err);
        }

        def.resolve();
      }
    );

    return def.promise;
  }

  function _resolveAccesor(accesor, model){

    // always return objects keys
    let props = accesor.split('.');
    var values = {};

    //if (props.length > 2){
    //  throw new Error('invalid accesor ' + accesor);
    //}

    if (props.length === 1){
      let items = model[accesor];

      if ('object' === typeof items){
        if (items instanceof Array){
          values = _.keyBy(items, i => {
            return i;
          });
        } else {
          values = items;
        }
      } else {
        values[items] = items;
      }

      return values;
    }

    if (_.get(model, accesor)){
      return _.get(model, accesor);
    }

    var a = props[0];
    var p = props[1];

    let items = model[a];

    if (items instanceof Array){
      values = _.keyBy(items, i => {
        return i[p];
      });
    } else {
      _.each(_.keys(items), key =>{
        values[items[key][p]] = items[key];
      });
    }

    return values;
  }
}