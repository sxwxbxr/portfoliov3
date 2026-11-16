import { test } from "node:test"
import assert from "node:assert/strict"
import { ASCENT, PACE, STATION, flight, presence, progressAt, route } from "../../components/hero/journey"

const r = route(4)

test("the journey ends on the picture it starts with", () => {
  assert.equal(flight(0, r).depth, 0)
  assert.equal(flight(1, r).depth, 0)
})

test("the camera sinks through the clouds, cruises under them and climbs out", () => {
  const depths = Array.from({ length: 201 }, (_, i) => flight(i / 200, r).depth)
  const low = depths.indexOf(2)
  const lastLow = depths.lastIndexOf(2)
  assert.ok(low > 0 && lastLow > low, "reaches cruising height and leaves it")
  for (let i = 1; i <= low; i++) assert.ok(depths[i] >= depths[i - 1], "only sinks on the way down")
  for (let i = lastLow + 1; i < depths.length; i++) assert.ok(depths[i] <= depths[i - 1], "only climbs on the way up")
  for (let i = low; i <= lastLow; i++) assert.equal(depths[i], 2)
})

test("every landmark and the gate are passed under the clouds, in order", () => {
  const stops = [...r.stations, r.shrine]
  stops.forEach((z, i) => {
    if (i > 0) assert.ok(z > stops[i - 1])
    const passing = flight(progressAt(z, 0, r), r)
    assert.ok(Math.abs(passing.z - z) < 1e-9)
    assert.equal(passing.depth, 2)
  })
  // The climb starts at the gate, not before it.
  assert.ok(Math.abs(r.shrine - PACE * (r.total - ASCENT)) < 1e-9)
})

test("a station's sheet waits, lies in place while its landmark is in view, then leaves", () => {
  assert.equal(presence(PACE * STATION + 2), -1)
  assert.equal(presence(12), 0)
  assert.equal(presence(7), 0)
  assert.equal(presence(4), 1)
  assert.ok(presence(13.5) < 0 && presence(13.5) > -1)
  assert.ok(presence(5.2) > 0 && presence(5.2) < 1)
})

test("only one sheet lies in place at a time", () => {
  for (let i = 0; i <= 400; i++) {
    const { z } = flight(i / 400, r)
    const inPlace = r.stations.filter((at) => presence(at - z) === 0)
    assert.ok(inPlace.length <= 1)
  }
})
