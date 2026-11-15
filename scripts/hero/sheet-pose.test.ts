import { test } from "node:test"
import assert from "node:assert/strict"
import { sheetPose, TILT } from "../../components/hero/sheetPose"

const FROM = 0.2
const TO = 0.3
const LENGTH = 0.1

test("a sheet waits below the stage until its turn", () => {
  assert.equal(sheetPose(0, 0, FROM, TO, LENGTH).y, 115)
  assert.equal(sheetPose(FROM, 0, FROM, TO, LENGTH).y, 115)
})

test("it lands in place at its resting tilt", () => {
  const pose = sheetPose(TO, 1, FROM, TO, LENGTH)
  assert.ok(Math.abs(pose.y) < 1e-9)
  assert.equal(pose.scale, 1)
  assert.ok(Math.abs(pose.rotate - TILT[1]) < 1e-9)
})

test("it only ever comes closer on the way in", () => {
  let last = Infinity
  for (let p = FROM; p <= TO; p += 0.005) {
    const { y } = sheetPose(p, 0, FROM, TO, LENGTH)
    assert.ok(y <= last)
    last = y
  }
})

test("after landing it keeps moving while the page scrolls", () => {
  const one = sheetPose(TO + LENGTH, 0, FROM, TO, LENGTH)
  const two = sheetPose(TO + 2 * LENGTH, 0, FROM, TO, LENGTH)
  assert.ok(one.y < 0 && two.y < one.y)
  assert.ok(two.scale < one.scale && one.scale < 1)
  // Tilts further the way it already leans.
  assert.ok(two.rotate < one.rotate && one.rotate < TILT[0])
})

test("the drift stops before the sheet leaves the stage", () => {
  const late = sheetPose(1, 0, FROM, TO, LENGTH)
  const later = sheetPose(5, 0, FROM, TO, LENGTH)
  assert.deepEqual(late, later)
  assert.ok(late.y > -15 && late.scale > 0.85)
})
