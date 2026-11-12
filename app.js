import {
  PALETTES,
  contrastRatio,
  contrastChecks,
  bestTextColor,
} from "./color.js";

const palettes = document.querySelector("#palettes");
const shades = document.querySelector("#shades");
const selection = document.querySelector("#selection");
const status = document.querySelector("#status");
const variantNames = ["Primary", "Light", "Dark"];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function copyColor(hex, input) {
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(hex);
    status.textContent = `Copied ${hex} to clipboard.`;
  } catch {
    input.focus();
    input.select();
    status.textContent = `Copy unavailable. ${hex} is selected; use your keyboard or device menu to copy it.`;
  }
}

function makeCard(hex, variant, paletteName) {
  const card = element("article", "shade-card");
  const swatch = element("div", "swatch");
  swatch.style.backgroundColor = hex;
  swatch.style.color = bestTextColor(hex);
  const heading = element("h3", "", variant);
  swatch.append(heading, element("span", "swatch-sample", "Aa"));

  const body = element("div", "card-body");
  const copyRow = element("div", "copy-row");
  const input = element("input", "hex-code");
  input.value = hex;
  input.readOnly = true;
  input.setAttribute("aria-label", `${paletteName} ${variant} HEX value`);
  const copy = element("button", "copy-button", "Copy HEX");
  copy.type = "button";
  copy.setAttribute(
    "aria-label",
    `Copy HEX for ${paletteName} ${variant}: ${hex}`,
  );
  copy.addEventListener("click", () => copyColor(hex, input));
  copyRow.append(input, copy);

  const table = element("table", "contrast-table");
  const caption = element(
    "caption",
    "visually-hidden",
    `${paletteName} ${variant} text contrast`,
  );
  const head = element("thead");
  const headerRow = element("tr");
  for (const label of ["Text", "Ratio", "Normal AA", "Large AA"]) {
    const cell = element("th", "", label);
    cell.scope = "col";
    headerRow.append(cell);
  }
  head.append(headerRow);
  const rows = element("tbody");
  for (const [label, foreground] of [
    ["White", "#ffffff"],
    ["Black", "#000000"],
  ]) {
    const ratio = contrastRatio(foreground, hex);
    const checks = contrastChecks(ratio);
    const row = element("tr");
    const name = element("th", "", label);
    name.scope = "row";
    row.append(name, element("td", "ratio", `${ratio.toFixed(2)}:1`));
    for (const passes of [checks.normalAA, checks.largeAA]) {
      const cell = element("td");
      cell.append(
        element(
          "span",
          passes ? "badge pass" : "badge fail",
          passes ? "Pass" : "Fail",
        ),
      );
      row.append(cell);
    }
    rows.append(row);
  }
  table.append(caption, head, rows);

  const samples = element("div", "text-samples");
  samples.style.backgroundColor = hex;
  for (const [label, foreground] of [
    ["White", "#ffffff"],
    ["Black", "#000000"],
  ]) {
    const sample = element("div", "text-sample");
    sample.style.color = foreground;
    sample.append(
      element("span", "sample-normal", `${label} text at 16px`),
      element("span", "sample-large", "Aa at 24px"),
    );
    samples.append(sample);
  }
  body.append(copyRow, table, samples);
  card.append(swatch, body);
  return card;
}

function selectPalette(palette, announce = true) {
  for (const button of palettes.querySelectorAll("button")) {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.palette === palette.id),
    );
  }
  selection.textContent = `${palette.name} palette`;
  shades.replaceChildren(
    ...palette.colors.map((hex, index) =>
      makeCard(hex, variantNames[index], palette.name),
    ),
  );
  status.textContent = announce ? `${palette.name} palette selected.` : "";
}

for (const palette of PALETTES) {
  const button = element("button", "palette-button");
  button.type = "button";
  button.dataset.palette = palette.id;
  button.setAttribute("aria-pressed", "false");
  const dot = element("span", "palette-dot");
  dot.style.backgroundColor = palette.colors[0];
  dot.setAttribute("aria-hidden", "true");
  button.append(dot, element("span", "", palette.name));
  button.addEventListener("click", () => selectPalette(palette));
  palettes.append(button);
}

document
  .querySelector("#reset")
  .addEventListener("click", () => selectPalette(PALETTES[0]));
selectPalette(PALETTES[0], false);
