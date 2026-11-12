const app = document.querySelector("#handheld-app");
let currentScreen = "menu";
let verificationOpen = false;
let transferComplete = false;
const currentUser = "John Smith";
let lineClearanceRecord = null;

const stock = {
  id: "08A0684",
  product: "Sinemet plus tablets",
  partNo: "DENAC100/25MGTAB100",
  batchNo: "W250446",
  boxes: "2",
  quantity: "95",
  location: "R7-C-01",
  imp: "C14156",
  contract: "WHO-G"
};
let confirmedBoxCount = stock.boxes;
let pendingBoxCount = null;
let boxCountConfirmationTimer = null;

function header(title, canGoBack = true) {
  return `<header class="legacy-header">
    <button class="legacy-back" type="button" data-action="${canGoBack ? "back" : "menu"}" aria-label="Back">←</button>
    <h1>${title}</h1>
    <button class="legacy-power" type="button" data-action="power" aria-label="Power">⏻</button>
  </header>`;
}

function workerCartIcon(withCheck = false) {
  return `<span class="worker-icon" aria-hidden="true"><svg viewBox="0 0 92 68" role="presentation">
    <circle cx="21" cy="10" r="7" fill="currentColor"/>
    <path d="M20 20 L20 41 L12 58 M20 31 L34 42 M20 23 L33 31" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M33 30 L43 52 L75 52 L82 30" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
    <path d="M45 28 L63 20 L75 35 L54 45 Z" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="49" cy="59" r="5" fill="currentColor"/><circle cx="74" cy="59" r="5" fill="currentColor"/>
    ${withCheck ? '<circle cx="78" cy="13" r="10" fill="currentColor"/><path d="M73 13 L77 17 L84 9" fill="none" stroke="#0879ce" stroke-width="3" stroke-linecap="round"/>' : ""}
  </svg></span>`;
}
function renderMenu() {
  currentScreen = "menu";
  verificationOpen = false;
  transferComplete = false;
  app.innerHTML = `${header("GOODS IN", false)}
    <div class="menu-grid">
      <button class="menu-tile" type="button" data-action="stock-put-away">${workerCartIcon(false)}<strong>STOCK<br>PUT AWAY</strong></button>
      <button class="menu-tile" type="button" data-action="stock-take-out">${workerCartIcon(true)}<strong>STOCK<br>TAKE OUT</strong></button>
      <button class="menu-tile" type="button" data-action="ppm-put-away">${workerCartIcon(false)}<strong>PPM<br>PUT AWAY</strong></button>
      <button class="menu-tile" type="button" data-action="ppm-take-out">${workerCartIcon(true)}<strong>PPM<br>TAKE OUT</strong></button>
    </div>`;
}

function productPanel() {
  return `<section class="product-panel">
    <h2>${stock.product}</h2>
    <div class="product-rows">
      <div class="product-row"><span>Part No.</span><span>${stock.partNo}</span></div>
      <div class="product-row"><span>Batch No.</span><span>${stock.batchNo}</span></div>
      <div class="product-row"><span>Goods In Boxes</span><span>${stock.boxes}</span></div>
      <div class="product-row"><span>Qty.</span><span>${stock.quantity}</span></div>
      <div class="product-row"><span>Location</span><span>${stock.location}</span></div>
      <div class="product-row"><span>IMP</span><span>${stock.imp}</span></div>
      <div class="product-row"><span>Contract</span><span>${stock.contract}</span></div>
    </div>
    <div class="transfer-row"><button class="transfer-button" type="button" data-action="transfer"><span>♧</span>TRANSFER</button></div>
  </section>`;
}

function keyboard() {
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  return `<div class="soft-keyboard" aria-label="On-screen keyboard">
    <div class="keyboard-row">${rows[0].split("").map((key) => `<button type="button" data-key="${key}">${key}</button>`).join("")}</div>
    <div class="keyboard-row keyboard-row-inset">${rows[1].split("").map((key) => `<button type="button" data-key="${key}">${key}</button>`).join("")}</div>
    <div class="keyboard-row"><button class="wide" type="button" data-key="shift">⇧</button>${rows[2].split("").map((key) => `<button type="button" data-key="${key}">${key}</button>`).join("")}<button class="wide" type="button" data-key="backspace">⌫</button></div>
    <div class="keyboard-row"><button class="wide" type="button" data-key="symbols">!#</button><button type="button" data-key="123">?123</button><button class="space" type="button" data-key="space"></button><button class="wide enter-key" type="button" data-key="enter">✓</button></div>
  </div>`;
}

function verificationDialog() {
  return `<div class="modal-shade">
    <section class="verify-dialog" role="dialog" aria-modal="true" aria-labelledby="verify-title">
      <h2 id="verify-title"><span class="dialog-alert">●</span>Scan Box ID for Verification</h2>
      <label class="dialog-field"><span>⚿</span><input id="box-id" autocomplete="off" placeholder="Scan Box ID..."></label>
      <div class="dialog-actions">
        <button class="confirm-button" type="button" data-action="confirm-box"><i>✓</i>CONFIRM</button>
        <button class="cancel-button" type="button" data-action="cancel-box"><i>×</i>CANCEL</button>
      </div>
    </section>
  </div>${keyboard()}`;
}

