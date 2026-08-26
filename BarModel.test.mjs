import assert from "node:assert/strict"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const { stableArray } = require("./BarModel.js")

test("stableArray preserves identity when widget ids are unchanged", () => {
  const current = ["omarchy.weather", "io.github.edwardcaf.sky-map"]
  assert.strictEqual(stableArray(current, [...current]), current)
})

test("stableArray copies changed widget ids", () => {
  const current = ["omarchy.weather"]
  const requested = ["omarchy.weather", "io.github.edwardcaf.sky-map"]
  const result = stableArray(current, requested)

  assert.deepEqual(result, requested)
  assert.notStrictEqual(result, current)
  assert.notStrictEqual(result, requested)
})

test("stableArray normalizes missing arrays", () => {
  assert.deepEqual(stableArray(undefined, undefined), [])
})
