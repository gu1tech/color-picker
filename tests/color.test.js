import test from "node:test";
import assert from "node:assert/strict";
import {
  PALETTES,
  relativeLuminance,
  contrastRatio,
  contrastChecks,
  bestTextColor,
} from "../color.js";

test("black and white have luminance endpoints and 21:1 contrast", () => {
  assert.equal(relativeLuminance("#000000"), 0);
  assert.equal(relativeLuminance("#ffffff"), 1);
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
});

test("contrast is symmetric and identical colours have 1:1 contrast", () => {
  assert.equal(
    contrastRatio("#49599b", "#7986cc"),
    contrastRatio("#7986cc", "#49599b"),
  );
  assert.equal(contrastRatio("#49599b", "#49599b"), 1);
});

test("known sRGB gray values straddle the normal-text AA threshold", () => {
  assert.ok(
    Math.abs(contrastRatio("#ffffff", "#777777") - 4.4780894536) < 1e-9,
  );
  assert.equal(
    contrastChecks(contrastRatio("#ffffff", "#777777")).normalAA,
    false,
  );
  assert.equal(
    contrastChecks(contrastRatio("#ffffff", "#767676")).normalAA,
    true,
  );
});

test("AA classification uses the full ratio, not its rounded display", () => {
  assert.deepEqual(contrastChecks(4.499), { normalAA: false, largeAA: true });
  assert.deepEqual(contrastChecks(4.5), { normalAA: true, largeAA: true });
  assert.deepEqual(contrastChecks(2.999), { normalAA: false, largeAA: false });
  assert.deepEqual(contrastChecks(3), { normalAA: false, largeAA: true });
});

test("HEX validation is strict and accepts uppercase", () => {
  assert.equal(relativeLuminance("#FFFFFF"), 1);
  for (const input of ["#fff", "ffffff", "#gggggg", "#ffffffff", null, 123]) {
    assert.throws(() => relativeLuminance(input), TypeError);
  }
});

test("invalid ratios are rejected", () => {
  for (const ratio of [NaN, Infinity, 0, 22, "4.5"]) {
    assert.throws(() => contrastChecks(ratio), RangeError);
  }
});

test("every palette has three valid shades and unique identity", () => {
  assert.equal(new Set(PALETTES.map((p) => p.id)).size, 5);
  for (const palette of PALETTES) {
    assert.equal(palette.colors.length, 3);
    for (const hex of palette.colors) {
      const foreground = bestTextColor(hex);
      assert.ok(contrastRatio(foreground, hex) >= 4.5);
    }
  }
});