function renderDetails(openDialog = false) {
  currentScreen = "details";
  verificationOpen = openDialog;
  app.innerHTML = `${header("GOODS IN -<br>STOCK TAKE<br>OUT")}
    <div class="detail-body">
      <label class="scan-id-bar"><span>⚿</span><input value="${stock.id}" aria-label="Stock ID"></label>
      <div class="thin-divider"></div>
      ${productPanel()}
      ${transferComplete ? `<div class="success-banner">Box verified and transfer confirmed.</div>` : ""}
    </div>
    ${verificationOpen ? verificationDialog() : ""}`;
  if (verificationOpen) window.setTimeout(() => document.querySelector("#box-id")?.focus(), 0);
}

function openBoxCountConfirmation() {
  window.clearTimeout(boxCountConfirmationTimer);
  boxCountConfirmationTimer = null;
  const input = document.querySelector("#confirmed-box-count");
  const revisedCount = Number(input?.value);
  if (!Number.isInteger(revisedCount) || revisedCount < 1) {
    input?.setCustomValidity("Enter a valid whole number of boxes.");
    input?.reportValidity();
    return;
  }
  if (String(revisedCount) === String(confirmedBoxCount)) {
    pendingBoxCount = null;
    updateLineClearanceAvailability();
    return;
  }
  pendingBoxCount = String(revisedCount);
  document.querySelector("[data-box-count-confirmation]")?.remove();
  app.insertAdjacentHTML("beforeend", `<div class="modal-shade box-count-confirmation-shade" data-box-count-confirmation>
    <section class="box-count-confirmation" role="alertdialog" aria-modal="true" aria-labelledby="box-count-confirmation-title">
      <div class="box-count-confirmation-icon">!</div>
      <h2 id="box-count-confirmation-title">Confirm Box Count Change</h2>
      <p>Change the confirmed number of boxes from <strong>${confirmedBoxCount}</strong> to <strong>${pendingBoxCount}</strong>?</p>
      <small>The revised count will be recorded in the BAR.</small>
      <div class="box-count-confirmation-actions">
        <button class="cancel-box-count-button" type="button" data-action="cancel-box-count-change">CANCEL</button>
        <button class="confirm-box-count-button" type="button" data-action="confirm-box-count-change">CONFIRM</button>
      </div>
    </section>
  </div>`);
  updateLineClearanceAvailability();
}

function confirmBoxCountChange() {
  if (!pendingBoxCount) return;
  confirmedBoxCount = pendingBoxCount;
  pendingBoxCount = null;
  document.querySelector("[data-box-count-confirmation]")?.remove();
  updateLineClearanceAvailability();
}

function cancelBoxCountChange() {
  const input = document.querySelector("#confirmed-box-count");
  if (input) input.value = confirmedBoxCount;
  pendingBoxCount = null;
  document.querySelector("[data-box-count-confirmation]")?.remove();
  updateLineClearanceAvailability();
}

function renderLineClearance() {
  currentScreen = "clearance";
  verificationOpen = false;
  const confirmedBoxes = lineClearanceRecord?.boxes || confirmedBoxCount || stock.boxes;
  const clearanceHeader = header("GOODS IN -<br>LINE CLEARANCE").replace('data-action="back"', 'data-action="back-details"');
  app.innerHTML = `${clearanceHeader}
    <div class="clearance-body">
      <section class="clearance-card">
        <div class="clearance-product"><strong>${stock.product}</strong><span>${stock.batchNo} · ${stock.boxes} boxes</span></div>
        <label class="legacy-check"><input type="checkbox" data-clearance-check><span>Check product name, Exp date and lot size on the box label</span></label>
        <label class="legacy-check editable-box-check"><input type="checkbox" data-clearance-check><span><span class="box-count-label">No. of boxes confirmed</span><input id="confirmed-box-count" class="confirmed-box-count" type="number" min="1" step="1" inputmode="numeric" value="${confirmedBoxes}" aria-label="Confirmed number of boxes" ${lineClearanceRecord ? "disabled" : ""}></span></label>
        <label class="room-field"><span>Assign Assembly Room</span><select id="assembly-room"><option value="">Select room</option><option>Room 1</option><option>Room 2</option></select></label>
        <button id="confirmed-by-button" class="confirmed-by-button" type="button" data-action="confirmed-by" disabled>CONFIRMED BY</button>
        ${lineClearanceRecord ? `<div class="bar-capture"><span>✓ BAR UPDATED</span><strong>${lineClearanceRecord.user}</strong><small>${lineClearanceRecord.dateTime} · ${lineClearanceRecord.room}</small></div>` : '<p class="clearance-help">Complete both checks and assign a room.</p>'}
      </section>
    </div>`;
  if (lineClearanceRecord) {
    document.querySelectorAll("[data-clearance-check]").forEach((check) => { check.checked = true; check.disabled = true; });
    const room = document.querySelector("#assembly-room");
    room.value = lineClearanceRecord.room;
    room.disabled = true;
  }
}
function showReferenceScreen(screen) {
  if (screen === "menu") renderMenu();
  if (screen === "details") renderDetails(false);
  if (screen === "verify") renderDetails(true);
  if (screen === "clearance") renderLineClearance();
}

