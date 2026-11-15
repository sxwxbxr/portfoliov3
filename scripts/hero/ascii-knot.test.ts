/**
 * The hero knot is drawn into a <pre>, so its output has to be a rectangle of
 * exactly rows x cols and must contain a visible shape at every morph value.
 * Run: npx tsx --test scripts/hero/ascii-knot.test.ts
 */
import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { renderKnot } from "../../components/hero/asciiKnot"

describe("renderKnot", () => {
  for (const morph of [0, 0.5, 1]) {
    it(`returns a filled ${72}x${40} block at morph ${morph}`, () => {
      const lines = renderKnot(1.3, morph, { cols: 72, rows: 40 }).split("\n")
      assert.equal(lines.pop(), "")
      assert.equal(lines.length, 40)
      assert.ok(lines.every((line) => line.length === 72))
      const inked = lines.join("").replace(/ /g, "").length
      assert.ok(inked > 300, `only ${inked} cells drawn`)
    })
  }

  it("keeps the shape inside the block instead of clipping at the edges", () => {
    const lines = renderKnot(0.4, 0, { cols: 72, rows: 40 }).split("\n").slice(0, 40)
    assert.equal(lines[0].trim(), "")
    assert.equal(lines[39].trim(), "")
  })
})
