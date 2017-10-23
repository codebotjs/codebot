import 'babel-polyfill';
import assert from 'assert';
import codebot from "../src"
import path from 'path';

var modules = [
  path.resolve(path.join(__dirname, '/cases/angular')),
  path.resolve(path.join(__dirname, '/cases/api'))
];

var output = path.resolve(path.join(__dirname, '/outputs'));

describe('codebot', function() {

  describe('#run', () => {

    it('should throw an Error when sources/output is not defined', (done) => {
      try {
        codebot();
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should throw an Error when output is not defined', (done) => {
      try {
        codebot({ modules: modules });
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should throw an Error when sources is not defined', (done) => {
      try {
        codebot({ output: output });
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should be run wen sources/output are defined', () => {
      
      var cbot = codebot({ modules: modules, output: output });
      assert.equal(typeof cbot, 'object', 'return an object');
      assert.equal(true, cbot['then'] !== undefined, 'need to be a promise');
    });

  });

});