document.addEventListener("click", (event) => {
  const jump = event.target.closest("[data-jump]");
  if (jump) { showReferenceScreen(jump.dataset.jump); return; }

  const key = event.target.closest("[data-key]");
  if (key && verificationOpen) {
    const input = document.querySelector("#box-id");
    const value = key.dataset.key;
    if (value === "backspace") input.value = input.value.slice(0, -1);
    else if (value === "space") input.value += " ";
    else if (value === "enter") confirmBox();
    else if (!["shift", "123", "symbols"].includes(value)) input.value += value;
    input.focus();
    return;
  }

  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;
  if (action === "back" || action === "power" || action === "menu") renderMenu();
  if (["stock-put-away", "stock-take-out", "ppm-put-away", "ppm-take-out"].includes(action)) renderDetails(false);
  if (action === "transfer") renderDetails(true);
  if (action === "cancel-box") renderDetails(false);
  if (action === "confirm-box") confirmBox();
  if (action === "back-details") renderDetails(false);
  if (action === "confirmed-by") captureLineClearance();
  if (action === "confirm-box-count-change") confirmBoxCountChange();
  if (action === "cancel-box-count-change") cancelBoxCountChange();
});

function confirmBox() {
  const input = document.querySelector("#box-id");
  if (!input || !input.value.trim()) {
    input?.setCustomValidity("Scan or enter the Box ID.");
    input?.reportValidity();
    return;
  }
  transferComplete = true;
  verificationOpen = false;
  // Every confirmed stock transfer starts a new blank line-clearance form.
  // The signed BAR remains stored as audit history, but never pre-fills a new form.
  lineClearanceRecord = null;
  confirmedBoxCount = stock.boxes;
  pendingBoxCount = null;
  renderLineClearance();
}

function updateLineClearanceAvailability() {
  const checks = [...document.querySelectorAll("[data-clearance-check]")];
  const room = document.querySelector("#assembly-room");
  const boxCount = document.querySelector("#confirmed-box-count");
  const boxesValid = Boolean(boxCount && Number.isInteger(Number(boxCount.value)) && Number(boxCount.value) > 0);
  const button = document.querySelector("#confirmed-by-button");
  if (button) button.disabled = !(checks.length === 2 && checks.every((check) => check.checked) && boxesValid && !pendingBoxCount && !document.querySelector("[data-box-count-confirmation]") && room && room.value);
}

function captureLineClearance() {
  const room = document.querySelector("#assembly-room")?.value || "";
  const boxCountInput = document.querySelector("#confirmed-box-count");
  const confirmedBoxes = Number(boxCountInput?.value);
  if (!Number.isInteger(confirmedBoxes) || confirmedBoxes < 1) {
    boxCountInput?.setCustomValidity("Enter a valid whole number of boxes.");
    boxCountInput?.reportValidity();
    return;
  }
  if (pendingBoxCount || String(confirmedBoxes) !== String(confirmedBoxCount)) {
    openBoxCountConfirmation();
    return;
  }
  lineClearanceRecord = {
    barId: stock.id,
    batchNo: stock.batchNo,
    product: stock.product,
    boxes: String(confirmedBoxes),
    room,
    user: currentUser,
    dateTime: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    checks: ["Product name, expiry date and lot size checked", `Number of boxes confirmed: ${confirmedBoxes}`]
  };
  localStorage.setItem("plpi-handheld-bar-line-clearance", JSON.stringify(lineClearanceRecord));
  renderLineClearance();
}

document.addEventListener("input", (event) => {
  if (event.target.id === "box-id") event.target.setCustomValidity("");
  if (event.target.id === "confirmed-box-count") {
    event.target.setCustomValidity("");
    pendingBoxCount = String(event.target.value) === String(confirmedBoxCount) ? null : event.target.value;
    window.clearTimeout(boxCountConfirmationTimer);
    if (pendingBoxCount && Number.isInteger(Number(pendingBoxCount)) && Number(pendingBoxCount) > 0) {
      boxCountConfirmationTimer = window.setTimeout(openBoxCountConfirmation, 450);
    }
  }
  if (event.target.matches("[data-clearance-check], #assembly-room, #confirmed-box-count")) updateLineClearanceAvailability();
});

document.addEventListener("focusout", (event) => {
  if (event.target.id !== "confirmed-box-count") return;
  if (String(event.target.value) === String(confirmedBoxCount)) {
    pendingBoxCount = null;
    updateLineClearanceAvailability();
    return;
  }
  openBoxCountConfirmation();
});

document.querySelector("#device-time").textContent = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
renderMenu();








