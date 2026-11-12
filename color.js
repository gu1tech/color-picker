/** Pure sRGB contrast calculations; thresholds use unrounded ratios. */
export const PALETTES = [
  { id: "indigo", name: "Indigo", colors: ["#49599b", "#7986cc", "#14306c"] },
  { id: "amber", name: "Amber", colors: ["#ff8f00", "#ffc046", "#c56000"] },
  { id: "orange", name: "Orange", colors: ["#ef6c00", "#ff9d3f", "#b53d00"] },
  { id: "green", name: "Green", colors: ["#2e7d32", "#60ad5e", "#005005"] },
  {
    id: "blue-grey",
    name: "Blue Grey",
    colors: ["#37474f", "#62727b", "#102027"],
  },
];

export function relativeLuminance(hex) {
  if (typeof hex !== "string" || !/^#[\da-f]{6}$/i.test(hex)) {
    throw new TypeError("Expected a six-digit HEX colour, such as #49599b.");
  }
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

export function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function contrastChecks(ratio) {
  if (!Number.isFinite(ratio) || ratio < 1 || ratio > 21) {
    throw new RangeError("Contrast ratio must be between 1 and 21.");
  }
  return { normalAA: ratio >= 4.5, largeAA: ratio >= 3 };
}

export function bestTextColor(background) {
  return contrastRatio("#ffffff", background) >
    contrastRatio("#000000", background)
    ? "#ffffff"
    : "#000000";
}
