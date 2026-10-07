const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  const source = path.resolve(__dirname, "..", "temp_ds_current_wireframe", "ds-workflow-v2.html");
  const output = path.resolve(__dirname, "..", "temp_ds_current_wireframe", "screenshots", "00-ds-workflow.png");
  await page.goto(`file:///${source.replace(/\\/g, "/")}`, { waitUntil: "load" });
  await page.screenshot({ path: output, fullPage: true });
  await browser.close();
  console.log(output);
})();
