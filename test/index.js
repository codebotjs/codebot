import test from "tape"
import codebot from "../src"

test("codebot", (t) => {
  t.plan(1)
  t.equal(true, codebot(), "return true")
})
