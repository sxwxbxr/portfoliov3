import { test } from "node:test"
import assert from "node:assert/strict"
import { route } from "../../components/hero/journey"
import { cruiseAt, floorAt, heightAt, rowAt, type Land } from "../../components/hero/terrain"

const r = route(4)
const land: Land = {
  shrine: r.shrine,
  features: [
    { z: r.stations[0], x: 2.7, shape: "knoll" },
    { z: r.stations[1], x: 2, shape: "level" },
    { z: r.stations[2], x: 4.2, shape: "massif" },
    { z: r.stations[3], x: 2.8, shape: "knoll" },
  ],
}
const CAMERA = 2
const along = Array.from({ length: Math.ceil(r.shrine) + 1 }, (_, z) => z)

test("the path lies level across its width, whatever stands beside it", () => {
  for (const z of along) {
    const row = rowAt(z, land)
    for (const x of [-1.05, -0.75, 0, 0.75, 1.05]) assert.equal(heightAt(x, row), row.floor)
  }
})

test("the camera clears the ground it flies over", () => {
  for (const z of along) {
    const cam = cruiseAt(z, land, CAMERA)
    for (let d = 0; d <= 6; d += 0.5) assert.ok(cam - floorAt(z + d, land) > 1, `too low at ${z} + ${d}`)
  }
})

test("the valley ahead never rises over the horizon, so the sun and the gate stay in view", () => {
  for (const z of along) {
    const cam = cruiseAt(z, land, CAMERA)
    for (let d = 1; d <= 60; d++) assert.ok(floorAt(z + d, land) < cam, `the path hides the view at ${z} + ${d}`)
  }
})

test("the land is not flat: hills to both sides, higher further out", () => {
  let highest = 0
  for (const z of along) {
    const row = rowAt(z, land)
    for (const side of [-1, 1]) {
      assert.ok(heightAt(side * 60, row) > row.floor + 2, `no range at ${z}`)
      highest = Math.max(highest, heightAt(side * 14, row) - row.floor)
    }
  }
  assert.ok(highest > 3, "no hill worth the name near the path")
})

test("every landmark stands in a clearing", () => {
  for (const feature of land.features) {
    const row = rowAt(feature.z, land)
    assert.ok(row.right >= feature.x + 4, "the hills leave it no room")
  }
})

test("behind the mountain the path climbs through a pass between high walls", () => {
  const z = r.stations[2] + 6.4
  const row = rowAt(z, land)
  assert.ok(row.floor > floorAt(z, { ...land, features: [] }) + 1, "the path does not climb")
  assert.ok(heightAt(-12, row) - row.floor > 5, "no wall on the left")
  assert.ok(heightAt(row.right + 12, row) - row.floor > 5, "no wall on the right")
})

test("the shrine stands on a plateau that falls away behind the gate", () => {
  const before = { ...land, shrine: 1e6 }
  assert.ok(floorAt(r.shrine, land) > floorAt(r.shrine, before) + 1.5)
  assert.ok(floorAt(r.shrine + 8, land) < floorAt(r.shrine, land) - 5)
  // The camera does not follow the ground down.
  assert.ok(cruiseAt(r.shrine + 8, land, CAMERA) > floorAt(r.shrine, land))
})
