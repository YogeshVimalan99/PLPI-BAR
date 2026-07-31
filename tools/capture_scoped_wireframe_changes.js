const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "temp_scoped_update", "screenshots");
fs.mkdirSync(outputDir, { recursive: true });

async function initialise(page, source) {
  await page.evaluate((script) => {
    document.querySelectorAll(".modal-backdrop").forEach((item) => item.classList.add("hidden"));
    document.body.classList.remove("pre-login");
    window.eval(script);
  }, source);
  await page.waitForTimeout(350);
}

async function annotate(page, items) {
  const result = await page.evaluate((callouts) => {
    document.querySelectorAll(".scoped-callout").forEach((item) => item.remove());
    document.querySelectorAll("[data-scoped-target]").forEach((item) => {
      item.style.removeProperty("outline");
      item.style.removeProperty("outline-offset");
      item.style.removeProperty("box-shadow");
      item.removeAttribute("data-scoped-target");
    });
    const app = document.querySelector(".plpi-app");
    if (!app) return { missing: callouts.map((item) => item.n) };
    app.style.position = "relative";
    const appRect = app.getBoundingClientRect();
    const missing = [];
    for (const item of callouts) {
      const matches = Array.from(document.querySelectorAll(item.selector));
      const target = matches[item.index || 0];
      if (!target) {
        missing.push(item.n);
        continue;
      }
      target.dataset.scopedTarget = String(item.n);
      target.style.outline = "4px solid #c00000";
      target.style.outlineOffset = "-2px";
      target.style.boxShadow = "0 0 0 3px rgba(255,242,204,.95)";
      const rect = target.getBoundingClientRect();
      const badge = document.createElement("div");
      badge.className = "scoped-callout";
      badge.textContent = String(item.n);
      Object.assign(badge.style, {
        position: "absolute",
        left: `${Math.max(4, Math.min(appRect.width - 34, rect.left - appRect.left - 13))}px`,
        top: `${Math.max(4, Math.min(appRect.height - 34, rect.top - appRect.top - 13))}px`,
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: "#c00000",
        color: "#fff",
        border: "3px solid #fff",
        boxShadow: "0 1px 5px rgba(0,0,0,.7)",
        font: "bold 16px Arial, sans-serif",
        lineHeight: "30px",
        textAlign: "center",
        zIndex: "2147483647",
        pointerEvents: "none",
      });
      app.appendChild(badge);
    }
    return { missing };
  }, items);
  if (result.missing.length) throw new Error(`Missing callouts: ${result.missing.join(", ")}`);
}

async function capture(page, name) {
  await page.locator(".plpi-app").screenshot({
    path: path.join(outputDir, name),
    animations: "disabled",
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

  await page.goto("http://127.0.0.1:9000/wireframe/index.html", { waitUntil: "load" });
  await page.waitForFunction(() => typeof renderStage === "function");

  await initialise(page, `
    currentLogin = { user: 'rp.user', role: 'Responsible Person' };
    isAuthenticated = true;
    ensureRpExampleWorkflows();
    packingListGenerated = true;
    selectedRpApprovalPo = 'C13719';
    rpiModuleView = 'tasks';
    const workflow = rpPackWorkflows['C13719'];
    workflow.status = 'Signed Off';
    workflow.signoff = { user: 'goods.in', dateTime: '31 Jul 2026, 15:00:00' };
    workflow.documents.forEach((doc) => {
      doc.uploaded = true;
      doc.fileName = doc.fileName || ('C13719_' + doc.name.replace(/\\s+/g, '_') + '.pdf');
    });
    workflow.rpTaskViewedDocs = {};
    workflow.documents.forEach((doc) => approveRpTaskDocument('C13719', doc.id));
    approveRpTaskPackingList('C13719');
    workflow.rpChecklistOpen = true;
    renderStage('rp-pack');
  `);
  const checklistPanel = page.locator(".rp-task-checklist-scroll-panel");
  await checklistPanel.evaluate((element) => {
    element.style.flex = "0 0 610px";
    element.style.height = "610px";
    element.style.minHeight = "610px";
    element.scrollTop = 0;
  });
  await annotate(page, [
    { n: 1, selector: ".modern-checklist-section:nth-of-type(1)" },
    { n: 2, selector: ".modern-check-card:has([data-rp-field='eori']) .rp-auto-verified-note" },
    { n: 3, selector: ".modern-check-card:has([data-rp-field='transporter']) .rp-auto-verified-note" },
    { n: 4, selector: ".modern-check-card:has([data-rp-field='temp-transit']) .rp-auto-verified-note" },
  ]);
  await capture(page, "01-rpi-approval-auto-mapped-top.png");

  await page.evaluate(() => {
    document.querySelectorAll(".scoped-callout").forEach((item) => item.remove());
    const panel = document.querySelector(".rp-task-checklist-scroll-panel");
    panel.querySelectorAll(".modern-checklist-section").forEach((section, index) => {
      section.style.display = index < 3 ? "none" : "block";
    });
    panel.scrollTop = 0;
  });
  await annotate(page, [
    { n: 1, selector: ".modern-checklist-section:nth-of-type(4)" },
    { n: 2, selector: ".modern-check-card:has([data-rp-field='art51-decl']) .rp-auto-verified-note" },
    { n: 3, selector: ".modern-check-card:has([data-rp-field='fmd-compliance']) .rp-auto-verified-note" },
    { n: 4, selector: ".modern-check-card:has([data-rp-field='fmd-decom']) .rp-auto-verified-note" },
  ]);
  await capture(page, "02-rpi-approval-auto-mapped-regulatory.png");

  await initialise(page, `
    currentLogin = { user: 'batch.checker', role: 'Batch Checker' };
    isAuthenticated = true;
    ensureRpExampleWorkflows();
    rpPackWorkflows['C13719'].status = 'RPi Approved';
    rpApprovalSignoffs['C13719'] = { user: 'rp.user', role: 'Responsible Person', dateTime: '31 Jul 2026, 15:20:00' };
    batchCheckerSelectedPo = 'C13719';
    batchCheckerDashboardOpen = true;
    selectedBatchCheckerRowKey = 0;
    renderStage('batch-checker');
    const rows = getBatchCheckerRows();
    const row = rows[0];
    const rowKey = getBatchCheckerRowKey(row);
    batchCheckerDetailChecks[rowKey] = Array(getBatchCheckerVerificationItems(row).length).fill(true);
    batchCheckerDetailChecks[rowKey][15] = false;
    batchCheckerCheckedRows[rowKey] = true;
    batchCheckerVerifiedRows[rowKey] = { checker: 'batch.checker', role: 'Batch Checker', date: '31-07-2026', time: '15:25:00' };
    openGeneratePclPopup();
  `);
  const pclBody = page.locator("#generate-pcl-modal .confirm-body");
  await pclBody.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await page.waitForTimeout(250);
  await annotate(page, [
    { n: 1, selector: "#batchchecker-pcl-regulatory-notice" },
    { n: 2, selector: "#batchchecker-pcl-comments" },
    { n: 3, selector: "#pcl-clearance-submit-btn" },
  ]);
  await capture(page, "03-incomplete-pcl-regulatory-comment.png");

  await browser.close();
  console.log(outputDir);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
