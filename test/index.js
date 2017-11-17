import 'babel-polyfill';
import assert from 'assert';
import codebot from "../src"
import path from 'path';
import fs from 'fs-extra';

var modules = [
  path.resolve(path.join(__dirname, '/cases/angular')),
  path.resolve(path.join(__dirname, '/cases/server'))
];

var output = path.resolve(path.join(__dirname, '/outputs'));
var model = fs.readJsonSync(path.join(__dirname, '/cases/model.json'))

describe('codebot', function() {

  describe('#run', () => {

    it('should throw an Error when sources/output is not defined', (done) => {
      try {
        codebot({ loglevel: 'error' });
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should throw an Error when output is not defined', (done) => {
      try {
        codebot({ loglevel: 'error', modules: modules });
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should throw an Error when sources is not defined', (done) => {
      try {
        codebot({ loglevel: 'error', output: output });
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should be run wen sources/output are defined', () => {
      
      var cbot = codebot({ loglevel: 'error', modules: modules, output: output, model });
      assert.equal(typeof cbot, 'object', 'return an object');
      assert.equal(true, cbot['then'] !== undefined, 'need to be a promise');
    });

  });

});