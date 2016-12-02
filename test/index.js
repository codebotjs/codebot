import test from "tape"
import codebot from "../src"

test("codebot#creation", (t) => {
  t.plan(5)

  t.throws(() => codebot(), /error/i, "Should throw an Error when sources/output has not defined");
  t.throws(() => codebot({ sources: 'some/path' }), /error/i, "Should throw an Error when sources/output has not defined");
  t.throws(() => codebot({ output: 'some/path' }), /error/i, "Should throw an Error when sources/output has not defined");

  var cbot = codebot({ sources: 'some/path', output: 'some/path' });

  t.equal(typeof cbot, 'object', 'return an object');
  t.equal(true, cbot['then'] !== undefined, 'need to be a promise');
})