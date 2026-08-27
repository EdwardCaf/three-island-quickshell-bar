import assert from "node:assert/strict"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const {
  customModulePath,
  customModuleType,
  entryCount,
  finiteNumber,
  inlineSettingsDelta,
  nearestDropTarget,
  pickPanelSlot,
  pinTrayToInner,
  resolvedModulePath,
  stableArray,
} = require("./BarModel.js")

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

test("pinTrayToInner preserves duplicate tray entries", () => {
  const first = { id: "omarchy.tray", label: "first" }
  const second = { id: "omarchy.tray", label: "second" }
  assert.deepEqual(pinTrayToInner(["clock", first, second], "right"), [first, second, "clock"])
  assert.deepEqual(pinTrayToInner([first, "clock", second], "left"), ["clock", first, second])
})

test("entryCount identifies ambiguous duplicate ids", () => {
  assert.equal(entryCount(["clock", { id: "clock" }, "tray"], "clock"), 2)
  assert.equal(entryCount(undefined, "clock"), 0)
})

test("inlineSettingsDelta returns settings-only updates", () => {
  const current = { left: [{ id: "clock", format: "HH:mm" }], center: [], right: [] }
  const next = { left: [{ id: "clock", format: "HH:mm:ss" }], center: [], right: [] }
  assert.deepEqual(inlineSettingsDelta(current, next), [
    { region: "left", index: 0, entry: next.left[0] },
  ])
})

test("inlineSettingsDelta rejects structural, custom, and duplicate changes", () => {
  const empty = { left: [], center: [], right: [] }
  assert.equal(inlineSettingsDelta(empty, { ...empty, left: ["clock"] }), null)
  assert.equal(inlineSettingsDelta(
    { ...empty, left: [{ id: "script", exec: "date" }] },
    { ...empty, left: [{ id: "script", exec: "uptime" }] },
  ), null)
  assert.equal(inlineSettingsDelta(
    { ...empty, left: [{ id: "clock", value: 1 }, { id: "clock", value: 1 }] },
    { ...empty, left: [{ id: "clock", value: 2 }, { id: "clock", value: 1 }] },
  ), null)
})

test("customModuleType accepts known explicit types and ignores unknown ones", () => {
  assert.equal(customModuleType({ id: "x", type: "command" }), "command")
  assert.equal(customModuleType({ id: "x", type: "qml" }), "qml")
  assert.equal(customModuleType({ id: "x", type: "unknown" }), "")
  assert.equal(customModuleType({ id: "x", exec: "date" }), "command")
})

test("customModulePath confines sources unless explicitly allowed", () => {
  const config = "/home/test/.config/omarchy"
  const base = `${config}/bar/modules`
  assert.equal(customModulePath({ id: "clock" }, "/home/test", config), `${base}/clock.qml`)
  assert.equal(customModulePath({ id: "x", source: "nested/x.qml" }, "/home/test", config), `${base}/nested/x.qml`)
  assert.equal(customModulePath({ id: "x", source: "../../secret.qml" }, "/home/test", config), "")
  assert.equal(customModulePath({ id: "x", source: "/tmp/x.qml" }, "/home/test", config), "")
  assert.equal(customModulePath({ id: "x", source: "/tmp/x.qml", allowExternalSource: true }, "/home/test", config), "/tmp/x.qml")
})

test("resolvedModulePath accepts only realpath output beneath the module directory", () => {
  const config = "/home/test/.config/omarchy"
  assert.equal(resolvedModulePath("nested/x.qml", config), `${config}/bar/modules/nested/x.qml`)
  assert.equal(resolvedModulePath("/tmp/x.qml", config), "")
  assert.equal(resolvedModulePath("../x.qml", config), "")
})

test("finiteNumber falls back and clamps malformed settings", () => {
  assert.equal(finiteNumber("bad", 5, 1, 10), 5)
  assert.equal(finiteNumber(Infinity, 5, 1, 10), 5)
  assert.equal(finiteNumber(-3, 5, 1, 10), 1)
  assert.equal(finiteNumber(30, 5, 1, 10), 10)
})

test("pickPanelSlot prefers an open panel before the focused screen", () => {
  const left = { visible: true, width: 10, height: 10 }
  const right = { visible: true, width: 10, height: 10 }
  assert.equal(pickPanelSlot([
    { slot: left, screenName: "left", opened: false },
    { slot: right, screenName: "right", opened: true },
  ], "left"), right)
})

test("nearestDropTarget selects the closest insertion edge", () => {
  const first = { id: "first" }
  const second = { id: "second" }
  assert.deepEqual(nearestDropTarget([
    { slot: first, x: 10, y: 0, width: 20, height: 10 },
    { slot: second, x: 40, y: 0, width: 20, height: 10 },
  ], { x: 58, y: 5 }, false), { slot: second, after: true })
})
