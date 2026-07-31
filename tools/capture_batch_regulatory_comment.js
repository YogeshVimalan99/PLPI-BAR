const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const output = path.resolve(__dirname, "..", "temp_scoped_update", "screenshots", "03-incomplete-pcl-regulatory-comment.png");
  const logFile = path.resolve(__dirname, "..", "temp_scoped_update", "batch-capture.log");
  const mark = (value) => fs.appendFileSync(logFile, new Date().toISOString() + " " + value + "\\n");
  fs.writeFileSync(logFile, "");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  mark("launch");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("dialog", async (dialog) => dialog.dismiss());
  await page.goto("http://127.0.0.1:9000/wireframe/index.html", { waitUntil: "load" });
  mark("loaded");
  await page.waitForFunction(() => typeof renderStage === "function");
  mark("app-ready");
  await page.evaluate(() => {
    document.querySelectorAll(".modal-backdrop").forEach((item) => item.classList.add("hidden"));
    document.body.classList.remove("pre-login");
    currentLogin = { user: "batch.checker", role: "Batch Checker" };
    isAuthenticated = true;
    ensureRpExampleWorkflows();
    rpPackWorkflows.C13719.status = "RPi Approved";
    rpApprovalSignoffs.C13719 = { user: "rp.user", role: "Responsible Person", dateTime: "31 Jul 2026, 15:20:00" };
    batchCheckerSelectedPo = "C13719";
    batchCheckerDashboardOpen = true;
    renderStage("batch-checker");
  });
  mark("batch-rendered");
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const rows = getBatchCheckerRows();
    selectedBatchCheckerRowKey = 0;
    const row = rows[0];
    const rowKey = getBatchCheckerRowKey(row);
    const checks = Array(getBatchCheckerVerificationItems(row).length).fill(true);
    checks[checks.length - 1] = false;
    batchCheckerDetailChecks[rowKey] = checks;
    batchCheckerCheckedRows[rowKey] = true;
    batchCheckerVerifiedRows[rowKey] = { checker: "batch.checker", role: "Batch Checker", date: "31-07-2026", time: "15:25:00" };
    openGeneratePclPopup();
  });
  mark("popup-called");
  await page.waitForSelector("#generate-pcl-modal:not(.hidden) #batchchecker-pcl-regulatory-notice", { timeout: 15000 });
  mark("popup-visible");
  const body = page.locator("#generate-pcl-modal .confirm-body");
  await body.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await page.waitForTimeout(250);
  mark("scrolled");
  await page.evaluate(() => {
    document.querySelectorAll(".scoped-callout").forEach((item) => item.remove());
    const app = document.querySelector(".plpi-app");
    app.style.position = "relative";
    const appRect = app.getBoundingClientRect();
    const selectors = ["#batchchecker-pcl-regulatory-notice", "#batchchecker-pcl-comments", "#pcl-clearance-submit-btn"];
    selectors.forEach((selector, index) => {
      const target = document.querySelector(selector);
      target.style.outline = "4px solid #c00000";
      target.style.outlineOffset = "-2px";
      const rect = target.getBoundingClientRect();
      const badge = document.createElement("div");
      badge.className = "scoped-callout";
      badge.textContent = String(index + 1);
      Object.assign(badge.style, {
        position: "absolute", left: `${Math.max(4, rect.left - appRect.left - 13)}px`,
        top: `${Math.max(4, rect.top - appRect.top - 13)}px`, width: "30px", height: "30px",
        borderRadius: "50%", background: "#c00000", color: "#fff", border: "3px solid #fff",
        boxShadow: "0 1px 5px rgba(0,0,0,.7)", font: "bold 16px Arial, sans-serif",
        lineHeight: "30px", textAlign: "center", zIndex: "2147483647", pointerEvents: "none"
      });
      app.appendChild(badge);
    });
  });
  mark("annotated");
  await page.screenshot({ path: output });
  mark("captured");
  await browser.close();
  mark("closed");
  console.log(output);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


