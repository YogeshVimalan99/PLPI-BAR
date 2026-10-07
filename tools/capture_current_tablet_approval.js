const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "temp_ds_current_wireframe", "index.html");
const output = path.join(root, "temp_ds_current_wireframe", "screenshots");
fs.mkdirSync(output, { recursive: true });

async function getTarget(page) {
  const frameHandle = await page.waitForSelector("iframe");
  const target = await frameHandle.contentFrame();
  await target.waitForSelector("#grc-wireframe");
  return target;
}

async function clearAnnotations(target) {
  await target.evaluate(() => {
    document.querySelectorAll(".ds-current-callout").forEach((node) => node.remove());
    document.querySelectorAll("[data-ds-current-target]").forEach((node) => {
      node.style.removeProperty("outline");
      node.style.removeProperty("outline-offset");
      node.style.removeProperty("box-shadow");
      node.removeAttribute("data-ds-current-target");
    });
  });
}

async function annotate(target, items) {
  await clearAnnotations(target);
  const missing = await target.evaluate((callouts) => {
    const absent = [];
    for (const item of callouts) {
      const element = document.querySelector(item.selector);
      if (!element) {
        absent.push(item.n);
        continue;
      }
      element.dataset.dsCurrentTarget = String(item.n);
      element.style.outline = "4px solid #c00000";
      element.style.outlineOffset = "-2px";
      element.style.boxShadow = "0 0 0 3px rgba(255,242,204,.95)";
      const rect = element.getBoundingClientRect();
      const badge = document.createElement("div");
      badge.className = "ds-current-callout";
      badge.textContent = String(item.n);
      Object.assign(badge.style, {
        position: "fixed",
        left: `${Math.max(5, Math.min(window.innerWidth - 38, rect.left - 12))}px`,
        top: `${Math.max(5, Math.min(window.innerHeight - 38, rect.top - 12))}px`,
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#c00000",
        color: "#fff",
        border: "3px solid #fff",
        boxShadow: "0 1px 5px rgba(0,0,0,.75)",
        font: "bold 16px Arial, sans-serif",
        lineHeight: "32px",
        textAlign: "center",
        zIndex: "2147483647",
        pointerEvents: "none",
      });
      document.body.appendChild(badge);
    }
    return absent;
  }, items);
  if (missing.length) throw new Error(`Missing callouts: ${missing.join(", ")}`);
}

async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(output, name),
    animations: "disabled",
  });
}

async function sign(page, target, selector) {
  const iframe = await page.locator("iframe").boundingBox();
  const box = await target.locator(selector).boundingBox();
  await page.mouse.move(iframe.x + box.x + 30, iframe.y + box.y + 45);
  await page.mouse.down();
  await page.mouse.move(iframe.x + box.x + 100, iframe.y + box.y + 75, { steps: 7 });
  await page.mouse.move(iframe.x + box.x + 175, iframe.y + box.y + 35, { steps: 7 });
  await page.mouse.up();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1 });
  await page.goto(`file:///${source.replace(/\\/g, "/")}`, { waitUntil: "load" });
  const target = await getTarget(page);

  await annotate(target, [
    { n: 1, selector: "#queue-screen .queue-summary" },
    { n: 2, selector: ".queue-filters" },
    { n: 3, selector: "#team-queue-tab" },
    { n: 4, selector: "#approval-queue-tab" },
    { n: 5, selector: "#team-queue-panel" },
  ]);
  await screenshot(page, "01-tablet-role-queues.png");

  await clearAnnotations(target);
  await target.locator('#team-queue-body tr[data-po^="C13628"] [data-open-delivery]').click();
  await annotate(target, [
    { n: 1, selector: ".stepper" },
    { n: 2, selector: ".prefill" },
    { n: 3, selector: '.screen[data-screen="0"] .split' },
    { n: 4, selector: "#driver-signature" },
    { n: 5, selector: "#to-checks" },
  ]);
  await screenshot(page, "02-tablet-delivery.png");

  await clearAnnotations(target);
  await target.locator("#driver-name").fill("A. Driver");
  await target.locator("#delivery-note").fill("DN-2026-0618");
  await sign(page, target, "#driver-signature");
  await target.locator("#to-checks").click();
  for (const name of ["clean", "nonpharma", "damage"]) {
    await target.locator(`input[name="${name}"][value="Yes"]`).check();
  }
  await target.locator("#receiver-name").fill("G. Receiver");
  await target.locator("#receiver-comments").fill("No exceptions observed.");
  await sign(page, target, "#receiver-signature");
  await annotate(target, [
    { n: 1, selector: ".stepper" },
    { n: 2, selector: '.screen[data-screen="1"] .check-list' },
    { n: 3, selector: '.screen[data-screen="1"] .split' },
    { n: 4, selector: "#receiver-signature" },
    { n: 5, selector: "#send-approval" },
  ]);
  await screenshot(page, "03-tablet-inspection-submit.png");

  await clearAnnotations(target);
  await target.locator("#send-approval").click();
  await target.locator("#approval-queue-tab").click();
  await target.locator('#approval-queue-body tr[data-po^="C13628"] [data-open-delivery]').click();
  await target.locator('input[name="confirmed"][value="Yes"]').check();
  await target.locator("#team-lead-name").fill("T. Lead");
  await target.locator("#approval-comments").fill("Information confirmed.");
  await sign(page, target, "#teamlead-signature");
  await target.locator("#confirm-record").check();
  await annotate(target, [
    { n: 1, selector: ".stepper" },
    { n: 2, selector: '.screen[data-screen="2"] .review-grid' },
    { n: 3, selector: '.screen[data-screen="2"] .check-list' },
    { n: 4, selector: '.screen[data-screen="2"] .split' },
    { n: 5, selector: "#confirm-record" },
    { n: 6, selector: "#complete-checklist" },
  ]);
  await screenshot(page, "04-tablet-lead-approval.png");

  await browser.close();
  console.log(`CAPTURED=${output}`);
})();
