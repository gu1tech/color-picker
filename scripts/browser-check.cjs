const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  try {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(process.env.COLOR_PICKER_URL || "http://127.0.0.1:8080");
    await page.locator(".shade-card").first().waitFor();
    assert.equal(await page.locator(".shade-card").count(), 3);
    assert.equal(
      await page.locator('.palette-button[aria-pressed="true"]').innerText(),
      "Indigo",
    );
    for (const [name, hex] of [
      ["Amber", "#ff8f00"],
      ["Orange", "#ef6c00"],
      ["Green", "#2e7d32"],
      ["Blue Grey", "#37474f"],
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
      assert.equal(await page.locator(".hex-code").first().inputValue(), hex);
      assert.equal(
        await page.locator('.palette-button[aria-pressed="true"]').count(),
        1,
      );
    }
    await page.getByRole("button", { name: "Reset to Indigo" }).click();
    assert.equal(
      await page.locator(".hex-code").first().inputValue(),
      "#49599b",
    );
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.copied = text;
          },
        },
      }),
    );
    await page
      .getByRole("button", {
        name: "Copy HEX for Indigo Primary: #49599b",
        exact: true,
      })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Copied #49599b" })
      .waitFor();
    assert.equal(await page.evaluate(() => window.copied), "#49599b");
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw Error("Denied");
          },
        },
      }),
    );
    await page
      .getByRole("button", {
        name: "Copy HEX for Indigo Primary: #49599b",
        exact: true,
      })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Copy unavailable" })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () =>
          document.activeElement.selectionEnd -
          document.activeElement.selectionStart,
      ),
      7,
    );
    await page.getByRole("button", { name: "Amber", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#selection").innerText(), "Amber palette");
    await page.getByRole("button", { name: "Reset to Indigo" }).click();
    const axe = await new AxeBuilder({ page })
      .exclude(".text-samples")
      .analyze();
    assert.deepEqual(
      axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      [],
    );
    if (process.env.UPDATE_PREVIEW === "1") {
      const path = require("node:path");
      await page.screenshot({
        path: path.join(__dirname, "../docs/preview.png"),
        fullPage: true,
      });
    }
    for (const width of [375, 820, 840, 1024, 1440]) {
      await page.setViewportSize({ width, height: 812 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Page overflows at ${width}px`,
      );
      assert.equal(
        await page
          .locator(".contrast-table")
          .evaluateAll((tables) =>
            tables.some(
              (table) => table.scrollWidth > table.parentElement.clientWidth,
            ),
          ),
        false,
        `Table overflows at ${width}px`,
      );
    }

    assert.deepEqual(errors, []);
    console.log(
      "Browser checks passed: all palettes, reset, keyboard, copy success and denial fallback, mobile overflow and axe (intentional text samples excluded).",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
