const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1050 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
*{box-sizing:border-box} body{margin:0;background:#fff;font-family:Arial,sans-serif;color:#12233f}
.flow{width:1200px;margin:24px auto;padding:30px 34px 34px;border:2px solid #17365d;background:#fff}
h1{margin:0 0 8px;font-size:30px;text-align:center;color:#092d66;letter-spacing:0}
.sub{margin:0 0 24px;text-align:center;font-size:16px;color:#4b5563}
.lane{display:grid;grid-template-columns:150px 1fr;min-height:236px;border-top:1px solid #9ca3af}
.lane:last-child{border-bottom:1px solid #9ca3af}
.owner{display:flex;align-items:center;justify-content:center;padding:18px;text-align:center;font-weight:700;font-size:21px;color:#fff}
.goods .owner{background:#126e5a}.rpi .owner{background:#17365d}.batch .owner{background:#a65b00}
.nodes{display:grid;grid-template-columns:repeat(4,1fr);align-items:center;gap:34px;padding:24px 22px;background:#f7f8fa}
.node{position:relative;min-height:154px;padding:18px 14px 14px;border:2px solid #17365d;background:#fff;display:flex;flex-direction:column;justify-content:flex-start}
.goods .node{border-top:8px solid #126e5a}.rpi .node{border-top:8px solid #17365d}.batch .node{border-top:8px solid #a65b00}
.num{position:absolute;top:-18px;left:-13px;width:34px;height:34px;border-radius:50%;background:#c00000;color:#fff;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center}
.node h2{font-size:18px;margin:0 0 8px;line-height:1.15;color:#092d66}
.node p{font-size:14px;line-height:1.3;margin:0;color:#24344d}
.node:not(:last-child)::after{content:"\u2192";position:absolute;right:-31px;top:55px;font-size:30px;font-weight:700;color:#6b7280}
.gate{display:inline-block;margin-top:9px;padding:4px 7px;background:#fff2cc;border:1px solid #c99a00;font-size:12px;font-weight:700;color:#6d4800}
.handoff{height:34px;display:grid;grid-template-columns:150px 1fr;background:#fff}
.handoff span{grid-column:2;justify-self:end;margin-right:100px;font-size:29px;line-height:30px;color:#c00000;font-weight:700}
.footer{margin-top:20px;display:flex;justify-content:center;gap:24px;font-size:13px;color:#374151}
.key{display:flex;align-items:center;gap:7px}.sw{width:18px;height:10px}.s1{background:#126e5a}.s2{background:#17365d}.s3{background:#a65b00}
</style></head><body>
<div class="flow">
<h1>PLPI Batch Record Automation</h1>
<p class="sub">End-to-End Design Sequence</p>
<section class="lane goods"><div class="owner">Goods-In</div><div class="nodes">
<div class="node"><span class="num">1</span><h2>Open the PO</h2><p>Search and open the applicable PO using existing Packing List data.</p></div>
<div class="node"><span class="num">2</span><h2>Complete tablet checklist</h2><p>Delivery and driver sign-off, four Goods checks, receiver sign-off, then Review &amp; file.</p><span class="gate">Gate: Completed checklist PDF</span></div>
<div class="node"><span class="num">3</span><h2>Verify &amp; Print</h2><p>Verify each applicable Packing List line, print labels and generate the PO Packing List.</p></div>
<div class="node"><span class="num">4</span><h2>Release document pack</h2><p>Confirm mandatory documents and Goods-In controls, then release as Ready for RPi Review.</p><span class="gate">Gate: Goods-In sign-off</span></div>
</div></section>
<div class="handoff"><span>\u2193</span></div>
<section class="lane rpi"><div class="owner">RPi / System</div><div class="nodes">
<div class="node"><span class="num">5</span><h2>Review documents</h2><p>RPi opens every required file and returns deficiencies for correction.</p></div>
<div class="node"><span class="num">6</span><h2>Complete RPi approval</h2><p>Complete the approval checklist and perform Generate &amp; Sign.</p><span class="gate">Gate: RPi approval</span></div>
<div class="node"><span class="num">7</span><h2>Combine and email</h2><p>PLPI creates one approved PDF and sends it to sc.india@bnsdistribution.com.</p></div>
<div class="node"><span class="num">8</span><h2>Reflect acceptance</h2><p>External stock acceptance is reflected in PLPI and makes the PO Batch Checker eligible.</p><span class="gate">Gate: Ready for Batch Check</span></div>
</div></section>
<div class="handoff"><span>\u2193</span></div>
<section class="lane batch"><div class="owner">Batch Checker</div><div class="nodes">
<div class="node"><span class="num">9</span><h2>Open eligible line</h2><p>Locate the approved PO and select the applicable product and batch line.</p></div>
<div class="node"><span class="num">10</span><h2>Review evidence</h2><p>Open the linked Supplier Declaration and Temperature Record where applicable.</p></div>
<div class="node"><span class="num">11</span><h2>Product Verification</h2><p>Complete every required product, batch, quantity and manufacturer check.</p><span class="gate">Gate: Batch Check verified</span></div>
<div class="node"><span class="num">12</span><h2>Preview and print PCL</h2><p>Review the populated PCL, complete line clearance and record Verify and Print.</p><span class="gate">Output: PCL printed</span></div>
</div></section>
<div class="footer"><span class="key"><i class="sw s1"></i>Goods-In</span><span class="key"><i class="sw s2"></i>RPi / system processing</span><span class="key"><i class="sw s3"></i>Batch Checker</span></div>
</div></body></html>`);
  const el = page.locator('.flow');
  await el.screenshot({ path: path.resolve('temp_ds_build/screenshots/00-end-to-end-flow.png') });
  await browser.close();
})();
