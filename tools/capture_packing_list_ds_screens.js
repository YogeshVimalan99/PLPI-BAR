const { chromium } = require("playwright");
const path = require("path");

async function clearOverlays(page) {
  await page.evaluate(() => document.querySelectorAll("[data-ds-overlay]").forEach((node) => node.remove()));
}

async function addBox(page, locator, number, padding = 5) {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Unable to locate callout ${number}`);
  await page.evaluate(({ box, number, padding }) => {
    const outline = document.createElement("div");
    outline.dataset.dsOverlay = "true";
    Object.assign(outline.style, {
      position: "fixed",
      left: `${box.x - padding}px`,
      top: `${box.y - padding}px`,
      width: `${box.width + padding * 2}px`,
      height: `${box.height + padding * 2}px`,
      border: "4px solid #d00000",
      borderRadius: "3px",
      zIndex: "999998",
      pointerEvents: "none",
    });
    document.body.appendChild(outline);

    const badge = document.createElement("div");
    badge.dataset.dsOverlay = "true";
    badge.textContent = String(number);
    Object.assign(badge.style, {
      position: "fixed",
      left: `${Math.max(4, box.x - padding - 12)}px`,
      top: `${Math.max(4, box.y - padding - 12)}px`,
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      background: "#d00000",
      border: "3px solid white",
      color: "white",
      font: "bold 17px Arial",
      lineHeight: "24px",
      textAlign: "center",
      boxShadow: "0 1px 4px rgba(0,0,0,.45)",
      zIndex: "999999",
      pointerEvents: "none",
    });
    document.body.appendChild(badge);
  }, { box, number, padding });
}

async function addCombinedBox(page, locators, number, padding = 5) {
  const boxes = [];
  for (const locator of locators) {
    const box = await locator.boundingBox();
    if (box) boxes.push(box);
  }
  if (!boxes.length) throw new Error(`Unable to locate combined callout ${number}`);
  const left = Math.min(...boxes.map((b) => b.x));
  const top = Math.min(...boxes.map((b) => b.y));
  const right = Math.max(...boxes.map((b) => b.x + b.width));
  const bottom = Math.max(...boxes.map((b) => b.y + b.height));
  await page.evaluate(({ box, number, padding }) => {
    const outline = document.createElement("div");
    outline.dataset.dsOverlay = "true";
    Object.assign(outline.style, {
      position: "fixed",
      left: `${box.x - padding}px`,
      top: `${box.y - padding}px`,
      width: `${box.width + padding * 2}px`,
      height: `${box.height + padding * 2}px`,
      border: "4px solid #d00000",
      borderRadius: "3px",
      zIndex: "999998",
      pointerEvents: "none",
    });
    document.body.appendChild(outline);
    const badge = document.createElement("div");
    badge.dataset.dsOverlay = "true";
    badge.textContent = String(number);
    Object.assign(badge.style, {
      position: "fixed",
      left: `${Math.max(4, box.x - padding - 12)}px`,
      top: `${Math.max(4, box.y - padding - 12)}px`,
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      background: "#d00000",
      border: "3px solid white",
      color: "white",
      font: "bold 17px Arial",
      lineHeight: "24px",
      textAlign: "center",
      boxShadow: "0 1px 4px rgba(0,0,0,.45)",
      zIndex: "999999",
      pointerEvents: "none",
    });
    document.body.appendChild(badge);
  }, { box: { x: left, y: top, width: right - left, height: bottom - top }, number, padding });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const source = path.resolve(__dirname, "..", "wireframe", "index.html");
  const outputDir = path.resolve(__dirname, "..", "temp_ds_current_wireframe", "screenshots");
  await page.goto(`file:///${source.replace(/\\/g, "/")}`, { waitUntil: "load" });
  await page.getByRole("button", { name: "Packing List", exact: true }).first().click();
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.waitForSelector('[data-packing-tab="view"]');

  await page.locator('[data-packing-tab="view"]').click();
  await page.waitForSelector("[data-packing-search]");
  await page.locator(".packing-list-window .packing-grid-shell.tall").evaluate((element) => { element.scrollLeft = 700; });
  await clearOverlays(page);
  await addBox(page, page.locator('[data-packing-tab="view"]'), 1, 4);
  await addBox(page, page.locator(".packing-view-search-row"), 2, 5);
  await addCombinedBox(page, [
    page.getByRole("columnheader", { name: "QTY", exact: true }),
    page.getByRole("columnheader", { name: "BOXES", exact: true }),
    page.getByRole("columnheader", { name: "VERIFY & PRINT", exact: true }),
  ], 3, 3);
  await addBox(page, page.getByRole("columnheader", { name: "LOG", exact: true }), 4, 3);
  await page.screenshot({ path: path.join(outputDir, "05-packing-list-view.png"), fullPage: true });

  await clearOverlays(page);
  await page.locator('[data-packing-tab="add"]').click();
  await page.waitForSelector("#pl-add-po-input");
  await page.locator("#pl-add-po-input").fill("C13719");
  await page.locator("#pl-add-search-btn").click();
  await page.waitForSelector(".add-doc-upload-panel");
  await clearOverlays(page);
  await addBox(page, page.locator('[data-packing-tab="add"]'), 1, 4);
  await addBox(page, page.locator(".packing-add-search-row"), 2, 5);
  await addBox(page, page.locator(".add-doc-upload-panel"), 3, 6);
  await addBox(page, page.locator("#pl-add-save-btn"), 4, 5);
  await page.screenshot({ path: path.join(outputDir, "06-packing-list-add-uploads.png"), fullPage: true });

  await browser.close();
  console.log(path.join(outputDir, "05-packing-list-view.png"));
  console.log(path.join(outputDir, "06-packing-list-add-uploads.png"));
})();
