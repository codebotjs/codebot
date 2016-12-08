import 'babel-polyfill';
import assert from 'assert';
import codebot from "../src"

describe('codebot', function() {

  describe('#run', () => {

    it('should throw an Error when sources/output has not defined', (done) => {
      try {
        codebot();
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should throw an Error when output has not defined', (done) => {
      try {
        codebot({ sources: 'some/path' });
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should throw an Error when sources has not defined', (done) => {
      try {
        codebot({ output: 'some/path' });
        done(new Error('Can\t be run this'));
      } catch(err){
        done();
      }
    });

    it('should be run wen sources/output are defined', () => {
      var cbot = codebot({ sources: 'some/path', output: 'some/path' });
      assert.equal(typeof cbot, 'object', 'return an object');
      assert.equal(true, cbot['then'] !== undefined, 'need to be a promise');
    });

  });

});