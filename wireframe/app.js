const stages = [
  {
    id: "packing-list",
    code: "Stage 1",
    title: "Goods-In / Packing List",
    loginTitle: "Packing List Login",
    user: "goods.in",
    role: "Goods-In User",
    owner: "Goods-In",
    status: "active",
    entry: "Supplier delivery and PO available",
    next: "RPi Pack / Product Check Log",
    approval: "Goods-In digital sign off",
    checks: [
      "Search the PO and pull packing list details into PLPI.",
      "Confirm supplier, delivery, invoice and product quantities.",
      "Upload supplier invoice, supplier declaration and temperature record.",
      "Complete Goods-In checklist digitally instead of printing the paper checklist.",
      "Sign off so the RPi Pack documents are available for downstream review."
    ],
    evidence: ["Purchase order", "Supplier invoice", "Supplier declaration", "Temperature record", "Goods-In checklist"],
    controls: [
      "Packing List cannot be completed until mandatory RPi Pack documents are attached.",
      "Goods-In sign off captures user, date and time.",
      "Completed documents are visible in the QP electronic batch pack."
    ],
    progress: [28, 20]
  },
  {
    id: "rp-pack",
    code: "Stage 2",
    title: "RPi",
    loginTitle: "RPi",
    user: "rp.user",
    role: "Responsible Person",
    owner: "RPi",
    status: "active",
    entry: "Goods-In sign off completed and documents attached",
    next: "BAR Creation",
    approval: "RPi digital sign off",
    checks: [
      "Review the required Goods-In document set. Review the CD License and Additional Files only when supplied; both are optional.",
      "Review the generated PO Packing List document.",
      "Confirm completeness and compliance of the RPi Pack.",
      "Provide digital sign off to release the RPi Pack for BAR creation."
    ],
    evidence: ["Goods-In Uploaded Pack", "Generated PO Packing List", "RPi Approval Check"],
    controls: [
      "RPi must verify all uploaded documents before sign off.",
      "Digital sign off captures user, date and time.",
      "Approved RPi Pack enables the downstream BAR Creation stage."
    ],
    progress: [0, 0]
  },
  {
    id: "goods-in-summary",
    code: "Goods-In",
    title: "Goods-in Summary",
    loginTitle: "Goods-in Summary Login",
    user: "goods.in",
    role: "Goods-In User",
    owner: "Goods-In",
    status: "active",
    entry: "Packing List PO created",
    next: "RPi approval complete",
    approval: "Read-only workflow summary",
    checks: [
      "Search individual or merged PO queues.",
      "Review actions from Generated Packing List to RPi approval.",
      "View the consolidated PO summary PDF."
    ],
    evidence: ["Packing List history", "RPi Documents audit", "RPi approval"],
    controls: ["Summary information is read-only and derived from the PO workflow audit history."],
    progress: [100, 100]
  },
  {
    id: "batch-checker",
    code: "Stage 3",
    title: "Batch Checker",
    loginTitle: "Batch Checker Login",
    user: "batch.checker",
    role: "Batch Checker",
    owner: "Checker Team",
    status: "active",
    entry: "PO Packing List and RPi Pack approved",
    next: "BNS Batch Add",
    approval: "Batch check verification and PCL generation",
    checks: [
      "Search the PO to list all products associated to it.",
      "Select a product line to perform batch checking.",
      "Verify all product and packaging details against the reference sample.",
      "Record manufacturer address details and save.",
      "Generate the digital PCL sheet and complete line clearance.",
      "Print carton and box labels after verification."
    ],
    evidence: ["PCL generation", "Verification check", "Line clearance confirmation"],
    controls: [
      "Verification must be recorded for each batch line before label printing.",
      "Print PCL is required for downstream line clearance.",
      "Digital sign off captures user, date, and time."
    ],
    progress: [40, 25]
  },
  {
    id: "regulatory-task",
    code: "Stage 4",
    title: "Regulatory Task",
    loginTitle: "Regulatory Task Login",
    user: "reg.user",
    role: "Regulatory User",
    owner: "Regulatory",
    status: "active",
    entry: "BAR issued",
    next: "Under Construction",
    approval: "Regulatory approval",
    checks: [
      "Perform regulatory checks.",
      "Placeholder dummy stage."
    ],
    evidence: [],
    controls: [],
    progress: [0, 0]
  },
  {
    id: "bar-creation",
    code: "Stage 4",
    title: "BAR Creation",
    loginTitle: "BNS Batch Add Login",
    user: "bar.creation",
    role: "BAR Creation User",
    owner: "BAR Issuing User",
    status: "complete",
    entry: "Completed Product Check Log and sample pack",
    next: "Label Printing",
    approval: "Digital BAR issue confirmation",
    checks: [
      "Select the batch from BNS Batch Add after Batch Checking completion.",
      "Verify BAR details against PCL, product sample, batch number, expiry, and quantity.",
      "Review related batch or in-transit alerts before issuing BAR.",
      "Generate BAR sequence and confirm all pages are available.",
      "Complete digital line clearance before handoff."
    ],
    evidence: ["Generated BAR pack", "PCL and sample verification", "Related batch alert decision", "Digital line clearance"],
    controls: [
      "BAR cannot be issued until PCL and sample checks are complete.",
      "All BAR confirmations are timestamped with user identity.",
      "Mismatch routes are recorded before handoff."
    ],
    progress: [100, 92]
  },
  {
    id: "label-printing",
    code: "Stage 5",
    title: "Printer",
    loginTitle: "Printer Login",
    user: "printer.user",
    role: "Printer User",
    owner: "Print Team",
    status: "active",
    entry: "Issued BAR pack",
    next: "Leaflet Printing",
    approval: "Operator print and line clearance confirmation",
    checks: [
      "Open the printer module and retrieve batch details from the BAR queue.",
      "Confirm calculated label quantity and reboxing instruction where applicable.",
      "Check label details against BAR, PCL, system details, and sample.",
      "Record test label acceptance before full print run.",
      "Capture first and last label evidence digitally."
    ],
    evidence: ["Test label evidence", "First printed label", "Last printed label", "Finish line clearance"],
    controls: [
      "Full label printing remains blocked until the test label is accepted.",
      "Quantity change requires recorded reboxing approval evidence.",
      "RRF hold is raised for detail mismatch."
    ],
    progress: [64, 50]
  },
  {
    id: "leaflet-printing",
    code: "Stage 6",
    title: "Leaflet Printing",
    loginTitle: "Printer Login",
    user: "leaflet.print",
    role: "Leaflet Printing User",
    owner: "Print Team",
    status: "active",
    entry: "Completed label printing",
    next: "Carton / Braille Preparation",
    approval: "Master copy acceptance",
    checks: [
      "Retrieve batch from the Leaflet Printing queue.",
      "Verify leaflet reference, product, strength, PL number, and format.",
      "Print and review the master/test copy before full quantity.",
      "Record leaflet quantity printed and any waste or reprint reason.",
      "Complete digital finish line clearance."
    ],
    evidence: ["Master/test leaflet", "Foreign leaflet reference", "Quantity print record", "Line clearance"],
    controls: [
      "Full leaflet print is disabled until master copy check is complete.",
      "Reference and version are visible in the electronic batch pack.",
      "Rejected master copies are retained as exception evidence."
    ],
    progress: [48, 33]
  },
  {
    id: "carton-braille",
    code: "Stage 7",
    title: "Carton / Braille Preparation",
    loginTitle: "Pre Printed Material Login",
    user: "carton.braille",
    role: "Carton / Braille User",
    owner: "Packaging Team",
    status: "active",
    entry: "Completed leaflet printing",
    next: "Leaflet Folding",
    approval: "Route-specific preparation confirmation",
    checks: [
      "Confirm reboxing or relabelling route from BAR instruction.",
      "For reboxing, verify carton reference, location, box ID, and issued quantity.",
      "For relabelling, verify braille requirement and declaration/reference.",
      "Upload carton or braille sample evidence.",
      "Record digital line clearance before stage completion."
    ],
    evidence: ["Carton reference evidence", "Braille sample evidence", "Handheld issue record", "Route decision record"],
    controls: [
      "Route decision is driven by BAR/process instruction.",
      "Carton issue remains on hold until location, box ID, and quantity match.",
      "Braille preparation requires declaration/reference confirmation."
    ],
    progress: [58, 42]
  },
  {
    id: "leaflet-folding",
    code: "Stage 8",
    title: "Leaflet Folding",
    loginTitle: "Leaflet Folding Login",
    user: "leaflet.fold",
    role: "Leaflet Folding User",
    owner: "Folding Operator",
    status: "active",
    entry: "Prepared cartons or braille route",
    next: "Pre Assembly",
    approval: "Folding completion confirmation",
    checks: [
      "Open Leaflet Folding queue and select the BAR.",
      "Confirm operator identity and batch number.",
      "Recheck one printed leaflet before folding.",
      "Confirm folding format and leaflet size.",
      "Record folded leaflets placed in the correct batch box or bucket."
    ],
    evidence: ["Leaflet pre-fold check", "Fold format confirmation", "Operator scan record", "Completion timestamp"],
    controls: [
      "Batch and user are captured before folding starts.",
      "Folded leaflets remain linked to the batch box/bucket.",
      "Stage completion removes the batch from the folding queue."
    ],
    progress: [74, 67]
  },
  {
    id: "pre-assembly-qc",
    code: "Stage 9",
    title: "Pre Assembly",
    loginTitle: "Pre Assembly Login",
    user: "preassembly.qc",
    role: "Pre Assembly User",
    owner: "QC",
    status: "hold",
    entry: "Folded leaflets and batch pack received",
    next: "Production Control / Room Allocation",
    approval: "QC digital completion",
    checks: [
      "Confirm batch is active in the Pre Assembly module.",
      "Check labels, sample, PCL, leaflet, braille/carton, and mock-up details.",
      "Prepare the assembly reference sample using the selected mock-up.",
      "Record blank label or butter paper quantities and comments where applicable.",
      "Upload sample evidence and complete digital QC confirmation."
    ],
    evidence: ["Assembly reference sample", "Mock-up", "Label and leaflet evidence", "QC line clearance"],
    controls: [
      "Inactive batches cannot proceed.",
      "Pre Assembly is blocked by label, sample, leaflet, braille, or mock-up mismatch.",
      "Prepared sample evidence becomes part of the QP review pack."
    ],
    progress: [38, 25]
  },
  {
    id: "room-allocation",
    code: "Stage 10",
    title: "Production Control / Room Allocation",
    loginTitle: "Production Controller Login",
    user: "production.control",
    role: "Production Controller",
    owner: "Production Control",
    status: "active",
    entry: "Completed Pre Assembly",
    next: "Assembly Room",
    approval: "Room allocation confirmation",
    checks: [
      "Review batches waiting for room allocation.",
      "Verify random sample against BAR and reference pack.",
      "Confirm box count, product details, expiry, and label/reference details.",
      "Select available assembly room and record planned start.",
      "Complete digital Process 7 confirmation."
    ],
    evidence: ["Room allocation record", "Random sample check", "Box quantity confirmation", "Production Control line clearance"],
    controls: [
      "Room allocation is not available when sample or BAR details mismatch.",
      "Room, owner, date, and time are captured digitally.",
      "Allocated room is visible to Assembly Room users."
    ],
    progress: [52, 44]
  },
  {
    id: "assembly-room",
    code: "Stage 11",
    title: "Assembly Room",
    loginTitle: "Assembly Room Login",
    user: "assembly.room",
    role: "Assembly Room User",
    owner: "Assembly Team",
    status: "active",
    entry: "Allocated assembly room",
    next: "Post-Assembly QC",
    approval: "Assembly completion and reconciliation",
    checks: [
      "Start the batch in the assigned room and record pre-start checks.",
      "Confirm line clearance, labels, leaflets, components, sample, and mock-up.",
      "Record assembly team briefing and batch start time.",
      "Capture IPC checks and photo evidence during assembly.",
      "Complete reconciliation for issued, used, damaged, surplus, and leftover items."
    ],
    evidence: ["Pre-start line clearance", "IPC photo evidence", "Reconciliation record", "Damage or leftover evidence"],
    controls: [
      "Assembly cannot start until pre-start checks are confirmed.",
      "IPC evidence is retained for Pre-QP and QP review.",
      "Reconciliation must be complete before stage handoff."
    ],
    progress: [70, 61]
  },
  {
    id: "post-assembly-qc",
    code: "Stage 12",
    title: "Post Assembly",
    loginTitle: "Post Assembly Login",
    user: "postassembly.qc",
    role: "Post-Assembly QC User",
    owner: "QC",
    status: "active",
    entry: "Completed assembly and reconciliation",
    next: "Pre-QP",
    approval: "Post-Assembly QC completion",
    checks: [
      "Segregate completed boxes and documentation.",
      "Select sample quantity based on batch size and check against mock-up.",
      "Verify full quantity, box count, label placement, and pack presentation.",
      "Print and apply quarantine labels after confirmed box/quantity entry.",
      "Move stock to quarantine and update status digitally."
    ],
    evidence: ["Sample pack check", "Box count record", "Quarantine labels", "Post-QC line clearance"],
    controls: [
      "Quarantine labels are not printed until quantity and box count are confirmed.",
      "Incorrect quarantine labels must be voided and reprinted.",
      "Completion makes the batch visible in the Pre-QP queue."
    ],
    progress: [56, 50]
  },
  {
    id: "pre-qp",
    code: "Stage 13",
    title: "Pre-QP",
    loginTitle: "Pre-QP / Release Log Login",
    user: "pre.qp",
    role: "Pre-QP User",
    owner: "Pre-QP",
    status: "active",
    entry: "Completed Post-Assembly QC and quarantined stock",
    next: "QP Release",
    approval: "Pre-QP evidence pack approval",
    checks: [
      "Select batch from Release Log queue by priority or pallet order.",
      "Review full digital batch record from BAR creation through Post-Assembly QC.",
      "Check document presence, completeness, IPC photos, and reconciliation.",
      "Record random sample removal and line clearance.",
      "Create digital release log and submit complete pack to QP."
    ],
    evidence: ["Release log", "Random sample record", "IPC review confirmation", "Pre-QP approval"],
    controls: [
      "Pre-QP cannot submit to QP with missing required evidence.",
      "IPC and reconciliation review are explicit release readiness checks.",
      "Green release log is replaced by digital release log."
    ],
    progress: [82, 77]
  },
  {
    id: "release-log",
    code: "Stage 14",
    title: "Release Log Sheet",
    loginTitle: "Release Log Sheet Login",
    user: "pre.qp",
    role: "Pre-QP User",
    owner: "Pre-QP",
    status: "active",
    entry: "Completed Pre-QP checks and line clearance",
    next: "QP Release Dashboard",
    approval: "QP Release Log print and Rel ID generation",
    checks: [
      "Select one or more completed B&S batches.",
      "Combine the selected batches into one QP Release Log Sheet.",
      "Generate the next sequential Rel ID for the complete sheet.",
      "Print the QP Release Log Record and send the grouped batches to QP."
    ],
    evidence: ["QP Release Log Record", "Rel ID", "Grouped batch list"],
    controls: [
      "Only completed Pre-QP batches can be selected.",
      "One printed Release Log Sheet creates exactly one Rel ID.",
      "Every selected batch remains associated with that Rel ID."
    ],
    progress: [88, 84]
  },
  {
    id: "qp-release",
    code: "Stage 15",
    title: "QP Approval / Batch Release",
    loginTitle: "QP Approval Login",
    user: "qp.release",
    role: "QP User",
    owner: "QP",
    status: "complete",
    entry: "Pre-QP approved digital batch pack",
    next: "Process Complete",
    approval: "QP electronic approval",
    checks: [
      "Review complete electronic batch pack, sample, and leftover components.",
      "Check supplier, invoice, declaration, temperature, PCL, and BAR evidence.",
      "Review reconciliation, IPC evidence, QMS status, and release logs.",
      "Record approved quantity and electronic signature.",
      "Confirm release label application and close the BAR process."
    ],
    evidence: ["QP approval", "Batch Summary Log", "QP release log", "Release label confirmation"],
    controls: [
      "QP approval is blocked by unresolved quality issue or missing required record.",
      "Electronic signature captures user, date, time, and approval outcome.",
      "Released batch is locked from further stage editing."
    ],
    progress: [96, 90]
  }
];

let packingListMode = "view";
let packingListSearch = "";
let packingListSelectedPo = "C13719";
let packingListSignedOff = false;
let packingListRecord = null;
let packingLabelPrintRecords = {};
let packingListAuditLog = [];
let packingListGenerated = false;
let generatedPackingListSnapshots = {};
function isPackingListLocked() {
  return packingListGenerated === true;
}
let packingListRowsState = null;
let poPackingListSignoff = null;
let packingListAddInitialized = {};
let rpDocumentsSignoff = null;
let rpPackWorkflows = {};
let selectedRpPackPo = null;
let selectedRpApprovalPo = null;
let rpApprovalSignoffs = {};
let rpApprovalAnswers = {};
let rpApprovalComments = {};
let rpApprovalSearch = "";
let rpTaskQueueTab = "po";
let rpiModuleView = "tasks";
let rpDocumentsPoSearch = "";
let rpRejectionComments = {};
const RP_DOCUMENT_REVIEW_STORAGE_KEY = "plpi-rp-document-review-progress-v1";
function loadRpDocumentReviewProgress() {
  try {
    const saved = window.localStorage.getItem(RP_DOCUMENT_REVIEW_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}
let rpDocumentReviewProgress = loadRpDocumentReviewProgress();
let selectedRpReviewDocument = {};
let rpReviewDraftDecision = {};
let rpMergeSelections = new Set();
let rpMergeGroups = {};
let checklistDecisionQueue = [];
let selectedChecklistDecisionPo = null;
let checklistDecisionSearch = "";
let goodsReceivingExamplesInitialized = false;
let goodsInSummarySearch = "";
let selectedGoodsInSummaryPo = null;
const CHANGE_OF_PACK_SIZE_STORAGE_KEY = "plpi-change-of-pack-size-records";
let changeOfPackSizeData = loadChangeOfPackSizeData();
let pendingStageId = stages[0].id;
let currentLogin = null;
let isAuthenticated = false;
let initialLoginPending = true;
let signOffRecord = null;
let barCreatedRecord = null;
let currentStageId = null;
let barCreated = false;
let barMovedToNextStage = false;
let generatedBatchNumbers = [];
let bnsSelectedRowIds = [];
let combinedBarProducts = {};
let generatedBarRecords = {};
const BNS_LINE_CLEARANCE_STORAGE_KEY = "plpi-bns-line-clearance-records";
let bnsLineClearanceRecords = loadBnsLineClearanceRecords();
let bnsFilters = {
  country: "All",
  site: "All",
  category: "All",
  quantity: "",
  status: "All",
  batch: ""
};
let selectedProduct = null;
let labelSelectedProduct = null;
let labelPrintedBatchNumbers = [];
const LABEL_PRINT_RECORDS_STORAGE_KEY = "plpi-label-print-records";
const LABEL_MANUAL_COMPLETION_MIGRATION_KEY = "plpi-label-manual-completion-v1";
let labelPrintRecords = loadLabelPrintRecords();
let printerSection = "menu";
let leafletSelectedProduct = null;
let leafletPrintedBatchNumbers = [];
const LEAFLET_PRINT_RECORDS_STORAGE_KEY = "plpi-leaflet-print-records";
let leafletPrintRecords = loadLeafletPrintRecords();
let cartonSelectedProduct = null;
let cartonPrintedBatchNumbers = [];
let cartonPrintRecords = {};
let brailleSelectedProduct = null;
let braillePrintedBatchNumbers = [];
let braillePrintRecords = {};
let printerSearch = "";
let leafletFoldingBatchSearch = "";
let leafletFoldingMfgSearch = "";
let leafletFoldingSelectedProduct = null;
let leafletFoldingRecords = {};
let leafletFoldedBatchNumbers = [];
let preAssemblySelectedProduct = null;
let preAssemblyCheckedBatchNumbers = [];
let preAssemblyRecords = {};
let preAssemblySearch = "";
let productionSelectedProduct = null;
let productionAllocatedBatchNumbers = [];
let productionRecords = {};
let productionSearch = "";
let assemblySelectedProduct = null;
let assembledBatchNumbers = [];
let assemblyRecords = {};
let assemblySearch = "";
let assemblyExtraIpcRows = 0;
let assemblyActiveTab = "materials";
let assemblyQueueView = "active";
let assemblyAttendanceLiveRows = [];
let postAssemblySelectedProduct = null;
let postAssemblyCheckedBatchNumbers = [];
let postAssemblyRecords = {};
let postAssemblySearch = "";
let postAssemblyBoxPopupTimer = null;
let preQpSelectedProduct = null;
let preQpCheckedBatchNumbers = [];
let preQpRecords = {};
let preQpSearch = "";
let preQpReleaseLogSelection = [];
let releaseLogProductSearch = "";
let releaseLogBatchSearch = "";
let releaseLogSiteSearch = "WHO";
let qpSelectedProduct = null;
let qpSelectedReleaseId = "";
let qpReleasedBatchNumbers = [];
let qpCertifiedBatchNumbers = [];
let qpCertifiedLabelSelection = [];
let qpCertifiedTab = "Approved";
let qpCertifiedOpenRelId = "";
let qpDashboardSelection = [];
const QP_RELEASE_RECORDS_STORAGE_KEY = "plpi-qp-release-review-records-v8";
let qpReleaseRecords = loadQpReleaseRecords();
let qpSelectedDocumentId = "";
let qpSearch = "";
let qpIdSearch = "";
let qpBatchSearch = "";
let qpStatusSearch = "";
let qpChecklistOpen = false;
let printerAuditTrail = [];
let printPreviewRequest = null;
let pendingSignoffAction = null;
let releaseLogPasswordBatches = [];

const bnsProducts = [
  {
    status: "Active",
    site: "WHO",
    country: "CZECH REPUBLIC",
    partNo: "CZFLU120ACT",
    product: "Flutiform pressurised inhalation, suspension",
    ecma: "14/555/12-C",
    strength: "250/10mcg",
    packSize: "120 actuations",
    batch: "03A1582",
    expiry: "07/2027",
    quantity: "650",
    imp: "C13506",
    invoice: "15003594",
    description: "Flutiform inhalation",
    warehouse: "R6-B-01",
    pl: "18799/2922",
    productId: "5547",
    foreignName: "Flutiform suspenze k inhalaci v tlakovem obalu",
    unitsPerPack: "1",
    productIntroduced: "20 Jul 2016",
    leafletDate: "12 Jun 2025",
    dateRevised: "05 Nov 2025",
    variationInfo: "",
    supplierName: "DerStar Pharma SK s.r.o.",
    reviewDate: "04/04/2025",
    supplierInvoice: "15003602",
    manufLotNo: "25086A",
    category: "Reboxing",
    batchType: "Composite",
    routeInstruction: "Rebox into 120 actuations",
    routeType: "Reboxing",
    leafletRequired: true,
    leafletQuantity: "650",
    blisterRequired: "No",
    cartonQuantity: "650",
    brailleRequired: false,
    brailleQuantity: "0"
  },
  {
    status: "Active",
    site: "WHO",
    country: "FRANCE",
    partNo: "FRADA0.25TAB12",
    product: "ADARTEL Compr...",
    ecma: "3400939183947",
    strength: "0.25mg",
    packSize: "12",
    batch: "EN8B",
    expiry: "31-10-2025",
    quantity: "140",
    imp: "F4690",
    invoice: "26/FEX/566",
    description: "ADARTEL Film...",
    warehouse: "Q-25-A",
    pl: "18799/2070",
    productId: "5178",
    foreignName: "ADARTEL comprimes pellicules",
    unitsPerPack: "1",
    productIntroduced: "14 Feb 2019",
    leafletDate: "08 Jan 2025",
    dateRevised: "18 Mar 2025",
    variationInfo: "Braille required",
    supplierName: "Pharma Logistics FR",
    reviewDate: "22/04/2025",
    supplierInvoice: "FV612259",
    manufLotNo: "EN8B-25",
    category: "Relabelling",
    batchType: "Consolidated",
    routeInstruction: "Relabel only",
    routeType: "Relabelling",
    leafletRequired: true,
    leafletQuantity: "140",
    blisterRequired: "Yes",
    cartonQuantity: "0",
    brailleRequired: true,
    brailleQuantity: "140"
  },
  {
    status: "Active",
    site: "WHO",
    country: "SPAIN",
    partNo: "ESADA2TAB28",
    product: "ADARTREL com...",
    ecma: "67922",
    strength: "2mg",
    packSize: "28",
    batch: "C22W",
    expiry: "28-02-2025",
    quantity: "80",
    imp: "G4452",
    invoice: "NC24090412",
    description: "Adara cream",
    warehouse: "R8-C-01",
    pl: "18799/3264",
    productId: "5547",
    foreignName: "ADARTREL comprimidos",
    unitsPerPack: "1",
    productIntroduced: "11 Sep 2020",
    leafletDate: "04 Feb 2025",
    dateRevised: "09 Apr 2025",
    variationInfo: "Braille required",
    supplierName: "UAB Dinera",
    reviewDate: "09/09/2025",
    supplierInvoice: "NC24090412",
    manufLotNo: "C22W-02",
    category: "Relabelling",
    batchType: "Consolidated",
    routeInstruction: "Relabel only",
    routeType: "Relabelling",
    leafletRequired: true,
    leafletQuantity: "80",
    blisterRequired: "Yes",
    cartonQuantity: "0",
    brailleRequired: true,
    brailleQuantity: "80"
  }
];

bnsProducts.push(
  {
    status: "Variation",
    site: "WHO",
    country: "FRANCE",
    partNo: "FRAZA10EYE5ML",
    product: "AZARGA Collyre ...",
    ecma: "EU/1/08/482/001",
    strength: "10mg/ml + 5mg/ml",
    packSize: "5ml",
    batch: "3TED1A",
    expiry: "30-04-2025",
    quantity: "50",
    imp: "I20594",
    invoice: "77337",
    description: "AZARGA eye drops",
    warehouse: "IN ASSEMBLY",
    pl: "3685",
    productId: "5346",
    foreignName: "AZARGA collyre en suspension",
    unitsPerPack: "1",
    productIntroduced: "07 Mar 2018",
    leafletDate: "19 May 2025",
    dateRevised: "02 Jun 2025",
    variationInfo: "Variation copy required",
    supplierName: "DerStar Pharma SK s.r.o.",
    reviewDate: "11/05/2025",
    supplierInvoice: "77337",
    manufLotNo: "3TED1A-FR",
    category: "Relabelling",
    batchType: "Composite",
    routeInstruction: "Relabel only",
    routeType: "Relabelling",
    leafletRequired: true,
    leafletQuantity: "50",
    blisterRequired: "Yes",
    cartonQuantity: "0",
    brailleRequired: true,
    brailleQuantity: "50"
  },
  {
    status: "Tentative",
    site: "WHO",
    country: "ITALY",
    partNo: "ITBON70MG4",
    product: "BONASOL Soluzi...",
    ecma: "040622033",
    strength: "70mg",
    packSize: "4",
    batch: "I58352",
    expiry: "30-06-2025",
    quantity: "48",
    imp: "T4572",
    invoice: "35",
    description: "Alendronic acid oral solution",
    warehouse: "IN ASSEMBLY",
    pl: "3031",
    productId: "4522",
    foreignName: "BONASOL soluzione orale",
    unitsPerPack: "1",
    productIntroduced: "26 Oct 2017",
    leafletDate: "17 Apr 2025",
    dateRevised: "21 Apr 2025",
    variationInfo: "",
    supplierName: "UAB Dinera",
    reviewDate: "18/05/2025",
    supplierInvoice: "35",
    manufLotNo: "I58352-IT",
    category: "Reboxing",
    batchType: "Composite",
    routeInstruction: "Rebox into 4 pack",
    routeType: "Reboxing",
    leafletRequired: true,
    leafletQuantity: "48",
    blisterRequired: "No",
    cartonQuantity: "48",
    brailleRequired: false,
    brailleQuantity: "0"
  },
  {
    status: "Active",
    site: "WHO",
    country: "PORTUGAL",
    partNo: "PTBRI90TAB56",
    product: "BRILIQUE",
    ecma: "EU/1/10/655/002",
    strength: "90mg",
    packSize: "56",
    batch: "VHUN",
    expiry: "31-10-2026",
    quantity: "100",
    imp: "T4651",
    invoice: "FF/54537",
    description: "Brilique film-coated tablets",
    warehouse: "IN ASSEMBLY",
    pl: "3999",
    productId: "5468",
    foreignName: "BRILIQUE comprimidos revestidos",
    unitsPerPack: "1",
    productIntroduced: "08 Aug 2016",
    leafletDate: "23 Jan 2025",
    dateRevised: "14 Feb 2025",
    variationInfo: "Cold chain not applicable",
    supplierName: "Pharma Logistics PT",
    reviewDate: "02/05/2025",
    supplierInvoice: "FF/54537",
    manufLotNo: "VHUN-PT",
    category: "Relabelling",
    batchType: "Consolidated",
    routeInstruction: "Relabel only",
    routeType: "Relabelling",
    leafletRequired: true,
    leafletQuantity: "100",
    blisterRequired: "Yes",
    cartonQuantity: "0",
    brailleRequired: true,
    brailleQuantity: "100"
  },
  {
    status: "Active",
    site: "WHO",
    country: "SPAIN",
    partNo: "ESBACNA10N15",
    product: "Bactroban pomada",
    ecma: "58868 (997585.2)",
    strength: "2% w/w",
    packSize: "15g",
    batch: "4U7R",
    expiry: "30-06-2025",
    quantity: "168",
    imp: "Y4322",
    invoice: "F/29628",
    description: "Bactroban ointment",
    warehouse: "IN ASSEMBLY",
    pl: "1411",
    productId: "120",
    foreignName: "Bactroban pomada",
    unitsPerPack: "1",
    productIntroduced: "03 Apr 2017",
    leafletDate: "10 Jan 2025",
    dateRevised: "01 Feb 2025",
    variationInfo: "",
    supplierName: "Spanish Pharma Supply",
    reviewDate: "20/04/2025",
    supplierInvoice: "F/29628",
    manufLotNo: "4U7R-ES",
    category: "Reboxing",
    batchType: "Composite",
    routeInstruction: "Rebox into 15g carton",
    routeType: "Reboxing",
    leafletRequired: true,
    leafletQuantity: "168",
    blisterRequired: "No",
    cartonQuantity: "168",
    brailleRequired: false,
    brailleQuantity: "0"
  },
  {
    status: "Active",
    site: "WHO",
    country: "BULGARIA",
    partNo: "BGBETM50MGT",
    product: "Betmiga",
    ecma: "EU/1/12/809/001",
    strength: "50mg",
    packSize: "30",
    batch: "23G0828",
    expiry: "30-06-2026",
    quantity: "82",
    imp: "Q17917",
    invoice: "1000049019",
    description: "Betmiga prolonged-release tablets",
    warehouse: "IN ASSEMBLY",
    pl: "3851",
    productId: "5302",
    foreignName: "Betmiga tablets",
    unitsPerPack: "1",
    productIntroduced: "16 Jun 2021",
    leafletDate: "08 May 2025",
    dateRevised: "27 May 2025",
    variationInfo: "Braille required",
    supplierName: "Balkan Pharma Supply",
    reviewDate: "28/05/2025",
    supplierInvoice: "1000049019",
    manufLotNo: "23G0828-BG",
    category: "Relabelling",
    batchType: "Consolidated",
    routeInstruction: "Relabel only",
    routeType: "Relabelling",
    leafletRequired: true,
    leafletQuantity: "82",
    blisterRequired: "Yes",
    cartonQuantity: "0",
    brailleRequired: true,
    brailleQuantity: "82"
  }
);

// Stage 2 combination examples used to demonstrate the two legacy PLPI warnings.
bnsProducts[0].combineWarning = {
  type: "transit",
  title: "Batch In Transit",
  message: "More batch In Transit, Want to continue?",
  rows: [{ orderNo: "C13975", quantity: "1320" }]
};
bnsProducts.push({
  ...bnsProducts[0],
  recordId: "BNS-TRANSIT-02",
  quantity: "350",
  invoice: "15003603",
  warehouse: "R6-B-02"
});
bnsProducts[1].combineWarning = {
  type: "batch-check",
  title: "CheckBox",
  message: "More batch in batch Check, Want to continue?",
  rows: []
};
bnsProducts.push({
  ...bnsProducts[1],
  recordId: "BNS-CHECK-02",
  quantity: "60",
  invoice: "26/FEX/567",
  warehouse: "Q-25-B"
});

const welcomeWindow = document.querySelector("#welcome-window");
const dashboardWindow = document.querySelector("#dashboard-window");
const moduleWindow = document.querySelector("#module-window");
const loginModal = document.querySelector("#login-modal");
const signoffModal = document.querySelector("#signoff-modal");
const appConfirmModal = document.querySelector("#app-confirm-modal");
const createBarModal = document.querySelector("#create-bar-modal");
const printPreviewModal = document.querySelector("#print-preview-modal");
const printPreviewBody = document.querySelector("#print-preview-body");
const stageStrip = document.querySelector("#stage-strip");
const statusMessage = document.querySelector("#status-message");

function findStage(stageId) {
  if (stageId === "batch-record") return { ...stages.find(stage => stage.id === "qp-release"), id: "batch-record", title: "Batch Record", loginTitle: "Batch Record", entry: "Approved electronic batch records" };
  if (stageId === "qp-certified") {
    const qpStage = stages.find((stage) => stage.id === "qp-release") || stages[0];
    return {
      ...qpStage,
      id: "qp-certified",
      title: "QP Certified Batches",
      loginTitle: "QP Certified Batches Login",
      entry: "QP approved, rejected, or held batches"
    };
  }
  return stages.find((stage) => stage.id === stageId) || stages[0];
}

function statusClass(status) {
  if (status === "complete") return "done-status";
  if (status === "hold") return "hold-status";
  return "active-status";
}

function renderStageStrip() {
  const topLaunchers = [
    { label: "Machine", icon: "?", inactive: true },
    { label: "PI Label Print", icon: "?", inactive: true },
    { label: "PPM Audit", icon: "AUD", inactive: true },
    { label: "PPM Locations", icon: "?", inactive: true },
    { label: "PPM Audit History", icon: "?", inactive: true },
    { label: "Regulatory Task", icon: "?", stageId: "regulatory-task" },
    { label: "Regulatory Log", icon: "LOG", inactive: true },
    { label: "Product Add", icon: "+", stageId: "bar-creation" },
    { label: "Product", icon: "?", inactive: true },
    { label: "Packing List", icon: "?", stageId: "packing-list" },
    { label: "RPi Pack Creation", icon: "RPi", stageId: "rp-pack", rpiEntry: "pack-creation" },
    { label: "RPi Approval", icon: "RPi", stageId: "rp-pack", rpiEntry: "tasks" },
    { label: "Goods-in Summary", icon: "SUM", stageId: "goods-in-summary" },
    { label: "Pre QP", icon: "?", stageId: "pre-qp" },
    { label: "Release Log Sheet", icon: "LOG", stageId: "release-log" },
    { label: "Double Check", icon: "?", stageId: "pre-assembly-qc" },
    { label: "Batch Checker", icon: "?", stageId: "batch-checker" },
    { label: "BNS Batch Add", icon: "?", stageId: "bar-creation" },
    { label: "Printer", icon: "?", stageId: "label-printing" }
  ];
  const sideLaunchers = [
    { label: "Users", icon: "??", inactive: true },
    { label: "Leaflet Folding", icon: "?", stageId: "leaflet-folding" },
    { label: "Production Controller", icon: "?", stageId: "room-allocation" },
    { label: "Check IN/OUT", icon: "?", stageId: "assembly-room" },
    { label: "Assembly Room", icon: "?", stageId: "assembly-room" },
    { label: "Post Assembly", icon: "?", stageId: "post-assembly-qc" },
    { label: "Batch Record", icon: "BAR", stageId: "batch-record" },
    { label: "QP Release Dashboard", icon: "?", stageId: "qp-release" },
    { label: "QP Certified Batches", icon: "?", stageId: "qp-certified" },
    { label: "Released Labels", icon: "?", inactive: true },
    { label: "User Rights", icon: "??", inactive: true },
    { label: "Raw Pack Scanned Summary", icon: "?", inactive: true },
    { label: "Raw Pack Scanning", icon: "?", inactive: true },
    { label: "MISC", icon: "misc", inactive: true },
    { label: "Action Master", icon: "?", inactive: true },
    { label: "Product Recall", icon: "?", inactive: true },
    { label: "Room Log", icon: "?", inactive: true },
    { label: "PLPI Report", icon: "?", inactive: true },
    { label: "Goods In", icon: "X", stageId: "packing-list" },
    { label: "Logout", icon: "?", inactive: true },
    { label: "Exit", icon: "?", inactive: true }
  ];
  const renderLauncher = (item) => `
    <button class="legacy-launcher ${item.inactive ? "inactive" : ""}" type="button" ${item.stageId ? `data-login-stage="${item.stageId}"` : ""} ${item.rpiEntry ? `data-rpi-entry="${item.rpiEntry}"` : ""}>
      <span class="legacy-launcher-icon">${item.icon}</span>
      <span class="legacy-launcher-label">${item.label}</span>
    </button>
  `;
  stageStrip.innerHTML = `
    <div class="legacy-desktop-shell">
      <div class="legacy-top-launchers">${topLaunchers.map(renderLauncher).join("")}</div>
      <div class="legacy-desktop-workspace"><span>.</span></div>
      <div class="legacy-side-launchers">${sideLaunchers.map(renderLauncher).join("")}</div>
    </div>
  `;
}
function openDashboard() {
  welcomeWindow.classList.add("hidden");
  moduleWindow.classList.add("hidden");
  dashboardWindow.classList.add("hidden");
  currentStageId = null;
  document.querySelectorAll(".toolbar-item, .launcher-item, .legacy-launcher").forEach((item) => item.classList.remove("active"));
  statusMessage.textContent = isAuthenticated ? "Logged in. Select a module from the toolbar." : "Login required to access PLPI.";
}

function openInitialLogin() {
  initialLoginPending = true;
  openLogin(stages[0].id);
  document.querySelector("#login-title").textContent = "Login";
  document.querySelector("#login-user").value = "plpi.user";
  statusMessage.textContent = "Login required to access PLPI.";
}

function openLogin(stageId) {
  const stage = findStage(stageId);
  pendingStageId = stage.id;
  document.body.classList.add("login-transition");
  currentStageId = null;
  welcomeWindow.classList.add("hidden");
  dashboardWindow.classList.add("hidden");
  moduleWindow.classList.add("hidden");
  moduleWindow.className = "internal-window module-window hidden";
  document.querySelectorAll(".toolbar-item, .launcher-item, .legacy-launcher").forEach((item) => item.classList.remove("active"));
  document.querySelector("#stage-work-content").innerHTML = "";
  document.querySelector("#module-queue").innerHTML = "";
  document.querySelector("#stage-evidence").innerHTML = "";
  document.querySelector("#phase-controls").innerHTML = "";
  document.querySelector("#login-title").textContent = stage.id === "rp-pack" ? (rpiModuleView === "pack-creation" ? "RPi Pack Creation Login" : "RPi Approval Login") : "Login";
  document.querySelector("#login-user").value = stage.user;
  document.querySelector("#login-password").value = "password";
  loginModal.classList.remove("hidden");
  statusMessage.textContent = stage.id === "bar-creation" ? "Login requested for BNS Batch Add" : `Login requested for ${stage.loginTitle}`;
}

function closeLogin() {
  if (!isAuthenticated) {
    statusMessage.textContent = "Login is required to access PLPI.";
    return;
  }
  document.body.classList.remove("login-transition");
  loginModal.classList.add("hidden");

  moduleWindow.classList.add("hidden");
  dashboardWindow.classList.add("hidden");
  welcomeWindow.classList.add("hidden");
  currentStageId = null;
  statusMessage.textContent = "Login cancelled. Select a module to continue.";
}

function closeSignoffDialog() {
  signoffModal.classList.add("hidden");
  statusMessage.textContent = "User sign off cancelled";
}

function requestUserSignoff(action, stageName = "this stage") {
  resetAssemblyIdScanPrompt();
  pendingSignoffAction = action;
  let operation = "sign off";
  if (stageName === "RPi Approval") {
    operation = "sign off RPi Task";
  } else if (stageName === "Packing List" || stageName === "generated PO Packing List") {
    operation = "sign off Packing List";
  } else if (stageName === "RPi Pack documents") {
    operation = "sign off RPi Pack documents";
  } else if (stageName === "selected PO Packing Label lines" || stageName === "Packing Label") {
    operation = "Print Packing Label";
  } else if (stageName === "this assembly page") {
    operation = "sign off this assembly page";
  } else if (stageName === "QP Release Log") {
    operation = "sign off QP Release Log";
  } else if (stageName === "Label Printing" || stageName === "Leaflet Printing" || stageName === "Carton Issuing" || stageName === "Braille" || stageName === "Braille Printing" || stageName === "Leaflet Folding" || stageName === "Pre Assembly" || stageName === "Production Controller" || stageName === "Post Assembly" || stageName === "Pre QP" || stageName === "QP Release") {
    operation = "sign off " + stageName;
  } else {
    operation = "sign off " + stageName;
  }

  const isGeneratedPoSignoff = stageName === "generated PO Packing List";
  document.body.classList.toggle("generated-po-signoff-active", isGeneratedPoSignoff);
  appConfirmModal.classList.toggle("generated-po-signoff-confirm", isGeneratedPoSignoff);
  const isPrint = operation.toLowerCase().startsWith("print");
  const dialogTitle = isPrint ? `${operation} Confirmation` : "Confirm Sign Off";
  const subCopy = isPrint ? "Are you sure to continue with printing?" : "";

  document.querySelector("#app-confirm-title").textContent = dialogTitle;
  document.querySelector("#app-confirm-header").textContent = `Are you sure you want to ${operation}?`;
  document.querySelector("#app-confirm-copy").textContent = subCopy;

  const yesButton = document.querySelector("#app-confirm-yes");
  if (yesButton) {
    if (isPrint) {
      yesButton.textContent = "Yes, Print";
    } else {
      yesButton.textContent = "Yes, Sign Off";
    }
  }

  document.body.appendChild(appConfirmModal);
  appConfirmModal.style.position = "fixed";
  appConfirmModal.style.zIndex = "2147483600";
  const confirmWindow = appConfirmModal.querySelector(".confirm-window");
  if (confirmWindow) {
    confirmWindow.style.position = "relative";
    confirmWindow.style.zIndex = "2147483601";
  }
  appConfirmModal.classList.remove("hidden");
  statusMessage.textContent = "User sign off confirmation requested";
}

function closeAppConfirm() {
  pendingSignoffAction = null;
  releaseLogPasswordBatches = [];
  document.body.classList.remove("generated-po-signoff-active");
  appConfirmModal.classList.remove("generated-po-signoff-confirm");
  appConfirmModal.classList.add("hidden");
  resetAssemblyIdScanPrompt();
  statusMessage.textContent = "User sign off cancelled";
}

function requestAppConfirmation(action, title, header, copy, yesText) {
  resetAssemblyIdScanPrompt();
  pendingSignoffAction = action;
  document.querySelector("#app-confirm-title").textContent = title;
  document.querySelector("#app-confirm-header").textContent = header;
  document.querySelector("#app-confirm-copy").textContent = copy;
  const yesButton = document.querySelector("#app-confirm-yes");
  if (yesButton) yesButton.textContent = yesText;
  appConfirmModal.classList.remove("hidden");
  statusMessage.textContent = `${title} requested`;
}

function resetAssemblyIdScanPrompt() {
  const copy = document.querySelector("#app-confirm-copy");
  appConfirmModal.classList.remove("release-log-password-confirm");
  const cancelButton = appConfirmModal.querySelector(".confirm-actions [data-app-confirm-no]");
  if (cancelButton) cancelButton.textContent = "No";
  if (copy) {
    copy.classList.remove("assembly-id-scan-prompt", "release-log-password-prompt");
    copy.style.display = "none";
    copy.textContent = "";
  }
}

function requestAssemblyIdScan(action, actionName) {
  pendingSignoffAction = () => {
    const scanInput = document.querySelector("#assembly-id-scan-input");
    const scannedId = scanInput ? scanInput.value.trim() : "";
    if (!scannedId) {
      statusMessage.textContent = "ID scan is required. Please scan the operator ID card and try again.";
      return;
    }
    action(scannedId);
  };
  document.querySelector("#app-confirm-title").textContent = "Scan ID Card";
  document.querySelector("#app-confirm-header").textContent = actionName;
  const copy = document.querySelector("#app-confirm-copy");
  if (copy) {
    copy.classList.add("assembly-id-scan-prompt");
    copy.style.display = "block";
    copy.innerHTML = `
      <label class="assembly-scan-field">
        <span>Operator ID</span>
        <input id="assembly-id-scan-input" autocomplete="off" placeholder="Scan ID card" autofocus>
      </label>
    `;
  }
  const yesButton = document.querySelector("#app-confirm-yes");
  if (yesButton) yesButton.textContent = "Confirm Scan";
  appConfirmModal.classList.remove("hidden");
  window.setTimeout(() => document.querySelector("#assembly-id-scan-input")?.focus(), 50);
  statusMessage.textContent = `${actionName}: waiting for ID scan.`;
}

function confirmAppSignoff() {
  const action = pendingSignoffAction;
  if (releaseLogPasswordBatches.length) {
    const passwordInput = document.querySelector("#release-log-confirm-password");
    if (!passwordInput || !passwordInput.value.trim()) {
      if (passwordInput) passwordInput.classList.add("field-error");
      statusMessage.textContent = "Enter your password to confirm Release Log generation.";
      return;
    }
  }
  pendingSignoffAction = null;
  releaseLogPasswordBatches = [];
  document.body.classList.remove("generated-po-signoff-active");
  appConfirmModal.classList.remove("generated-po-signoff-confirm");
  appConfirmModal.classList.add("hidden");
  if (action) action();
  resetAssemblyIdScanPrompt();
}
function htmlSafe(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function closeSystemPopup() {
  document.querySelector("#system-popup-modal")?.remove();
}

function showSystemMessage(title, header, copy) {
  closeSystemPopup();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" id="system-popup-modal" role="dialog" aria-modal="true" aria-labelledby="system-popup-title">
      <div class="confirm-window app-confirm-window">
        <div class="internal-title">
          <span id="system-popup-title">${htmlSafe(title)}</span>
          <button type="button" class="close-button" data-system-popup-close>X</button>
        </div>
        <div class="confirm-body app-confirm-body">
          <div class="app-confirm-icon">OK</div>
          <div>
            <h2>${htmlSafe(header)}</h2>
            <p>${htmlSafe(copy)}</p>
          </div>
          <div class="confirm-actions">
            <button class="classic-button primary" type="button" data-system-popup-close>OK</button>
          </div>
        </div>
      </div>
    </div>
  `);
  document.querySelectorAll("[data-system-popup-close]").forEach((button) => {
    button.addEventListener("click", closeSystemPopup);
  });
}

function completeRpReject(poNo, comment) {
  if (rpPackWorkflows[poNo]) {
    rpRejectionComments[poNo] = comment;
    rpPackWorkflows[poNo].status = "Rejected by RPi";
    rpPackWorkflows[poNo].rpChecklistOpen = false;
    rpPackWorkflows[poNo].viewedDocs = {};
    rpPackWorkflows[poNo].rpTaskViewedDocs = {};
    rpPackWorkflows[poNo].documents = rpPackWorkflows[poNo].documents.map((doc) => ({ ...doc, uploaded: false, fileName: "", verified: false }));
    selectedRpApprovalPo = null;
    selectedRpPackPo = null;
    rpiModuleView = "pack-creation";
    currentStageId = "rp-pack";
    statusMessage.textContent = `PO ${poNo} rejected by RPi. Comments returned to RPi Pack Creation for re-upload.`;
    renderStage("rp-pack");
  }
}

function openRpRejectPopup(poNo) {
  closeSystemPopup();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" id="system-popup-modal" role="dialog" aria-modal="true" aria-labelledby="system-popup-title">
      <div class="confirm-window app-confirm-window rp-reject-popup-window">
        <div class="internal-title">
          <span id="system-popup-title">RPi Task Reject</span>
          <button type="button" class="close-button" data-system-popup-close>X</button>
        </div>
        <div class="confirm-body rp-reject-popup-body">
          <h2>Reject PO ${htmlSafe(poNo)}</h2>
          <p>Enter rejection comments to return this PO to RPi Pack for corrected document upload.</p>
          <textarea id="rp-reject-comment-input" rows="5" placeholder="Rejection comments"></textarea>
          <small id="rp-reject-comment-error" class="rp-reject-comment-error"></small>
          <div class="confirm-actions">
            <button class="classic-button" type="button" data-system-popup-close>Cancel</button>
            <button class="classic-button danger" type="button" id="rp-reject-confirm-btn">Reject</button>
          </div>
        </div>
      </div>
    </div>
  `);
  document.querySelectorAll("[data-system-popup-close]").forEach((button) => {
    button.addEventListener("click", closeSystemPopup);
  });
  document.querySelector("#rp-reject-confirm-btn")?.addEventListener("click", () => {
    const input = document.querySelector("#rp-reject-comment-input");
    const error = document.querySelector("#rp-reject-comment-error");
    const comment = input.value.trim();
    if (!comment) {
      error.textContent = "Rejection comments are required.";
      input.focus();
      return;
    }
    closeSystemPopup();
    completeRpReject(poNo, comment);
  });
  setTimeout(() => document.querySelector("#rp-reject-comment-input")?.focus(), 0);
}

function openCreateBarDialog(batchNumber) {
  selectedProduct = bnsProducts.find((product) => product.batch === batchNumber) || bnsProducts[0];
  document.querySelector("#create-bar-title").textContent = "Generate BAR Confirmation";
  document.querySelector("#create-bar-header").textContent = "Are you sure you want to generate the BAR?";
  document.querySelector("#create-bar-copy").textContent = `Do you want to generate the electronic BAR for selected Batch_No ${selectedProduct.batch}?`;
  createBarModal.classList.remove("hidden");
  statusMessage.textContent = "Create BAR confirmation requested";
}

function getBnsRowId(product) {
  if (product.recordId) return product.recordId;
  const sourceIndex = bnsProducts.indexOf(product);
  product.recordId = `BNS-ROW-${sourceIndex >= 0 ? sourceIndex : bnsProducts.length}`;
  return product.recordId;
}

function getSelectedBnsProducts() {
  return bnsSelectedRowIds
    .map((recordId) => bnsProducts.find((product) => getBnsRowId(product) === recordId))
    .filter(Boolean);
}

function buildSelectedBnsBatchRecord(products) {
  const totalQuantity = products.reduce((total, product) => total + (Number(product.quantity) || 0), 0);
  return {
    ...products[0],
    quantity: String(totalQuantity),
    leafletQuantity: String(totalQuantity),
    cartonQuantity: Number(products[0].cartonQuantity) > 0 ? String(totalQuantity) : products[0].cartonQuantity,
    brailleQuantity: products[0].brailleRequired ? String(totalQuantity) : products[0].brailleQuantity,
    combinedSourceRecords: products.map((product) => ({
      recordId: getBnsRowId(product),
      invoice: product.invoice,
      warehouse: product.warehouse,
      quantity: product.quantity
    }))
  };
}

function getBnsLineClearanceItems() {
  return [
    "PCL has been checked for completeness and invoice is attached",
    "Batch number and expiry date are correct",
    "Product name, strength, pack size and ECMA are correct"
  ];
}

function loadBnsLineClearanceRecords() {
  try {
    const saved = window.localStorage.getItem(BNS_LINE_CLEARANCE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function persistBnsLineClearanceRecords() {
  try {
    window.localStorage.setItem(BNS_LINE_CLEARANCE_STORAGE_KEY, JSON.stringify(bnsLineClearanceRecords));
  } catch (error) {
    return;
  }
}

function createEmptyBnsLineClearanceRecord(batchNumber) {
  return {
    batchNumber,
    department: "B&S Batch Add",
    checks: getBnsLineClearanceItems().map((label) => ({ label, checked: false })),
    comments: "",
    completedBy: "",
    completedAt: "",
    signedOff: false
  };
}

function getSavedBnsLineClearance(batchNumber) {
  const saved = bnsLineClearanceRecords[batchNumber];
  if (!saved) return null;
  const savedChecks = Array.isArray(saved.checks) ? saved.checks : [];
  saved.checks = getBnsLineClearanceItems().map((label, index) => ({
    label,
    checked: Boolean(savedChecks[index]?.checked)
  }));
  saved.batchNumber = batchNumber;
  return saved;
}

function ensureGeneratedBarRecord(product) {
  if (!product) return null;
  const existing = generatedBarRecords[product.batch] || {};
  const savedClearance = getSavedBnsLineClearance(product.batch)
    || existing.bnsLineClearance
    || createEmptyBnsLineClearanceRecord(product.batch);
  bnsLineClearanceRecords[product.batch] = savedClearance;
  generatedBarRecords[product.batch] = {
    ...existing,
    batchNumber: product.batch,
    product: { ...product },
    totalPages: getGeneratedBarTotalPages(product),
    generatedBy: existing.generatedBy || (barCreatedRecord ? barCreatedRecord.user : currentLogin ? currentLogin.user : "bar.creation"),
    generatedAt: existing.generatedAt || (barCreatedRecord ? barCreatedRecord.dateTime : getAssemblyAuditTimestamp()),
    status: existing.status || "Generated",
    bnsLineClearance: savedClearance
  };
  persistBnsLineClearanceRecords();
  return generatedBarRecords[product.batch];
}

function captureBnsLineClearance(completed = false) {
  if (!selectedProduct) return;
  const checkInputs = [...document.querySelectorAll("[data-process-check]")];
  const comments = document.querySelector("[data-process-comment]")?.value || "";
  const record = ensureGeneratedBarRecord(selectedProduct);
  const previous = getSavedBnsLineClearance(selectedProduct.batch) || record.bnsLineClearance || {};
  const savedRecord = {
    batchNumber: selectedProduct.batch,
    department: "B&S Batch Add",
    checks: getBnsLineClearanceItems().map((label, index) => ({
      label,
      checked: Boolean(checkInputs[index]?.checked)
    })),
    comments,
    completedBy: completed ? (currentLogin ? currentLogin.user : "bar.creation") : (previous.completedBy || ""),
    completedAt: completed ? getAssemblyAuditTimestamp() : (previous.completedAt || ""),
    signedOff: completed || Boolean(previous.signedOff)
  };
  bnsLineClearanceRecords[selectedProduct.batch] = savedRecord;
  record.bnsLineClearance = savedRecord;
  persistBnsLineClearanceRecords();
  return savedRecord;
}

function getBnsProductName(product) {
  return String(product.product || product.foreignName || product.description || "").trim().toLowerCase();
}

function canCombineBnsProducts(products) {
  if (products.length < 2) return true;
  const first = products[0];
  return products.every((product) =>
    String(product.partNo || "").trim().toLowerCase() === String(first.partNo || "").trim().toLowerCase()
    && getBnsProductName(product) === getBnsProductName(first)
    && String(product.batch || "").trim().toLowerCase() === String(first.batch || "").trim().toLowerCase()
    && String(product.expiry || "").trim().toLowerCase() === String(first.expiry || "").trim().toLowerCase()
  );
}

function closeBnsCombineWarning() {
  document.querySelector("#bns-combine-warning-modal")?.remove();
}

function showBnsCombineWarning(warning, addedRecordId, onYes = null, removeSelectionOnNo = true) {
  closeBnsCombineWarning();
  const rows = Array.isArray(warning.rows) ? warning.rows : [];
  const rowsMarkup = rows.length
    ? `
      <table class="classic-table" style="width: 100%; margin-bottom: 8px;">
        <thead><tr><th>Order No</th><th>Quantity</th></tr></thead>
        <tbody>${rows.map((row) => `<tr><td>${htmlSafe(row.orderNo)}</td><td>${htmlSafe(row.quantity)}</td></tr>`).join("")}</tbody>
      </table>
    `
    : "";
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" id="bns-combine-warning-modal" role="dialog" aria-modal="true" aria-labelledby="bns-combine-warning-title">
      <div class="confirm-window" style="width: 585px;">
        <div class="internal-title">
          <span id="bns-combine-warning-title">${htmlSafe(warning.title)}</span>
          <button type="button" class="close-button" data-bns-combine-no>X</button>
        </div>
        <div class="confirm-body" style="padding: 10px 12px;">
          ${rowsMarkup}
          <h2 style="font-size: 20px; margin: 8px 0 14px;">${htmlSafe(warning.message)}</h2>
          <div class="confirm-actions">
            <button class="classic-button primary" type="button" data-bns-combine-yes>Yes</button>
            <button class="classic-button" type="button" data-bns-combine-no>No</button>
          </div>
        </div>
      </div>
    </div>
  `);
  document.querySelector("[data-bns-combine-yes]")?.addEventListener("click", () => {
    closeBnsCombineWarning();
    statusMessage.textContent = "Related batch warning accepted.";
    if (onYes) onYes();
  });
  document.querySelectorAll("[data-bns-combine-no]").forEach((button) => {
    button.addEventListener("click", () => {
      if (removeSelectionOnNo && addedRecordId) {
        bnsSelectedRowIds = bnsSelectedRowIds.filter((recordId) => recordId !== addedRecordId);
      }
      closeBnsCombineWarning();
      if (removeSelectionOnNo) renderStage("bar-creation");
      statusMessage.textContent = removeSelectionOnNo ? "Batch combination cancelled." : "Generate BAR cancelled.";
    });
  });
}

function updateBnsBatchSelection(input) {
  const recordId = input.dataset.bnsSelect;
  if (!input.checked) {
    bnsSelectedRowIds = bnsSelectedRowIds.filter((value) => value !== recordId);
    renderStage("bar-creation");
    statusMessage.textContent = "Batch removed from the BAR combination.";
    return;
  }

  const candidate = bnsProducts.find((product) => getBnsRowId(product) === recordId);
  const proposedIds = [...bnsSelectedRowIds, recordId];
  const proposedProducts = proposedIds
    .map((id) => bnsProducts.find((product) => getBnsRowId(product) === id))
    .filter(Boolean);

  if (!canCombineBnsProducts(proposedProducts)) {
    input.checked = false;
    showSystemMessage(
      "Batches Cannot Be Combined",
      "Selected batch details do not match",
      "Batches can only be combined when Product Name / PART_NO, BATCH_NO and EXPIRY_DATE are the same."
    );
    statusMessage.textContent = "Combination blocked because the selected batch details do not match.";
    return;
  }

  bnsSelectedRowIds = proposedIds;
  renderStage("bar-creation");
  statusMessage.textContent = proposedProducts.length > 1
    ? `${proposedProducts.length} matching batches selected for one BAR.`
    : "Batch selected for BAR creation.";
}

function openSelectedBnsBarDialog(warningAccepted = false) {
  const products = getSelectedBnsProducts();
  if (!products.length) {
    showSystemMessage("BNS Batch Creation", "No batch selected", "Select at least one batch before creating the BAR.");
    return;
  }
  if (!canCombineBnsProducts(products)) {
    showSystemMessage(
      "Batches Cannot Be Combined",
      "Selected batch details do not match",
      "Batches can only be combined when Product Name / PART_NO, BATCH_NO and EXPIRY_DATE are the same."
    );
    return;
  }
  const relatedWarning = products.find((product) => product.combineWarning)?.combineWarning;
  if (relatedWarning && !warningAccepted) {
    showBnsCombineWarning(
      relatedWarning,
      null,
      () => openSelectedBnsBarDialog(true),
      false
    );
    return;
  }
  const totalQuantity = products.reduce((total, product) => total + (Number(product.quantity) || 0), 0);
  selectedProduct = buildSelectedBnsBatchRecord(products);
  document.querySelector("#create-bar-title").textContent = products.length > 1 ? "Combined BAR Confirmation" : "Generate BAR Confirmation";
  document.querySelector("#create-bar-header").textContent = products.length > 1
    ? "Are you sure you want to combine and generate one BAR?"
    : "Are you sure you want to generate the BAR?";
  document.querySelector("#create-bar-copy").textContent = products.length > 1
    ? `${products.length} matching batches will be combined for Batch_No ${selectedProduct.batch}. Total quantity: ${totalQuantity}.`
    : `Do you want to create BAR for selected Batch_No ${selectedProduct.batch}?`;
  createBarModal.classList.remove("hidden");
  statusMessage.textContent = "Create BAR confirmation requested";
}

function openBnsBatchDetailsPreview() {
  const products = getSelectedBnsProducts();
  if (!products.length) {
    showSystemMessage("Print Batch Details", "No batch selected", "Select at least one batch to display its Batch Assembly Record.");
    return;
  }
  if (!canCombineBnsProducts(products)) {
    showSystemMessage(
      "Batch Details Unavailable",
      "Selected batch details do not match",
      "A combined Batch Assembly Record can only be created when Product Name / PART_NO, BATCH_NO and EXPIRY_DATE are the same."
    );
    return;
  }

  const product = buildSelectedBnsBatchRecord(products);
  printPreviewRequest = {
    type: "bns-batch-details",
    batchNumber: product.batch,
    product,
    workflowMode: "bns-batch-details"
  };
  document.querySelector("#print-preview-title").textContent = "Print Batch Details";
  printPreviewModal.classList.add("batch-details-print-mode");
  printPreviewBody.innerHTML = `
    <div class="batch-details-preview-toolbar">
      <div>
        <strong>Batch Assembly Record</strong>
        <span>B&amp;S Batch Number: ${htmlSafe(product.batch)}</span>
      </div>
      <button class="classic-button primary" id="batch-details-print-button" type="button">Print Batch Details</button>
    </div>
    <section class="batch-assembly-record" aria-label="Batch Assembly Record">
      <h1>Batch Assembly Record</h1>
      <div class="batch-record-layout">
        <div class="batch-record-main">
          <div class="batch-record-field batch-record-product">
            <span>Product<br>Name</span><strong>${htmlSafe(product.product || "-")}</strong>
          </div>
          <div class="batch-record-field">
            <span>Foreign<br>Name</span><strong>${htmlSafe(product.foreignName || "-")}</strong>
          </div>
          <div class="batch-record-field">
            <span>Strength</span><strong>${htmlSafe(product.strength || "-")}</strong>
          </div>
          <div class="batch-record-field">
            <span>Pack Size</span><strong>${htmlSafe(product.packSize || "-")}</strong>
          </div>
          <div class="batch-record-field">
            <span>ECMA</span><strong>${htmlSafe(product.ecma || "-")}</strong>
          </div>
          <div class="batch-record-split">
            <div class="batch-record-field">
              <span>PL No</span><strong>${htmlSafe(product.pl || "-")}</strong>
            </div>
            <div class="batch-record-field batch-record-units">
              <span>Units per pack</span><strong>${htmlSafe(product.unitsPerPack || "1")}</strong>
            </div>
          </div>
          <div class="batch-record-field">
            <span>Country of<br>origin</span><strong>${htmlSafe(product.country || "-")}</strong>
          </div>
          <div class="batch-record-dates">
            <div class="batch-record-field">
              <span>Product<br>Introduced</span><strong>${htmlSafe(product.productIntroduced || "-")}</strong>
            </div>
            <div class="batch-record-field">
              <span>Leaflet Date</span><strong>${htmlSafe(product.leafletDate || "-")}</strong>
            </div>
          </div>
          <div class="batch-record-field batch-record-revised">
            <span>Date Revised</span><strong>${htmlSafe(product.dateRevised || "-")}</strong>
          </div>
        </div>
        <aside class="batch-record-codes">
          <div class="batch-record-code">
            <span>B&amp;S Batch Number</span>
            <strong>${htmlSafe(product.batch || "-")}</strong>
            <i aria-hidden="true"></i>
          </div>
          <div class="batch-record-code">
            <span>Expiry Date</span>
            <strong>${htmlSafe(product.expiry || "-")}</strong>
            <i aria-hidden="true"></i>
          </div>
        </aside>
      </div>
      <div class="batch-record-variation">
        <span>Variation Information<br>(If Applicable)</span>
        <strong>${htmlSafe(product.variationInfo || "")}</strong>
      </div>
    </section>
  `;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = `Batch Assembly Record displayed for B&S Batch Number ${product.batch}.`;
}

function printBnsBatchDetails() {
  if (printPreviewRequest?.workflowMode !== "bns-batch-details") return;
  const batchNumber = printPreviewRequest.batchNumber;
  statusMessage.textContent = `Batch Assembly Record sent to print for B&S Batch Number ${batchNumber}.`;
  window.print();
}

function closeCreateBarDialog() {
  createBarModal.classList.add("hidden");
  statusMessage.textContent = "Create BAR cancelled";
}

function confirmCreateBar() {
  barCreated = true;
  barMovedToNextStage = false;
  signOffRecord = null;
  barCreatedRecord = {
    user: currentLogin ? currentLogin.user : "bar.creation",
    dateTime: new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  };
  combinedBarProducts[selectedProduct.batch] = selectedProduct;
  ensureGeneratedBarRecord(selectedProduct);
  createBarModal.classList.add("hidden");
  renderStage("bar-creation");
  statusMessage.textContent = `One BAR generated for ${selectedProduct.batch} with total quantity ${selectedProduct.quantity}. Complete line clearance checks.`;
}

function updateSignoffAvailability() {
  const checks = [...document.querySelectorAll("[data-process-check]")];
  const signoffButton = document.querySelector("#user-signoff-button");
  if (!checks.length || !signoffButton || signOffRecord) return;

  const allChecked = checks.every((check) => check.checked);
  signoffButton.disabled = !allChecked;
  if (allChecked) {
    statusMessage.textContent = "All line-clearance checks are complete. User Sign Off is available.";
  } else {
    statusMessage.textContent = "Complete all line-clearance checks to enable User Sign Off.";
  }
}

function getLabelRequirements(product) {
  return product.routeType === "Reboxing"
    ? [
{ label: "Carton Label", reference: product.ecma, size: product.packSize, quantity: product.quantity },
{ label: "End Of Pack Label", reference: product.ecma, size: product.packSize, quantity: product.quantity },
{ label: "Security Seals", reference: "Seal", size: "Standard", quantity: "2" }
      ]
    : [
{ label: "Blister / Pack Label", reference: product.ecma, size: product.packSize, quantity: product.quantity },
{ label: "Obscure Label", reference: product.ecma, size: "Standard", quantity: product.quantity }
      ];
}

function renderLabelPrintingDocumentList(product) {
  const batchDocuments = [
    { type: "carton", action: "view" },
    { type: "peel", action: "view" },
    { type: "braille", action: "view" },
    { type: "mockup", action: "view" },
    { type: "bar", action: "view" }
  ];
  const continuationPages = [
    { type: "generated-bar-print", action: "generated-bar" },
    { type: "label-attachment", action: "print" },
    { type: "bar-continuation", action: "print" },
    { type: "cold-chain", action: "print" }
  ];
  if (product.routeType === "Reboxing") {
    continuationPages.push({ type: "reboxing-form", action: "print" });
  }
  const renderDocuments = (documents) => documents.map((item) => {
    const document = getApprovedArtworkMetadata(item.type, product);
    const actionAttributes = item.action === "print"
      ? `data-print-continuation-page="${item.type}" data-continuation-batch="${product.batch}"`
      : item.action === "generated-bar"
        ? `data-print-generated-bar="${product.batch}"`
        : `data-view-approved-artwork="${item.type}" data-approved-artwork-batch="${product.batch}"`;
    return `<button class="label-document-link" type="button" ${actionAttributes}><span class="label-document-icon" aria-hidden="true">&#9635;</span><span class="label-document-text">${document.buttonLabel}</span></button>`;
  }).join("");
  return `
    <div class="label-document-group">
      <h3>Batch Documents</h3>
      <div class="label-document-list">${renderDocuments(batchDocuments)}</div>
    </div>
    <div class="label-document-group">
      <h3>Continuation Page</h3>
      <div class="label-document-list">${renderDocuments(continuationPages)}</div>
    </div>`;
}

function renderPrintingProductSidebar(product) {
  return `
    <aside class="label-product-sidebar">
      <h2>Product Information</h2>
      <dl class="label-sidebar-details">
        <div><dt>Product Name</dt><dd>${product.product}</dd></div>
        <div><dt>Foreign Name</dt><dd>${product.foreignName || "-"}</dd></div>
        <div><dt>Strength</dt><dd>${product.strength}</dd></div>
        <div><dt>Country of origin</dt><dd>${product.country}</dd></div>
        <div><dt>Pack Size</dt><dd>${product.packSize}</dd></div>
        <div><dt>Units per pack</dt><dd>${product.unitsPerPack || "1"}</dd></div>
        <div><dt>B&amp;S Batch Number</dt><dd>${product.batch}</dd></div>
        <div><dt>ECMA</dt><dd>${product.ecma}</dd></div>
        <div><dt>Expiry Date</dt><dd>${product.expiry}</dd></div>
        <div><dt>PL No.</dt><dd>${product.pl}</dd></div>
        <div><dt>Quantity</dt><dd>${product.quantity}</dd></div>
        <div><dt>Product Introduced</dt><dd>${product.productIntroduced || "-"}</dd></div>
        <div><dt>Mfg. Lot No.</dt><dd>${product.manufLotNo || product.manufacturingLot || "-"}</dd></div>
        <div><dt>Leaflet Date</dt><dd>${product.leafletDate || "-"}</dd></div>
        <div><dt>Date Revised</dt><dd>${product.dateRevised || "-"}</dd></div>
      </dl>
      <section class="label-sidebar-documents">
        ${renderLabelPrintingDocumentList(product)}
      </section>
    </aside>`;
}

function renderProductionCheckingProductInformation(product) {
  return `
    <aside class="label-product-sidebar production-checking-product-information">
      <h2>Product Information</h2>
      <dl class="label-sidebar-details">
        <div><dt>Product Name</dt><dd>${product.product}</dd></div>
        <div><dt>Foreign Name</dt><dd>${product.foreignName || "-"}</dd></div>
        <div><dt>Strength</dt><dd>${product.strength}</dd></div>
        <div><dt>Country of origin</dt><dd>${product.country}</dd></div>
        <div><dt>Pack Size</dt><dd>${product.packSize}</dd></div>
        <div><dt>Units per pack</dt><dd>${product.unitsPerPack || "1"}</dd></div>
        <div><dt>B&amp;S Batch Number</dt><dd>${product.batch}</dd></div>
        <div><dt>ECMA</dt><dd>${product.ecma}</dd></div>
        <div><dt>Expiry Date</dt><dd>${product.expiry}</dd></div>
        <div><dt>PL No.</dt><dd>${product.pl}</dd></div>
        <div><dt>Quantity</dt><dd>${product.quantity}</dd></div>
        <div><dt>Product Introduced</dt><dd>${product.productIntroduced || "-"}</dd></div>
        <div><dt>Mfg. Lot No.</dt><dd>${product.manufLotNo || product.manufacturingLot || "-"}</dd></div>
        <div><dt>Leaflet Date</dt><dd>${product.leafletDate || "-"}</dd></div>
        <div><dt>Date Revised</dt><dd>${product.dateRevised || "-"}</dd></div>
      </dl>
    </aside>`;
}

function renderPrintingWorkflowMeta(product) {
  return `
    <dl class="label-workflow-meta">
      <div><dt>B&amp;S Batch Number</dt><dd>${product.batch}</dd></div>
      <div><dt>ECMA</dt><dd>${product.ecma}</dd></div>
      <div><dt>Expiry Date</dt><dd>${product.expiry}</dd></div>
      <div><dt>PL No.</dt><dd>${product.pl}</dd></div>
      <div><dt>Quantity</dt><dd>${product.quantity}</dd></div>
      <div><dt>Product Introduced</dt><dd>${product.productIntroduced || "-"}</dd></div>
      <div><dt>Mfg. Lot No.</dt><dd>${product.manufLotNo || product.manufacturingLot || "-"}</dd></div>
    </dl>`;
}

function getLeafletRequirements(product) {
  return [
    { label: "Leaflet", reference: product.ecma, size: `${product.packSize} leaflet`, quantity: product.leafletQuantity }
  ];
}

function getLeafletInitialInHandQuantity(product) {
  return Math.max(0, Number(product.leafletInHandQuantity ?? product.onHandQuantity ?? product.leafletQuantity ?? product.quantity ?? 0));
}

function getLeafletInHandQuantity(product, record, itemLabel) {
  const issuedQuantity = Number((record.leafletIssuedQuantities || {})[itemLabel] || 0);
  return getLeafletInitialInHandQuantity(product) - issuedQuantity;
}

function getBrailleRequirements(product) {
  return [
    { label: "Braille Label", reference: product.ecma, size: product.packSize, quantity: product.brailleQuantity || product.quantity },
    { label: "Braille Declaration Copy", reference: product.pl, size: "Master copy", quantity: "1" }
  ];
}

function getPrintRecord(type, batchNumber) {
  if (type === "label") return labelPrintRecords[batchNumber] || {};
  if (type === "leaflet") return leafletPrintRecords[batchNumber] || {};
  if (type === "braille") return braillePrintRecords[batchNumber] || {};
  return {};
}

function loadLabelPrintRecords() {
  try {
    const saved = window.localStorage.getItem(LABEL_PRINT_RECORDS_STORAGE_KEY);
    const records = saved ? JSON.parse(saved) : {};
    if (!window.localStorage.getItem(LABEL_MANUAL_COMPLETION_MIGRATION_KEY)) {
      Object.values(records).forEach((record) => {
        const automaticallyCompletedLabels = Object.keys(record.printRuns || {}).filter((label) => {
          const completion = (record.itemCompletions || {})[label];
          return completion && !completion.confirmedManually;
        });
        if (!automaticallyCompletedLabels.length) return;
        record.itemsPrinted = (record.itemsPrinted || []).filter((label) => !automaticallyCompletedLabels.includes(label));
        const retainedCompletions = { ...(record.itemCompletions || {}) };
        automaticallyCompletedLabels.forEach((label) => delete retainedCompletions[label]);
        record.itemCompletions = retainedCompletions;
        record.printed = false;
        record.finalized = false;
        delete record.finalizedAt;
        delete record.finalizedBy;
      });
      window.localStorage.setItem(LABEL_PRINT_RECORDS_STORAGE_KEY, JSON.stringify(records));
      window.localStorage.setItem(LABEL_MANUAL_COMPLETION_MIGRATION_KEY, "complete");
    }
    return records;
  } catch (error) {
    return {};
  }
}

function persistLabelPrintRecords() {
  try {
    window.localStorage.setItem(LABEL_PRINT_RECORDS_STORAGE_KEY, JSON.stringify(labelPrintRecords));
  } catch (error) {
    return;
  }
}

function loadLeafletPrintRecords() {
  try {
    const saved = window.localStorage.getItem(LEAFLET_PRINT_RECORDS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function persistLeafletPrintRecords() {
  try {
    window.localStorage.setItem(LEAFLET_PRINT_RECORDS_STORAGE_KEY, JSON.stringify(leafletPrintRecords));
  } catch (error) {
    return;
  }
}

function savePrintRecord(type, batchNumber, record) {
  if (type === "label") labelPrintRecords[batchNumber] = record;
  if (type === "leaflet") leafletPrintRecords[batchNumber] = record;
  if (type === "braille") braillePrintRecords[batchNumber] = record;
  if (type === "label") persistLabelPrintRecords();
  if (type === "leaflet") persistLeafletPrintRecords();
}

function getPrintProduct(type, batchNumber) {
  if (type === "label") return labelSelectedProduct || bnsProducts.find((item) => item.batch === batchNumber);
  if (type === "leaflet") return leafletSelectedProduct || bnsProducts.find((item) => item.batch === batchNumber);
  if (type === "braille") return brailleSelectedProduct || bnsProducts.find((item) => item.batch === batchNumber);
  return bnsProducts.find((item) => item.batch === batchNumber);
}

function getPrintRequirements(type, product) {
  if (type === "label") return getLabelRequirements(product);
  if (type === "leaflet") return getLeafletRequirements(product);
  if (type === "braille") return getBrailleRequirements(product);
  return [];
}

function getPrintInputSelector(type) {
  if (type === "label") return "[data-label-print-qty]";
  if (type === "leaflet") return "[data-leaflet-print-qty]";
  if (type === "braille") return "[data-braille-print-qty]";
  if (type === "carton") return "[data-carton-print-qty]";
  return "";
}

function getPrintItemDatasetKey(type) {
  if (type === "label") return "labelName";
  if (type === "leaflet") return "leafletName";
  if (type === "braille") return "brailleName";
  if (type === "carton") return "cartonName";
  return "";
}

function collectRowExtras(type) {
  const extras = {};
  document.querySelectorAll(`[data-${type}-extra-qty]`).forEach((input) => {
    const item = input.dataset.extraItem;
    const reason = document.querySelector(`[data-${type}-extra-reason][data-extra-item="${item}"]`);
    extras[item] = {
      quantity: input.value || "0",
      reason: reason ? reason.value || "" : ""
    };
  });
  return extras;
}

function rowExtraHasMissingReason(rowExtras = {}) {
  return Object.values(rowExtras).some((extra) => Number(extra.quantity || 0) > 0 && !extra.reason);
}

function isPrintItemDone(record, label) {
  return Boolean((record.itemsPrinted && record.itemsPrinted.includes(label)) || (record.itemCompletions && record.itemCompletions[label]));
}

function syncTestPrintButtons(type) {
  document.querySelectorAll(`[data-test-preview-print][data-preview-type="${type}"]`).forEach((button) => {
    button.disabled = false;
  });
}

function getPreviewPageCount(type) {
  if (type === "leaflet") return 4;
  if (type === "braille") return 1;
  return 2;
}

function openPrintPreview(type, batchNumber, itemLabel, isTestPrint = false) {
  const product = getPrintProduct(type, batchNumber);
  if (!product) return;
  const requirement = getPrintRequirements(type, product).find((item) => item.label === itemLabel);
  if (!requirement) return;
  const input = document.querySelector(`${getPrintInputSelector(type)}[data-${type}-name="${itemLabel}"]`);
  const record = getPrintRecord(type, batchNumber);
  const savedQuantity = (record.quantities || []).find((item) => item.label === itemLabel);
  const quantity = savedQuantity ? savedQuantity.quantity : input ? input.value || "0" : requirement.quantity;
  const pageCount = getPreviewPageCount(type);
  printPreviewRequest = { type, batchNumber, itemLabel, quantity: isTestPrint ? "" : quantity, isTestPrint };
  document.querySelector("#print-preview-title").textContent = isTestPrint ? "Test Print" : "Print Preview";
  if (isTestPrint) {
    printPreviewBody.innerHTML = `
      <div class="preview-toolbar test-print-preview-toolbar">
        <label>Quantity
          <input id="preview-print-quantity" type="number" min="1" max="${requirement.quantity}" value="" autocomplete="off">
        </label>
        <label>Select Printer
          <select id="preview-printer">
            <option>PLPI Label Printer 01</option>
            <option>PLPI Leaflet Printer 02</option>
            <option>PLPI Braille Printer 03</option>
            <option>PDF Preview</option>
          </select>
        </label>
        <button class="classic-button primary" type="button" id="preview-print-button">Print</button>
      </div>
      <div class="preview-pages test-print-preview-pages">
        <section class="preview-page preview-${type}">
          <div class="preview-page-header">${itemLabel}</div>
          <div class="preview-art">
            <strong>${product.product}</strong>
            <span>${product.strength} | ${product.packSize}</span>
            <span>B&S Batch Number: ${product.batch}</span>
            <span>Expiry: ${product.expiry}</span>
            <i></i>
          </div>
        </section>
      </div>`;
    printPreviewModal.classList.remove("hidden");
    statusMessage.textContent = `Test Print opened for ${itemLabel}.`;
    return;
  }
  printPreviewBody.innerHTML = `
    <div class="preview-toolbar">
      <div>
<strong>${itemLabel}</strong>
<span>${product.product} | ${product.batch} | Required Qty ${requirement.quantity}</span>
      </div>
      <label>Printer
<select id="preview-printer">
  <option>PLPI Label Printer 01</option>
  <option>PLPI Leaflet Printer 02</option>
  <option>PLPI Braille Printer 03</option>
  <option>PDF Preview</option>
</select>
      </label>
      <button class="classic-button primary" type="button" id="preview-print-button">Print</button>
    </div>
    <div class="preview-page-count">Pages: ${pageCount}</div>
    <div class="preview-pages">
      ${Array.from({ length: pageCount })
.map(
  (_, index) => `
    <section class="preview-page preview-${type}">
      <div class="preview-page-header">${itemLabel} | Page ${index + 1} of ${pageCount}</div>
      <div class="preview-art">
<strong>${product.product}</strong>
<span>${product.strength} | ${product.packSize}</span>
<span>B&S Batch Number: ${product.batch}</span>
<span>Expiry: ${product.expiry}</span>
<i></i>
      </div>
    </section>
  `
)
.join("")}
    </div>
  `;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = `Preview opened for ${itemLabel}.`;
}

function closePrintPreview() {
  closePoPackingListInlineSignoffConfirm();
  const shouldRefreshRpTask = currentStageId === "rp-pack" && rpiModuleView === "tasks" && activePreviewPo && rpPackWorkflows[activePreviewPo]?.rpTaskViewedDocs?.["generated-packing-list"] === true;
  const shouldRefreshRpPackDocs = currentStageId === "rp-pack" && rpiModuleView === "pack-creation" && activePreviewPo && rpPackWorkflows[activePreviewPo]?.viewedDocs?.["generated-packing-list"] === true;
  const shouldRefreshLeafletPrinting = currentStageId === "label-printing" && ["leaflet-pdf", "leaflet-extra-pdf", "leaflet-unified-pdf"].includes(printPreviewRequest?.workflowMode);
  printPreviewRequest = null;
  document.querySelector("#print-preview-title").textContent = "Print Preview";
  printPreviewModal.classList.add("hidden");
  printPreviewModal.classList.remove("leaflet-extra-entry-mode");
  printPreviewModal.classList.remove("carton-extra-entry-mode");
  printPreviewModal.classList.remove("batch-details-print-mode");
  printPreviewModal.classList.remove("bar-record-preview-mode");
  printPreviewModal.classList.remove("continuation-page-preview-mode");
  if (shouldRefreshRpTask) {
    renderStage("rp-pack");
    setTimeout(updateRpApprovalAvailability, 0);
  } else if (shouldRefreshRpPackDocs) {
    renderStage("rp-pack");
    setTimeout(updateRpDocumentsAvailability, 0);
  } else if (shouldRefreshLeafletPrinting) {
    renderStage("label-printing");
  }
}

function getPrintItemRemaining(record, requirement) {
  const required = Number(requirement.quantity || 0);
  const hasTrackedTotal = Object.prototype.hasOwnProperty.call(record.itemPrintTotals || {}, requirement.label);
  if (!hasTrackedTotal && isPrintItemDone(record, requirement.label)) return 0;
  const printed = Number((record.itemPrintTotals || {})[requirement.label] || 0);
  return Math.max(0, required - printed);
}

function openQuantityPrintDialog(type, batchNumber, itemLabel, isExtra = false) {
  const product = getPrintProduct(type, batchNumber);
  if (!product) return;
  const requirement = getPrintRequirements(type, product).find((item) => item.label === itemLabel);
  if (!requirement) return;
  const record = getPrintRecord(type, batchNumber);
  const remaining = getPrintItemRemaining(record, requirement);
  const leafletLineDone = type === "leaflet" && isPrintItemDone(record, itemLabel);
  if (isExtra && type === "leaflet" && !leafletLineDone) {
    statusMessage.textContent = `Mark ${itemLabel} as done before using Print Extra.`;
    return;
  }
  if (isExtra && type !== "leaflet" && remaining > 0) {
    statusMessage.textContent = `Print the remaining ${remaining} required ${itemLabel} labels before using Print Extra.`;
    return;
  }
  if (!isExtra && type !== "label" && remaining <= 0) {
    statusMessage.textContent = `${itemLabel} required quantity is complete. Use Print Extra for additional labels.`;
    return;
  }
  if (type === "leaflet" && !isExtra) {
    printPreviewModal.classList.remove("leaflet-extra-entry-mode");
    const openedAt = getAssemblyAuditTimestamp();
    const openedBy = currentLogin ? currentLogin.user : "printer.user";
    const pdfOpenEvent = { user: openedBy, dateTime: openedAt };
    savePrintRecord(type, batchNumber, {
      ...record,
      pdfOpenedItems: Array.from(new Set([...(record.pdfOpenedItems || []), itemLabel])),
      pdfOpenEvents: {
        ...(record.pdfOpenEvents || {}),
        [itemLabel]: [...((record.pdfOpenEvents || {})[itemLabel] || []), pdfOpenEvent]
      }
    });
    auditPrinterAction(`${itemLabel} PDF Opened`, product, `Leaflet PDF opened by ${openedBy} at ${openedAt} for printing through the PDF viewer.`);
    printPreviewRequest = { type, batchNumber, itemLabel, workflowMode: "leaflet-pdf" };
    document.querySelector("#print-preview-title").textContent = "Leaflet PDF";
    printPreviewBody.innerHTML = `
      <div class="preview-pages leaflet-pdf-only-preview">
        <section class="preview-page preview-leaflet">
          <div class="preview-page-header">Leaflet PDF | ${itemLabel}</div>
          <div class="preview-art">
            <strong>${product.product}</strong>
            <span>${product.strength} | ${product.packSize}</span>
            <span>B&amp;S Batch Number: ${product.batch}</span>
            <span>Expiry: ${product.expiry}</span>
            <i></i>
          </div>
        </section>
      </div>`;
    printPreviewModal.classList.remove("hidden");
    statusMessage.textContent = `Leaflet PDF opened for ${itemLabel}. Use the PDF viewer to print, then close it and select Mark as Done.`;
    return;
  }  printPreviewRequest = { type, batchNumber, itemLabel, workflowMode: isExtra ? "extra" : "required", remaining };
  printPreviewModal.classList.toggle("leaflet-extra-entry-mode", type === "leaflet" && isExtra);
  document.querySelector("#print-preview-title").textContent = isExtra
    ? "Print Extra"
    : type === "leaflet"
      ? "Leaflet PDF"
      : "Print";
  const reasonOptions = `
    <option value="">Select reason</option>
    <option>Print damage</option>
    <option>Line setup waste</option>
    <option>Reconciliation correction</option>
    <option>Printing alignment check</option>
    <option>Supervisor approved extra</option>`;
  printPreviewBody.innerHTML = `
    <div class="preview-toolbar print-run-toolbar ${isExtra ? "extra-print-toolbar" : ""} ${type === "label" && !isExtra ? "label-print-toolbar" : ""} ${type === "leaflet" && isExtra ? "leaflet-extra-print-toolbar" : ""} ${type === "leaflet" && !isExtra ? "leaflet-pdf-print-toolbar" : ""}">
      ${isExtra
        ? `<label>Extra Quantity
             <input id="preview-print-quantity" type="number" min="1" value="" autocomplete="off">
           </label>
           <label>Reason for Extra
             <select id="preview-extra-reason">${reasonOptions}</select>
           </label>`
        : type === "leaflet"
          ? `<label>Quantity to Print
               <input id="preview-print-quantity" type="number" min="1" max="${remaining}" value="" autocomplete="off">
             </label>`
          : type === "label"
            ? `<label>Quantity Needed
                 <input id="preview-quantity-needed" type="number" value="${requirement.quantity}" readonly>
               </label>
               <label>Quantity to Print
                 <input id="preview-print-quantity" type="number" min="1" value="" autocomplete="off">
               </label>`
          : `<label>Quantity Needed
               <input id="preview-quantity-needed" type="number" value="${requirement.quantity}" readonly>
             </label>
             <label>Remaining Quantity to Print
               <input id="preview-quantity-remaining" type="number" value="${remaining}" readonly>
             </label>
             <label>Quantity to Print
               <input id="preview-print-quantity" type="number" min="1" max="${remaining}" value="" autocomplete="off">
             </label>`}
      ${type === "leaflet" && isExtra
        ? ""
        : `<label>Select Printer
             <select id="preview-printer">
               <option>PLPI Label Printer 01</option>
               <option>PLPI Leaflet Printer 02</option>
               <option>PLPI Braille Printer 03</option>
               <option>PDF Preview</option>
             </select>
           </label>`}
      <button class="classic-button primary" type="button" id="preview-print-button">${type === "leaflet" && isExtra ? "Print" : isExtra ? "Print Extra" : "Print"}</button>
    </div>
    ${type === "leaflet" && isExtra
      ? ""
      : `<div class="preview-pages test-print-preview-pages">
           <section class="preview-page preview-${type}">
             <div class="preview-page-header">${type === "leaflet" && !isExtra ? "Leaflet PDF | " : ""}${itemLabel}</div>
             <div class="preview-art">
               <strong>${product.product}</strong>
               <span>${product.strength} | ${product.packSize}</span>
               <span>B&amp;S Batch Number: ${product.batch}</span>
               <span>Expiry: ${product.expiry}</span>
               <i></i>
             </div>
           </section>
         </div>`}`;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = isExtra
    ? `Enter the extra quantity and mandatory reason for ${itemLabel}.`
    : `${remaining} ${itemLabel} labels remain to be printed.`;
}

function openUnifiedPrintDialog(type, batchNumber, itemLabel) {
  if (!["label", "leaflet", "braille"].includes(type)) return;
  const product = getPrintProduct(type, batchNumber);
  if (!product) return;
  const requirement = getPrintRequirements(type, product).find((item) => item.label === itemLabel);
  if (!requirement) return;
  const printRecord = getPrintRecord(type, batchNumber);
  const lineCompleted = isPrintItemDone(printRecord, itemLabel);
  printPreviewRequest = { type, batchNumber, itemLabel, workflowMode: "unified-print" };
  document.querySelector("#print-preview-title").textContent = `${type === "braille" ? "Braille" : type === "leaflet" ? "Leaflet" : "Label"} Print Preview`;
  printPreviewBody.innerHTML = `
    <div class="preview-toolbar unified-print-toolbar">
      <label>Quantity Needed
        <input id="unified-quantity-needed" type="number" value="${requirement.quantity}" readonly>
      </label>
      <label>Quantity to Print
        <input id="unified-quantity-to-print" type="number" min="1" value="" autocomplete="off">
      </label>
      <label>Category
        <select id="unified-print-category">
          <option value="" selected disabled>Select category</option>
          <option>Test Print</option>
          <option>Actually Print</option>
          <option>Extra Print</option>
        </select>
      </label>
      <label>Reason
        <select id="unified-print-reason" disabled>
          <option value="">Not required</option>
          <option>Print damage</option>
          <option>Line setup waste</option>
          <option>Reconciliation correction</option>
          <option>Printing alignment check</option>
          <option>Supervisor approved extra</option>
        </select>
      </label>
      <button class="classic-button primary" type="button" id="preview-print-button" disabled>Print</button>
    </div>
    ${type === "leaflet"
      ? ""
      : `<div class="preview-pages unified-print-preview">
           <section class="preview-page preview-${type}">
             <div class="preview-page-header">${itemLabel}</div>
             <div class="preview-art">
               <strong>${product.product}</strong>
               <span>${product.strength} | ${product.packSize}</span>
               <span>B&amp;S Batch Number: ${product.batch}</span>
               <span>Expiry: ${product.expiry}</span>
               <i></i>
             </div>
           </section>
         </div>`}`;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = lineCompleted
    ? `${itemLabel} is complete. All print categories remain available; further prints will not change the Batch Record Summary.`
    : `Select Test Print, Actually Print or Extra Print and enter a quantity for ${itemLabel}.`;
}

function confirmUnifiedPrint() {
  if (!printPreviewRequest || printPreviewRequest.workflowMode !== "unified-print") return;
  const { type, batchNumber, itemLabel } = printPreviewRequest;
  const product = getPrintProduct(type, batchNumber);
  if (!product) return;
  const quantity = Number(document.querySelector("#unified-quantity-to-print")?.value || 0);
  const category = document.querySelector("#unified-print-category")?.value || "";
  const reason = document.querySelector("#unified-print-reason")?.value || "";
  if (!category) {
    statusMessage.textContent = "Select a print category before printing.";
    return;
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    statusMessage.textContent = "Enter a whole print quantity greater than zero.";
    return;
  }
  if (category === "Extra Print" && !reason) {
    statusMessage.textContent = "Select a reason before printing extra copies.";
    return;
  }
  const existing = getPrintRecord(type, batchNumber);
  const actionAt = getAssemblyAuditTimestamp();
  const actionBy = currentLogin ? currentLogin.user : "printer.user";
  const lineCompleted = isPrintItemDone(existing, itemLabel);
  if (type === "leaflet") {
    const deductFromInHand = category === "Actually Print" || category === "Extra Print";
    const summaryEntry = {
      module: "Leaflet Printing",
      item: itemLabel,
      quantityNeeded: Number(getPrintRequirements(type, product).find((item) => item.label === itemLabel)?.quantity || 0),
      quantityToPrint: quantity,
      category,
      reason: category === "Extra Print" ? reason : "Not required",
      user: actionBy,
      dateTime: actionAt
    };
    const nextRecord = {
      ...existing,
      ...(lineCompleted
        ? {}
        : { batchSummaryPrintEntries: [...(existing.batchSummaryPrintEntries || []), summaryEntry] })
    };
    if (deductFromInHand) {
      nextRecord.leafletIssuedQuantities = {
        ...(existing.leafletIssuedQuantities || {}),
        [itemLabel]: Number((existing.leafletIssuedQuantities || {})[itemLabel] || 0) + quantity
      };
      nextRecord.leafletInHandBalance = getLeafletInHandQuantity(product, nextRecord, itemLabel);
    }
    if (category === "Test Print") {
      nextRecord.testPrints = {
        ...(existing.testPrints || {}),
        [itemLabel]: { user: actionBy, dateTime: actionAt, quantity }
      };
    } else if (category === "Actually Print") {
      nextRecord.actualPrintItems = Array.from(new Set([...(existing.actualPrintItems || []), itemLabel]));
      nextRecord.pdfOpenedItems = Array.from(new Set([...(existing.pdfOpenedItems || []), itemLabel]));
      nextRecord.printRuns = {
        ...(existing.printRuns || {}),
        [itemLabel]: [...((existing.printRuns || {})[itemLabel] || []), summaryEntry]
      };
    } else {
      const previousExtra = (existing.rowExtras || {})[itemLabel] || {};
      nextRecord.rowExtras = {
        ...(existing.rowExtras || {}),
        [itemLabel]: { quantity: Number(previousExtra.quantity || 0) + quantity, reason }
      };
      nextRecord.extraPrintRuns = {
        ...(existing.extraPrintRuns || {}),
        [itemLabel]: [...((existing.extraPrintRuns || {})[itemLabel] || []), summaryEntry]
      };
    }
    savePrintRecord(type, batchNumber, nextRecord);
    if (!lineCompleted) {
      const batchSummaryRecord = postAssemblyRecords[batchNumber] || {};
      postAssemblyRecords[batchNumber] = {
        ...batchSummaryRecord,
        leafletPrintingEntries: [...(batchSummaryRecord.leafletPrintingEntries || []), summaryEntry],
        printingLastUpdatedBy: actionBy,
        printingLastUpdatedAt: actionAt
      };
    }
    if (category !== "Test Print") {
      auditPrinterAction(
        `${itemLabel} ${category}`,
        product,
        `Quantity needed: ${summaryEntry.quantityNeeded}; quantity selected: ${quantity}; category: ${category}; reason: ${summaryEntry.reason}; in hand balance: ${getLeafletInHandQuantity(product, nextRecord, itemLabel)}; user: ${actionBy}; date/time: ${actionAt}.`
      );
    }
    printPreviewRequest = { type, batchNumber, itemLabel, workflowMode: "leaflet-unified-pdf", category, quantity, reason: summaryEntry.reason };
    document.querySelector("#print-preview-title").textContent = `Leaflet PDF - ${category}`;
    printPreviewBody.innerHTML = `
      <div class="preview-pages leaflet-pdf-only-preview">
        <section class="preview-page preview-leaflet">
          <div class="preview-page-header">Leaflet PDF | ${itemLabel} | ${category} | Qty ${quantity}</div>
          <div class="preview-art">
            <strong>${product.product}</strong>
            <span>${product.strength} | ${product.packSize}</span>
            <span>B&amp;S Batch Number: ${product.batch}</span>
            <span>Reason: ${summaryEntry.reason}</span>
            <i></i>
          </div>
        </section>
      </div>`;
    statusMessage.textContent = lineCompleted
      ? `${category} PDF opened for ${itemLabel}. This post-completion print was not added to the Batch Record Summary.`
      : `${category} PDF opened for ${itemLabel}. The popup details were added to the Batch Record Summary.`;
    return;
  }

  if (category === "Test Print") {
    savePrintRecord(type, batchNumber, {
      ...existing,
      testPrints: {
        ...(existing.testPrints || {}),
        [itemLabel]: { user: actionBy, dateTime: actionAt, quantity }
      }
    });
    closePrintPreview();
    renderStage("label-printing");
    statusMessage.textContent = `Test Print completed for ${itemLabel}. Required quantities and audit history were not changed.`;
    return;
  }

  if (category === "Extra Print") {
    const previousExtra = (existing.rowExtras || {})[itemLabel] || {};
    savePrintRecord(type, batchNumber, {
      ...existing,
      rowExtras: {
        ...(existing.rowExtras || {}),
        [itemLabel]: { quantity: Number(previousExtra.quantity || 0) + quantity, reason }
      },
      extraPrintRuns: {
        ...(existing.extraPrintRuns || {}),
        [itemLabel]: [
          ...((existing.extraPrintRuns || {})[itemLabel] || []),
          { quantity, reason, user: actionBy, dateTime: actionAt }
        ]
      }
    });
    auditPrinterAction(`${itemLabel} Extra Printed`, product, `Extra quantity: ${quantity}; reason: ${reason}; printed by ${actionBy} at ${actionAt}.`);
    closePrintPreview();
    renderStage("label-printing");
    statusMessage.textContent = `${quantity} extra ${itemLabel} cop${quantity === 1 ? "y" : "ies"} printed and logged with reason: ${reason}.`;
    return;
  }

  printPreviewRequest = { type, batchNumber, itemLabel, workflowMode: "required" };
  const bridgeInput = document.createElement("input");
  bridgeInput.id = "preview-print-quantity";
  bridgeInput.type = "hidden";
  bridgeInput.value = String(quantity);
  printPreviewBody.appendChild(bridgeInput);
  confirmQuantityPrint();
}

function confirmQuantityPrint() {
  if (!printPreviewRequest || !printPreviewRequest.workflowMode) return;
  const { type, batchNumber, itemLabel, workflowMode } = printPreviewRequest;
  const product = getPrintProduct(type, batchNumber);
  if (!product) return;
  const requirement = getPrintRequirements(type, product).find((item) => item.label === itemLabel);
  if (!requirement) return;
  const quantity = Number(document.querySelector("#preview-print-quantity")?.value || 0);
  const printer = document.querySelector("#preview-printer")?.value || (type === "leaflet" ? "PDF Viewer" : "Default");
  if (!Number.isInteger(quantity) || quantity <= 0) {
    statusMessage.textContent = "Enter a whole print quantity greater than zero.";
    return;
  }
  const existing = getPrintRecord(type, batchNumber);
  const printedAt = getAssemblyAuditTimestamp();
  const printedBy = currentLogin ? currentLogin.user : "printer.user";

  if (workflowMode === "extra") {
    const remainingRequired = getPrintItemRemaining(existing, requirement);
    if (type === "leaflet" && !isPrintItemDone(existing, itemLabel)) {
      statusMessage.textContent = `Mark ${itemLabel} as done before using Print Extra.`;
      return;
    }
    if (type !== "leaflet" && remainingRequired > 0) {
      statusMessage.textContent = `Print the remaining ${remainingRequired} required ${itemLabel} labels before using Print Extra.`;
      return;
    }
    const reason = document.querySelector("#preview-extra-reason")?.value || "";
    if (!reason) {
      statusMessage.textContent = "Select a reason before printing extra labels.";
      return;
    }
    const priorExtra = (existing.rowExtras || {})[itemLabel] || {};
    const extraRun = { quantity, reason, printer, user: printedBy, dateTime: printedAt };
    savePrintRecord(type, batchNumber, {
      ...existing,
      rowExtras: {
        ...(existing.rowExtras || {}),
        [itemLabel]: { quantity: Number(priorExtra.quantity || 0) + quantity, reason }
      },
      extraPrintRuns: {
        ...(existing.extraPrintRuns || {}),
        [itemLabel]: [...((existing.extraPrintRuns || {})[itemLabel] || []), extraRun]
      },
      savedAt: printedAt,
      savedBy: printedBy
    });
    auditPrinterAction(`${itemLabel} Extra Printed`, product, `Extra quantity: ${quantity}; reason: ${reason}; printer: ${printer}; printed by ${printedBy} at ${printedAt}.`);
    if (type === "leaflet") {
      printPreviewModal.classList.remove("leaflet-extra-entry-mode");
      printPreviewRequest = { type, batchNumber, itemLabel, workflowMode: "leaflet-extra-pdf", extraQuantity: quantity, extraReason: reason };
      document.querySelector("#print-preview-title").textContent = "Leaflet Extra PDF";
      printPreviewBody.innerHTML = `
        <div class="preview-pages leaflet-pdf-only-preview">
          <section class="preview-page preview-leaflet">
            <div class="preview-page-header">Leaflet Extra PDF | ${itemLabel} | Extra Qty ${quantity}</div>
            <div class="preview-art">
              <strong>${product.product}</strong>
              <span>${product.strength} | ${product.packSize}</span>
              <span>B&amp;S Batch Number: ${product.batch}</span>
              <span>Reason: ${reason}</span>
              <i></i>
            </div>
          </section>
        </div>`;
      statusMessage.textContent = `Leaflet extra PDF opened for ${quantity} additional copies. The quantity and reason were logged.`;
      return;
    }
    closePrintPreview();
    renderStage("label-printing");
    statusMessage.textContent = `${quantity} extra ${itemLabel} label${quantity === 1 ? "" : "s"} printed and logged with reason: ${reason}.`;
    return;
  }

  const remainingBefore = getPrintItemRemaining(existing, requirement);
  if (["label", "braille"].includes(type) && remainingBefore === 0) {
    const reprintRun = { quantity, printer, user: printedBy, dateTime: printedAt };
    savePrintRecord(type, batchNumber, {
      ...existing,
      reprintRuns: {
        ...(existing.reprintRuns || {}),
        [itemLabel]: [...((existing.reprintRuns || {})[itemLabel] || []), reprintRun]
      },
      savedAt: printedAt,
      savedBy: printedBy
    });
    auditPrinterAction(`${itemLabel} Reprinted`, product, `Reprint quantity: ${quantity}; printer: ${printer}; printed by ${printedBy} at ${printedAt}.`);
    closePrintPreview();
    renderStage("label-printing");
    statusMessage.textContent = `${quantity} ${itemLabel} label${quantity === 1 ? "" : "s"} reprinted and logged. The completed quantity and timestamp were unchanged.`;
    return;
  }
  if (quantity > remainingBefore) {
    statusMessage.textContent = `Quantity to Print cannot exceed the remaining quantity of ${remainingBefore}.`;
    return;
  }
  const totalPrintedForItem = Number((existing.itemPrintTotals || {})[itemLabel] || 0) + quantity;
  const remainingAfter = Math.max(0, Number(requirement.quantity || 0) - totalPrintedForItem);
  const run = { quantity, printer, user: printedBy, dateTime: printedAt, remainingAfter };
  const nextItemPrintTotals = { ...(existing.itemPrintTotals || {}), [itemLabel]: totalPrintedForItem };
  const readyForConfirmation = type === "label" && remainingAfter === 0;
  const itemsPrinted = [...(existing.itemsPrinted || [])];
  const itemCompletions = { ...(existing.itemCompletions || {}) };
  const nextRecord = {
    ...existing,
    quantities: getPrintRequirements(type, product).map((item) => ({ label: item.label, quantity: item.quantity })),
    itemPrintTotals: nextItemPrintTotals,
    printRuns: {
      ...(existing.printRuns || {}),
      [itemLabel]: [...((existing.printRuns || {})[itemLabel] || []), run]
    },
    itemLastPrints: {
      ...(existing.itemLastPrints || {}),
      [itemLabel]: { user: printedBy, dateTime: printedAt, status: readyForConfirmation ? "Ready for confirmation" : remainingAfter === 0 ? "Completed" : "Active" }
    },
    itemsPrinted,
    itemCompletions,
    printedAt
  };
  const allRequiredPrinted = getPrintRequirements(type, product).every((item) => getPrintItemRemaining(nextRecord, item) === 0);
  nextRecord.requiredPrintingComplete = allRequiredPrinted;
  nextRecord.printed = getPrintRequirements(type, product).every((item) => isPrintItemDone(nextRecord, item.label));
  nextRecord.printedQuantity = Object.values(nextItemPrintTotals).reduce((total, value) => total + Number(value || 0), 0);
  savePrintRecord(type, batchNumber, nextRecord);
  auditPrinterAction(`${itemLabel} Printed`, product, `Print run quantity: ${quantity}; remaining quantity: ${remainingAfter}; printer: ${printer}; printed by ${printedBy} at ${printedAt}; line status: ${readyForConfirmation ? "Awaiting Mark as Done" : "Active"}.`);
  closePrintPreview();
  renderStage("label-printing");
  statusMessage.textContent = remainingAfter === 0
      ? `${itemLabel} required quantity printed. Select Mark as Done to complete the line.`
      : `${quantity} ${itemLabel} labels printed. ${remainingAfter} remain to be printed.`;
}

function markPrintLineDone(type, batchNumber, itemLabel) {
  const product = getPrintProduct(type, batchNumber);
  if (!product) return;
  const requirement = getPrintRequirements(type, product).find((item) => item.label === itemLabel);
  if (!requirement) return;
  const existing = getPrintRecord(type, batchNumber);
  const remaining = getPrintItemRemaining(existing, requirement);
  const leafletPdfOpened = Boolean((existing.pdfOpenedItems || []).includes(itemLabel));
  if (type === "leaflet" && !leafletPdfOpened) {
    statusMessage.textContent = `Open and print ${itemLabel} from the PDF before marking the line as done.`;
    return;
  }
  if (type !== "leaflet" && remaining > 0) {
    statusMessage.textContent = `Print the remaining ${remaining} ${itemLabel} labels before marking the line as done.`;
    return;
  }
  if (isPrintItemDone(existing, itemLabel)) return;
  const completedAt = getAssemblyAuditTimestamp();
  const completedBy = currentLogin ? currentLogin.user : "printer.user";
  const itemsPrinted = Array.from(new Set([...(existing.itemsPrinted || []), itemLabel]));
  const nextRecord = {
    ...existing,
    itemsPrinted,
    itemCompletions: {
      ...(existing.itemCompletions || {}),
      [itemLabel]: { user: completedBy, dateTime: completedAt, status: "Completed", confirmedManually: true }
    }
  };
  nextRecord.printed = getPrintRequirements(type, product).every((item) => isPrintItemDone(nextRecord, item.label));
  savePrintRecord(type, batchNumber, nextRecord);
  if (type === "leaflet") {
    const batchSummaryRecord = postAssemblyRecords[batchNumber] || {};
    postAssemblyRecords[batchNumber] = {
      ...batchSummaryRecord,
      leafletCompletionLogs: [
        ...(batchSummaryRecord.leafletCompletionLogs || []),
        { item: itemLabel, status: "Completed", user: completedBy, dateTime: completedAt }
      ],
      printingLastUpdatedBy: completedBy,
      printingLastUpdatedAt: completedAt
    };
  }
  auditPrinterAction(`${itemLabel} Marked as Done`, product, `Required quantity reconciled and line completed by ${completedBy} at ${completedAt}.`);
  renderStage("label-printing");
  statusMessage.textContent = `${itemLabel} marked as done by ${completedBy} at ${completedAt}. Print Extra remains available.`;
}

function confirmPreviewPrint() {
  if (!printPreviewRequest) return;
  if (printPreviewRequest.type === "preqp-release-log") {
    const batches = printPreviewRequest.batches || [];
    const count = batches.length;
    const qpId = assignQpReleaseLogId(batches);
    closePrintPreview();
    preQpReleaseLogSelection = [];
    renderStage("pre-qp");
    statusMessage.textContent = `QP Release Log ${qpId} printed for ${count} batch${count === 1 ? "" : "es"}. Group moved to the QP Dashboard.`;
    return;
  }
  if (printPreviewRequest.type === "release-log") {
    const batches = [...(printPreviewRequest.batches || [])];
    closePrintPreview();
    requestReleaseLogPasswordConfirmation(batches);
    return;
  }
  let { type, batchNumber, itemLabel, quantity, isTestPrint } = printPreviewRequest;
  const product = getPrintProduct(type, batchNumber);
  if (!product) return;
  if (isTestPrint) {
    const quantityInput = document.querySelector("#preview-print-quantity");
    quantity = quantityInput ? quantityInput.value : quantity;
    if (!Number(quantity)) {
      statusMessage.textContent = "Enter a print quantity greater than zero.";
      return;
    }
    const existing = getPrintRecord(type, batchNumber);
    const testPrintedAt = getAssemblyAuditTimestamp();
    const testPrintedBy = currentLogin ? currentLogin.user : "printer.user";
    savePrintRecord(type, batchNumber, {
      ...existing,
      testPrints: {
        ...(existing.testPrints || {}),
        [itemLabel]: { user: testPrintedBy, dateTime: testPrintedAt, quantity }
      },
      savedAt: testPrintedAt,
      savedBy: testPrintedBy
    });
    closePrintPreview();
    renderStage("label-printing");
    statusMessage.textContent = isPrintItemDone(getPrintRecord(type, batchNumber), itemLabel)
      ? `Test print completed for ${itemLabel}. The label remains completed and available for further Test Print.`
      : `Test print completed for ${itemLabel}. Print is now available for this line.`;
    return;
  }
  const requirements = getPrintRequirements(type, product);
  const selector = getPrintInputSelector(type);
  const datasetKey = getPrintItemDatasetKey(type);
  const quantities = [...document.querySelectorAll(selector)].map((input) => ({
    label: input.dataset[datasetKey],
    quantity: input.value || "0"
  }));
  if (!quantities.some((item) => item.label === itemLabel)) {
    quantities.push({ label: itemLabel, quantity });
  }
  const existing = getPrintRecord(type, batchNumber);
  const itemsPrinted = Array.from(new Set([...(existing.itemsPrinted || []), itemLabel]));
  const printedQuantity = quantities.reduce(
    (total, item) => (itemsPrinted.includes(item.label) ? total + Number(item.quantity || 0) : total),
    0
  );
  const rowExtras = collectRowExtras(type);
  const allPrinted = requirements.every((item) => itemsPrinted.includes(item.label));
  const itemPrintedAt = getAssemblyAuditTimestamp();
  const itemPrintedBy = currentLogin ? currentLogin.user : "printer.user";
  const record = {
    ...existing,
    printed: allPrinted,
    printedQuantity,
    quantities,
    itemsPrinted,
    itemCompletions: {
      ...(existing.itemCompletions || {}),
      [itemLabel]: { user: itemPrintedBy, dateTime: itemPrintedAt, status: "Printed" }
    },
    rowExtras,
    printedAt: itemPrintedAt
  };
  savePrintRecord(type, batchNumber, record);
  auditPrinterAction(`${itemLabel} Printed`, product, `Quantity printed: ${quantity}; printer: ${document.querySelector("#preview-printer") ? document.querySelector("#preview-printer").value : "Default"}.`);
  closePrintPreview();
  renderStage("label-printing");
  statusMessage.textContent = allPrinted
    ? `${itemLabel} printed. All ${type} items printed; sign off.`
    : `${itemLabel} printed. Continue printing remaining ${type} items.`;
}

function updateLabelCompletionAvailability() {
  const completeButton = document.querySelector("#label-complete-button");
  if (!completeButton || !labelSelectedProduct) return;

  const record = labelPrintRecords[labelSelectedProduct.batch] || {};
  const rowExtras = collectRowExtras("label");
  const hasEvidence = true;
  const hasMissingExtraReason = rowExtraHasMissingReason(rowExtras);
  completeButton.disabled = !(record.printed && hasEvidence && !hasMissingExtraReason);

  if (!record.printed) {
    statusMessage.textContent = "Print each label row before user sign off.";
  } else if (hasMissingExtraReason) {
    statusMessage.textContent = "Select a reason for every extra label quantity.";
  } else {
    statusMessage.textContent = "Labels printed. User Sign Off is available.";
  }
}

function updateLabelRowPrintAvailability() {
  if (!labelSelectedProduct) return;
  const record = labelPrintRecords[labelSelectedProduct.batch] || {};
  document.querySelectorAll("[data-label-print-done]").forEach((button) => {
    const itemLabel = button.dataset.labelPrintItem;
    const extraQty = document.querySelector(`[data-label-extra-qty][data-extra-item="${itemLabel}"]`);
    const extraReason = document.querySelector(`[data-label-extra-reason][data-extra-item="${itemLabel}"]`);
    const extraIsValid = Number(extraQty ? extraQty.value || 0 : 0) === 0 || Boolean(extraReason && extraReason.value);
    const testCompleted = Boolean((record.testPrints || {})[itemLabel]);
    const formValid = button.dataset.labelFormValid !== "false";
    button.disabled = isPrintItemDone(record, itemLabel) || !testCompleted || !formValid || !extraIsValid;
  });
}

function updateLeafletCompletionAvailability() {
  const submitButton = document.querySelector("#leaflet-complete-button");
  if (!submitButton || !leafletSelectedProduct) return;

  const record = leafletPrintRecords[leafletSelectedProduct.batch] || {};
  const rowExtras = collectRowExtras("leaflet");
  const hasEvidence = true;
  const hasMissingExtraReason = rowExtraHasMissingReason(rowExtras);
  submitButton.disabled = !(record.printed && hasEvidence && !hasMissingExtraReason);

  if (!record.printed) {
    statusMessage.textContent = "Print each leaflet row before user sign off.";
  } else if (hasMissingExtraReason) {
    statusMessage.textContent = "Select a reason for every extra leaflet quantity.";
  } else {
    statusMessage.textContent = "Leaflets printed. User Sign Off is available.";
  }
}

function updateCartonCompletionAvailability() {
  const submitButton = document.querySelector("#carton-complete-button");
  if (!submitButton || !cartonSelectedProduct) return;

  const record = cartonPrintRecords[cartonSelectedProduct.batch] || {};
  const cartonConfirmed = record.printed || isPrintItemDone(record, "Issued Carton");
  submitButton.disabled = !cartonConfirmed;

  statusMessage.textContent = cartonConfirmed
    ? "Carton issue confirmed. Select Done to complete this batch."
    : "Confirm the carton issue line before selecting Done.";
}

function updateBrailleCompletionAvailability() {
  const submitButton = document.querySelector("#braille-complete-button");
  if (!submitButton || !brailleSelectedProduct) return;

  const record = braillePrintRecords[brailleSelectedProduct.batch] || {};
  const rowExtras = collectRowExtras("braille");
  const hasEvidence = true;
  const hasMissingExtraReason = rowExtraHasMissingReason(rowExtras);
  submitButton.disabled = !(record.printed && hasEvidence && !hasMissingExtraReason);

  if (!record.printed) {
    statusMessage.textContent = "Print each braille row before user sign off.";
  } else if (hasMissingExtraReason) {
    statusMessage.textContent = "Select a reason for every extra braille quantity.";
  } else {
    statusMessage.textContent = "Braille labels printed. User Sign Off is available.";
  }
}

function updateLeafletFoldingAvailability() {
  const submitButton = document.querySelector("#leaflet-folding-complete-button");
  const quantity = document.querySelector("#leaflet-folding-quantity");
  const lineClearance = document.querySelector("#leaflet-folding-line-clearance");
  if (!submitButton || !leafletFoldingSelectedProduct) return;

  const hasQuantity = Boolean(quantity && Number(quantity.value) > 0);
  const lineClearanceComplete = Boolean(lineClearance && lineClearance.checked);
  submitButton.disabled = !(hasQuantity && lineClearanceComplete);

  if (!hasQuantity) {
    statusMessage.textContent = "Enter Leaflet Folding quantity before sign off.";
  } else if (!lineClearanceComplete) {
    statusMessage.textContent = "Confirm the Leaflet Folding count before sign off.";
  } else {
    statusMessage.textContent = "Leaflet Folding count confirmed. User Sign Off is available.";
  }
}

function collectLabelPrintDraft() {
  const quantities = [...document.querySelectorAll("[data-label-print-qty]")].map((input) => ({
    label: input.dataset.labelName,
    quantity: input.value || "0"
  }));
  return { quantities, rowExtras: collectRowExtras("label") };
}

function saveLabelPrintingProgress(batchNumber, showMessage = true) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return null;
  const existing = labelPrintRecords[batchNumber] || {};
  const draft = collectLabelPrintDraft();
  const savedAt = getAssemblyAuditTimestamp();
  const savedBy = currentLogin ? currentLogin.user : "label.print";
  const record = { ...existing, ...draft, savedAt, savedBy };
  labelPrintRecords[batchNumber] = record;
  persistLabelPrintRecords();
  auditPrinterAction("Label Printing Progress Saved", product, `${(record.itemsPrinted || []).length} label(s) completed; draft saved for later continuation.`);
  if (showMessage) {
    labelSelectedProduct = null;
    printerSection = "label-list";
    renderStage("label-printing");
    statusMessage.textContent = `Printing progress saved for batch ${batchNumber}.`;
  }
  return record;
}

function savePrintingModuleProgress(type, batchNumber) {
  const product = getPrintProduct(type, batchNumber);
  if (!product) return;
  const existing = getPrintRecord(type, batchNumber);
  const selector = getPrintInputSelector(type);
  const datasetKey = getPrintItemDatasetKey(type);
  const quantities = selector
    ? [...document.querySelectorAll(selector)].map((input) => ({ label: input.dataset[datasetKey], quantity: input.value || "0" }))
    : existing.quantities || [];
  const rowExtras = collectRowExtras(type);
  const extraQuantity = document.querySelector(`#extra-${type}-qty`);
  const extraReason = document.querySelector(`#extra-${type}-reason`);
  const savedAt = getAssemblyAuditTimestamp();
  const savedBy = currentLogin ? currentLogin.user : "printer.user";
  savePrintRecord(type, batchNumber, {
    ...existing,
    quantities,
    rowExtras,
    extraQuantity: extraQuantity ? extraQuantity.value || "0" : existing.extraQuantity || "0",
    extraReason: extraReason ? extraReason.value || "" : existing.extraReason || "",
    savedAt,
    savedBy
  });
  auditPrinterAction(`${type} Printing Progress Saved`, product, `Checklist progress saved by ${savedBy} at ${savedAt}.`);
  if (type === "leaflet") leafletSelectedProduct = null;
  if (type === "carton") cartonSelectedProduct = null;
  if (type === "braille") brailleSelectedProduct = null;
  printerSection = `${type}-list`;
  renderStage("label-printing");
  statusMessage.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} printing progress saved for batch ${batchNumber}.`;
}
function completeLabelPrintItem(batchNumber, itemLabel) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  const extraQty = document.querySelector(`[data-label-extra-qty][data-extra-item="${itemLabel}"]`);
  const extraReason = document.querySelector(`[data-label-extra-reason][data-extra-item="${itemLabel}"]`);
  const extraQuantity = extraQty ? extraQty.value || "0" : "0";
  const extraReasonValue = extraReason ? extraReason.value || "" : "";
  if (Number(extraQuantity) > 0 && !extraReasonValue) {
    statusMessage.textContent = `Select a reason for the extra quantity before completing ${itemLabel}.`;
    return;
  }
  const draftRecord = saveLabelPrintingProgress(batchNumber, false) || {};
  const user = currentLogin ? currentLogin.user : "label.print";
  const dateTime = getAssemblyAuditTimestamp();
  const printedLineQuantity = ((draftRecord.quantities || []).find((item) => item.label === itemLabel) || {}).quantity || "0";
  const itemsPrinted = Array.from(new Set([...(draftRecord.itemsPrinted || []), itemLabel]));
  const itemCompletions = {
    ...(draftRecord.itemCompletions || {}),
    [itemLabel]: { user, dateTime, quantity: printedLineQuantity, extraQuantity, extraReason: extraReasonValue || "N/A", status: "Printed" }
  };
  const requirements = getLabelRequirements(product);
  const allPrinted = requirements.every((item) => itemsPrinted.includes(item.label));
  const printedQuantity = (draftRecord.quantities || []).reduce((total, item) => itemsPrinted.includes(item.label) ? total + Number(item.quantity || 0) : total, 0);
  labelPrintRecords[batchNumber] = {
    ...draftRecord,
    itemsPrinted,
    itemCompletions,
    printed: allPrinted,
    printedQuantity,
    printedAt: allPrinted ? dateTime : draftRecord.printedAt || "",
    savedAt: dateTime,
    savedBy: user
  };
  persistLabelPrintRecords();
  auditPrinterAction(`${itemLabel} Printed`, product, `Quantity: ${printedLineQuantity}; extra quantity: ${extraQuantity}; extra reason: ${extraReasonValue || "N/A"}; printed by ${user} at ${dateTime}; line marked complete and progress saved.`);
  renderStage("label-printing");
  statusMessage.textContent = allPrinted
    ? `${itemLabel} printed. All labels are ready for Print Done.`
    : `${itemLabel} printed by ${user}. Remaining labels can be printed by another user.`;
}
function finalizeLabelPrintingBatch(batchNumber) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  const record = labelPrintRecords[batchNumber] || {};
  const requirements = getLabelRequirements(product);
  if (!requirements.every((item) => isPrintItemDone(record, item.label))) {
    statusMessage.textContent = "Print every label before selecting Print Done.";
    return;
  }
  const completedAt = getAssemblyAuditTimestamp();
  const completedBy = currentLogin ? currentLogin.user : "label.print";
  labelPrintRecords[batchNumber] = { ...record, finalized: true, finalizedAt: completedAt, finalizedBy: completedBy };
  persistLabelPrintRecords();
  if (!labelPrintedBatchNumbers.includes(batchNumber)) labelPrintedBatchNumbers.push(batchNumber);
  auditPrinterAction("Label Printing Print Done", product, `Batch printing finalized by ${completedBy} at ${completedAt}; total printed: ${record.printedQuantity || product.quantity}; extras: ${JSON.stringify(record.rowExtras || {})}.`);
  labelSelectedProduct = null;
  printerSection = "label-list";
  renderStage("label-printing");
  statusMessage.textContent = `Batch ${batchNumber} printing completed and retained in the queue for review and Test Print.`;
}
function completeLabelPrinting() {
  if (!labelSelectedProduct) return;
  const batchNumber = labelSelectedProduct.batch;
  const record = labelPrintRecords[batchNumber] || {};
  const rowExtras = collectRowExtras("label");
  labelPrintRecords[batchNumber] = { ...record, rowExtras };
  persistLabelPrintRecords();
  const now = getAssemblyAuditTimestamp();
  if (!labelPrintedBatchNumbers.includes(batchNumber)) {
    labelPrintedBatchNumbers.push(batchNumber);
  }
  auditPrinterAction("Label Printing Submitted", labelSelectedProduct, `Quantity printed: ${record.printedQuantity || labelSelectedProduct.quantity}; extras: ${JSON.stringify(rowExtras)}.`);
  const workflowState = document.querySelector("#label-workflow-state");
  if (workflowState) {
    workflowState.innerHTML = `Signed off by <strong>${currentLogin ? currentLogin.user : "label.print"}</strong> at <strong>${now}</strong>. Batch <strong>${batchNumber}</strong> moved to ${labelSelectedProduct.leafletRequired ? "Leaflet Printing" : "next applicable stage"}.`;
  }
  statusMessage.textContent = `Batch ${batchNumber} moved to ${labelSelectedProduct.leafletRequired ? "Leaflet Printing" : "next applicable stage"} after print sign off.`;
  const movesToLeaflet = labelSelectedProduct.leafletRequired;
  window.setTimeout(() => {
    labelSelectedProduct = null;
    printerSection = "label-list";
    renderStage("label-printing");
    statusMessage.textContent = movesToLeaflet
      ? `Batch ${batchNumber} moved to Leaflet Printing and is removed from Label Printing list.`
      : `Batch ${batchNumber} removed from Label Printing list.`;
  }, 1200);
}

function printLabels(batchNumber) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  const quantityInputs = [...document.querySelectorAll("[data-label-print-qty]")];
  const quantities = quantityInputs.map((input) => ({
    label: input.dataset.labelName,
    quantity: input.value || "0"
  }));
  const printedQuantity = quantities.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const extraQty = document.querySelector("#extra-label-qty");
  const extraReason = document.querySelector("#extra-label-reason");
  labelSelectedProduct = product;
  labelPrintRecords[batchNumber] = {
    printed: true,
    printedQuantity: printedQuantity || product.quantity,
    quantities,
    extraQuantity: extraQty ? extraQty.value || "0" : "0",
    extraReason: extraReason ? extraReason.value || "N/A" : "N/A",
    printedAt: itemPrintedAt
  };
  auditPrinterAction("Labels Printed", product, `Quantity printed: ${printedQuantity || product.quantity}; extra quantity: ${extraQty ? extraQty.value || "0" : "0"}; reason: ${extraReason ? extraReason.value || "N/A" : "N/A"}.`);
  renderStage("label-printing");
  statusMessage.textContent = `Labels printed for batch ${batchNumber}. Ready for sign off.`;
}

function printLeaflets(batchNumber) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  const quantityInputs = [...document.querySelectorAll("[data-leaflet-print-qty]")];
  const quantities = quantityInputs.map((input) => ({
    label: input.dataset.leafletName,
    quantity: input.value || "0"
  }));
  const printedQuantity = quantities.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const extraQty = document.querySelector("#extra-leaflet-qty");
  const extraReason = document.querySelector("#extra-leaflet-reason");
  leafletSelectedProduct = product;
  leafletPrintRecords[batchNumber] = {
    printed: true,
    printedQuantity: printedQuantity || product.leafletQuantity,
    quantities,
    extraQuantity: extraQty ? extraQty.value || "0" : "0",
    extraReason: extraReason ? extraReason.value || "N/A" : "N/A",
    printedAt: itemPrintedAt
  };
  persistLeafletPrintRecords();
  auditPrinterAction("Leaflets Printed", product, `Quantity printed: ${printedQuantity || product.leafletQuantity}; extra quantity: ${extraQty ? extraQty.value || "0" : "0"}; reason: ${extraReason ? extraReason.value || "N/A" : "N/A"}.`);
  renderStage("label-printing");
  statusMessage.textContent = `Leaflets printed for batch ${batchNumber}. Ready for sign off.`;
}

function completeLeafletPrinting() {
  if (!leafletSelectedProduct) return;
  const batchNumber = leafletSelectedProduct.batch;
  const record = leafletPrintRecords[batchNumber] || {};
  const rowExtras = collectRowExtras("leaflet");
  leafletPrintRecords[batchNumber] = { ...record, rowExtras };
  persistLeafletPrintRecords();
  if (!leafletPrintedBatchNumbers.includes(batchNumber)) {
    leafletPrintedBatchNumbers.push(batchNumber);
  }
  auditPrinterAction("Leaflet Printing Submitted", leafletSelectedProduct, `Quantity printed: ${record.printedQuantity || leafletSelectedProduct.leafletQuantity}; extras: ${JSON.stringify(rowExtras)}.`);
  const nextPrintStage = leafletSelectedProduct.routeType === "Reboxing"
    ? "Carton Issuing"
    : leafletSelectedProduct.brailleRequired
      ? "Braille Printing"
      : "next applicable stage";
  statusMessage.textContent = `Batch ${batchNumber} moved to ${nextPrintStage}.`;
  window.setTimeout(() => {
    leafletSelectedProduct = null;
    printerSection = "label-list";
    renderStage("label-printing");
    statusMessage.textContent = `Batch ${batchNumber} removed from Leaflet Printing and moved to ${nextPrintStage}.`;
  }, 1200);
}

function printCartons(batchNumber) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  const extraQty = document.querySelector("[data-carton-extra-qty]");
  const extraReason = document.querySelector("[data-carton-extra-reason]");
  const locationInput = document.querySelector("[data-carton-location]");
  const requiredQtyInput = document.querySelector("[data-carton-print-qty]");
  const extraQuantity = extraQty ? extraQty.value || "0" : "0";
  const reason = extraReason ? extraReason.value || "" : "";
  if (Number(extraQuantity || 0) > 0 && !reason) {
    statusMessage.textContent = "Select a reason before confirming extra cartons.";
    return;
  }
  const confirmedAt = getAssemblyAuditTimestamp();
  const confirmedBy = currentLogin ? currentLogin.user : "printer.user";
  const requiredQuantity = requiredQtyInput ? requiredQtyInput.value || product.cartonQuantity || product.quantity : product.cartonQuantity || product.quantity;
  const existing = cartonPrintRecords[batchNumber] || {};
  const alreadyConfirmed = Boolean(existing.printed || isPrintItemDone(existing, "Issued Carton"));
  cartonSelectedProduct = product;
  if (alreadyConfirmed) {
    if (Number(extraQuantity || 0) <= 0) {
      statusMessage.textContent = "Enter an extra carton quantity greater than zero.";
      return;
    }
    const previousExtra = (existing.rowExtras || {})["Issued Carton"] || {};
    const extraIssuedAt = getAssemblyAuditTimestamp();
    const extraIssuedBy = currentLogin ? currentLogin.user : "printer.user";
    cartonPrintRecords[batchNumber] = {
      ...existing,
      rowExtras: {
        ...(existing.rowExtras || {}),
        "Issued Carton": {
          quantity: Number(previousExtra.quantity || 0) + Number(extraQuantity),
          reason
        }
      },
      extraIssueRuns: [
        ...(existing.extraIssueRuns || []),
        { quantity: extraQuantity, reason, user: extraIssuedBy, dateTime: extraIssuedAt }
      ]
    };
    auditPrinterAction("Extra Cartons Issued", product, `Extra quantity: ${extraQuantity}; reason: ${reason}; issued by ${extraIssuedBy} at ${extraIssuedAt}.`);
    renderStage("label-printing");
    statusMessage.textContent = `${extraQuantity} extra carton${Number(extraQuantity) === 1 ? "" : "s"} issued and logged for batch ${batchNumber}.`;
    return;
  }
  cartonPrintRecords[batchNumber] = {
    ...existing,
    printed: true,
    printedQuantity: requiredQuantity,
    quantities: [{ label: "Issued Carton", quantity: requiredQuantity }],
    rowExtras: {
      ...(existing.rowExtras || {}),
      "Issued Carton": { quantity: extraQuantity, reason }
    },
    locationNumber: locationInput ? locationInput.value || product.warehouse || "" : product.warehouse || "",
    itemCompletions: {
      ...(existing.itemCompletions || {}),
      "Issued Carton": { user: confirmedBy, dateTime: confirmedAt, status: "Confirmed" }
    },
    printedAt: confirmedAt,
    printedBy: confirmedBy
  };
  auditPrinterAction("Carton Issue Confirmed", product, `Required quantity: ${requiredQuantity}; extra quantity: ${extraQuantity}; reason: ${reason || "N/A"}; location: ${locationInput ? locationInput.value || product.warehouse || "N/A" : product.warehouse || "N/A"}; confirmed by ${confirmedBy} at ${confirmedAt}.`);
  renderStage("label-printing");
  statusMessage.textContent = `Carton issue confirmed for batch ${batchNumber}.`;
}

function openCartonExtraIssueDialog(batchNumber) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  const record = cartonPrintRecords[batchNumber] || {};
  if (!product || !(record.printed || isPrintItemDone(record, "Issued Carton"))) {
    statusMessage.textContent = "Confirm the required carton quantity before issuing extras.";
    return;
  }
  printPreviewRequest = { type: "carton-extra", batchNumber, workflowMode: "carton-extra" };
  printPreviewModal.classList.add("carton-extra-entry-mode");
  document.querySelector("#print-preview-title").textContent = "Issue Extra Cartons";
  printPreviewBody.innerHTML = `
    <div class="preview-toolbar carton-extra-issue-toolbar">
      <label>Extra Quantity
        <input id="carton-extra-popup-quantity" type="number" min="1" value="" autocomplete="off">
      </label>
      <label>Reason for Extra
        <select id="carton-extra-popup-reason">
          <option value="">Select reason</option>
          <option>Carton damage</option>
          <option>Line setup waste</option>
          <option>Reconciliation correction</option>
          <option>Printing alignment check</option>
          <option>Supervisor approved extra</option>
        </select>
      </label>
      <button class="classic-button primary" type="button" id="confirm-carton-extra-button">Confirm</button>
    </div>`;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = "Enter the extra carton quantity and select a reason.";
}

function confirmCartonExtraIssue() {
  if (!printPreviewRequest || printPreviewRequest.workflowMode !== "carton-extra") return;
  const batchNumber = printPreviewRequest.batchNumber;
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  const quantity = Number(document.querySelector("#carton-extra-popup-quantity")?.value || 0);
  const reason = document.querySelector("#carton-extra-popup-reason")?.value || "";
  if (!Number.isInteger(quantity) || quantity <= 0) {
    statusMessage.textContent = "Enter a whole extra quantity greater than zero.";
    return;
  }
  if (!reason) {
    statusMessage.textContent = "Select a reason before confirming extra cartons.";
    return;
  }
  const existing = cartonPrintRecords[batchNumber] || {};
  const previousExtra = (existing.rowExtras || {})["Issued Carton"] || {};
  const issuedAt = getAssemblyAuditTimestamp();
  const issuedBy = currentLogin ? currentLogin.user : "printer.user";
  cartonPrintRecords[batchNumber] = {
    ...existing,
    rowExtras: {
      ...(existing.rowExtras || {}),
      "Issued Carton": {
        quantity: Number(previousExtra.quantity || 0) + quantity,
        reason
      }
    },
    extraIssueRuns: [
      ...(existing.extraIssueRuns || []),
      { quantity, reason, user: issuedBy, dateTime: issuedAt }
    ]
  };
  auditPrinterAction("Extra Cartons Issued", product, `Extra quantity: ${quantity}; reason: ${reason}; issued by ${issuedBy} at ${issuedAt}.`);
  closePrintPreview();
  renderStage("label-printing");
  statusMessage.textContent = `${quantity} extra carton${quantity === 1 ? "" : "s"} issued and logged for batch ${batchNumber}.`;
}

function completeCartonPrinting() {
  if (!cartonSelectedProduct) return;
  const batchNumber = cartonSelectedProduct.batch;
  const record = cartonPrintRecords[batchNumber] || {};
  if (!(record.printed || isPrintItemDone(record, "Issued Carton"))) {
    statusMessage.textContent = "Confirm the carton issue line before selecting Done.";
    return;
  }
  if (!cartonPrintedBatchNumbers.includes(batchNumber)) {
    cartonPrintedBatchNumbers.push(batchNumber);
  }
  auditPrinterAction("Carton Issuing Done", cartonSelectedProduct, `Carton issue completed by ${currentLogin ? currentLogin.user : "printer.user"} at ${getAssemblyAuditTimestamp()}.`);
  cartonSelectedProduct = null;
  printerSection = "carton-list";
  renderStage("label-printing");
  statusMessage.textContent = `Batch ${batchNumber} completed in Carton Issuing.`;
}

function printBraille(batchNumber) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  const quantityInputs = [...document.querySelectorAll("[data-braille-print-qty]")];
  const quantities = quantityInputs.map((input) => ({
    label: input.dataset.brailleName,
    quantity: input.value || "0"
  }));
  const printedQuantity = quantities.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const extraQty = document.querySelector("#extra-braille-qty");
  const extraReason = document.querySelector("#extra-braille-reason");
  brailleSelectedProduct = product;
  braillePrintRecords[batchNumber] = {
    printed: true,
    printedQuantity: printedQuantity || product.brailleQuantity || product.quantity,
    quantities,
    extraQuantity: extraQty ? extraQty.value || "0" : "0",
    extraReason: extraReason ? extraReason.value || "N/A" : "N/A",
    printedAt: itemPrintedAt
  };
  auditPrinterAction("Braille Printed", product, `Quantity printed: ${printedQuantity || product.brailleQuantity || product.quantity}; extra quantity: ${extraQty ? extraQty.value || "0" : "0"}; reason: ${extraReason ? extraReason.value || "N/A" : "N/A"}.`);
  renderStage("label-printing");
  statusMessage.textContent = `Braille printed for batch ${batchNumber}. Ready for sign off.`;
}

function completeBraillePrinting() {
  if (!brailleSelectedProduct) return;
  const batchNumber = brailleSelectedProduct.batch;
  const record = braillePrintRecords[batchNumber] || {};
  const rowExtras = collectRowExtras("braille");
  braillePrintRecords[batchNumber] = { ...record, rowExtras };
  if (!braillePrintedBatchNumbers.includes(batchNumber)) {
    braillePrintedBatchNumbers.push(batchNumber);
  }
  auditPrinterAction("Braille Printing Submitted", brailleSelectedProduct, `Quantity printed: ${record.printedQuantity || brailleSelectedProduct.brailleQuantity || brailleSelectedProduct.quantity}; extras: ${JSON.stringify(rowExtras)}.`);
  statusMessage.textContent = `Batch ${batchNumber} moved to next applicable stage.`;
  window.setTimeout(() => {
    brailleSelectedProduct = null;
    printerSection = "label-list";
    renderStage("label-printing");
    statusMessage.textContent = `Batch ${batchNumber} removed from Braille Printing and moved to next applicable stage.`;
  }, 1200);
}

function completeLeafletFolding() {
  if (!leafletFoldingSelectedProduct) return;
  const product = leafletFoldingSelectedProduct;
  const batchNumber = product.batch;
  const now = getAssemblyAuditTimestamp();
  const user = currentLogin ? currentLogin.user : "leaflet.fold";
  const quantity = Number(product.leafletQuantity || product.quantity || 0);
  leafletFoldingRecords[batchNumber] = {
    user,
    dateTime: now,
    quantity,
    countConfirmed: true
  };
  if (!leafletFoldedBatchNumbers.includes(batchNumber)) leafletFoldedBatchNumbers.push(batchNumber);
  auditPrinterAction("Leaflet Folding Done", product, `Quantity ${quantity} confirmed by ${user} at ${now}.`);
  renderStage("leaflet-folding");
  statusMessage.textContent = `Leaflet Folding marked Done for batch ${batchNumber}.`;
}

function confirmSignoff() {
  const now = new Date();
  const user = currentLogin ? currentLogin.user : "bar.creation";
  signOffRecord = {
    user,
    dateTime: now.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  };
  captureBnsLineClearance(true);
  if (selectedProduct && generatedBarRecords[selectedProduct.batch]) {
    generatedBarRecords[selectedProduct.batch].status = "B&S Line Clearance Complete";
    generatedBarRecords[selectedProduct.batch].bnsLineClearance.completedBy = signOffRecord.user;
    generatedBarRecords[selectedProduct.batch].bnsLineClearance.completedAt = signOffRecord.dateTime;
    generatedBarRecords[selectedProduct.batch].bnsLineClearance.signedOff = true;
    bnsLineClearanceRecords[selectedProduct.batch] = generatedBarRecords[selectedProduct.batch].bnsLineClearance;
    persistBnsLineClearanceRecords();
  }

  appConfirmModal.classList.add("hidden");

  barMovedToNextStage = true;
  const batchNumber = selectedProduct ? selectedProduct.batch : "03A1582";
  if (!generatedBatchNumbers.includes(batchNumber)) {
    generatedBatchNumbers.push(batchNumber);
  }
  const workflowState = document.querySelector("#bar-workflow-state");
  const signoffButton = document.querySelector("#user-signoff-button");
  if (workflowState) {
    workflowState.classList.remove("hidden");
    workflowState.innerHTML = `Signed off by <strong>${signOffRecord.user}</strong> at <strong>${signOffRecord.dateTime}</strong>. Batch <strong>${batchNumber}</strong> moved to Printer - Label Printing list view.`;
  }
  if (signoffButton) {
    signoffButton.disabled = true;
    signoffButton.textContent = "Signed Off";
  }

  statusMessage.textContent = `${batchNumber} moved to Printer - Label Printing after sign off by ${signOffRecord.user}`;
  window.setTimeout(() => {
    barCreated = false;
    barCreatedRecord = null;
    renderStage("bar-creation");
    statusMessage.textContent = `Batch ${batchNumber} has moved to Printer - Label Printing and is removed from BNS Batch Add.`;
  }, 1200);
}

function submitLogin() {
  const stage = findStage(pendingStageId);
  currentLogin = {
    user: document.querySelector("#login-user").value,
    role: stage.role,
    stageId: stage.id
  };
  isAuthenticated = true;
  if (initialLoginPending) {
    initialLoginPending = false;
    currentLogin.role = "PLPI User";
    currentLogin.stageId = "all";
    document.body.classList.remove("pre-login", "login-transition");
    loginModal.classList.add("hidden");
    openDashboard();
    statusMessage.textContent = `Logged in as ${currentLogin.user}. Select a module.`;
    return;
  }
  if (stage.id === "label-printing") {
    printerSection = "menu";
    labelSelectedProduct = null;
    leafletSelectedProduct = null;
    cartonSelectedProduct = null;
    brailleSelectedProduct = null;
  }
  document.body.classList.remove("pre-login");
  document.body.classList.remove("login-transition");
  loginModal.classList.add("hidden");
  renderStage(stage.id);
  if (stage.id === "rp-pack" && rpiModuleView === "pack-creation") setTimeout(updateRpDocumentsAvailability, 0);
}

function loadLeafletFoldingDemo() {
  const stage = findStage("leaflet-folding");
  const product = bnsProducts.find((item) => item.batch === "03A1582") || bnsProducts[0];
  const batchNumber = product.batch;

  currentLogin = {
    user: stage.user,
    role: stage.role,
    stageId: stage.id
  };
  isAuthenticated = true;
  selectedProduct = product;
  leafletFoldingSelectedProduct = null;

  if (!generatedBatchNumbers.includes(batchNumber)) generatedBatchNumbers.push(batchNumber);
  if (!labelPrintedBatchNumbers.includes(batchNumber)) labelPrintedBatchNumbers.push(batchNumber);
  if (!leafletPrintedBatchNumbers.includes(batchNumber)) leafletPrintedBatchNumbers.push(batchNumber);

  labelPrintRecords[batchNumber] = labelPrintRecords[batchNumber] || {
    printed: true,
    printedBy: "printer.user",
    dateTime: "17 Jun 2026, 10:35:41",
    itemsPrinted: {
      "Carton Label": true,
      "End Of Pack Label": true,
      "Security Seals": true
    }
  };
  leafletPrintRecords[batchNumber] = leafletPrintRecords[batchNumber] || {
    printed: true,
    printedBy: "printer.user",
    dateTime: "17 Jun 2026, 12:18:04",
    itemsPrinted: {
      Leaflet: true
    }
  };

  document.body.classList.remove("pre-login");
  loginModal.classList.add("hidden");
  renderStage("leaflet-folding");
  statusMessage.textContent = `${batchNumber} is ready in Leaflet Folding demo mode.`;
}

function loadPreAssemblyDemo() {
  const stage = findStage("pre-assembly-qc");
  const product = bnsProducts.find((item) => item.batch === "03A1582") || bnsProducts[0];
  const batchNumber = product.batch;

  currentLogin = {
    user: stage.user,
    role: stage.role,
    stageId: stage.id
  };
  isAuthenticated = true;
  document.body.classList.remove("pre-login");
  loginModal.classList.add("hidden");
  if (!generatedBatchNumbers.includes(batchNumber)) generatedBatchNumbers.push(batchNumber);
  if (!labelPrintedBatchNumbers.includes(batchNumber)) labelPrintedBatchNumbers.push(batchNumber);
  if (!leafletPrintedBatchNumbers.includes(batchNumber)) leafletPrintedBatchNumbers.push(batchNumber);
  if (!leafletFoldedBatchNumbers.includes(batchNumber)) leafletFoldedBatchNumbers.push(batchNumber);
  preAssemblySelectedProduct = null;
  renderStage("pre-assembly-qc");
  statusMessage.textContent = `${batchNumber} is ready in Pre Assembly demo mode.`;
}

function preloadToProduction(batchNumber = "03A1582") {
  const product = bnsProducts.find((item) => item.batch === batchNumber) || bnsProducts[0];
  const resolvedBatch = product.batch;
  if (!generatedBatchNumbers.includes(resolvedBatch)) generatedBatchNumbers.push(resolvedBatch);
  if (!labelPrintedBatchNumbers.includes(resolvedBatch)) labelPrintedBatchNumbers.push(resolvedBatch);
  if (!leafletPrintedBatchNumbers.includes(resolvedBatch)) leafletPrintedBatchNumbers.push(resolvedBatch);
  if (!leafletFoldedBatchNumbers.includes(resolvedBatch)) leafletFoldedBatchNumbers.push(resolvedBatch);
  if (!preAssemblyCheckedBatchNumbers.includes(resolvedBatch)) preAssemblyCheckedBatchNumbers.push(resolvedBatch);
  return product;
}

function loadProductionDemo() {
  const stage = findStage("room-allocation");
  const product = preloadToProduction();
  currentLogin = {
    user: stage.user,
    role: stage.role,
    stageId: stage.id
  };
  isAuthenticated = true;
  document.body.classList.remove("pre-login");
  loginModal.classList.add("hidden");
  productionSelectedProduct = null;
  renderStage("room-allocation");
  statusMessage.textContent = `${product.batch} is ready in Production Controller demo mode.`;
}

function loadAssemblyDemo() {
  const stage = findStage("assembly-room");
  const product = preloadToProduction();
  if (!productionAllocatedBatchNumbers.includes(product.batch)) productionAllocatedBatchNumbers.push(product.batch);
  productionRecords[product.batch] = productionRecords[product.batch] || {
    user: "production.control",
    dateTime: "22 Jun 2026, 11:10:00",
    boxCount: "2",
    roomNo: "Room 2"
  };
  currentLogin = {
    user: stage.user,
    role: stage.role,
    stageId: stage.id
  };
  isAuthenticated = true;
  document.body.classList.remove("pre-login");
  loginModal.classList.add("hidden");
  assemblySelectedProduct = null;
  renderStage("assembly-room");
  statusMessage.textContent = `${product.batch} is ready in Assembly Room demo mode.`;
}

function loadPostAssemblyDemo() {
  const stage = findStage("post-assembly-qc");
  const product = preloadToProduction();
  if (!productionAllocatedBatchNumbers.includes(product.batch)) productionAllocatedBatchNumbers.push(product.batch);
  if (!assembledBatchNumbers.includes(product.batch)) assembledBatchNumbers.push(product.batch);
  assemblyRecords[product.batch] = assemblyRecords[product.batch] || {
    user: "assembly.room",
    dateTime: "22 Jun 2026, 15:15:00",
    boxCount: "5",
    usedLabels: product.quantity,
    signedTabs: {
      materials: { user: "assembly.room", dateTime: "22 Jun 2026, 14:55:00" },
      samples: { user: "assembly.room", dateTime: "22 Jun 2026, 15:00:00" },
      ipc: { user: "assembly.room", dateTime: "22 Jun 2026, 15:08:00" },
      recon: { user: "assembly.room", dateTime: "22 Jun 2026, 15:15:00" }
    }
  };
  currentLogin = {
    user: stage.user,
    role: stage.role,
    stageId: stage.id
  };
  isAuthenticated = true;
  document.body.classList.remove("pre-login");
  loginModal.classList.add("hidden");
  postAssemblySelectedProduct = null;
  renderStage("post-assembly-qc");
  statusMessage.textContent = `${product.batch} is ready in Post Assembly demo mode.`;
}

function loadPreQpDemo() {
  const stage = findStage("pre-qp");
  const product = preloadToProduction();
  if (!productionAllocatedBatchNumbers.includes(product.batch)) productionAllocatedBatchNumbers.push(product.batch);
  if (!assembledBatchNumbers.includes(product.batch)) assembledBatchNumbers.push(product.batch);
  if (!postAssemblyCheckedBatchNumbers.includes(product.batch)) postAssemblyCheckedBatchNumbers.push(product.batch);
  postAssemblyRecords[product.batch] = postAssemblyRecords[product.batch] || {
    user: "postassembly.qc",
    dateTime: "22 Jun 2026, 16:10:00",
    boxCount: "7",
    totalQty: product.quantity,
    packsChecked: "27",
    quarantinePrinted: true
  };
  currentLogin = {
    user: stage.user,
    role: stage.role,
    stageId: stage.id
  };
  isAuthenticated = true;
  document.body.classList.remove("pre-login");
  loginModal.classList.add("hidden");
  preQpSelectedProduct = null;
  renderStage("pre-qp");
  statusMessage.textContent = `${product.batch} is ready in Pre QP demo mode.`;
}

function loadQpReleaseDemo() {
  const stage = findStage("qp-release");
  const product = preloadToProduction();
  if (!productionAllocatedBatchNumbers.includes(product.batch)) productionAllocatedBatchNumbers.push(product.batch);
  if (!assembledBatchNumbers.includes(product.batch)) assembledBatchNumbers.push(product.batch);
  if (!postAssemblyCheckedBatchNumbers.includes(product.batch)) postAssemblyCheckedBatchNumbers.push(product.batch);
  if (!preQpCheckedBatchNumbers.includes(product.batch)) preQpCheckedBatchNumbers.push(product.batch);
  postAssemblyRecords[product.batch] = postAssemblyRecords[product.batch] || {
    user: "postassembly.qc",
    dateTime: "22 Jun 2026, 16:10:00",
    boxCount: "7",
    totalQty: product.quantity,
    packsChecked: "27",
    quarantinePrinted: true
  };
  preQpRecords[product.batch] = preQpRecords[product.batch] || {
    user: "pre.qp",
    dateTime: "22 Jun 2026, 16:45:00",
    sampleBox: "01",
    docs: ["Yes", "Yes", "No", "Yes", "No", "No"],
    materialChecked: true,
    comments: "Pre-QP review complete. Digital release log generated.",
    logGenerated: true
  };
  currentLogin = {
    user: stage.user,
    role: stage.role,
    stageId: stage.id
  };
  isAuthenticated = true;
  document.body.classList.remove("pre-login");
  loginModal.classList.add("hidden");
  qpSelectedProduct = null;
  renderStage("qp-release");
  statusMessage.textContent = `${product.batch} is ready in QP Release demo mode.`;
}

function startWireframe() {
  renderStageStrip();
  const demoMode = new URLSearchParams(window.location.search).get("demo") || new URLSearchParams(window.location.hash.replace(/^#/, "?")).get("demo");

  if (demoMode === "packing-list") {
    const stage = findStage("packing-list");
    currentLogin = { user: stage.user, role: stage.role, stageId: stage.id };
    isAuthenticated = true;
    document.body.classList.remove("pre-login");
    loginModal.classList.add("hidden");
    renderStage("packing-list");
    statusMessage.textContent = "Packing List demo mode opened.";
    return;
  }
  if (demoMode === "leaflet-folding") {
    loadLeafletFoldingDemo();
    return;
  }

  if (demoMode === "pre-assembly") {
    loadPreAssemblyDemo();
    return;
  }

  if (demoMode === "production") {
    loadProductionDemo();
    return;
  }

  if (demoMode === "assembly") {
    loadAssemblyDemo();
    return;
  }

  if (demoMode === "post-assembly") {
    loadPostAssemblyDemo();
    return;
  }

  if (demoMode === "pre-qp") {
    loadPreQpDemo();
    return;
  }

  if (demoMode === "qp-release") {
    loadQpReleaseDemo();
    return;
  }

  openInitialLogin();
}

function renderHandoff(stage) {
  return `
    <aside class="handoff-box">
      <div class="panel-title">Handoff</div>
      <dl>
<dt>Entry source</dt>
<dd>${stage.entry}</dd>
<dt>Next module</dt>
<dd>${stage.next}</dd>
<dt>Required approval</dt>
<dd>${stage.approval}</dd>
      </dl>
      <button class="classic-button primary full" type="button">Submit Handoff</button>
      <button class="classic-button full" type="button">Save Draft</button>
    </aside>
  `;
}

function renderGenericStageWork(stage) {
  return `
    <div class="work-grid">
      <section>
<div class="panel-title">Digital Checklist</div>
<div class="checklist">
  ${stage.checks
    .map(
      (check, index) => `
<div class="check-row">
  <span class="check-box">${index < 2 ? "OK" : ""}</span>
  <div>
    <strong>${check}</strong>
    <p>${index < 2 ? "Completed in current draft." : "Ready for operator completion."}</p>
  </div>
  <span class="status ${index < 2 ? "done-status" : "active-status"}">${index < 2 ? "Done" : "Open"}</span>
</div>
      `
    )
    .join("")}
</div>
      </section>
      ${renderHandoff(stage)}
    </div>
  `;
}

function getMfgLotNo(item) {
  if (!item) return "";
  return item.mfgLotNo || item.manufLotNo || item.manufacturingLot || item.mfgLot || item.manufacturerBatchNo || item.batchNo || "";
}

function matchesBatchOrMfgLot(item, searchValue) {
  const search = String(searchValue || "").trim().toLowerCase();
  if (!search) return true;
  return [item.batch, item.batchNo, item.product, item.description, getMfgLotNo(item)]
    .some((value) => String(value || "").toLowerCase().includes(search));
}

function exactBatchOrMfgLotMatch(item, searchValue) {
  const search = String(searchValue || "").trim().toLowerCase();
  if (!search) return false;
  return [item.batch, item.batchNo, getMfgLotNo(item)]
    .some((value) => String(value || "").trim().toLowerCase() === search);
}

function getFilteredBnsProducts() {
  return bnsProducts
    .filter((product) =>
      bnsFilters.status === "Printed BAR"
        ? generatedBatchNumbers.includes(product.batch)
        : bnsFilters.status === "Not Printed BAR"
          ? !generatedBatchNumbers.includes(product.batch)
          : true
    )
    .filter((product) => bnsFilters.country === "All" || product.country === bnsFilters.country)
    .filter((product) => bnsFilters.site === "All" || product.site === bnsFilters.site)
    .filter((product) => bnsFilters.category === "All" || product.category === bnsFilters.category)
    .filter((product) => !bnsFilters.quantity || String(product.quantity).includes(bnsFilters.quantity.trim()))
    .filter((product) => !bnsFilters.batch || String(product.batch || product.batchNo || "").toLowerCase().includes(bnsFilters.batch.trim().toLowerCase()));
}

function getDefaultPackingListRows() {
  return [
    { orderNo: "C13719", lineNo: "1", partNo: "ESADA05TABS84", description: "Adartrel 0.5mg Tabs 84", batchNo: "", expiryDate: "", qty: "50", boxes: "0", suppName: "EUROSERV, S.A.", suppCode: "EURO10_G", comments: "", createdBy: "Satish Kalbande", createdDate: "22-06-2026", foreignName: "ADARTREL comprimes pellicules", strength: "0.5mg", packSize: "28", country: "SPAIN", ecma: "67921 (654...)", contract: "WHO", barcode: "0", validBarcode: "0" },
    { orderNo: "C13719", lineNo: "10", partNo: "ESLUMEYE30", description: "Lumigan 0.01% Eye drops 3ml", batchNo: "426752", expiryDate: "30-09-2027", qty: "300", boxes: "1", suppName: "EUROSERV, S.A.", suppCode: "EURO10_G", comments: "", createdBy: "Satish Kalbande", createdDate: "22-06-2026", foreignName: "Lumigan", strength: "0.1mg/ml", packSize: "1 x 3ml", country: "SPAIN", ecma: "EU/1/02/205...", contract: "WHO", barcode: "0", validBarcode: "0" },
    { orderNo: "C13719", lineNo: "11", partNo: "ESMAS500TAB", description: "Mastical 500mg Tabs 90", batchNo: "12522242", expiryDate: "31-03-2028", qty: "280", boxes: "7", suppName: "EUROSERV, S.A.", suppCode: "EURO10_G", comments: "", createdBy: "Satish Kalbande", createdDate: "22-06-2026", foreignName: "MASTICAL comp.", strength: "500mg", packSize: "90", country: "SPAIN", ecma: "58828 (655...)", contract: "WHO", barcode: "0", validBarcode: "0" },
    { orderNo: "C13719", lineNo: "12", partNo: "ESOMA1000", description: "Omacor 1000mg Capsules 28", batchNo: "Z002", expiryDate: "30-09-2028", qty: "500", boxes: "6", suppName: "EUROSERV, S.A.", suppCode: "EURO10_G", comments: "", createdBy: "Satish Kalbande", createdDate: "22-06-2026", foreignName: "Omacor cap.", strength: "1000mg", packSize: "28", country: "SPAIN", ecma: "65476 (873...)", contract: "WHO", barcode: "0", validBarcode: "0" },
    { orderNo: "C13719", lineNo: "2", partNo: "ESBACNA15G", description: "Bactroban Ointment 15G", batchNo: "TL2B", expiryDate: "31-10-2027", qty: "200", boxes: "1", suppName: "EUROSERV, S.A.", suppCode: "EURO10_G", comments: "", createdBy: "Satish Kalbande", createdDate: "22-06-2026", foreignName: "Bactroban pomada", strength: "2% w/w", packSize: "15g", country: "SPAIN", ecma: "58868 (997...)", contract: "WHO", barcode: "0", validBarcode: "0" }
  ];
}

function canGeneratePackingList(poNo) {
  const rows = getPackingListRows().filter(r => r.orderNo === poNo);
  if (rows.length === 0) return false;
  // Ignore empty draft lines with no batches or expiries
  const activeRows = rows.filter(row => row.batchNo && row.expiryDate && row.qty && row.qty !== "0");
  if (activeRows.length === 0) return false;
  return activeRows.every(row => {
    const key = getPackingLineKey(row);
    return packingLabelPrintRecords[key] !== undefined;
  });
}

function getRpTaskViewedDocs(po) {
  if (!po.rpTaskViewedDocs) {
    po.rpTaskViewedDocs = {};
  }
  return po.rpTaskViewedDocs;
}

const rpDocumentApprovalFieldMap = {
  "import-export": ["eori", "commodity"],
  "cmr": ["transporter", "wda-match"],
  "temperature-record": ["temp-transit", "temp-storage"],
  "supplier-declaration": ["art51-decl", "fmd-compliance", "fmd-decom"]
};

function syncRpApprovalFormFromVerifiedDocument(poNo, docId) {
  const fields = rpDocumentApprovalFieldMap[docId] || [];
  if (!fields.length) return;
  const primaryPoNo = getRpMergePrimaryPo(poNo);
  getRpMergePoNos(primaryPoNo).forEach((memberPoNo) => {
    if (!rpApprovalAnswers[memberPoNo]) rpApprovalAnswers[memberPoNo] = {};
    fields.forEach((field) => {
      rpApprovalAnswers[memberPoNo][field] = "Y";
    });
  });
}

function approveRpTaskDocument(poNo, docId) {
  const workflow = rpPackWorkflows[poNo];
  if (!workflow) return false;
  getRpTaskViewedDocs(workflow)[docId] = true;
  if (rpSharedDocumentIds.includes(docId)) {
    getRpMergePoNos(poNo).forEach((memberPoNo) => {
      const memberWorkflow = rpPackWorkflows[memberPoNo];
      if (memberWorkflow) getRpTaskViewedDocs(memberWorkflow)[docId] = true;
    });
  }
  syncRpApprovalFormFromVerifiedDocument(poNo, docId);
  return true;
}

function approveRpTaskPackingList(poNo) {
  const workflow = rpPackWorkflows[poNo];
  if (!workflow) return false;
  getRpTaskViewedDocs(workflow)["generated-packing-list"] = true;
  return true;
}

function syncRpApprovalFormFromRejectedDocument(poNo, docId) {
  const fields = rpDocumentApprovalFieldMap[docId] || [];
  if (!fields.length) return;
  const primaryPoNo = getRpMergePrimaryPo(poNo);
  getRpMergePoNos(primaryPoNo).forEach((memberPoNo) => {
    if (!rpApprovalAnswers[memberPoNo]) rpApprovalAnswers[memberPoNo] = {};
    fields.forEach((field) => {
      rpApprovalAnswers[memberPoNo][field] = "N";
    });
  });
}

function rejectRpTaskDocument(poNo, docId) {
  const workflow = rpPackWorkflows[poNo];
  if (!workflow) return false;
  getRpTaskViewedDocs(workflow)[docId] = "rejected";
  if (rpSharedDocumentIds.includes(docId)) {
    getRpMergePoNos(poNo).forEach((memberPoNo) => {
      const memberWorkflow = rpPackWorkflows[memberPoNo];
      if (memberWorkflow) getRpTaskViewedDocs(memberWorkflow)[docId] = "rejected";
    });
  }
  syncRpApprovalFormFromRejectedDocument(poNo, docId);
  return true;
}

function rejectRpTaskPackingList(poNo) {
  const workflow = rpPackWorkflows[poNo];
  if (!workflow) return false;
  getRpTaskViewedDocs(workflow)["generated-packing-list"] = "rejected";
  return true;
}

function hasAnyRpDocumentRejected(poNo) {
  return getRpMergePoNos(getRpMergePrimaryPo(poNo)).some((memberPoNo) => {
    const workflow = rpPackWorkflows[memberPoNo];
    return workflow && Object.values(getRpTaskViewedDocs(workflow)).includes("rejected");
  });
}

function getRpApprovalVerifiedDocumentSource(poNo, field) {
  const primaryPoNo = getRpMergePrimaryPo(poNo);
  const workflow = rpPackWorkflows[primaryPoNo];
  if (!workflow) return "";
  const viewedDocs = getRpTaskViewedDocs(workflow);
  const matchedDocId = Object.keys(rpDocumentApprovalFieldMap).find((docId) => viewedDocs[docId] === true && rpDocumentApprovalFieldMap[docId].includes(field));
  if (!matchedDocId) return "";
  const names = {
    "import-export": "Import / Export",
    "cmr": "CMR",
    "temperature-record": "Temperature Record",
    "supplier-declaration": "Supplier Declaration"
  };
  return names[matchedDocId] || matchedDocId;
}

function areAllRpDocumentsVerified(poNo) {
  const primaryPoNo = getRpMergePrimaryPo(poNo);
  const poNos = getRpMergePoNos(primaryPoNo);
  const primaryWorkflow = rpPackWorkflows[primaryPoNo];
  if (!primaryWorkflow) return false;
  const requiredIds = getRpRequiredDocumentsForPo(primaryPoNo).map((doc) => doc.id);
  const sharedIds = getRpMergeGroup(primaryPoNo) ? rpSharedDocumentIds.filter((docId) => requiredIds.includes(docId)) : [];
  const sharedViewed = sharedIds.every((docId) => getRpTaskViewedDocs(primaryWorkflow)[docId] === true);
  const individualViewed = poNos.every((memberPoNo) => {
    const workflow = rpPackWorkflows[memberPoNo];
    if (!workflow) return false;
    const viewedDocs = getRpTaskViewedDocs(workflow);
    const individualDocIds = getRpRequiredDocumentsForPo(memberPoNo).map((doc) => doc.id).filter((docId) => !sharedIds.includes(docId));
    return individualDocIds.every((docId) => viewedDocs[docId] === true) && viewedDocs["generated-packing-list"] === true;
  });
  return sharedViewed && individualViewed;
}

function areAllRpDocumentsDecided(poNo) {
  const primaryPoNo = getRpMergePrimaryPo(poNo);
  const poNos = getRpMergePoNos(primaryPoNo);
  const primaryWorkflow = rpPackWorkflows[primaryPoNo];
  if (!primaryWorkflow) return false;
  const isDecided = (value) => value === true || value === "rejected";
  const requiredIds = getRpRequiredDocumentsForPo(primaryPoNo).map((doc) => doc.id);
  const sharedIds = getRpMergeGroup(primaryPoNo) ? rpSharedDocumentIds.filter((docId) => requiredIds.includes(docId)) : [];
  const sharedDecided = sharedIds.every((docId) => isDecided(getRpTaskViewedDocs(primaryWorkflow)[docId]));
  const individualDecided = poNos.every((memberPoNo) => {
    const workflow = rpPackWorkflows[memberPoNo];
    if (!workflow) return false;
    const decisions = getRpTaskViewedDocs(workflow);
    const individualDocIds = getRpRequiredDocumentsForPo(memberPoNo).map((doc) => doc.id).filter((docId) => !sharedIds.includes(docId));
    return individualDocIds.every((docId) => isDecided(decisions[docId])) && isDecided(decisions["generated-packing-list"]);
  });
  return sharedDecided && individualDecided;
}
let activePreviewDoc = null;
let activePreviewPo = null;

function openDocumentPreview(poNo, docId) {
  activePreviewPo = poNo;
  activePreviewDoc = docId;
  
  const workflow = rpPackWorkflows[poNo];
  if (!workflow) return;
  const doc = workflow.documents.find(d => d.id === docId);
  if (!doc) return;
  const isRpTaskPreview = currentStageId === "rp-pack" && rpiModuleView === "tasks";
  const isRpPackPreview = currentStageId === "rp-pack" && rpiModuleView === "pack-creation";
  if (isRpPackPreview) {
    workflow.viewedDocs = workflow.viewedDocs || {};
    workflow.viewedDocs[docId] = true;
    doc.verified = true;
  }
  const documentAlreadyVerified = isRpTaskPreview ? getRpTaskViewedDocs(workflow)[docId] === true : (isRpPackPreview ? true : doc.verified === true);
  
  let previewContent = "";
  if (docId === "supplier-invoice") {
    previewContent = `
      <div style="border: 2px solid #334155; padding: 20px; font-family: Courier, monospace; background: #fffdf6; border-radius: 4px;">
        <h2 style="text-align: center; margin-top: 0; color: #1e293b;">SUPPLIER INVOICE</h2>
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #334155; padding-bottom: 10px; margin-bottom: 15px; font-size: 11px;">
          <div>
            <strong>Invoice To:</strong> B&S Healthcare<br>
            <strong>Invoice No:</strong> INV-9874102<br>
            <strong>Date:</strong> 24-06-2026
          </div>
          <div style="text-align: right;">
            <strong>Supplier:</strong> ${escapeQaChecklistText(workflow.supplier || "Supplier from PO")}<br>
            <strong>Country:</strong> SPAIN<br>
            <strong>P.O. Ref:</strong> ${poNo}
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid #334155;">
              <th style="text-align: left; padding: 5px;">Item</th>
              <th style="text-align: center; padding: 5px;">Qty</th>
              <th style="text-align: right; padding: 5px;">Unit Price</th>
              <th style="text-align: right; padding: 5px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 5px;">Alphagan eye drops 0.2% 5ml</td>
              <td style="text-align: center; padding: 5px;">220</td>
              <td style="text-align: right; padding: 5px;">GBP 4.50</td>
              <td style="text-align: right; padding: 5px;">GBP 990.00</td>
            </tr>
            <tr>
              <td style="padding: 5px;">Brilique film-coated tablets 90mg</td>
              <td style="text-align: center; padding: 5px;">360</td>
              <td style="text-align: right; padding: 5px;">GBP 12.00</td>
              <td style="text-align: right; padding: 5px;">GBP 4,320.00</td>
            </tr>
          </tbody>
        </table>
        <div style="text-align: right; font-weight: bold; border-top: 2px solid #334155; padding-top: 8px; font-size: 12px;">
          GRAND TOTAL: GBP 5,310.00
        </div>
      </div>
    `;
  } else if (docId === "po") {
    previewContent = `
      <div style="border: 2px solid #1e3a8a; padding: 20px; font-family: sans-serif; background: #ffffff; border-radius: 4px;">
        <h2 style="color: #1e3a8a; margin-top: 0; text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 5px;">PURCHASE ORDER</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px;">
          <div>
            <strong>B&S Healthcare</strong><br>
            100 Sovereign Road, London<br>
            <strong>PO Number:</strong> ${poNo}<br>
            <strong>Date:</strong> 23-06-2026
          </div>
          <div style="text-align: right;">
            <strong>Supplier Ref:</strong> EURO10_G<br>
            <strong>Ship Via:</strong> Authorized Transporter
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
          <thead style="background: #f1f5f9;">
            <tr>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Part No</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Description</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Qty Ordered</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">ESALP02EYE5</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Alphagan eye drops 0.2% 5ml</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">220</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">PTBRI90TAB56</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;">Brilique film-coated tablets 90mg</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">360</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (docId === "supplier-packing-list") {
    previewContent = `
      <div style="border: 2px solid #059669; padding: 20px; font-family: sans-serif; background: #ffffff; border-radius: 4px;">
        <h2 style="color: #059669; margin-top: 0; text-align: center; border-bottom: 2px solid #059669; padding-bottom: 5px;">SUPPLIER PACKING LIST</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px;">
          <div>
            <strong>Sender:</strong> Euroserv S.A.<br>
            <strong>PO Ref:</strong> ${poNo}
          </div>
          <div style="text-align: right;">
            <strong>Packages:</strong> 5 boxes<br>
            <strong>Gross Wt:</strong> 12.5 kg
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead style="background: #ecfdf5;">
            <tr>
              <th style="border: 1px solid #d1fae5; padding: 6px;">Box No</th>
              <th style="border: 1px solid #d1fae5; padding: 6px;">Description</th>
              <th style="border: 1px solid #d1fae5; padding: 6px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #d1fae5; padding: 6px; text-align: center;">Box 1-2</td>
              <td style="border: 1px solid #d1fae5; padding: 6px;">Alphagan eye drops 0.2% 5ml</td>
              <td style="border: 1px solid #d1fae5; padding: 6px; text-align: center;">220</td>
            </tr>
            <tr>
              <td style="border: 1px solid #d1fae5; padding: 6px; text-align: center;">Box 3-5</td>
              <td style="border: 1px solid #d1fae5; padding: 6px;">Brilique film-coated tablets 90mg</td>
              <td style="border: 1px solid #d1fae5; padding: 6px; text-align: center;">360</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (docId === "supplier-declaration") {
    previewContent = `
      <div style="border: 2px solid #7c3aed; padding: 20px; font-family: serif; background: #faf5ff; border-radius: 4px;">
        <h2 style="color: #7c3aed; text-align: center; margin-top: 0; font-size: 18px;">SUPPLIER COMPLIANCE DECLARATION</h2>
        <p style="text-align: justify; line-height: 1.5; font-size: 12px;">
          We hereby declare and certify that all the goods supplied under PO reference <strong>${poNo}</strong> comply fully with Article 51 of Directive 2001/83/EC and Falsified Medicines Directive 2011/62/EU. We confirm that the stock has been sourced from approved suppliers in accordance with regulatory guidelines.
        </p>
        <div style="margin-top: 20px; display: flex; justify-content: space-between; font-size: 11px;">
          <div>
            <strong>Authorized Signatory:</strong><br>
            Dr. Alejandro Ruiz<br>
            Quality Director, Euroserv S.A.
          </div>
          <div style="text-align: right;">
            <strong>Date:</strong> 24-06-2026
          </div>
        </div>
      </div>
    `;
  } else if (docId === "temperature-record") {
    previewContent = `
      <div style="border: 2px solid #db2777; padding: 20px; font-family: sans-serif; background: #ffffff; border-radius: 4px;">
        <h2 style="color: #db2777; text-align: center; margin-top: 0; border-bottom: 2px solid #db2777; padding-bottom: 5px;">TRANSIT TEMPERATURE LOG</h2>
        <div style="margin-bottom: 15px; font-size: 11px;">
          <strong>PO No:</strong> ${poNo} | <strong>Logger ID:</strong> TL-4091<br>
          <strong>Range:</strong> +2.0C to +8.0C (Cold Chain System)
        </div>
        <div style="background: #fdf2f8; border: 1px solid #fbcfe8; padding: 15px; border-radius: 4px; text-align: center;">
          <p style="font-weight: bold; color: #be185d; margin: 0 0 10px; font-size: 11px;">Temperature Profile Chart</p>
          <div style="height: 100px; display: flex; align-items: flex-end; justify-content: space-between; border-left: 2px solid #ccc; border-bottom: 2px solid #ccc; padding: 10px 5px 0;">
            <div style="height: 60%; width: 10%; background: #be185d; border-radius: 2px 2px 0 0;"></div>
            <div style="height: 55%; width: 10%; background: #be185d; border-radius: 2px 2px 0 0;"></div>
            <div style="height: 65%; width: 10%; background: #be185d; border-radius: 2px 2px 0 0;"></div>
            <div style="height: 58%; width: 10%; background: #be185d; border-radius: 2px 2px 0 0;"></div>
            <div style="height: 62%; width: 10%; background: #be185d; border-radius: 2px 2px 0 0;"></div>
            <div style="height: 57%; width: 10%; background: #be185d; border-radius: 2px 2px 0 0;"></div>
            <div style="height: 63%; width: 10%; background: #be185d; border-radius: 2px 2px 0 0;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8px; color: #666; margin-top: 4px; padding-left: 10px;">
            <span>Day 1</span><span>Day 2</span><span>Day 3</span><span>Day 4</span><span>Day 5</span><span>Day 6</span><span>Day 7</span>
          </div>
        </div>
        <p style="font-size: 11px; color: green; font-weight: bold; text-align: center; margin-top: 10px; margin-bottom: 0;">OK - Temperature parameters kept within 2.0C - 8.0C.</p>
      </div>
    `;
  } else {
    previewContent = `
      <div style="border: 2px solid #475569; padding: 25px; font-family: sans-serif; background: #ffffff; border-radius: 4px;">
        <h2 style="color: #475569; text-align: center; margin-top: 0; text-transform: uppercase; font-size: 16px;">${doc.name}</h2>
        <p style="margin-bottom: 15px; font-size: 11px;"><strong>PO Reference No:</strong> ${poNo}</p>
        <div style="border: 1px dashed #94a3b8; padding: 40px; text-align: center; color: #64748b; background: #f8fafc; border-radius: 4px; font-size: 12px;">
          Mock digital representation of ${doc.name} for PO ${poNo}. All data matched and verified.
        </div>
      </div>
    `;
  }

  let previewOverlay = document.querySelector("#doc-preview-modal");
  if (!previewOverlay) {
    previewOverlay = document.createElement("div");
    previewOverlay.id = "doc-preview-modal";
    previewOverlay.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;";
    document.body.appendChild(previewOverlay);
  }
  
  previewOverlay.innerHTML = `
    <div style="background: white; border-radius: 8px; width: 600px; max-width: 90vw; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 15px; font-family: Tahoma, sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
        <div style="display:flex; flex-direction:column; gap:3px; min-width:0;">
          <h3 style="margin: 0; color: #1f3a5f; font-size: 14px;">Document Preview - ${doc.name}</h3>
          <span style="color:#64748b; font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Uploaded file: ${escapeQaChecklistText(doc.fileName || "Uploaded document")}</span>
        </div>
        <button id="doc-preview-close" style="background: none; border: none; font-size: 20px; cursor: pointer; font-weight: bold; color: #64748b;">&times;</button>
      </div>
      
      <div style="max-height: 400px; overflow-y: auto; padding: 5px;">
        ${previewContent}
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #cbd5e1; padding-top: 12px;">
        ${documentAlreadyVerified ? `<span style="color: #065f46; font-weight: bold; align-self: center; font-size: 12px; margin-right: auto;">Approved</span>` : `<span style="color: #64748b; font-weight: bold; align-self: center; font-size: 11px; margin-right: auto;">Preview only â€” approve from the document card</span>`}
        <button id="doc-preview-download" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">Download</button>
        <button id="doc-preview-cancel" style="background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">Close</button>
      </div>
    </div>
  `;
  
  document.querySelector("#doc-preview-close").addEventListener("click", closeDocumentPreview);
  document.querySelector("#doc-preview-cancel").addEventListener("click", closeDocumentPreview);
  document.querySelector("#doc-preview-download").addEventListener("click", () => { statusMessage.textContent = `Download started for ${doc.name}.`; });
  
}

function closeDocumentPreview() {
  const previewOverlay = document.querySelector("#doc-preview-modal");
  const stageToRender = currentStageId;
  if (previewOverlay) {
    previewOverlay.remove();
  }
  activePreviewDoc = null;
  activePreviewPo = null;
  if (stageToRender === "rp-pack") {
    renderStage("rp-pack");
    if (rpiModuleView === "tasks") setTimeout(updateRpApprovalAvailability, 0);
    if (rpiModuleView === "pack-creation") setTimeout(updateRpDocumentsAvailability, 0);
  }
}

function renderRpApprovalExactPdfModal(poNo, answers, signatureObj) {
  answers = answers || {};
  const po = rpPackWorkflows[poNo] || {};
  const firstRow = getPackingListRows().find(r => r.orderNo === poNo) || {};
  
  const supplierName = firstRow.suppName || "Euroserv S.A.";
  const supplierCountry = firstRow.country || "SPAIN";
  const invoiceNo = "INV-9874102";
  const poNumberValue = answers["po-number"] || getRpMergePoNos(poNo).join(", ");
  const escapedPoNumberValue = String(poNumberValue).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  const getYN = (val) => {
    if (val === "Y" || val === true) return `<strong>YES</strong> <span style="color:#aaa;">/ NO</span>`;
    if (val === "N" || val === false) return `<span style="color:#aaa;">YES /</span> <strong>NO</strong>`;
    return `<span style="color:#aaa;">YES / NO</span>`;
  };
  
  const getYNNA = (val) => {
    if (val === "Y") return `<strong>YES</strong> <span style="color:#aaa;">/ NO / NA</span>`;
    if (val === "N") return `<span style="color:#aaa;">YES /</span> <strong>NO</strong> <span style="color:#aaa;">/ NA</span>`;
    if (val === "NA") return `<span style="color:#aaa;">YES / NO /</span> <strong>NA</strong>`;
    return `<span style="color:#aaa;">YES / NO / NA</span>`;
  };

  const getFEStatus = (val) => {
    if (val === "Y" || val === "Active") return `<strong>Active</strong> <span style="color:#aaa;">/ Inactive</span>`;
    if (val === "N" || val === "Inactive") return `<span style="color:#aaa;">Active /</span> <strong>Inactive</strong>`;
    return `<span style="color:#aaa;">Active / Inactive</span>`;
  };

  const sigHtml = signatureObj ? `
    <div style="border: 1px dashed green; background: #f0fdf4; padding: 6px; border-radius: 4px; display: inline-block;">
      <span style="color: #15803d; font-weight: bold; font-size: 11px;">Digitally Signed by ${signatureObj.user}</span><br>
      <span style="color: #15803d; font-size: 9px;">on ${signatureObj.dateTime}</span>
    </div>
  ` : `
    <button id="rp-pdf-sign-btn" class="classic-button primary" style="padding: 6px 12px; font-weight: bold; background: #1e3a8a; border-radius: 4px; cursor: pointer; font-size: 11px;">Click to Sign</button>
  `;

  return `
    <div id="rp-pdf-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 20000; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; border-radius: 8px; width: 800px; max-width: 95vw; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 15px; position: relative; font-family: Tahoma, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
          <h3 style="margin: 0; color: #1e3a8a; font-size: 14px;">RPi Checks Form F/PLPI/0088/001/v4 - Preview</h3>
          <button id="rp-pdf-close" style="background: none; border: none; font-size: 24px; cursor: pointer; font-weight: bold; color: #64748b;">&times;</button>
        </div>
        
        <div style="max-height: 70vh; overflow-y: auto; background: #f1f5f9; padding: 20px; border-radius: 6px;">
          <!-- A4 Sheet Container -->
          <div style="background: white; border: 1px solid #94a3b8; width: 700px; margin: 0 auto; padding: 35px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-family: Calibri, sans-serif; font-size: 11pt; color: #000000; line-height: 1.3; text-align: left;">
            
            <!-- Logo & Title -->
            <div style="margin-bottom: 20px;">
              <div style="font-weight: bold; font-size: 14pt; color: #1e3a8a; font-style: italic;">B&S Healthcare</div>
              <div style="font-weight: bold; font-size: 12pt; color: #1e3a8a; border-bottom: 2px solid #000000; padding-bottom: 4px;">
                RPi Checks on Raw Imported Stock prior to Re-Labelling<br>
                (Under Regulation 45AA)
              </div>
            </div>
            
            <!-- Header Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt;">
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; width: 45%; font-weight: bold;">Supplier Name / Country</td>
                <td style="border: 1px solid #000000; padding: 6px;">${supplierName} / ${supplierCountry}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; font-weight: bold;">BNS's Purchase Order Number</td>
                <td style="border: 1px solid #000000; padding: 4px 6px;"><input id="rp-pdf-po-number" type="text" value="${escapedPoNumberValue}" ${signatureObj ? "readonly" : ""} aria-label="Purchase Order Number" placeholder="Enter one or more PO numbers" style="width:100%;box-sizing:border-box;border:${signatureObj ? "0" : "1px solid #94a3b8"};background:${signatureObj ? "transparent" : "#ffffff"};padding:4px 6px;font:inherit;color:#000;"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; font-weight: bold;">Supplier's Invoice Number</td>
                <td style="border: 1px solid #000000; padding: 6px;">${invoiceNo}</td>
              </tr>
            </table>

            <!-- Section: Custom Details Check -->
            <div style="background: #1e3a8a; color: white; font-weight: bold; text-align: center; padding: 4px 0; font-size: 11pt; margin-top: 15px;">
              Custom Details Check
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt;">
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; width: 80%;">EORI Verification</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold; width: 20%;">${getYN(answers.eori)}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px;">Commodity Code Verification</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${getYN(answers.commodity)}</td>
              </tr>
            </table>

            <!-- Section: Supplier Compliance Check -->
            <div style="background: #1e3a8a; color: white; font-weight: bold; text-align: center; padding: 4px 0; font-size: 11pt; margin-top: 15px;">
              Supplier Compliance Check
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt;">
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; width: 45%; font-weight: bold;" rowspan="2">Supplier Status in FE</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold; width: 55%;">${getFEStatus(answers["fe-status"] === "Y" ? "Active" : "Inactive")}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; font-size: 9pt;">
                  <strong>Give Reason if Inactive:</strong><br>
                  <span style="color: #334155; font-style: italic;">${answers["inactive-reason"] || "N/A"}</span>
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; font-weight: bold;">Is the collection address matches with the WDA?</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${getYN(answers["wda-match"])}</td>
              </tr>
            </table>

            <!-- Section: Temperature Compliance During Transit -->
            <div style="background: #1e3a8a; color: white; font-weight: bold; text-align: center; padding: 4px 0; font-size: 11pt; margin-top: 15px;">
              Temperature Compliance During Transit
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt;">
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; width: 80%;">Stock Transported by Authorised Transporter?</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold; width: 20%;">${getYN(answers.transporter)}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px;">Temperature records in transit checked and within parameters</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${getYN(answers["temp-transit"])}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px;">Temperature Records at Storage Site (if any) checked and within parameters</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${getYNNA(answers["temp-storage"])}</td>
              </tr>
            </table>

            <!-- Section: Compliance check in line with Article 51 of Directive 2001/83/EC -->
            <div style="background: #1e3a8a; color: white; font-weight: bold; text-align: center; padding: 4px 0; font-size: 10.5pt; margin-top: 15px;">
              Compliance check in line with Article 51 of Directive 2001/83/EC
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt;">
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; width: 80%;">Supplier declaration that all Goods on the delivery note comply with Article 51 of Directive 2001/83/EC and sourced from approved suppliers</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold; width: 20%;">${getYN(answers["art51-decl"])}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px;">Does the declaration contain compliance with FMD</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${getYN(answers["fmd-compliance"])}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px;">Does the declaration states that all FMD applicable products has been Decommissioned in accordance with Falsified Medicines Directive 2011/62/EU</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${getYN(answers["fmd-decom"])}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px;">Italian and Greek packs checked for presence of Bollino/Vignate stickers</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${getYNNA(answers.bollino)}</td>
              </tr>
            </table>

            <!-- Section: Conclusion -->
            <div style="background: #1e3a8a; color: white; font-weight: bold; text-align: center; padding: 4px 0; font-size: 11pt; margin-top: 15px;">
              Conclusion
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt;">
              <tr>
                <td style="border: 1px solid #000000; padding: 6px;" colspan="2">
                  <strong>RPi Comments:</strong><br>
                  <span style="color: #334155; font-style: italic;">${rpApprovalComments[poNo] || "No comments."}</span>
                </td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; width: 80%; font-weight: bold;">RPi Checks completed and stock is suitable for processing</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold; width: 20%;">${getYN(answers["stock-suitable"])}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000000; padding: 6px; font-weight: bold;">Any Deviation to be raised?</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${getYN(answers.deviation)}</td>
              </tr>
              <tr style="height: 60px;">
                <td style="border: 1px solid #000000; padding: 6px; font-weight: bold;">Signature (RPi or Delegate Deputy)</td>
                <td style="border: 1px solid #000000; padding: 6px; text-align: center; vertical-align: middle;">
                  ${sigHtml}
                </td>
              </tr>
            </table>

            <!-- Footer Details -->
            <div style="margin-top: 25px; display: flex; justify-content: space-between; font-size: 9pt; color: #555; border-top: 1px solid #ccc; padding-top: 8px;">
              <div>
                Parent SOP SOP/PLPI/0088<br>
                Effective Date: 02Jan2025
              </div>
              <div style="text-align: center;">
                Form Number F/PLPI/0088/001/v4<br>
                Review Date: 31Dec2026
              </div>
              <div style="text-align: right;">
                Page 1 of 1
              </div>
            </div>
            
          </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #cbd5e1; padding-top: 12px;">
          <button id="rp-pdf-cancel" style="background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">Close Preview</button>
        </div>
      </div>
    </div>
  `;
}
function getLivePackingListRows() {
  return [
    { orderNo: "C13810", lineNo: "1", partNo: "ESALP02EYE5", description: "Alphagan eye drops 0.2% 5ml", batchNo: "LVT001", mfgLotNo: "MFG-ALP-2401", expiryDate: "31-08-2027", qty: "220", boxes: "2", suppName: "Euroserv S.A.", suppCode: "EURO10_G", comments: "Live test row", createdBy: "goods.in", createdDate: "24-06-2026", foreignName: "Alphagan collyre", strength: "0.2%", packSize: "5ml", country: "SPAIN", ecma: "64120", contract: "WHO", barcode: "1", validBarcode: "1" },
    { orderNo: "C13810", lineNo: "2", partNo: "PTBRI90TAB56", description: "Brilique film-coated tablets 90mg", batchNo: "LVT002", mfgLotNo: "MFG-BRI-2402", expiryDate: "30-09-2028", qty: "360", boxes: "3", suppName: "Pharma Logistics PT", suppCode: "PHARMA_PT", comments: "Live test row", createdBy: "goods.in", createdDate: "24-06-2026", foreignName: "BRILIQUE comprimidos", strength: "90mg", packSize: "56", country: "PORTUGAL", ecma: "EU/1/10/655/002", contract: "WHO", barcode: "1", validBarcode: "1" },
    { orderNo: "C13810", lineNo: "3", partNo: "ESFOS100-6", description: "Foster Nexthaler 100/6mcg", batchNo: "LVT003", mfgLotNo: "MFG-FOS-2403", expiryDate: "31-10-2027", qty: "480", boxes: "4", suppName: "Spanish Pharma Supply", suppCode: "SPAIN_SUP", comments: "PCL already generated", createdBy: "goods.in", createdDate: "24-06-2026", foreignName: "FOSTER NEXTHALER", strength: "100/6 microgram", packSize: "120 doses", country: "SPAIN", ecma: "76713", contract: "WHO", barcode: "1", validBarcode: "1" },
    { orderNo: "C13810", lineNo: "4", partNo: "ESOMA1000", description: "Omacor 1000mg Capsules 28", batchNo: "LVT004", mfgLotNo: "MFG-OMA-2404", expiryDate: "30-09-2028", qty: "520", boxes: "5", suppName: "Euroserv S.A.", suppCode: "EURO10_G", comments: "Live test row", createdBy: "goods.in", createdDate: "24-06-2026", foreignName: "Omacor cap.", strength: "1000mg", packSize: "28", country: "SPAIN", ecma: "65476", contract: "WHO", barcode: "1", validBarcode: "1" },
    { orderNo: "C13811", lineNo: "1", partNo: "CZFLU120ACT", description: "Flutiform pressurised inhalation", batchNo: "LVT005", mfgLotNo: "MFG-FLU-2405", expiryDate: "31-07-2027", qty: "650", boxes: "6", suppName: "DerStar Pharma SK s.r.o.", suppCode: "DERSTAR", comments: "Reboxing batch", createdBy: "goods.in", createdDate: "24-06-2026", foreignName: "Flutiform suspenze", strength: "250/10mcg", packSize: "120 actuations", country: "CZECH REPUBLIC", ecma: "14/555/12-C", contract: "CON-G", barcode: "1", validBarcode: "1" },
    { orderNo: "C13811", lineNo: "2", partNo: "FRADA025TAB12", description: "Adartel tablets 0.25mg", batchNo: "LVT006", mfgLotNo: "MFG-ADA-2406", expiryDate: "31-10-2027", qty: "180", boxes: "2", suppName: "Pharma Logistics FR", suppCode: "PHARMA_FR", comments: "Braille required", createdBy: "goods.in", createdDate: "24-06-2026", foreignName: "ADARTEL comprimes pellicules", strength: "0.25mg", packSize: "12", country: "FRANCE", ecma: "3400939183947", contract: "CON-G", barcode: "1", validBarcode: "1" }
  ];
}
function getPackingListRows() {
  if (!packingListRowsState) {
    packingListRowsState = getDefaultPackingListRows().concat(getLivePackingListRows()).map((row, index) => ({ ...row, rowId: `pl-${index + 1}` }));
  }
  return packingListRowsState;
}
function getPackingLineKey(row) {
  return row.rowId || `${row.orderNo}-${row.lineNo}-${row.partNo}-${row.batchNo || "pending"}`;
}

function getSelectedPackingLineKeys() {
  const checked = [...document.querySelectorAll("[data-packing-row-select]:checked")].map((input) => input.dataset.packingRowSelect);
  if (checked.length) return checked;
  const firstRow = getFilteredPackingListRows()[0];
  return firstRow ? [getPackingLineKey(firstRow)] : [];
}

function updatePackingRowValue(rowKey, field, value) {
  if (isPackingListLocked()) {
    statusMessage.textContent = "Packing List is generated and locked. Editing is disabled.";
    return;
  }
  const row = getPackingListRows().find((item) => getPackingLineKey(item) === rowKey);
  if (!row) return;
  row[field] = value;
}

function splitPackingLine(rowKey) {
  if (isPackingListLocked()) {
    statusMessage.textContent = "Packing List is generated and locked. Split line is disabled.";
    return;
  }
  const rows = getPackingListRows();
  const index = rows.findIndex((row) => getPackingLineKey(row) === rowKey);
  if (index < 0) return;
  const row = rows[index];
  const originalQty = Number(row.qty || 0);
  const splitQty = Math.floor(originalQty / 2);
  const remainingQty = originalQty - splitQty;
  row.qty = String(remainingQty);
  const newRow = { ...row, rowId: `${row.rowId || rowKey}-split-${Date.now()}`, parentRowKey: rowKey, isSplitLine: true, lineNo: `${row.lineNo}A`, qty: String(splitQty), comments: "Split line" };
  rows.splice(index + 1, 0, newRow);
  statusMessage.textContent = `Line ${row.lineNo} split. Quantities can now be edited.`;
  renderStage("packing-list");
}

function getSelectedRemovableSplitPackingLine() {
  const selected = getSelectedPackingLineKeys();
  if (selected.length !== 1) return null;
  const row = getPackingListRows().find((item) => getPackingLineKey(item) === selected[0]);
  return row && row.isSplitLine ? row : null;
}

function updatePackingRemoveLineAvailability() {
  const button = document.querySelector("[data-remove-packing-lines]");
  if (!button) return;
  if (isPackingListLocked()) {
    button.disabled = true;
    return;
  }
  button.disabled = !getSelectedRemovableSplitPackingLine();
}

function removeSelectedSplitPackingLine() {
  if (isPackingListLocked()) {
    statusMessage.textContent = "Packing List is generated and locked. Remove line is disabled.";
    return;
  }
  const row = getSelectedRemovableSplitPackingLine();
  if (!row) {
    statusMessage.textContent = "Select one split line to remove. Original packing list entries cannot be removed.";
    updatePackingRemoveLineAvailability();
    return;
  }
  const key = getPackingLineKey(row);
  packingListRowsState = getPackingListRows().filter((item) => getPackingLineKey(item) !== key);
  delete packingLabelPrintRecords[key];
  renderStage("packing-list");
  statusMessage.textContent = `Removed split line ${row.lineNo}. Original entry retained.`;
}

function getVisiblePackingLineKeysForDelete() {
  return getFilteredPackingListRows().map((row) => getPackingLineKey(row));
}

function closePackingDeleteLoginDialog() {
  const dialog = document.querySelector("#packing-delete-login-modal");
  if (dialog) dialog.remove();
}

function openPackingDeleteLoginDialog() {
  if (isPackingListLocked()) {
    statusMessage.textContent = "Packing List is generated and locked. Delete is disabled.";
    return;
  }
  const deleteKeys = getVisiblePackingLineKeysForDelete();
  if (!deleteKeys.length) {
    statusMessage.textContent = "No packing list rows are available to delete.";
    return;
  }
  closePackingDeleteLoginDialog();
  const dialog = document.createElement("div");
  dialog.id = "packing-delete-login-modal";
  dialog.className = "modal-backdrop packing-delete-login-modal";
  dialog.innerHTML = `
    <div class="confirm-window packing-delete-login-window">
      <div class="internal-title"><span>Delete Packing List Data</span><button type="button" class="close-button" data-packing-delete-cancel>X</button></div>
      <div class="confirm-body packing-delete-login-body">
        <h2>Confirm delete</h2>
        <p>This will delete all rows currently displayed in the packing list table. Enter login details to continue.</p>
        <label>User Name <input id="packing-delete-user" value="${currentLogin ? currentLogin.user : "goods.in"}"></label>
        <label>Password <input id="packing-delete-password" type="password" value=""></label>
        <div class="confirm-actions">
          <button class="classic-button" type="button" data-packing-delete-cancel>Cancel</button>
          <button class="classic-button danger" type="button" data-packing-delete-confirm>Delete</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  const password = dialog.querySelector("#packing-delete-password");
  if (password) password.focus();
  statusMessage.textContent = "Delete confirmation requires login and password.";
}

function confirmPackingDeleteWithLogin() {
  const user = document.querySelector("#packing-delete-user")?.value.trim();
  const password = document.querySelector("#packing-delete-password")?.value;
  if (!user || !password) {
    statusMessage.textContent = "Enter user name and password to delete packing list data.";
    return;
  }
  const deleteKeys = getVisiblePackingLineKeysForDelete();
  const deleteSet = new Set(deleteKeys);
  packingListRowsState = getPackingListRows().filter((row) => !deleteSet.has(getPackingLineKey(row)));
  deleteKeys.forEach((key) => delete packingLabelPrintRecords[key]);
  closePackingDeleteLoginDialog();
  renderStage("packing-list");
  statusMessage.textContent = `${deleteKeys.length} packing list row(s) deleted by ${user}.`;
}
function printSelectedPoPackingLabels() {
  const selected = getSelectedPackingLineKeys();
  const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  selected.forEach((key) => {
    const user = currentLogin ? currentLogin.user : "goods.in";
    const row = getPackingListRows().find((item) => getPackingLineKey(item) === key);
    packingLabelPrintRecords[key] = { user, dateTime: now, poLabel: true };
    if (row) recordPackingListAudit(row.orderNo, `Printed the PO packing label for line ${row.lineNo} â€“ ${row.description}.`, user, now, key);
  });
  statusMessage.textContent = `PO packing label printed for ${selected.length} selected line(s).`;
  renderStage("packing-list");
}
function getFilteredPackingListRows() {
  const search = String(packingListSearch || "").trim().toLowerCase();
  return getPackingListRows().filter((row) => {
    if (!row.orderNo || !row.partNo || !row.description) return false;
    // Remove empty template rows from the View Packing List grid
    if (!row.batchNo || !row.expiryDate || !row.qty || row.qty === "" || row.qty === "0") return false;
    
    if (!search) return true;
    return [row.orderNo, row.lineNo, row.partNo, row.description, row.batchNo, getMfgLotNo(row), row.suppName, row.suppCode, row.foreignName, row.ecma]
      .some((value) => String(value || "").toLowerCase().includes(search));
  });
}
function getVisiblePackingListRowsSnapshot() {
  const tableRows = [...document.querySelectorAll(".packing-list-table tbody tr")];
  if (!tableRows.length) return null;
  return tableRows.map((tableRow) => {
    const keySource = tableRow.querySelector("[data-packing-row-key]") || tableRow.querySelector("[data-packing-row-select]");
    const rowKey = keySource ? (keySource.dataset.packingRowKey || keySource.dataset.packingRowSelect) : "";
    const sourceRow = getPackingListRows().find((row) => getPackingLineKey(row) === rowKey);
    if (!sourceRow) return null;
    const snapshot = { ...sourceRow };
    tableRow.querySelectorAll("[data-packing-row-input]").forEach((input) => {
      snapshot[input.dataset.packingRowInput] = input.value;
    });
    tableRow.querySelectorAll("[data-packing-row-checkbox]").forEach((input) => {
      snapshot[input.dataset.packingRowCheckbox] = input.checked;
    });
    return snapshot;
  }).filter(Boolean);
}

function recordPackingListAudit(poNo, action, user, dateTime, lineKey = "") {
  const normalizedPoNo = String(poNo || "").trim();
  if (!normalizedPoNo || !action) return;
  const auditEntry = {
    poNo: normalizedPoNo,
    stage: "Packing List",
    action,
    user: user || currentLogin?.user || "goods.in",
    dateTime: dateTime || getAssemblyAuditTimestamp(),
    lineKey
  };
  const duplicate = packingListAuditLog.some((entry) => entry.poNo === auditEntry.poNo && entry.action === auditEntry.action && entry.dateTime === auditEntry.dateTime);
  if (!duplicate) packingListAuditLog.push(auditEntry);
}

function getPackingListAuditEvents(poNos) {
  const poSet = new Set(poNos);
  const events = packingListAuditLog.filter((entry) => poSet.has(entry.poNo)).map((entry) => ({ ...entry }));
  getPackingListRows().forEach((row) => {
    if (!poSet.has(row.orderNo)) return;
    const lineKey = getPackingLineKey(row);
    const printRecord = packingLabelPrintRecords[lineKey];
    if (!printRecord) return;
    const action = printRecord.poLabel
      ? `Printed the PO packing label for line ${row.lineNo} â€“ ${row.description}.`
      : printRecord.printedCount
        ? `Verified line ${row.lineNo} and printed ${printRecord.printedCount} packing label${printRecord.printedCount === 1 ? "" : "s"} for ${row.description}.`
        : `Printed the packing label for line ${row.lineNo} â€“ ${row.description}.`;
    const duplicate = events.some((entry) => entry.lineKey === lineKey && entry.dateTime === printRecord.dateTime);
    if (!duplicate) events.push({ poNo: row.orderNo, stage: "Packing List", action, user: printRecord.user || "goods.in", dateTime: printRecord.dateTime, lineKey });
  });
  return events;
}
function getGeneratedPackingRows(poNo) {
  return generatedPackingListSnapshots[poNo] || null;
}
function getGeneratedPackingLineStatus(row) {
  if (!row) return "Active";
  const generatedRows = getGeneratedPackingRows(row.orderNo);
  const generatedRow = Array.isArray(generatedRows)
    ? generatedRows.find((item) =>
      String(item.lineNo || "") === String(row.lineNo || "") &&
      String(item.partNo || "") === String(row.partNo || "")
    ) || generatedRows.find((item) => String(item.lineNo || "") === String(row.lineNo || ""))
    : null;
  return generatedRow?.status || row.status || "Active";
}
function getPackingRequiredDocuments() {
  return [
    { id: "supplier-invoice", name: "Supplier Invoice", required: true },
    { id: "po", name: "Purchase Order", required: true },
    { id: "supplier-packing-list", name: "Supplier Packing List", required: true },
    { id: "supplier-declaration", name: "Supplier Declaration", required: true },
    { id: "temperature-record", name: "Temperature Record", required: true },
    { id: "goods-receiving-checklist", name: "Goods Receiving Checklist", required: true },
    { id: "cmr", name: "CMR", required: true },
    { id: "import-export", name: "Import / Export", required: true },
    { id: "additional-files", name: "CD License if applicable", required: false },
    { id: "optional-additional-files", name: "Additional Files", required: false }
  ];
}
function getRpRequiredDocuments() {
  return getPackingRequiredDocuments().filter((doc) => doc.required !== false);
}

function getRpRequiredDocumentsForPo(poNo) {
  const workflow = rpPackWorkflows[poNo];
  return getRpRequiredDocuments().filter((doc) => !(workflow?.diagnosticBatch === true && doc.id === "supplier-declaration"));
}

function isRpWorkflowSetDiagnostic(poNos) {
  return poNos.length > 0 && poNos.every((poNo) => rpPackWorkflows[poNo]?.diagnosticBatch === true);
}

function getPackingListContractsForPo(poNo) {
  return [...new Set(getPackingListRows()
    .filter((row) => row.orderNo === poNo)
    .map((row) => String(row.contract || "").trim().toUpperCase())
    .filter(Boolean))];
}

function getRpContractRoute(poNos) {
  const contractsByPo = poNos.map((poNo) => ({ poNo, contracts: getPackingListContractsForPo(poNo) }));
  const allContracts = [...new Set(contractsByPo.flatMap((entry) => entry.contracts))];
  const stockControlRoute = contractsByPo.length > 0 && contractsByPo.every((entry) => entry.contracts.length > 0 && entry.contracts.every((contract) => contract === "CON-G"));
  const hasWho = allContracts.includes("WHO");
  return {
    destination: stockControlRoute ? "stock-control" : "rpi-approval",
    contracts: allContracts,
    label: allContracts.length ? allContracts.join(", ") : "Not recorded",
    reason: stockControlRoute
      ? "CON-G contract detected â€” RPi Approval is not required."
      : (hasWho ? "WHO contract detected â€” RPi Approval is required." : "Mixed or unknown contract â€” RPi Approval is required.")
  };
}

function isRpApprovalBypassed(poNos) {
  return getRpContractRoute(poNos).destination === "stock-control";
}

function createPackingWorkflow(poNo) {
  return {
    poNo,
    status: "Pending Uploads",
    signoff: null,
    documents: getPackingRequiredDocuments().map((doc) => ({ ...doc, required: doc.required !== false, uploaded: false, fileName: "", verified: false }))
  };
}

function normalizeGoodsReceivingPoNumbers(poNumbers) {
  const source = Array.isArray(poNumbers) ? poNumbers : String(poNumbers || "").split(/[,;\n]+/);
  return [...new Set(source.map((poNo) => String(poNo || "").trim()).filter(Boolean))];
}

function getGoodsReceivingChecklistPoNumbers(item) {
  const checklistData = item?.checklistData || item || {};
  return normalizeGoodsReceivingPoNumbers(
    checklistData.rpPackMergePoNumbers ||
    checklistData.poNumbers ||
    checklistData.leadApprovedPoNumber ||
    checklistData.poNumber ||
    item?.poNo
  );
}

function removePoFromRpMergeGroup(poNo, reason) {
  const unmergeReason = String(reason || "").trim();
  if (!unmergeReason) return { ok: false, message: "Enter a reason before unmerging the PO." };
  const workflow = rpPackWorkflows[poNo];
  const groupId = workflow?.mergeGroupId;
  const group = groupId ? rpMergeGroups[groupId] : null;
  if (!workflow || !group) return { ok: false, message: `PO ${poNo} is not part of a merged set.` };
  const previousPoNos = [...group.poNos];
  const remainingPoNos = previousPoNos.filter((memberPoNo) => memberPoNo !== poNo);
  const auditRecord = {
    poNo,
    reason: unmergeReason,
    previousPoNos,
    remainingPoNos: [...remainingPoNos],
    user: currentLogin?.user || "goods.in",
    dateTime: getAssemblyAuditTimestamp()
  };
  previousPoNos.forEach((memberPoNo) => {
    const memberWorkflow = rpPackWorkflows[memberPoNo];
    if (!memberWorkflow) return;
    memberWorkflow.unmergeHistory = memberWorkflow.unmergeHistory || [];
    memberWorkflow.unmergeHistory.push({ ...auditRecord, previousPoNos: [...previousPoNos], remainingPoNos: [...remainingPoNos] });
  });
  workflow.lastUnmergeReason = unmergeReason;
  workflow.lastUnmergedBy = auditRecord.user;
  workflow.lastUnmergedAt = auditRecord.dateTime;
  delete workflow.mergeGroupId;
  if (remainingPoNos.length >= 2) {
    group.poNos = remainingPoNos;
    remainingPoNos.forEach((memberPoNo) => { if (rpPackWorkflows[memberPoNo]) rpPackWorkflows[memberPoNo].mergeGroupId = groupId; });
  } else {
    remainingPoNos.forEach((memberPoNo) => { if (rpPackWorkflows[memberPoNo]) delete rpPackWorkflows[memberPoNo].mergeGroupId; });
    delete rpMergeGroups[groupId];
  }
  rpMergeSelections.delete(poNo);
  selectedRpPackPo = remainingPoNos[0] || poNo;
  selectedRpApprovalPo = null;
  return {
    ok: true,
    message: remainingPoNos.length >= 2
      ? `PO ${poNo} unmerged. ${remainingPoNos.join(", ")} remain grouped. Reason recorded.`
      : `PO ${poNo} unmerged. The remaining PO is now an individual queue. Reason recorded.`
  };
}

function detachPosFromExistingRpGroups(poNos) {
  const incoming = new Set(poNos);
  const affectedGroupIds = [...new Set(poNos.map((poNo) => rpPackWorkflows[poNo]?.mergeGroupId).filter(Boolean))];
  affectedGroupIds.forEach((groupId) => {
    const group = rpMergeGroups[groupId];
    if (!group) return;
    const remainingPoNos = group.poNos.filter((poNo) => !incoming.has(poNo));
    group.poNos.forEach((poNo) => { if (incoming.has(poNo) && rpPackWorkflows[poNo]) delete rpPackWorkflows[poNo].mergeGroupId; });
    if (remainingPoNos.length >= 2) {
      group.poNos = remainingPoNos;
      remainingPoNos.forEach((poNo) => { if (rpPackWorkflows[poNo]) rpPackWorkflows[poNo].mergeGroupId = groupId; });
    } else {
      remainingPoNos.forEach((poNo) => { if (rpPackWorkflows[poNo]) delete rpPackWorkflows[poNo].mergeGroupId; });
      delete rpMergeGroups[groupId];
    }
  });
}

function createRpDocumentsQueueFromTabletConfirmation(poNumbers, supplier = "") {
  const poNos = normalizeGoodsReceivingPoNumbers(poNumbers);
  if (!poNos.length) return null;
  const workflows = poNos.map((poNo) => {
    const workflow = rpPackWorkflows[poNo] || (rpPackWorkflows[poNo] = createPackingWorkflow(poNo));
    workflow.rpDocumentsQueueCreated = true;
    workflow.rpDocumentsQueueSource = "Goods Receiving checklist";
    workflow.tabletConfirmed = true;
    workflow.tabletConfirmedAt = workflow.tabletConfirmedAt || getAssemblyAuditTimestamp();
    if (supplier) workflow.supplier = supplier;
    if (!workflow.status || workflow.status === "Pending Uploads" || workflow.status === "Checklist decision approved") workflow.status = "Documents Pending";
    return workflow;
  });

  detachPosFromExistingRpGroups(poNos);
  if (poNos.length > 1) {
    const groupId = `GRC-${poNos.join("-")}`;
    rpMergeGroups[groupId] = {
      id: groupId,
      poNos: [...poNos],
      supplier: supplier || workflows[0].supplier || "Supplier pending",
      sharedDocIds: [...rpSharedDocumentIds],
      source: "Goods Receiving checklist"
    };
    workflows.forEach((workflow) => { workflow.mergeGroupId = groupId; });
  }

  rpSharedDocumentIds.forEach((docId) => {
    const uploadedSharedDoc = workflows.map((workflow) => workflow.documents.find((doc) => doc.id === docId)).find((doc) => doc?.uploaded);
    if (!uploadedSharedDoc) return;
    workflows.forEach((workflow) => {
      const targetDoc = workflow.documents.find((doc) => doc.id === docId);
      if (targetDoc) Object.assign(targetDoc, { ...uploadedSharedDoc });
    });
  });

  const checklistFileName = poNos.length > 1
    ? `Goods_Receiving_Checklist_${poNos.join("_")}.pdf`
    : `${poNos[0]}_Goods_Receiving_Checklist.pdf`;
  workflows.forEach((workflow) => {
    const checklist = workflow.documents.find((doc) => doc.id === "goods-receiving-checklist");
    if (checklist) {
      checklist.uploaded = true;
      checklist.fileName = checklistFileName;
      checklist.verified = false;
      checklist.uploadedFrom = "Goods Receiving checklist";
      checklist.tabletPoNumbers = [...poNos];
    }
    workflow.goodsReceivingChecklistReceived = true;
  });
  return workflows[0];
}
const rpSharedDocumentIds = ["supplier-declaration", "temperature-record", "goods-receiving-checklist", "cmr", "import-export"];

function getRpMergeGroup(poNo) {
  const groupId = rpPackWorkflows[poNo]?.mergeGroupId;
  return groupId ? rpMergeGroups[groupId] || null : null;
}

function getRpMergePoNos(poNo) {
  const group = getRpMergeGroup(poNo);
  return group ? group.poNos : [poNo];
}

function getRpMergePrimaryPo(poNo) {
  return getRpMergePoNos(poNo)[0] || poNo;
}

function ensureGoodsReceivingWorkflowExamples() {
  if (goodsReceivingExamplesInitialized) return;
  goodsReceivingExamplesInitialized = true;
  const supplier = "LIAFARM SA";
  ["C13628", "C13629", "C13630", "C13631"].forEach((poNo, index) => {
    const workflow = rpPackWorkflows[poNo] || createPackingWorkflow(poNo);
    workflow.supplier = supplier;
    workflow.supplierCode = "LIAFARM";
    workflow.status = "Documents Pending";
    workflow.signoff = null;
    workflow.documents = workflow.documents.map((doc) => ({
      ...doc,
      uploaded: true,
      fileName: rpSharedDocumentIds.includes(doc.id)
        ? `Shared_${doc.name.replace(/\s+/g, "_")}.pdf`
        : `${poNo}_${doc.name.replace(/\s+/g, "_")}.pdf`
    }));
    rpPackWorkflows[poNo] = workflow;
    generatedPackingListSnapshots[poNo] = generatedPackingListSnapshots[poNo] || [];
  });
  createRpDocumentsQueueFromTabletConfirmation(["C13628", "C13629", "C13630"], supplier);
  createRpDocumentsQueueFromTabletConfirmation("C13631", supplier);
  const summaryExampleWorkflow = rpPackWorkflows["C13631"];
  if (summaryExampleWorkflow && !packingListAuditLog.some((entry) => entry.poNo === "C13631")) {
    recordPackingListAudit("C13631", "Verified line 1 and printed 3 packing labels for the first Packing List line.", "goods.in", "24 Jul 2026, 11:58:12", "C13631-L1");
    recordPackingListAudit("C13631", "Verified line 2 and printed 2 packing labels for the second Packing List line.", "goods.in", "24 Jul 2026, 12:02:45", "C13631-L2");
    recordPackingListAudit("C13631", "Printed the PO packing labels for the selected Packing List lines.", "goods.in", "24 Jul 2026, 12:06:20");
    recordPackingListAudit("C13631", "Generated Packing List for C13631.", "goods.in", "24 Jul 2026, 12:10:05");
    summaryExampleWorkflow.packingListGeneratedBy = "goods.in";
    summaryExampleWorkflow.packingListGeneratedAt = "24 Jul 2026, 12:10:05";
  }

  const addPackingQueueExamples = [
    { poNo: "C13640", supplier: "Northline Pharma Ltd", files: ["supplier-invoice", "supplier-packing-list", "supplier-declaration"] },
    { poNo: "C13641", supplier: "Medico Europe SA", files: ["supplier-invoice", "supplier-packing-list", "supplier-declaration", "additional-files"] }
  ];
  addPackingQueueExamples.forEach((example) => {
    const workflow = rpPackWorkflows[example.poNo] || createPackingWorkflow(example.poNo);
    workflow.supplier = example.supplier;
    workflow.status = "Documents Pending";
    workflow.rpDocumentsQueueCreated = true;
    workflow.rpDocumentsQueueSource = "Add Packing List";
    workflow.documents.forEach((doc) => {
      if (!example.files.includes(doc.id)) return;
      doc.uploaded = true;
      doc.fileName = `${example.poNo}_${doc.name.replace(/\s+/g, "_")}.pdf`;
      doc.uploadedFrom = "Add Packing List";
    });
    rpPackWorkflows[example.poNo] = workflow;
    generatedPackingListSnapshots[example.poNo] = generatedPackingListSnapshots[example.poNo] || [];
  });

  const mergedTestPoNos = ["C13644", "C13645", "C13647"];
  mergedTestPoNos.forEach((poNo) => {
    const workflow = rpPackWorkflows[poNo] || createPackingWorkflow(poNo);
    workflow.supplier = "PharmaCo Ltd";
    workflow.status = "Documents Pending";
    workflow.rpDocumentsQueueCreated = true;
    workflow.rpDocumentsQueueSource = "Add Packing List";
    workflow.documents.forEach((doc) => {
      const uploadedIds = ["supplier-invoice", "supplier-packing-list", "supplier-declaration"];
      if (!uploadedIds.includes(doc.id)) return;
      doc.uploaded = true;
      doc.fileName = rpSharedDocumentIds.includes(doc.id)
        ? `Shared_${doc.name.replace(/\s+/g, "_")}.pdf`
        : `${poNo}_${doc.name.replace(/\s+/g, "_")}.pdf`;
      doc.uploadedFrom = "Add Packing List";
    });
    rpPackWorkflows[poNo] = workflow;
    generatedPackingListSnapshots[poNo] = generatedPackingListSnapshots[poNo] || [];
  });
  createRpDocumentsQueueFromTabletConfirmation(mergedTestPoNos, "PharmaCo Ltd");

  const tabletQueueExample = rpPackWorkflows["C13646"] || createPackingWorkflow("C13646");
  tabletQueueExample.supplier = "Atlas Healthcare GmbH";
  tabletQueueExample.status = "Documents Pending";
  ["supplier-invoice", "supplier-packing-list", "supplier-declaration", "temperature-record", "cmr"].forEach((docId) => {
    const doc = tabletQueueExample.documents.find((item) => item.id === docId);
    if (!doc) return;
    doc.uploaded = true;
    doc.fileName = `C13646_${doc.name.replace(/\s+/g, "_")}.pdf`;
  });
  rpPackWorkflows["C13646"] = tabletQueueExample;
  generatedPackingListSnapshots["C13646"] = generatedPackingListSnapshots["C13646"] || [];
  createRpDocumentsQueueFromTabletConfirmation("C13646", "Atlas Healthcare GmbH");

  const rpPackCreationTestData = [
    { poNo: "C13649", supplier: "Helix Diagnostics Ltd", uploadedIds: ["supplier-invoice", "supplier-packing-list", "temperature-record", "cmr"], diagnosticBatch: true },
    { poNo: "C13650", supplier: "MedSupply Europe NV", uploadedIds: ["supplier-invoice", "supplier-packing-list", "supplier-declaration", "temperature-record", "cmr", "import-export"] },
    { poNo: "C13654", supplier: "Orion Healthcare GmbH", uploadedIds: ["supplier-invoice", "supplier-packing-list", "supplier-declaration", "temperature-record", "cmr"] }
  ];
  rpPackCreationTestData.forEach((example) => {
    const workflow = rpPackWorkflows[example.poNo] || createPackingWorkflow(example.poNo);
    workflow.supplier = example.supplier;
    workflow.status = "Documents Pending";
    workflow.rpDocumentsQueueCreated = true;
    workflow.rpDocumentsQueueSource = "Add Packing List";
    workflow.diagnosticBatch = example.diagnosticBatch === true;
    workflow.documents.forEach((doc) => {
      if (!example.uploadedIds.includes(doc.id)) return;
      doc.uploaded = true;
      doc.fileName = `${example.poNo}_${doc.name.replace(/\s+/g, "_")}.pdf`;
      doc.uploadedFrom = doc.id === "goods-receiving-checklist" ? "Goods Receiving checklist" : "Add Packing List";
    });
    rpPackWorkflows[example.poNo] = workflow;
    generatedPackingListSnapshots[example.poNo] = generatedPackingListSnapshots[example.poNo] || [];
    createRpDocumentsQueueFromTabletConfirmation(example.poNo, example.supplier);
  });

  ensureContractProductRpPackExample();

  const rpApprovalTestData = [
    { poNo: "C13651", supplier: "Alpine Healthcare AG", dateTime: "30 Jul 2026, 10:18:00" },
    { poNo: "C13652", supplier: "Nova Medical BV", dateTime: "30 Jul 2026, 11:42:00" },
    { poNo: "C13653", supplier: "Medline Pharma SARL", dateTime: "30 Jul 2026, 14:06:00" }
  ];
  rpApprovalTestData.forEach((example) => {
    const workflow = rpPackWorkflows[example.poNo] || createPackingWorkflow(example.poNo);
    workflow.supplier = example.supplier;
    workflow.documents = workflow.documents.map((doc) => ({
      ...doc,
      uploaded: true,
      fileName: `${example.poNo}_${doc.name.replace(/\s+/g, "_")}.pdf`,
      uploadedFrom: doc.id === "goods-receiving-checklist" ? "Goods Receiving checklist" : "RPi Pack Creation"
    }));
    workflow.status = "Signed Off";
    workflow.signoff = { user: "goods.in", dateTime: example.dateTime };
    workflow.rpDocumentsQueueCreated = true;
    workflow.rpDocumentsQueueSource = "RPi Pack Creation";
    rpPackWorkflows[example.poNo] = workflow;
    generatedPackingListSnapshots[example.poNo] = generatedPackingListSnapshots[example.poNo] || [];
  });

  const completedSummaryPo = "C13648";
  const completedSummaryWorkflow = rpPackWorkflows[completedSummaryPo] || createPackingWorkflow(completedSummaryPo);
  completedSummaryWorkflow.supplier = "Zenith Pharma BV";
  completedSummaryWorkflow.documents = completedSummaryWorkflow.documents.map((doc) => ({ ...doc, uploaded: true, fileName: `${completedSummaryPo}_${doc.name.replace(/\s+/g, "_")}.pdf` }));
  rpPackWorkflows[completedSummaryPo] = completedSummaryWorkflow;
  createRpDocumentsQueueFromTabletConfirmation(completedSummaryPo, completedSummaryWorkflow.supplier);
  completedSummaryWorkflow.signoff = { user: "goods.in", dateTime: "23 Jul 2026, 14:20" };
  completedSummaryWorkflow.status = "RPi Approved";
  rpApprovalSignoffs[completedSummaryPo] = { user: "rp.user", dateTime: "23 Jul 2026, 15:05" };
  generatedPackingListSnapshots[completedSummaryPo] = generatedPackingListSnapshots[completedSummaryPo] || [];
  completedSummaryWorkflow.packingListGeneratedBy = "goods.in";
  completedSummaryWorkflow.packingListGeneratedAt = "23 Jul 2026, 13:42:18";
  completedSummaryWorkflow.documentsCompletedBy = "goods.in";
  completedSummaryWorkflow.documentsCompletedAt = "23 Jul 2026, 13:58:44";
  completedSummaryWorkflow.documentSetValidatedBy = "goods.in";
  completedSummaryWorkflow.documentSetValidatedAt = "23 Jul 2026, 14:12:06";
  completedSummaryWorkflow.rpiReviewStartedBy = "rp.user";
  completedSummaryWorkflow.rpiReviewStartedAt = "23 Jul 2026, 14:32:27";
  completedSummaryWorkflow.rpiDocumentsReviewedBy = "rp.user";
  completedSummaryWorkflow.rpiDocumentsReviewedAt = "23 Jul 2026, 14:51:39";
  if (!packingListAuditLog.some((entry) => entry.poNo === completedSummaryPo)) {
    recordPackingListAudit(completedSummaryPo, "Verified packing-list line 1 and printed 2 packing labels.", "goods.in", "23 Jul 2026, 13:28:14", `${completedSummaryPo}-L1`);
    recordPackingListAudit(completedSummaryPo, "Verified packing-list line 2 and printed 1 packing label.", "goods.in", "23 Jul 2026, 13:34:52", `${completedSummaryPo}-L2`);
    recordPackingListAudit(completedSummaryPo, "Printed the PO packing labels for both verified lines.", "goods.in", "23 Jul 2026, 13:37:25");
    recordPackingListAudit(completedSummaryPo, `Generated Packing List for ${completedSummaryPo}.`, "goods.in", completedSummaryWorkflow.packingListGeneratedAt);
  }

  const exceptionPo = "C13632";
  const exceptionWorkflow = rpPackWorkflows[exceptionPo] || createPackingWorkflow(exceptionPo);
  exceptionWorkflow.supplier = supplier;
  exceptionWorkflow.supplierCode = "LIAFARM";
  exceptionWorkflow.status = "Waiting for QA decision";
  exceptionWorkflow.checklistExceptionStatus = "Waiting for QA decision";
  exceptionWorkflow.documents = exceptionWorkflow.documents.map((doc) => ({ ...doc, uploaded: true, fileName: `${exceptionPo}_${doc.name.replace(/\s+/g, "_")}.pdf` }));
  rpPackWorkflows[exceptionPo] = exceptionWorkflow;
  if (!checklistDecisionQueue.some((item) => item.poNo === exceptionPo)) {
    checklistDecisionQueue.push({
      poNo: exceptionPo,
      supplier,
      status: "Waiting for QA decision",
      failedChecks: ["Pallets / boxes are undamaged", "Information confirmed by Goods In Team"],
      goodsInComment: "Damage reported during tablet checklist inspection. Stock quarantined pending QA decision.",
      raisedBy: "goods.in",
      raisedAt: "22 Jul 2026, 16:29",
      checklistData: {
        poNumbers: "C13628, C13629, C13630",
        supplier,
        vehicleNumber: "BS 0233-J",
        driverName: "Vimal",
        deliveryNote: "N/A",
        receiverName: "Yogesh",
        driverSigned: true,
        receiverSigned: true,
        checks: [
          { id: "clean", label: "Vehicle is clean", detail: "No visible dirt, residue, pests, or odour.", answer: "Yes" },
          { id: "nonpharma", label: "No non-pharmaceutical products", detail: "Load contains only approved pharmaceutical products.", answer: "Yes" },
          { id: "damage", label: "Pallets / boxes are undamaged", detail: "Visible damage was identified during receipt.", answer: "No" },
          { id: "confirmed", label: "Information confirmed", detail: "A No response requires stock quarantine and QA review.", answer: "No" }
        ]
      },
      qaReviewChecks: {},
      qaDecision: null
    });
  }
  const waitingExample = checklistDecisionQueue.find((item) => item.poNo === exceptionPo && item.status === "Waiting for QA decision");
  if (waitingExample) {
    normalizeGoodsReceivingPoNumbers(waitingExample.checklistData?.poNumbers || waitingExample.poNo).forEach((memberPoNo) => {
      const memberWorkflow = rpPackWorkflows[memberPoNo] || (rpPackWorkflows[memberPoNo] = createPackingWorkflow(memberPoNo));
      memberWorkflow.status = "Waiting for QA decision";
      memberWorkflow.checklistExceptionStatus = "Waiting for QA decision";
    });
  }
  packingListGenerated = true;
}

function ensureContractProductRpPackExample() {
  const contractTestPoNo = "C13811";
  const existingWorkflow = rpPackWorkflows[contractTestPoNo];
  if (existingWorkflow?.contractBypassTestData) return existingWorkflow;

  const contractTestWorkflow = existingWorkflow || createPackingWorkflow(contractTestPoNo);
  contractTestWorkflow.supplier = "DerStar Pharma SK s.r.o.";
  contractTestWorkflow.status = "Documents Pending";
  contractTestWorkflow.signoff = null;
  contractTestWorkflow.rpDocumentsQueueCreated = true;
  contractTestWorkflow.rpDocumentsQueueSource = "Contract product test data";
  contractTestWorkflow.contractBypassTestData = true;
  contractTestWorkflow.noRpiApprovalNeeded = true;
  delete contractTestWorkflow.stockControlEmailSentAt;
  delete contractTestWorkflow.stockControlEmailSentBy;
  delete rpApprovalSignoffs[contractTestPoNo];
  contractTestWorkflow.documents = contractTestWorkflow.documents.map((doc) => ({
    ...doc,
    required: doc.required !== false,
    uploaded: doc.id !== "additional-files",
    fileName: doc.id !== "additional-files" ? `${contractTestPoNo}_${doc.name.replace(/\s+/g, "_")}.pdf` : "",
    uploadedFrom: doc.id === "goods-receiving-checklist" ? "Goods Receiving checklist" : "Add Packing List"
  }));
  rpPackWorkflows[contractTestPoNo] = contractTestWorkflow;
  generatedPackingListSnapshots[contractTestPoNo] = getPackingListRows()
    .filter((row) => row.orderNo === contractTestPoNo)
    .map((row) => ({ ...row }));
  return contractTestWorkflow;
}

function getPackingLineUserComment(row) {
  return row.userComments || "";
}

function ensureRpExampleWorkflows() {
  ensureGoodsReceivingWorkflowExamples();
  const poNos = [...new Set(getPackingListRows().filter((row) => row.orderNo).map((row) => row.orderNo))];
  poNos.slice(0, 6).forEach((poNo, index) => {
    if (!rpPackWorkflows[poNo]) {
      rpPackWorkflows[poNo] = createPackingWorkflow(poNo);
    }
    const po = rpPackWorkflows[poNo];
    if (po.contractBypassTestData) return;
    const rows = getPackingListRows().filter((row) => row.orderNo === poNo);
    if (po.status !== "Rejected by RPi") {
      po.documents = po.documents.map((doc) => ({
        ...doc,
        uploaded: true,
        fileName: doc.fileName || `${poNo}_${doc.name.replace(/\s+/g, "_")}.pdf`
      }));
    }
    if (!po.signoff) {
      po.signoff = { user: "goods.in", dateTime: `02 Jul 2026, ${String(9 + index).padStart(2, "0")}:15:00` };
    }
    if (!po.status || po.status === "Pending Uploads" || po.status === "RPi Checklist Open") po.status = "Signed Off";
    po.supplier = rows[0]?.suppName || po.supplier || "Supplier pending";
    createRpDocumentsQueueFromTabletConfirmation(poNo, po.supplier);
    packingListGenerated = true;
  });
}

function getRpTaskFilteredPoKeys() {
  ensureRpExampleWorkflows();
  const search = String(rpApprovalSearch || "").trim().toLowerCase();
  return Object.keys(rpPackWorkflows).filter((poKey) => {
    const po = rpPackWorkflows[poKey];
    const isMergePrimary = !po.mergeGroupId || getRpMergePrimaryPo(poKey) === poKey;
    const readyForRp = po.rpDocumentsQueueCreated === true && !isRpApprovalBypassed(getRpMergePoNos(poKey)) && !po.stockControlEmailSentAt && (po.status === "Signed Off" || po.signoff) && po.status !== "Rejected by RPi" && po.status !== "RPi Approved" && po.status !== "Waiting for QA decision" && !po.checklistExceptionStatus && !rpApprovalSignoffs[poKey] && isMergePrimary;
    if (!readyForRp) return false;
    if (!search) return true;
    return getRpMergePoNos(poKey).some((memberPoNo) => memberPoNo.toLowerCase().includes(search));
  });
}
function getPackingDocCounts(po) {
  const requiredDocuments = po ? getRpRequiredDocumentsForPo(po.poNo) : getRpRequiredDocuments();
  const docs = po && po.documents ? po.documents.filter((doc) => requiredDocuments.some((required) => required.id === doc.id)) : [];
  return { uploaded: docs.filter((doc) => doc.uploaded).length, verified: docs.filter((doc) => doc.verified).length, total: requiredDocuments.length };
}
function renderChecklistDecisionTab(stage) {
  ensureGoodsReceivingWorkflowExamples();
  const approvedItems = checklistDecisionQueue.filter((item) => item.status === "Approved for unpacking");
  const normalizedSearch = String(checklistDecisionSearch || "").trim().toLowerCase();
  const approved = approvedItems.filter((item) => {
    const poNumbers = String(item.checklistData?.poNumbers || item.poNo).toLowerCase();
    return !normalizedSearch || poNumbers.includes(normalizedSearch);
  });
  const rows = approved.map((item) => `
    <tr class="${selectedChecklistDecisionPo === item.poNo ? "selected-row" : ""}">
      <td><strong>${escapeQaChecklistText(item.checklistData?.poNumbers || item.poNo)}</strong></td>
      <td>${escapeQaChecklistText(item.supplier)}</td>
      <td>${escapeQaChecklistText(item.failedChecks.join("; "))}</td>
      <td><span class="checklist-decision-badge approved">${escapeQaChecklistText(item.status)}</span></td>
      <td>${escapeQaChecklistText(item.qaDecision?.user || "QA")}<br><small>${escapeQaChecklistText(item.qaDecision?.dateTime || "")}</small></td>
      <td><div class="checklist-decision-actions"><button class="classic-button" type="button" data-view-checklist-decision="${item.poNo}">View checklist</button><button class="classic-button primary" type="button" data-accept-checklist-decision="${item.poNo}">Accept</button></div></td>
    </tr>
  `).join("");
  const resultsContent = approved.length ? `
    <div class="checklist-decision-results">
      <table class="classic-table checklist-decision-table">
        <thead><tr><th>PO Number</th><th>Supplier</th><th>Checklist exception</th><th>QA decision</th><th>Approved by</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  ` : `
    <div class="checklist-decision-empty">
      <strong>${normalizedSearch ? "No matching PO found" : "No approved checklist decisions"}</strong>
      <span>${normalizedSearch ? `No approved checklist matches PO ${escapeQaChecklistText(checklistDecisionSearch)}.` : "QA-approved Goods Receiving checklists will appear here."}</span>
    </div>
  `;
  return `
    <div class="packing-list-panel checklist-decision-panel">
      <div class="checklist-decision-toolbar">
        <div class="checklist-decision-search-controls">
          <label for="checklist-decision-po-search">PO Number</label>
          <input class="classic-search-input" id="checklist-decision-po-search" data-checklist-decision-search value="${escapeQaChecklistText(checklistDecisionSearch)}" placeholder="Enter PO number">
          <button class="classic-search-button" type="button" data-checklist-decision-search-button>Search</button>
        </div>
        <span class="viewed-badge ${approvedItems.length ? "viewed" : "pending"}">${approvedItems.length} approved</span>
      </div>
      ${resultsContent}
    </div>
  `;
}
function renderPackingListWork(stage) {
  if (packingListMode === "documents") packingListMode = "view";
  const currentPoNo = packingListSearch || packingListSelectedPo || "C13719";
  const generatedRows = packingListMode === "view" ? getGeneratedPackingRows(currentPoNo) : null;
  const rows = generatedRows || getFilteredPackingListRows();
  const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
  return `
    <div class="packing-list-layout">
      <section class="packing-list-window">
<div class="sub-window-title">Packing List</div>
<div class="packing-tabs">
  <button class="${packingListMode === "add" ? "active" : ""}" type="button" data-packing-tab="add">Add Packing List</button>
  <button class="${packingListMode === "view" ? "active" : ""}" type="button" data-packing-tab="view">View Packing List</button>
  <button class="${packingListMode === "checklist-decision" ? "active" : ""}" type="button" data-packing-tab="checklist-decision">Checklist decision</button>
</div>
${packingListMode === "add" ? renderPackingListAdd(stage) : packingListMode === "view" ? renderPackingListView(stage, rows, totalQty) : renderChecklistDecisionTab(stage)}
      </section>
    </div>
  `;
}

function renderPackingListAdd(stage) {
  const poNo = packingListSelectedPo || "";
  const workflow = rpPackWorkflows[poNo];
  const addPackingDocumentIds = ["supplier-declaration", "supplier-packing-list", "supplier-invoice", "po"];
  const allRequiredDocs = getPackingRequiredDocuments();
  const requiredDocs = addPackingDocumentIds
    .map((docId) => allRequiredDocs.find((doc) => doc.id === docId))
    .filter(Boolean);
  const uploadedDocumentCount = workflow
    ? requiredDocs.filter((required) => workflow.documents.find((doc) => doc.id === required.id)?.uploaded).length
    : 0;
  const counts = { uploaded: uploadedDocumentCount, total: requiredDocs.length };

  const uploadHtml = poNo && workflow ? `
    <fieldset class="packing-invoice-panel add-doc-upload-panel">
      <legend>Supplier Documents <span>${counts.uploaded}/${counts.total} uploaded</span></legend>
      <div class="packing-doc-upload-grid">
        ${requiredDocs.map((required, index) => {
          const doc = workflow.documents.find((item) => item.id === required.id) || required;
          const uploaded = Boolean(doc.uploaded);
          return `
            <label class="packing-doc-upload ${uploaded ? "uploaded" : ""}">
              <strong>${index + 1}. ${required.name}</strong>
              <span>${uploaded ? (doc.fileName || "Uploaded") : "No file chosen"}</span>
              <input type="file" data-pl-add-file="${required.id}" data-pl-add-po="${poNo}">
            </label>
          `;
        }).join("")}
      </div>
    </fieldset>
  ` : "";

  return `
    <div class="packing-list-panel add-packing-panel reference-add-panel">
      <div class="packing-add-search-row packing-add-reference-search">
        <label class="classic-search-label">PO No: <input class="classic-search-input" id="pl-add-po-input" value="${poNo}" placeholder="Enter PO no"></label>
        <label class="classic-search-label">Supplier Code: <input class="classic-search-input" value="" placeholder="Enter supplier code"></label>
        <label class="classic-search-label">Supplier Name: <input class="classic-search-input" value="" placeholder="Enter supplier name"></label>
        <button class="classic-search-button" type="button" id="pl-add-search-btn">Search</button>
        <button class="classic-button packing-clear-button" type="button" id="pl-add-clear-btn">Clear</button>
      </div>
      <div class="packing-grid-shell tall reference-grid-shell">
        <div class="packing-empty-grid reference-empty-grid" style="height: 100%; min-height: 360px; display: flex; align-items: center; justify-content: center; background: #b3b3b3; border: 1px solid #222; color: transparent;">
          <span aria-hidden="true">Blank packing list entry area</span>
        </div>
      </div>
      <div class="packing-add-bottom reference-add-bottom">
        <div class="packing-actions-stack">
          <button class="classic-button primary" type="button" id="pl-add-save-btn">Save</button>
          <button class="classic-button" type="button" id="pl-add-remove-btn">Remove Line</button>
          <button class="classic-button primary" type="button" id="pl-add-generate-btn" ${!canGeneratePackingList(poNo) ? "disabled" : ""}>Print Packing List</button>
        </div>
        ${uploadHtml}
      </div>
    </div>
  `;
}

function renderPackingListView(stage, rows, totalQty) {
  const isLocked = isPackingListLocked();
  const lockAttr = isLocked ? "disabled" : "";
  const readonlyAttr = isLocked ? "readonly" : "";
  const lockNotice = "";
  return `
    <div class="packing-list-panel view-packing-panel">
      <div class="packing-view-search-row">
<label class="classic-search-label">P.O. No : <input class="classic-search-input" data-packing-search value="${packingListSearch || "C13719"}" placeholder="Enter PO no"></label>
<button class="classic-button" type="button" data-packing-search-button>Search</button>
      </div>
      <div class="packing-grid-shell tall">
<table class="classic-table product-grid packing-list-table wide-packing-table">
  <thead>
    <tr>
      <th></th><th></th><th>Print Packing Label</th><th class="twod-col">Presence of 2D</th><th class="compact-col">ORDER_NO</th><th>LINE_NO</th><th class="part-no-col">PART_NO</th><th>DESCRIPTION</th><th>STATUS</th><th>BATCH_NO</th><th>EXPIRY_DATE</th><th class="edit-col">QTY</th><th class="edit-col">BOXES</th><th>VERIFY & PRINT</th><th>COMMENTS</th><th>SUPP_NAME</th><th>SUPP_CODE</th><th>LOG</th><th>CREATED_BY</th><th>CREATED_DATE</th><th>FOREIGN_NAME</th><th>STRENGTH</th><th>PACK_SIZE</th><th>COUNTRY</th><th>ECMA</th><th>CONTRACT</th><th>BARCODE</th><th>VALIDBARCODE</th>
    </tr>
  </thead>
  <tbody>${rows.map((row, index) => {
    const key = getPackingLineKey(row);
    const printRecord = packingLabelPrintRecords[key];
    return `
      <tr class="${index === 0 ? "selected-row" : ""} ${printRecord ? "packing-label-printed" : ""}">
<td><button class="split-line-button" type="button" title="${isLocked ? "Packing List generated - split disabled" : "Double click to split line"}" data-split-packing-line="${key}" ${lockAttr}>&gt;</button></td>
<td><input type="checkbox" data-packing-row-select="${key}" ${index === 0 ? "checked" : ""} ${lockAttr}></td>
<td><button class="packing-label-button" type="button" data-print-packing-label="${key}" ${lockAttr}>${printRecord ? `Printed ${printRecord.user}` : "Print Packing Label"}</button></td>
<td class="twod-col"><input type="checkbox" data-packing-row-checkbox="presenceOf2D" data-packing-row-key="${key}" ${row.presenceOf2D ? "checked" : ""} ${lockAttr}></td>
<td class="compact-col">${row.orderNo}</td><td>${row.lineNo}</td><td class="part-no-col">${row.partNo}</td><td>${row.description}</td><td>${getGeneratedPackingLineStatus(row)}</td><td>${row.batchNo}</td><td>${row.expiryDate}</td>
<td><input class="grid-edit-input" data-packing-row-input="qty" data-packing-row-key="${key}" value="${row.qty}" ${readonlyAttr}></td>
<td><input class="grid-edit-input" data-packing-row-input="boxes" data-packing-row-key="${key}" value="${row.boxes}" ${readonlyAttr}></td>
<td>
  ${printRecord ? `
    <span style="color: #065f46; font-weight: bold; font-size: 11px;">Verified</span>
  ` : `
    <button class="classic-button row-verify-button" type="button" data-pl-verify-print="${key}" ${lockAttr} style="font-size: 10px; padding: 2px 6px; background-color: #1e3a8a; color: white;">Verify</button>
  `}
</td>
<td><input class="grid-edit-input packing-comment-input" data-packing-row-input="userComments" data-packing-row-key="${key}" value="${getPackingLineUserComment(row)}" placeholder="Comments" ${readonlyAttr}></td><td>${row.suppName}</td><td>${row.suppCode}</td><td>${printRecord ? `Label printed by ${printRecord.user} at ${printRecord.dateTime}` : row.comments}</td><td>${row.createdBy}</td><td>${row.createdDate}</td><td>${row.foreignName}</td><td>${row.strength}</td><td>${row.packSize}</td><td>${row.country}</td><td>${row.ecma}</td><td>${row.contract}</td><td>${row.barcode}</td><td>${row.validBarcode}</td>
      </tr>`;
  }).join("")}</tbody>
</table>
      </div>
      <div class="packing-view-actions packing-view-actions-split">
        <div class="packing-view-actions-left">
<button class="classic-button" type="button" data-generate-packing-list ${!isLocked && !canGeneratePackingList(packingListSearch || "C13719") ? "disabled" : ""}>${isLocked ? "View Generated PO Packing List" : "Generate PO Packing List"}</button>
<button class="classic-button" type="button" data-print-selected-po-labels ${lockAttr}>Print PO Packing Label</button>
${lockNotice}${poPackingListSignoff ? `<span class="packing-action-status">PO Packing List signed by ${poPackingListSignoff.user} ${poPackingListSignoff.dateTime}</span>` : ""}
        </div>
        <div class="packing-view-actions-right">
<button class="classic-button danger" type="button" data-delete-packing-lines ${lockAttr}>Delete</button>
<button class="classic-button primary" type="button" data-packing-save ${lockAttr}>Save</button>
<button class="classic-button" type="button" data-remove-packing-lines disabled>Remove Line</button>
        </div>
      </div>
      <div class="double-check-counts"><span>Total Lines : <strong>${rows.length}</strong></span><span>Total Quantity : <strong>${totalQty}</strong></span><span>Printed Labels : <strong>${Object.keys(packingLabelPrintRecords).length}</strong></span></div>
    </div>
  `;
}

function renderPackingRpDocuments(stage) {
  ensureGoodsReceivingWorkflowExamples();
  ensureContractProductRpPackExample();
  const normalizedPoSearch = String(rpDocumentsPoSearch || "").trim().toLowerCase();
  const poKeys = Object.keys(rpPackWorkflows).filter((poKey) => {
    const workflow = rpPackWorkflows[poKey];
    if (!workflow || workflow.rpDocumentsQueueCreated !== true || workflow.status === "RPi Approved" || workflow.stockControlEmailSentAt || rpApprovalSignoffs[poKey] || workflow.checklistExceptionStatus) return false;
    const isPrimary = !workflow.mergeGroupId || getRpMergePrimaryPo(poKey) === poKey;
    const matchesSearch = !normalizedPoSearch || getRpMergePoNos(poKey).some((poNo) => poNo.toLowerCase().includes(normalizedPoSearch));
    return isPrimary && matchesSearch;
  });

  if (!selectedRpPackPo) {
    const poListHtml = poKeys.map((poKey) => {
      const po = rpPackWorkflows[poKey];
      const mergeGroup = getRpMergeGroup(poKey);
      const poNos = mergeGroup ? mergeGroup.poNos : [poKey];
      const selected = rpMergeSelections.has(poKey);
      const documentCount = poNos.reduce((sum, memberPoNo) => sum + getPackingDocCounts(rpPackWorkflows[memberPoNo]).uploaded, 0);
      const totalCount = poNos.reduce((sum, memberPoNo) => sum + getPackingDocCounts(rpPackWorkflows[memberPoNo]).total, 0);
      return `
        <div class="rp-merge-card-shell ${mergeGroup ? "merged" : ""}">
          <label class="rp-merge-selector" title="Select PO to merge"><input type="checkbox" data-rp-doc-merge-select="${poKey}" ${selected ? "checked" : ""} ${mergeGroup ? "disabled" : ""}><span>Merge</span></label>
          <button class="rp-po-card rp-doc-po-card" type="button" data-rp-select-po="${poKey}">
            <strong>${mergeGroup ? `Merged set: ${poNos.join(", ")}` : poKey}</strong>
            <span class="status ${po.status === "Signed Off" ? "done-status" : "active-status"}">${documentCount}/${totalCount} source files uploaded</span>
            <small>${po.supplier || "Supplier pending"}</small>
            <small>${mergeGroup ? `${poNos.length} separate packing lists · ${rpSharedDocumentIds.length} common files` : po.status}</small>
          </button>
        </div>
      `;
    }).join("");
    return `
      <div class="packing-list-panel rp-documents-panel packing-rp-documents-panel rp-documents-list-first">
        <div class="rp-documents-header rp-documents-search-toolbar">
          <div class="rp-documents-po-search">
            <label for="rp-documents-po-search">PO Number</label>
            <input class="classic-search-input" id="rp-documents-po-search" data-rp-documents-po-search value="${escapeQaChecklistText(rpDocumentsPoSearch)}" placeholder="Enter PO number">
            <button class="classic-search-button" type="button" data-rp-documents-po-search-button>Search</button>
          </div>
          <button class="classic-button primary rp-merge-button" type="button" data-rp-doc-merge-selected ${rpMergeSelections.size < 2 ? "disabled" : ""}>Merge selected POs (${rpMergeSelections.size})</button>
        </div>
        <div class="rp-doc-po-grid">${poListHtml || `<div class="rp-empty-state"><p>No packing list POs are waiting for documents.</p></div>`}</div>
      </div>
    `;
  }

  const activePo = rpPackWorkflows[selectedRpPackPo];
  if (!activePo) {
    selectedRpPackPo = null;
    return renderPackingRpDocuments(stage);
  }
  const mergeGroup = getRpMergeGroup(activePo.poNo);
  const poNos = mergeGroup ? mergeGroup.poNos : [activePo.poNo];
  const primaryPoNo = poNos[0];
  const primaryWorkflow = rpPackWorkflows[primaryPoNo];
  const diagnosticBatch = isRpWorkflowSetDiagnostic(poNos);
  const contractRoute = getRpContractRoute(poNos);
  const noRpiApprovalNeeded = contractRoute.destination === "stock-control";
  const requiredDocs = getRpRequiredDocuments().filter((doc) => !(diagnosticBatch && doc.id === "supplier-declaration"));
  const optionalDocs = getPackingRequiredDocuments().filter((doc) => doc.required === false);
  const sharedRequiredDocs = requiredDocs.filter((doc) => mergeGroup && rpSharedDocumentIds.includes(doc.id));
  const individualRequiredDocs = requiredDocs.filter((doc) => !mergeGroup || !rpSharedDocumentIds.includes(doc.id));

  const renderUploadTile = (workflow, required, label, isShared = false, isOptional = false) => {
    const doc = workflow.documents.find((item) => item.id === required.id) || required;
    const uploaded = Boolean(doc.uploaded);
    return { uploaded, html: `
      <div class="rp-doc-tile ${isShared ? "rp-shared-document-tile" : ""}">
        <span class="rp-tile-index">${isShared ? "SH" : "PDF"}</span>
        <div class="rp-tile-header">
          <svg class="rp-document-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          <div class="rp-tile-title">${required.name}${isShared ? " · Shared" : ""}</div>
          <div class="rp-tile-subtitle">${label}</div>
        </div>
        <div class="rp-tile-file-name">${uploaded ? (doc.fileName || "Uploaded file") : "No file uploaded"}</div>
        <div class="rp-tile-status"><span class="rp-tile-badge ${uploaded ? "verified" : (isOptional ? "pending" : "missing")}">${uploaded ? "Uploaded" : (isOptional ? "Optional" : "Upload required")}</span></div>
        <div class="rp-tile-action">${uploaded ? `
          <button class="classic-button link-button" type="button" data-pl-preview-doc="${doc.id}" data-pl-preview-po="${workflow.poNo}">View file</button>
          <button class="classic-button link-button" type="button" data-rp-reupload-doc="${required.id}" data-rp-reupload-po="${workflow.poNo}">Re-upload</button>
        ` : `<input type="file" data-pl-add-file="${required.id}" data-pl-add-po="${workflow.poNo}">`}</div>
      </div>
    ` };
  };

  const renderDocumentStatusRows = (entries, optionalEntries = []) => {
    const uploadedEntries = entries.filter((entry) => entry.uploaded);
    const remainingEntries = entries.filter((entry) => !entry.uploaded);
    const renderRow = (rowClass, title, countText, rowEntries, emptyText, isComplete = false) => `
      <div class="rp-document-status-row ${rowClass}">
        <div class="rp-document-status-label"><strong>${title}</strong><span>${countText}</span></div>
        <div class="rp-doc-tiles-grid" style="--rp-status-columns: ${Math.max(rowEntries.length, 1)}">${rowEntries.map((entry) => entry.html).join("") || `<div class="rp-document-row-empty ${isComplete ? "complete" : ""}">${emptyText}</div>`}</div>
      </div>
    `;
    return `${renderRow("uploaded-files-row", "Uploaded files", `${uploadedEntries.length} required files available`, uploadedEntries, "No required files uploaded yet")}${remainingEntries.length ? renderRow("remaining-files-row", "Remaining required files", `${remainingEntries.length} outstanding`, remainingEntries, "", false) : ""}${optionalEntries.length ? renderRow("optional-files-row", "Optional files", "Not required for sign-off", optionalEntries, "", true) : ""}`;
  };

  const sharedTileEntries = sharedRequiredDocs.map((required) => renderUploadTile(primaryWorkflow, required, `${poNos.length} POs · shared file`, true));
  const individualTileEntriesByPo = Object.fromEntries(poNos.map((poNo) => {
    const workflow = rpPackWorkflows[poNo];
    return [poNo, individualRequiredDocs.map((required) => renderUploadTile(workflow, required, poNo))];
  }));
  const optionalTileEntriesByPo = Object.fromEntries(poNos.map((poNo) => {
    const workflow = rpPackWorkflows[poNo];
    return [poNo, optionalDocs.map((optional) => renderUploadTile(workflow, optional, poNo, false, true))];
  }));
  const individualTilesHtml = poNos.map((poNo) => renderDocumentStatusRows(individualTileEntriesByPo[poNo], optionalTileEntriesByPo[poNo])).join("");
  const packingListTilesByPo = Object.fromEntries(poNos.map((poNo) => {
    const tileHtml = `
      <div class="rp-doc-tile rp-packing-list-tile">
        <span class="rp-tile-index">PL</span>
        <div class="rp-tile-header">
          <svg class="rp-document-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          <div class="rp-tile-title">Generated PO Packing List</div>
          <div class="rp-tile-subtitle">${poNo} · Separate packing list</div>
        </div>
        <div class="rp-tile-file-name">Generated by PLPI</div>
        <div class="rp-tile-status"><span class="rp-tile-badge verified">Available</span></div>
        <div class="rp-tile-action"><button class="classic-button link-button" type="button" data-pl-preview-generated-packing-list data-pl-preview-po="${poNo}">View Packing List</button></div>
      </div>
    `;
    return [poNo, tileHtml];
  }));
  const packingListTilesHtml = poNos.map((poNo) => packingListTilesByPo[poNo]).join("");
  const mergedPoSectionsHtml = mergeGroup ? `
    <div class="rp-document-section rp-common-files-section"><h4>Common files</h4>${renderDocumentStatusRows(sharedTileEntries)}</div>
    ${poNos.map((poNo) => `<div class="rp-document-section"><h4>PO ${poNo}</h4>${renderDocumentStatusRows(individualTileEntriesByPo[poNo], optionalTileEntriesByPo[poNo])}<div class="rp-po-packing-list-row">${packingListTilesByPo[poNo]}</div></div>`).join("")}
  ` : "";

  const sharedUploaded = sharedRequiredDocs.every((required) => primaryWorkflow.documents.find((doc) => doc.id === required.id)?.uploaded);
  const individualUploaded = poNos.every((poNo) => individualRequiredDocs.every((required) => rpPackWorkflows[poNo].documents.find((doc) => doc.id === required.id)?.uploaded));
  const allSignedOff = poNos.every((poNo) => rpPackWorkflows[poNo].status === "Signed Off");
  const stockControlSent = poNos.every((poNo) => Boolean(rpPackWorkflows[poNo].stockControlEmailSentAt));
  const routeCompleted = allSignedOff || stockControlSent;
  const readyToSend = sharedUploaded && individualUploaded && !routeCompleted;
  const signoff = primaryWorkflow.signoff;
  const routeStatusText = stockControlSent ? "Emailed to Stock Control India" : (allSignedOff ? "Sent to RPi" : "");
  return `
    <div class="packing-list-panel rp-documents-panel packing-rp-documents-panel rp-documents-detail-view">
      <div class="rp-documents-header">
        <button class="classic-button" type="button" data-rp-docs-back>Back to PO List</button>
        <div><h3>RPi Documents Dashboard - ${mergeGroup ? `Merged POs ${poNos.join(", ")}` : `PO ${activePo.poNo}`}</h3>${mergeGroup ? "<p>Upload the shared and PO-specific files below.</p>" : ""}</div>
        ${routeStatusText ? `<span class="viewed-badge viewed">${routeStatusText}</span>` : ""}
      </div>
      <div class="rp-pack-routing-options">
        <label class="rp-pack-route-option ${diagnosticBatch ? "selected" : ""}"><input type="checkbox" data-rp-diagnostic-batch ${diagnosticBatch ? "checked" : ""} ${routeCompleted ? "disabled" : ""}><span><strong>Diagnostic batch</strong><small>Supplier Declaration is not required for this RPi approval.</small></span></label>
      </div>
      ${mergeGroup ? `<div class="rp-merged-set-manager"><div><strong>Manage merged PO set</strong><span>Select one PO and record why it is being removed. The other POs will remain grouped.</span></div><label><span>PO to remove</span><select class="classic-search-input" data-rp-unmerge-po-select><option value="">Select PO</option>${poNos.map((poNo) => `<option value="${poNo}">${poNo}</option>`).join("")}</select></label><label class="rp-unmerge-reason-field"><span>Reason for unmerge</span><input class="classic-search-input" data-rp-unmerge-reason placeholder="Enter reason" maxlength="180"></label><button class="classic-button" type="button" data-rp-unmerge-selected>Unmerge selected PO</button></div>` : ""}
      ${mergeGroup ? mergedPoSectionsHtml : `<div class="rp-document-section"><h4>PO documents</h4>${individualTilesHtml}</div><div class="rp-document-section rp-packing-list-section"><h4>PLPI Packing List</h4><div class="rp-doc-tiles-grid">${packingListTilesHtml}</div></div>`}
      <div class="signature-grid rp-doc-signoff-row">
        <label>Goods-In Operator <input value="${currentLogin ? currentLogin.user : stage.user}" readonly></label>
        <label>Date / Time <input value="${signoff ? signoff.dateTime : "Pending required uploads"}" readonly></label>
        <div class="signoff-action process-signoff-action"><button class="classic-button primary" type="button" id="rp-documents-signoff-button" ${readyToSend ? "" : "disabled"}>${noRpiApprovalNeeded ? "Send to Stock Control" : "Send to RPi Approval"}</button></div>
      </div>
    </div>
  `;
}
function updateRpDocumentsAvailability() {
  const button = document.querySelector("#rp-documents-signoff-button");
  if (!button) return;
  const primaryPoNo = selectedRpPackPo ? getRpMergePrimaryPo(selectedRpPackPo) : null;
  const poNos = primaryPoNo ? getRpMergePoNos(primaryPoNo) : [];
  const primaryWorkflow = rpPackWorkflows[primaryPoNo];
  if (!primaryWorkflow || !poNos.length) { button.disabled = true; return; }
  const diagnosticBatch = isRpWorkflowSetDiagnostic(poNos);
  const noRpiApprovalNeeded = isRpApprovalBypassed(poNos);
  const requiredIds = getRpRequiredDocuments().map((doc) => doc.id).filter((docId) => !(diagnosticBatch && docId === "supplier-declaration"));
  const sharedIds = getRpMergeGroup(primaryPoNo) ? rpSharedDocumentIds.filter((docId) => requiredIds.includes(docId)) : [];
  const sharedUploaded = sharedIds.every((docId) => primaryWorkflow.documents.find((doc) => doc.id === docId)?.uploaded);
  const individualIds = requiredIds.filter((docId) => !sharedIds.includes(docId));
  const individualUploaded = poNos.every((poNo) => individualIds.every((docId) => rpPackWorkflows[poNo].documents.find((doc) => doc.id === docId)?.uploaded));
  const routeCompleted = poNos.every((poNo) => rpPackWorkflows[poNo].status === "Signed Off" || Boolean(rpPackWorkflows[poNo].stockControlEmailSentAt));
  button.disabled = !(sharedUploaded && individualUploaded) || routeCompleted;
  button.textContent = noRpiApprovalNeeded ? "Send to Stock Control" : "Send to RPi Approval";
  button.title = button.disabled
    ? (routeCompleted ? "This document route has already been completed." : "Upload all required documents before sign-off.")
    : (noRpiApprovalNeeded ? "Combine the uploaded document set into one PDF and email Stock Control India" : "Ready to send the document set to RPi");
}

function completeRpDocumentsSignoff() {
  const now = getAssemblyAuditTimestamp();
  const primaryPoNo = getRpMergePrimaryPo(selectedRpPackPo);
  const poNos = getRpMergePoNos(primaryPoNo);
  const noRpiApprovalNeeded = isRpApprovalBypassed(poNos);
  const signoff = { user: currentLogin ? currentLogin.user : "goods.in", dateTime: now };

  if (noRpiApprovalNeeded) {
    const combinedPdfFileName = `${poNos.join("-")}_Stock_Control_Document_Pack.pdf`;
    const includedFiles = [];
    poNos.forEach((poNo) => {
      const workflow = rpPackWorkflows[poNo];
      if (!workflow) return;
      workflow.documents.filter((doc) => doc.uploaded).forEach((doc) => {
        const fileLabel = doc.fileName || `${poNo}_${doc.name.replace(/\s+/g, "_")}.pdf`;
        if (!includedFiles.includes(fileLabel)) includedFiles.push(fileLabel);
      });
      includedFiles.push(`${poNo}_Generated_PO_Packing_List.pdf`);
    });
    poNos.forEach((poNo) => {
      const workflow = rpPackWorkflows[poNo];
      if (!workflow) return;
      workflow.noRpiApprovalNeeded = true;
      workflow.status = "Sent to Stock Control India";
      workflow.signoff = signoff;
      workflow.combinedPdfFileName = combinedPdfFileName;
      workflow.combinedPdfDocuments = [...includedFiles];
      workflow.stockControlEmailRecipient = "Stock Control India";
      workflow.stockControlEmailSentAt = now;
      workflow.stockControlEmailSentBy = signoff.user;
    });
    statusMessage.textContent = `${combinedPdfFileName} created from ${includedFiles.length} files and emailed to Stock Control India for PO ${poNos.join(", ")}. RPi Approval was bypassed.`;
  } else {
    poNos.forEach((poNo) => {
      const workflow = rpPackWorkflows[poNo];
      if (workflow) { workflow.noRpiApprovalNeeded = false; workflow.status = "Signed Off"; workflow.signoff = signoff; }
    });
    statusMessage.textContent = `${poNos.join(", ")} sent to RPi as one ${poNos.length > 1 ? "merged" : "PO"} work queue.`;
  }

  selectedRpApprovalPo = null;
  selectedRpPackPo = null;
  rpiModuleView = "pack-creation";
  renderStage("rp-pack");
}
function getGoodsInSummaryRecord(poKey) {
  const primaryPoNo = getRpMergePrimaryPo(poKey);
  const poNos = getRpMergePoNos(primaryPoNo);
  const workflows = poNos.map((poNo) => rpPackWorkflows[poNo]).filter(Boolean);
  if (!workflows.length) return null;
  const primaryWorkflow = workflows[0];
  const signoff = workflows.map((workflow) => workflow.signoff).find(Boolean) || null;
  const approval = poNos.map((poNo) => rpApprovalSignoffs[poNo]).find(Boolean) || null;
  const approved = poNos.every((poNo) => rpApprovalSignoffs[poNo] || rpPackWorkflows[poNo]?.status === "RPi Approved");
  const checklistDecision = checklistDecisionQueue.find((item) => {
    const itemPoNos = getGoodsReceivingChecklistPoNumbers(item);
    return itemPoNos.some((poNo) => poNos.includes(poNo));
  }) || null;
  const unmergeHistory = workflows.flatMap((workflow) => workflow.unmergeHistory || []).filter((record, index, records) => records.findIndex((candidate) => candidate.poNo === record.poNo && candidate.dateTime === record.dateTime) === index);
  const packingListDate = primaryWorkflow.packingListGeneratedAt || primaryWorkflow.tabletConfirmedAt || signoff?.dateTime || "24 Jul 2026, 09:15";
  const packingListUser = primaryWorkflow.packingListGeneratedBy || "goods.in";
  const timeline = getPackingListAuditEvents(poNos);
  if (!timeline.some((entry) => entry.action.startsWith("Generated Packing List"))) {
    timeline.push({ stage: "Packing List", action: `Generated Packing List for ${poNos.join(", ")}.`, user: packingListUser, dateTime: packingListDate });
  }
  if (primaryWorkflow.documentsCompletedAt) {
    timeline.push({ stage: "RPi Pack Creation", action: `Uploaded all ${getRpRequiredDocuments().length} required source files for ${poNos.join(", ")}.`, user: primaryWorkflow.documentsCompletedBy || "goods.in", dateTime: primaryWorkflow.documentsCompletedAt });
  }
  if (primaryWorkflow.documentSetValidatedAt) {
    timeline.push({ stage: "RPi Pack Creation", action: "Checked the uploaded files and completed the PO document set.", user: primaryWorkflow.documentSetValidatedBy || "goods.in", dateTime: primaryWorkflow.documentSetValidatedAt });
  }
  unmergeHistory.forEach((entry) => {
    timeline.push({ stage: "RPi Pack Creation", action: `Unmerged PO ${entry.poNo}. Reason: ${entry.reason}`, user: entry.user, dateTime: entry.dateTime });
  });
  if (primaryWorkflow.stockControlEmailSentAt) {
    timeline.push({ stage: "RPi Pack Creation", action: `Combined the uploaded files into ${primaryWorkflow.combinedPdfFileName} and emailed the document pack to Stock Control India. RPi Approval not required.`, user: primaryWorkflow.stockControlEmailSentBy || signoff?.user || "goods.in", dateTime: primaryWorkflow.stockControlEmailSentAt });
  } else if (signoff) {
    timeline.push({ stage: "RPi Pack Creation", action: `Sent ${poNos.length > 1 ? "the merged PO set" : poNos[0]} to the RPi Approval queue.`, user: signoff.user, dateTime: signoff.dateTime });
  }
  if (primaryWorkflow.rpiReviewStartedAt) {
    timeline.push({ stage: "RPi Approval", action: `Opened the PO document pack and started the RPi review for ${poNos.join(", ")}.`, user: primaryWorkflow.rpiReviewStartedBy || "rp.user", dateTime: primaryWorkflow.rpiReviewStartedAt });
  }
  if (primaryWorkflow.rpiDocumentsReviewedAt) {
    timeline.push({ stage: "RPi Approval", action: "Reviewed all required source files and the generated Packing List.", user: primaryWorkflow.rpiDocumentsReviewedBy || "rp.user", dateTime: primaryWorkflow.rpiDocumentsReviewedAt });
  }
  if (approved) {
    timeline.push({ stage: "RPi Approval", action: `Completed RPi approval for ${poNos.join(", ")}.`, user: approval?.user || "rp.user", dateTime: approval?.dateTime || primaryWorkflow.rpApprovedAt || "Completed" });
  }
  const currentStage = primaryWorkflow.stockControlEmailSentAt
    ? "Sent to Stock Control India"
    : approved
      ? "RPi Approved"
      : checklistDecision?.status === "Approved for unpacking"
      ? "Checklist acceptance"
      : checklistDecision?.status === "Waiting for QA decision"
        ? "Waiting for QA decision"
        : signoff
          ? "RPi review"
          : "RPi Pack Creation";
  return {
    primaryPoNo,
    poNos,
    workflows,
    supplier: primaryWorkflow.supplier || "Supplier pending",
    merged: poNos.length > 1,
    approval,
    approved,
    currentStage,
    timeline,
    lastUpdated: timeline[timeline.length - 1]?.dateTime || packingListDate
  };
}
function getGoodsInSummaryRecords() {
  ensureRpExampleWorkflows();
  const normalizedSearch = String(goodsInSummarySearch || "").trim().toLowerCase();
  return Object.keys(rpPackWorkflows)
    .filter((poNo) => rpPackWorkflows[poNo]?.rpDocumentsQueueCreated === true)
    .filter((poNo) => !rpPackWorkflows[poNo].mergeGroupId || getRpMergePrimaryPo(poNo) === poNo)
    .map((poNo) => getGoodsInSummaryRecord(poNo))
    .filter(Boolean)
    .filter((record) => !normalizedSearch || record.poNos.some((poNo) => poNo.toLowerCase().includes(normalizedSearch)) || record.supplier.toLowerCase().includes(normalizedSearch))
    .sort((a, b) => a.primaryPoNo.localeCompare(b.primaryPoNo));
}

function renderGoodsInSummaryWork() {
  const records = getGoodsInSummaryRecords();
  if (!selectedGoodsInSummaryPo) {
    const rows = records.map((record) => `
      <tr>
        <td><button class="goods-summary-po-link" type="button" data-goods-summary-open="${record.primaryPoNo}">${record.poNos.join(", ")}</button></td>
        <td>${escapeQaChecklistText(record.supplier)}</td>
        <td><span class="goods-summary-stage ${record.approved ? "complete" : "active"}">${escapeQaChecklistText(record.currentStage)}</span></td>
        <td>${escapeQaChecklistText(record.lastUpdated)}</td>
        <td><button class="classic-button" type="button" data-goods-summary-open="${record.primaryPoNo}">View summary</button></td>
      </tr>
    `).join("");
    return `
      <div class="goods-summary-page">
        <header class="goods-summary-header"><div><h2>Goods-in Summary</h2><p>Review the recorded Goods-In and RPi actions for each PO.</p></div><span>${records.length} PO queue${records.length === 1 ? "" : "s"}</span></header>
        <div class="goods-summary-search"><label for="goods-summary-search">PO Number</label><input class="classic-search-input" id="goods-summary-search" data-goods-summary-search value="${escapeQaChecklistText(goodsInSummarySearch)}" placeholder="Enter PO number"><button class="classic-search-button" type="button" data-goods-summary-search-button>Search</button><button class="classic-button" type="button" data-goods-summary-clear>Clear</button></div>
        <div class="goods-summary-list-shell">
          <table class="classic-table goods-summary-list"><thead><tr><th>PO Number(s)</th><th>Supplier</th><th>Current stage</th><th>Last updated</th><th>Action</th></tr></thead><tbody>${rows || `<tr><td colspan="5" class="goods-summary-empty">No PO summary matches the search.</td></tr>`}</tbody></table>
        </div>
      </div>
    `;
  }
  const record = getGoodsInSummaryRecord(selectedGoodsInSummaryPo);
  if (!record) { selectedGoodsInSummaryPo = null; return renderGoodsInSummaryWork(); }
  const actionRows = record.timeline.map((entry) => `<tr><td><strong>${escapeQaChecklistText(entry.stage)}</strong></td><td>${escapeQaChecklistText(entry.action)}</td><td>${escapeQaChecklistText(entry.user)}</td><td>${escapeQaChecklistText(entry.dateTime)}</td></tr>`).join("");
  return `
    <div class="goods-summary-page goods-summary-detail goods-summary-simple-detail">
      <header class="goods-summary-detail-header"><button class="classic-button" type="button" data-goods-summary-back>Back to PO list</button><div><h2>Goods-in Summary · ${record.poNos.join(", ")}</h2><p>${escapeQaChecklistText(record.supplier)}</p></div><button class="classic-button primary" type="button" data-goods-summary-pdf="${record.primaryPoNo}">View Summary PDF</button></header>
      <section class="goods-summary-simple-meta"><div><span>PO Number(s)</span><strong>${record.poNos.join(", ")}</strong></div><div><span>Supplier</span><strong>${escapeQaChecklistText(record.supplier)}</strong></div><div><span>Current stage</span><strong>${escapeQaChecklistText(record.currentStage)}</strong></div></section>
      <section class="goods-summary-action-log"><h3>Action history</h3><table class="classic-table"><thead><tr><th>Stage</th><th>Action</th><th>User</th><th>Date / Time</th></tr></thead><tbody>${actionRows}</tbody></table></section>
    </div>
  `;
}
function buildGoodsInSummaryPdfMarkup(record) {
  return `
    <article class="goods-summary-pdf-page goods-summary-simple-pdf">
      <header><div><strong>B&amp;S HEALTHCARE</strong><span>PARALLEL IMPORT</span></div><div><h1>GOODS-IN SUMMARY</h1></div><div><strong>${record.approved ? "COMPLETED" : "IN PROGRESS"}</strong><span>${escapeQaChecklistText(record.lastUpdated)}</span></div></header>
      <section class="goods-summary-pdf-meta goods-summary-simple-pdf-meta"><div><span>PO Number(s)</span><strong>${record.poNos.join(", ")}</strong></div><div><span>Supplier</span><strong>${escapeQaChecklistText(record.supplier)}</strong></div><div><span>Current stage</span><strong>${escapeQaChecklistText(record.currentStage)}</strong></div></section>
      <h2>Action History</h2>
      <table class="goods-summary-pdf-action-table"><thead><tr><th>Stage</th><th>Action</th><th>User</th><th>Date / Time</th></tr></thead><tbody>${record.timeline.map((entry) => `<tr><td>${escapeQaChecklistText(entry.stage)}</td><td>${escapeQaChecklistText(entry.action)}</td><td>${escapeQaChecklistText(entry.user)}</td><td>${escapeQaChecklistText(entry.dateTime)}</td></tr>`).join("")}</tbody></table>
      <footer><span>Generated from PLPI Goods-in Summary</span><span>Page 1 of 1</span></footer>
    </article>
  `;
}
function openGoodsInSummaryPdf(poKey) {
  const record = getGoodsInSummaryRecord(poKey);
  if (!record) return false;
  document.querySelector("#goods-summary-pdf-modal")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "goods-summary-pdf-modal";
  overlay.className = "goods-summary-pdf-backdrop";
  overlay.innerHTML = `<div class="goods-summary-pdf-window" role="dialog" aria-modal="true" aria-label="Goods-in Summary PDF"><div class="goods-summary-pdf-toolbar"><div><strong>Goods-in Summary PDF</strong><span>${record.poNos.join(", ")}</span></div><button class="classic-button" type="button" data-close-goods-summary-pdf>Close</button></div><div class="goods-summary-pdf-canvas">${buildGoodsInSummaryPdfMarkup(record)}</div></div>`;
  document.body.appendChild(overlay);
  return true;
}
// State variables for Batch Checker module
let batchCheckerSearch = "";
let selectedBatchCheckerRowKey = null;
let batchCheckerSelectedPo = "";
let batchCheckerDashboardOpen = true;
let batchCheckerChecklistOpen = false;
let batchCheckerDetailChecks = {};
let batchCheckerFilters = { supplier: "", contract: "", product: "", invoice: "", po: "", site: "", status: "", mfgLot: "", country: "" };
let batchCheckerCheckedRows = {}; // index -> checked boolean
let batchCheckerVerifiedRows = {}; // index -> { checker: 'name', date: 'date' }
let batchCheckerPrintedLabelRows = {}; // rowKey -> { user, dateTime, type }
let batchCheckerPclGeneratedRows = {}; // rowKey -> { user, dateTime }
let batchCheckerColdPclPrintedRows = {}; // rowKey -> { user, dateTime, reprints, comments }
let pclBarRecords = {}; // B&S batch number -> PCL checks/comments/user snapshot for the BAR
let batchCheckerActivePclReprintReason = "";
let batchCheckerPclRegulatoryComments = {}; // rowKey -> comment entered in PCL preview
let selectedBatchCheckerRowIndexForPopup = null; // row being updated with Mfg
let selectedBatchCheckerRowIndexForSplit = null; // row being split
let batchCheckerPclPrintMode = "standard";
let batchCheckerPendingReprint = null;
let batchCheckerMfgList = [
  { name: "Boehringer Ingelheim Ellas ...", address: "5th km Paiania - Markopoulo, Koropi Attiki, 194 00, Greece" },
  { name: "Boehringer Ingelheim Phar...", address: "Binger Strasse 173, D-55216 Ingelheim am Rhein, Germany" },
  { name: "Dragenopharm Apotheker...", address: "Dragenopharm Apotheker Puschl GmbH, Germany" }
];

let batchCheckerDb = [
  {
    orderNo: "C13777",
    foreignName: "AirFluSal Forspiro in...",
    strength: "50 microgra...",
    packSize: "60 doses",
    ecma: "23170",
    batchNo: "PX8416",
    expiryDate: "31-10-2027",
    qty: "300",
    boxes: "3",
    manufacturer: "Boehringer Ingelheim Ellas ...",
    foreignLicense: "Sandoz Gm...",
    partNo: "PLAIR50/50...",
    imp: "C13777",
    printType: "",
    invoice: "2904",
    invoiceDate: "22-06-2026",
    supplier: "Abimed 3 Ltd",
    reviewDate: "13/02/2026",
    country: "BULGARIA",
    originCountry: "POLAND",
    actionCount: "10",
    description: "AirFluSal Forspiro",
    prodStatus: "Active",
    status: "",
    warehouse: "Q-25-A",
    product: "AirFluSal Forspiro",
    productId: "6020",
    mfgId: "101",
    contractSign: "",
    contractStatus: "",
    category: "",
    comments: "Mock-up do...",
    mockup: "Product Mockup",
    scans: "Raw Pack Scans",
    objId: "AAARu9ABy...",
    piObjId: "AAARu9ABy...",
    packingId: "326360",
    invoiceFile: "F:\\PI GOOD...",
    site: "WHO",
    coldChain: "No",
    controlDr: "No",
    foreignLeaflet: "04/2022"
  },
  {
    orderNo: "C13777",
    foreignName: "Spiriva caps...",
    strength: "18 microgram",
    packSize: "30 capsule...",
    ecma: "9766/2017/02",
    batchNo: "503474",
    expiryDate: "30-06-2027",
    qty: "47",
    boxes: "1",
    manufacturer: "Boehringer Ingelheim Phar...",
    foreignLicense: "Boehringer ...",
    partNo: "ROSPI18MC...",
    imp: "C13777",
    printType: "",
    invoice: "2904",
    invoiceDate: "22-06-2026",
    supplier: "Abimed 3 Ltd",
    reviewDate: "13/02/2026",
    country: "BULGARIA",
    originCountry: "ROMANIA",
    actionCount: "18",
    description: "Spiriva Inha...",
    prodStatus: "Active",
    status: "",
    warehouse: "",
    product: "Spiriva inhalation p...",
    productId: "4144",
    mfgId: "102",
    contractSign: "",
    contractStatus: "3",
    category: "",
    comments: "Line update...",
    mockup: "Product Mockup",
    scans: "Raw Pack Scans",
    objId: "AAARu9ABy...",
    piObjId: "",
    packingId: "326369",
    invoiceFile: "F:\\PI GOOD...",
    site: "WHO",
    coldChain: "No",
    controlDr: "No",
    foreignLeaflet: "05/2023"
  },
  {
    orderNo: "C13777",
    foreignName: "Jentadueto",
    strength: "2.5 mg/1,0...",
    packSize: "60 tablets",
    ecma: "EU/1/12/780/020-BG",
    batchNo: "479510",
    expiryDate: "30-11-2028",
    qty: "256",
    boxes: "0",
    manufacturer: "Boehringer Ingelheim Phar...",
    foreignLicense: "Boehringer ...",
    partNo: "BGJEN2.5/1...",
    imp: "C13777",
    printType: "",
    invoice: "2904",
    invoiceDate: "22-06-2026",
    supplier: "Abimed 3 Ltd",
    reviewDate: "13/02/2026",
    country: "BULGARIA",
    originCountry: "BULGARIA",
    actionCount: "15",
    description: "",
    prodStatus: "Active",
    status: "",
    warehouse: "",
    product: "Jentadueto film-coa...",
    productId: "4977",
    mfgId: "103",
    contractSign: "",
    contractStatus: "",
    category: "",
    comments: "Bulk PIL Var...",
    mockup: "Product Mockup",
    scans: "Raw Pack Scans",
    objId: "AAARu9ABy...",
    piObjId: "",
    packingId: "0",
    invoiceFile: "F:\\PI GOOD...",
    site: "WHO",
    coldChain: "No",
    controlDr: "No",
    foreignLeaflet: "03/2023"
  },
  {
    orderNo: "C13777",
    foreignName: "EXFORGE",
    strength: "10mg/160mg",
    packSize: "28",
    ecma: "EU/1/06/370/019-BG",
    batchNo: "TPVF6",
    expiryDate: "31-10-2028",
    qty: "79",
    boxes: "1",
    manufacturer: "Novartis Farma S.p.A.",
    foreignLicense: "Novartis Eu...",
    partNo: "BGEXF1016...",
    imp: "C13777",
    printType: "",
    invoice: "2904",
    invoiceDate: "22-06-2026",
    supplier: "Abimed 3 Ltd",
    reviewDate: "13/02/2026",
    country: "BULGARIA",
    originCountry: "BULGARIA",
    actionCount: "9",
    description: "Exforge 10/...",
    prodStatus: "Active",
    status: "",
    warehouse: "Q-25-A",
    product: "Exforge film-coated...",
    productId: "5313",
    mfgId: "301",
    contractSign: "",
    contractStatus: "",
    category: "",
    comments: "Foreign leaf...",
    mockup: "Product Mockup",
    scans: "Raw Pack Scans",
    objId: "AAARu9ABy...",
    piObjId: "AAARu9ABy...",
    packingId: "326363",
    invoiceFile: "F:\\PI GOOD...",
    site: "WHO",
    coldChain: "Yes",
    controlDr: "No",
    foreignLeaflet: "02/2025"
  }
];

function getBatchCheckerRowKey(row) {
  return row ? `${row.orderNo}_${row.batchNo}` : "";
}

function markBatchCheckerLabelPrinted(row, type = "Box Label", reprintReason = "") {
  if (!row) return null;
  const rowKey = getBatchCheckerRowKey(row);
  const existingRecord = batchCheckerPrintedLabelRows[rowKey];
  const now = getAssemblyAuditTimestamp();
  const reprints = [...(existingRecord?.reprints || [])];
  if (reprintReason) reprints.push({ reason: reprintReason, user: currentLogin ? currentLogin.user : "batch.checker", dateTime: now });
  const record = { user: currentLogin ? currentLogin.user : "batch.checker", dateTime: now, type, reprints };
  batchCheckerPrintedLabelRows[rowKey] = record;
  row.labelPrinted = true;
  row.labelPrintedAt = now;
  return record;
}

function openBatchCheckerReprintReason(action, row, printMode = "standard") {
  if (!row) return false;
  const rowKey = getBatchCheckerRowKey(row);
  const alreadyPrinted = action === "pcl" ? Boolean(batchCheckerPclGeneratedRows[rowKey] || row.printType === "Printed - PCL") : action === "pcl-cold" ? Boolean(batchCheckerColdPclPrintedRows[rowKey]) : Boolean(batchCheckerPrintedLabelRows[rowKey]);
  if (!alreadyPrinted) return false;
  batchCheckerPendingReprint = { action, row, printMode };
  const typeLabel = action === "pcl-cold" ? "PCL cold chain continuation" : action === "pcl" ? "PCL" : "label";
  document.querySelector("#batchchecker-reprint-title").textContent = `Reason for reprinting ${typeLabel}`;
  document.querySelector("#batchchecker-reprint-message").textContent = `The ${typeLabel} for batch ${row.batchNo} has already been printed. Enter a reason to continue.`;
  const reasonInput = document.querySelector("#batchchecker-reprint-reason");
  reasonInput.value = "";
  document.querySelector("#batchchecker-reprint-confirm").disabled = true;
  document.querySelector("#batchchecker-reprint-modal").classList.remove("hidden");
  setTimeout(() => reasonInput.focus(), 0);
  return true;
}

function filterBatchCheckerRows(rows) {
  const supplierSearch = String(batchCheckerFilters.supplier || "").trim().toLowerCase();
  const contractSearch = String(batchCheckerFilters.contract || "").trim().toLowerCase();
  const productSearch = String(batchCheckerFilters.product || "").trim().toLowerCase();
  const invoiceSearch = String(batchCheckerFilters.invoice || "").trim().toLowerCase();
  const siteSearch = String(batchCheckerFilters.site || "").trim().toLowerCase();
  const poSearch = String(batchCheckerFilters.po || "").trim().toLowerCase();
  const statusSearch = String(batchCheckerFilters.status || "").trim().toLowerCase();
  const mfgLotSearch = String(batchCheckerFilters.mfgLot || "").trim().toLowerCase();
  const countrySearch = String(batchCheckerFilters.country || "").trim().toLowerCase();
  return rows.filter((row) => {
    const currentStatus = getBatchCheckerStatusText(row);
    return (!supplierSearch || String(row.supplier || row.foreignLicense || "").toLowerCase().includes(supplierSearch)) &&
      (!contractSearch || String(row.contractSign || row.contractStatus || "").toLowerCase().includes(contractSearch)) &&
      (!productSearch || String(row.product || row.description || row.foreignName || "").toLowerCase().includes(productSearch)) &&
      (!invoiceSearch || String(row.invoice || "").toLowerCase().includes(invoiceSearch)) &&
      (!siteSearch || String(row.site || "").toLowerCase().includes(siteSearch)) &&
      (!poSearch || String(row.orderNo || "").toLowerCase().includes(poSearch)) &&
      (!statusSearch || currentStatus.toLowerCase().includes(statusSearch)) &&
      (!mfgLotSearch || String(getMfgLotNo(row) || "").toLowerCase().includes(mfgLotSearch)) &&
      (!countrySearch || String(row.country || row.originCountry || "").toLowerCase().includes(countrySearch));
  });
}
function getBatchCheckerRows() {
  const filtered = batchCheckerDb.filter(row => !batchCheckerSelectedPo || row.orderNo === batchCheckerSelectedPo);
  if (filtered.length > 0) return filterBatchCheckerRows(filtered);
  
  const plRows = getPackingListRows().filter(r => r.orderNo === batchCheckerSelectedPo);
  if (plRows.length > 0) {
    const mapped = plRows.map(row => ({
      orderNo: row.orderNo,
      foreignName: row.foreignName || row.description,
      strength: row.strength || "10mg",
      packSize: row.packSize || "28",
      ecma: row.ecma || "EU/1/10/655/002",
      batchNo: row.batchNo || "VHUN",
      mfgLotNo: getMfgLotNo(row),
      manufLotNo: getMfgLotNo(row),
      expiryDate: row.expiryDate || "31-10-2026",
      qty: row.qty || "100",
      boxes: row.boxes || "1",
      manufacturer: "",
      foreignLicense: row.suppName || "Pharma Supplier",
      partNo: row.partNo || "PTBRI90TAB56",
      imp: row.orderNo,
      printType: "",
      invoice: row.comments || "2904",
      invoiceDate: "22-06-2026",
      supplier: row.suppName || "Pharma Supplier",
      reviewDate: "13/02/2026",
      country: row.country || "BULGARIA",
      originCountry: row.country || "POLAND",
      actionCount: "10",
      description: row.description,
      prodStatus: "Active",
      status: "",
      warehouse: "",
      product: row.description,
      productId: row.productId || "5468",
      mfgId: "0",
      contractSign: "",
      contractStatus: "",
      category: "Relabelling",
      comments: row.comments || "",
      mockup: "Product Mockup",
      scans: "Raw Pack Scans",
      objId: "AAARu9ABy...",
      piObjId: "",
      packingId: "326360",
      invoiceFile: "F:\\PI GOOD...",
      site: "WHO",
      coldChain: "No",
      controlDr: "No",
      foreignLeaflet: "04/2022"
    }));
    batchCheckerDb.push(...mapped);
    return filterBatchCheckerRows(mapped);
  }
  return filterBatchCheckerRows([]);
}

function seedLiveTestingData() {
  const liveProducts = [
    { batch: "RBX001", manufLotNo: "MFG-RBX-2601", product: "Reboxing Test Product", partNo: "GBRBX60TAB", country: "SPAIN", strength: "10mg", packSize: "60 tablets", quantity: "300", onHandQuantity: "325", expiry: "31-12-2028", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "300", brailleQuantity: "0", leafletQuantity: "300", imp: "C13830", invoice: "INV-RBX-2601", ecma: "RBX/10/60/001", pl: "18799/6001", productId: "7201", warehouse: "R7-D-01", supplierName: "PLPI Reboxing Test Supplier", foreignName: "Producto de prueba para reenvasado", description: "Active Reboxing workflow test batch", batchType: "Composite", receivedPackSize: "30 tablets", receivedBlisterPerPack: "3", assembledBlisterPerPack: "6" },
    { batch: "LVT001", manufLotNo: "MFG-ALP-2401", product: "Alphagan eye drops", partNo: "ESALP02EYE5", country: "SPAIN", strength: "0.2%", packSize: "5ml", quantity: "220", expiry: "31-08-2027", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "220", leafletQuantity: "220", imp: "C13810", invoice: "INV-78210", ecma: "64120", pl: "18799/4011", productId: "7101", warehouse: "Q-26-A", supplierName: "Euroserv S.A.", foreignName: "Alphagan collyre", description: "Alphagan eye drops", batchType: "Consolidated" },
    { batch: "LVT002", manufLotNo: "MFG-BRI-2402", product: "Brilique film-coated tablets", partNo: "PTBRI90TAB56", country: "PORTUGAL", strength: "90mg", packSize: "56", quantity: "360", expiry: "30-09-2028", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "360", leafletQuantity: "360", imp: "C13810", invoice: "INV-78210", ecma: "EU/1/10/655/002", pl: "18799/3999", productId: "7102", warehouse: "Q-26-B", supplierName: "Pharma Logistics PT", foreignName: "BRILIQUE comprimidos", description: "Brilique tablets", batchType: "Consolidated" },
    { batch: "LVT003", manufLotNo: "MFG-FOS-2403", product: "Foster Nexthaler", partNo: "ESFOS100-6", country: "SPAIN", strength: "100/6 microgram", packSize: "120 doses", quantity: "480", expiry: "31-10-2027", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "480", leafletQuantity: "480", imp: "C13811", invoice: "INV-78211", ecma: "76713", pl: "18799/4050", productId: "7103", warehouse: "R8-A-02", supplierName: "Spanish Pharma Supply", foreignName: "FOSTER NEXTHALER", description: "Foster inhaler", batchType: "Composite" },
    { batch: "LVT004", manufLotNo: "MFG-OMA-2404", product: "Omacor capsules", partNo: "ESOMA1000", country: "SPAIN", strength: "1000mg", packSize: "28", quantity: "520", expiry: "30-09-2028", routeType: "Relabelling", category: "Relabelling", brailleRequired: false, cartonQuantity: "0", brailleQuantity: "0", leafletQuantity: "520", imp: "C13811", invoice: "INV-78211", ecma: "65476", pl: "18799/4115", productId: "7104", warehouse: "R8-A-03", supplierName: "Euroserv S.A.", foreignName: "Omacor cap.", description: "Omacor capsules", batchType: "Composite" },
    { batch: "LVT005", manufLotNo: "MFG-FLU-2405", product: "Flutiform inhalation", partNo: "CZFLU120ACT", country: "CZECH REPUBLIC", strength: "250/10mcg", packSize: "120 actuations", quantity: "650", expiry: "31-07-2027", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "650", brailleQuantity: "0", leafletQuantity: "650", imp: "C13812", invoice: "INV-78212", ecma: "14/555/12-C", pl: "18799/2922", productId: "7105", warehouse: "R6-B-04", supplierName: "DerStar Pharma SK s.r.o.", foreignName: "Flutiform suspenze", description: "Flutiform inhalation", batchType: "Composite" },
    { batch: "LVT006", manufLotNo: "MFG-ADA-2406", product: "Adartel tablets", partNo: "FRADA025TAB12", country: "FRANCE", strength: "0.25mg", packSize: "12", quantity: "180", expiry: "31-10-2027", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "180", leafletQuantity: "180", imp: "C13812", invoice: "INV-78212", ecma: "3400939183947", pl: "18799/2070", productId: "7106", warehouse: "Q-25-C", supplierName: "Pharma Logistics FR", foreignName: "ADARTEL comprimes pellicules", description: "Adartel tablets", batchType: "Consolidated" },
    { batch: "LVT007", manufLotNo: "MFG-AZA-2407", product: "Azarga eye drops", partNo: "FRAZA10EYE5ML", country: "FRANCE", strength: "10mg/ml + 5mg/ml", packSize: "5ml", quantity: "75", expiry: "30-04-2027", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "75", leafletQuantity: "75", imp: "C13813", invoice: "INV-78213", ecma: "EU/1/08/482/001", pl: "18799/3685", productId: "7107", warehouse: "Q-27-A", supplierName: "DerStar Pharma SK s.r.o.", foreignName: "AZARGA collyre", description: "Azarga eye drops", batchType: "Composite" },
    { batch: "LVT008", manufLotNo: "MFG-BON-2408", product: "Bonasol oral solution", partNo: "ITBON70MG4", country: "ITALY", strength: "70mg", packSize: "4", quantity: "96", expiry: "30-06-2027", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "96", brailleQuantity: "0", leafletQuantity: "96", imp: "C13813", invoice: "INV-78213", ecma: "040622033", pl: "18799/3031", productId: "7108", warehouse: "Q-27-B", supplierName: "UAB Dinera", foreignName: "BONASOL soluzione orale", description: "Bonasol oral solution", batchType: "Composite" },
    { batch: "LVT009", manufLotNo: "MFG-BAC-2409", product: "Bactroban ointment", partNo: "ESBACNA15G", country: "SPAIN", strength: "2% w/w", packSize: "15g", quantity: "240", expiry: "31-10-2027", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "240", brailleQuantity: "0", leafletQuantity: "240", imp: "C13814", invoice: "INV-78214", ecma: "58868", pl: "18799/1411", productId: "7109", warehouse: "R8-C-03", supplierName: "Spanish Pharma Supply", foreignName: "Bactroban pomada", description: "Bactroban ointment", batchType: "Composite" },
    { batch: "LVT010", manufLotNo: "MFG-EXF-2410", product: "Exforge tablets", partNo: "BGEXF1016", country: "BULGARIA", strength: "10mg/160mg", packSize: "28", quantity: "144", expiry: "31-10-2028", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "144", leafletQuantity: "144", imp: "C13814", invoice: "INV-78214", ecma: "EU/1/06/370/019-BG", pl: "18799/5313", productId: "7110", warehouse: "Q-25-D", supplierName: "Abimed 3 Ltd", foreignName: "EXFORGE", description: "Exforge tablets", batchType: "Consolidated" },
    { batch: "LVT011", manufLotNo: "MFG-SPI-2411", product: "Spiriva inhalation capsules", partNo: "ROSPI18MC", country: "ROMANIA", strength: "18 microgram", packSize: "30 capsules", quantity: "210", expiry: "30-06-2027", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "210", leafletQuantity: "210", imp: "C13815", invoice: "INV-78215", ecma: "9766/2017/02", pl: "18799/4144", productId: "7111", warehouse: "Q-28-A", supplierName: "Abimed 3 Ltd", foreignName: "Spiriva caps", description: "Spiriva inhalation capsules", batchType: "Consolidated" },
    { batch: "LVT012", manufLotNo: "MFG-JEN-2412", product: "Jentadueto tablets", partNo: "BGJEN251", country: "BULGARIA", strength: "2.5mg/1000mg", packSize: "60", quantity: "300", expiry: "30-11-2028", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "300", leafletQuantity: "300", imp: "C13815", invoice: "INV-78215", ecma: "EU/1/12/780/020-BG", pl: "18799/4977", productId: "7112", warehouse: "Q-28-B", supplierName: "Abimed 3 Ltd", foreignName: "Jentadueto", description: "Jentadueto tablets", batchType: "Consolidated" },
    { batch: "LVT013", manufLotNo: "MFG-LAT-2413", product: "Latuda tablets", partNo: "ESLAT74MG", country: "SPAIN", strength: "74mg", packSize: "28 x 1", quantity: "132", expiry: "30-06-2030", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "132", leafletQuantity: "132", imp: "C13816", invoice: "INV-78216", ecma: "EU/1/14/91", pl: "18799/5021", productId: "7113", warehouse: "Q-29-A", supplierName: "Euroserv S.A.", foreignName: "LATUDA comprimidos", description: "Latuda tablets", batchType: "Consolidated" },
    { batch: "LVT014", manufLotNo: "MFG-LUM-2414", product: "Lumigan eye drops", partNo: "ESLUMEYE30", country: "SPAIN", strength: "0.1mg/ml", packSize: "1 x 3ml", quantity: "390", expiry: "30-09-2027", routeType: "Relabelling", category: "Relabelling", brailleRequired: false, cartonQuantity: "0", brailleQuantity: "0", leafletQuantity: "390", imp: "C13816", invoice: "INV-78216", ecma: "EU/1/02/205", pl: "18799/5128", productId: "7114", warehouse: "Q-29-B", supplierName: "Euroserv S.A.", foreignName: "Lumigan", description: "Lumigan eye drops", batchType: "Composite" },
    { batch: "LVT015", manufLotNo: "MFG-MAS-2415", product: "Mastical tablets", partNo: "ESMAS500TAB", country: "SPAIN", strength: "500mg", packSize: "90", quantity: "280", expiry: "31-03-2028", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "280", leafletQuantity: "280", imp: "C13817", invoice: "INV-78217", ecma: "58828", pl: "18799/5220", productId: "7115", warehouse: "Q-30-A", supplierName: "Euroserv S.A.", foreignName: "MASTICAL comp.", description: "Mastical tablets", batchType: "Consolidated" },
    { batch: "LVT016", manufLotNo: "MFG-SOL-2416", product: "Soludronate oral solution", partNo: "ESSOL70ML", country: "SPAIN", strength: "70mg", packSize: "4 x 100ml", quantity: "88", expiry: "31-12-2027", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "88", brailleQuantity: "0", leafletQuantity: "88", imp: "C13817", invoice: "INV-78217", ecma: "73232", pl: "18799/5330", productId: "7116", warehouse: "Q-30-B", supplierName: "Euroserv S.A.", foreignName: "Soludronate", description: "Soludronate oral solution", batchType: "Composite" },
    { batch: "LVT017", manufLotNo: "MFG-CLO-2417", product: "Clovate cream", partNo: "ESCLOCREA30", country: "SPAIN", strength: "0.05% w/w", packSize: "30g", quantity: "620", expiry: "31-03-2028", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "620", brailleQuantity: "0", leafletQuantity: "620", imp: "C13818", invoice: "INV-78218", ecma: "55746", pl: "18799/5441", productId: "7117", warehouse: "Q-31-A", supplierName: "Euroserv S.A.", foreignName: "Clovate cream", description: "Clovate cream", batchType: "Composite" },
    { batch: "LVT018", manufLotNo: "MFG-GIN-2418", product: "Gine Canesmed cream", partNo: "ESGINCAN20", country: "SPAIN", strength: "20g", packSize: "20g", quantity: "900", expiry: "31-01-2030", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "900", brailleQuantity: "0", leafletQuantity: "900", imp: "C13818", invoice: "INV-78218", ecma: "62220", pl: "18799/5510", productId: "7118", warehouse: "Q-31-B", supplierName: "Euroserv S.A.", foreignName: "Gine Canesmed", description: "Gine Canesmed cream", batchType: "Composite" },
    { batch: "LVT019", manufLotNo: "MFG-TAM-2419", product: "Tamsulosin capsules", partNo: "NLTAM400CAP", country: "NETHERLANDS", strength: "400 microgram", packSize: "30", quantity: "360", expiry: "30-04-2029", routeType: "Relabelling", category: "Relabelling", brailleRequired: true, cartonQuantity: "0", brailleQuantity: "360", leafletQuantity: "360", imp: "C13819", invoice: "INV-78219", ecma: "RVG 32919", pl: "18799/5620", productId: "7119", warehouse: "Q-32-A", supplierName: "Dutch Pharma Logistics", foreignName: "Tamsulosine capsules", description: "Tamsulosin capsules", batchType: "Consolidated" },
    { batch: "LVT020", manufLotNo: "MFG-VEN-2420", product: "Ventolin inhaler", partNo: "IEVEN100INH", country: "IRELAND", strength: "100 microgram", packSize: "200 doses", quantity: "540", expiry: "31-05-2029", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "540", brailleQuantity: "0", leafletQuantity: "540", imp: "C13819", invoice: "INV-78219", ecma: "PA 1077/071/001", pl: "18799/5750", productId: "7120", warehouse: "Q-32-B", supplierName: "Irish Pharma Supply", foreignName: "Ventolin Evohaler", description: "Ventolin inhaler", batchType: "Composite" },
    { batch: "LVT021", manufLotNo: "MFG-SYM-2421", product: "Symbicort Turbohaler", partNo: "SESYM2006INH", country: "SWEDEN", strength: "200/6 microgram", packSize: "120 doses", quantity: "420", onHandQuantity: "460", expiry: "31-12-2028", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "420", brailleQuantity: "0", leafletQuantity: "420", imp: "C13820", invoice: "INV-78220", ecma: "EU/1/00/294/006", pl: "18799/5811", productId: "7121", warehouse: "R7-A-01", supplierName: "Nordic Pharma Logistics", foreignName: "Symbicort Turbuhaler", description: "Symbicort Turbohaler", batchType: "Composite" },
    { batch: "LVT022", manufLotNo: "MFG-DAK-2422", product: "Daktarin oral gel", partNo: "BEDAK20G40", country: "BELGIUM", strength: "20mg/g", packSize: "40g", quantity: "275", onHandQuantity: "310", expiry: "30-09-2028", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "275", brailleQuantity: "0", leafletQuantity: "275", imp: "C13821", invoice: "INV-78221", ecma: "BE 154231", pl: "18799/5874", productId: "7122", warehouse: "R7-B-02", supplierName: "Medico Europe SA", foreignName: "Daktarin gel oral", description: "Daktarin oral gel", batchType: "Composite" },
    { batch: "LVT023", manufLotNo: "MFG-EML-2423", product: "Emla cream", partNo: "FREMLA5CRE30", country: "FRANCE", strength: "5%", packSize: "30g", quantity: "510", onHandQuantity: "545", expiry: "31-03-2029", routeType: "Reboxing", category: "Reboxing", brailleRequired: false, cartonQuantity: "510", brailleQuantity: "0", leafletQuantity: "510", imp: "C13822", invoice: "INV-78222", ecma: "FR 3400930005124", pl: "18799/5936", productId: "7123", warehouse: "R7-C-03", supplierName: "Pharma Logistics FR", foreignName: "Emla creme", description: "Emla cream", batchType: "Composite" }
  ].map((product) => ({
    status: product.status || "Active",
    site: "WHO",
    unitsPerPack: "1",
    productIntroduced: "12 Jan 2024",
    leafletDate: "02 Jan 2026",
    dateRevised: "12 Jun 2026",
    variationInfo: product.brailleRequired ? "Braille required" : "",
    reviewDate: "15/06/2026",
    supplierInvoice: product.invoice,
    leafletRequired: true,
    routeInstruction: product.routeType === "Reboxing" ? "Rebox and apply UK labels" : "Relabel approved stock",
    ...product
  }));

  liveProducts.forEach((product) => {
    if (!bnsProducts.some((existing) => existing.batch === product.batch)) bnsProducts.push(product);
  });

  const addMany = (target, values) => values.forEach((value) => {
    if (!target.includes(value)) target.push(value);
  });

  addMany(generatedBatchNumbers, ["RBX001", "LVT001", "LVT002", "LVT003", "LVT004", "LVT005", "LVT006", "LVT007", "LVT008", "LVT009", "LVT010", "LVT011", "LVT012", "LVT013", "LVT014", "LVT015", "LVT016", "LVT017", "LVT018", "LVT019", "LVT020", "LVT021", "LVT022", "LVT023"]);
  addMany(labelPrintedBatchNumbers, ["LVT003", "LVT004", "LVT005", "LVT006", "LVT007", "LVT008", "LVT009", "LVT010", "LVT011", "LVT012", "LVT013", "LVT014", "LVT015", "LVT016", "LVT017", "LVT018", "LVT019", "LVT020", "LVT022", "LVT023"]);
  addMany(leafletPrintedBatchNumbers, ["LVT005", "LVT006", "LVT007", "LVT008", "LVT009", "LVT010", "LVT011", "LVT012", "LVT013", "LVT014", "LVT015", "LVT016", "LVT017", "LVT018", "LVT019", "LVT020", "LVT023"]);
  addMany(cartonPrintedBatchNumbers, ["LVT008", "LVT009", "LVT016", "LVT017", "LVT018", "LVT020"]);
  addMany(braillePrintedBatchNumbers, ["LVT010", "LVT011", "LVT012", "LVT013", "LVT015", "LVT019"]);
  addMany(leafletFoldedBatchNumbers, ["LVT009", "LVT010", "LVT011", "LVT012", "LVT013", "LVT014", "LVT015", "LVT016", "LVT017", "LVT018", "LVT019", "LVT020"]);
  addMany(preAssemblyCheckedBatchNumbers, ["LVT012", "LVT013", "LVT014", "LVT015", "LVT016", "LVT017", "LVT018", "LVT019", "LVT020"]);
  addMany(productionAllocatedBatchNumbers, ["LVT014", "LVT015", "LVT016", "LVT017", "LVT018", "LVT019", "LVT020"]);
  addMany(assembledBatchNumbers, ["LVT016", "LVT017", "LVT018", "LVT019", "LVT020"]);
  addMany(postAssemblyCheckedBatchNumbers, ["LVT017", "LVT018", "LVT019", "LVT020"]);
  addMany(preQpCheckedBatchNumbers, ["LVT018", "LVT019", "LVT020"]);

  ["LVT014", "LVT015", "LVT016", "LVT017", "LVT018", "LVT019", "LVT020"].forEach((batch, index) => {
    productionRecords[batch] = productionRecords[batch] || { user: "production.control", dateTime: `24 Jun 2026, 0${9 + index}:15:00`, boxCount: String(2 + index), roomNo: `Room ${2 + (index % 3)}` };
  });
  ["LVT016", "LVT017", "LVT018", "LVT019", "LVT020"].forEach((batch, index) => {
    const product = bnsProducts.find((item) => item.batch === batch);
    assemblyRecords[batch] = assemblyRecords[batch] || { user: "assembly.room", dateTime: `24 Jun 2026, 1${index}:30:00`, boxCount: "4", usedLabels: product ? product.quantity : "100", startRecord: { user: "assembly.room", dateTime: "24 Jun 2026, 09:15:00" }, finishRecord: { user: "assembly.room", dateTime: "24 Jun 2026, 12:45:00" }, startTime: "24 Jun 2026, 09:15:00", finishTime: "24 Jun 2026, 12:45:00", signedTabs: { materials: { user: "assembly.room", dateTime: "24 Jun 2026, 09:30:00" }, samples: { user: "assembly.room", dateTime: "24 Jun 2026, 10:20:00" }, ipc: { user: "assembly.room", dateTime: "24 Jun 2026, 11:10:00" }, reconciliation: { user: "assembly.room", dateTime: "24 Jun 2026, 12:45:00" } } };
  });
  ["LVT017", "LVT018", "LVT019", "LVT020"].forEach((batch, index) => {
    const product = bnsProducts.find((item) => item.batch === batch);
    postAssemblyRecords[batch] = postAssemblyRecords[batch] || { user: "postassembly.qc", dateTime: `24 Jun 2026, ${14 + index}:20:00`, boxCount: String(Math.max(1, Math.ceil(Number(product ? product.quantity : 100) / 100))), totalQty: product ? product.quantity : "100", packsChecked: String(26 + index), quarantinePrinted: true, packChecksConfirmed: true, comments: "Demo record ready for Pre-QP." };
  });
  ["LVT018", "LVT019", "LVT020"].forEach((batch, index) => {
    const product = bnsProducts.find((item) => item.batch === batch);
    preQpRecords[batch] = preQpRecords[batch] || { sampleBox: "01", docs: ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"], materialChecked: true, comments: index === 0 ? "Release log printed; waiting QP decision." : "Release log printed and QP decision recorded.", user: "pre.qp", dateTime: `24 Jun 2026, 16:${10 + index * 8}:00`, logGenerated: true };
    if (index > 0) qpReleaseRecords[batch] = qpReleaseRecords[batch] || { qpId: "28942", qpReady: true, qpLogGeneratedAt: `24 Jun 2026, 16:${35 + index * 7}:00`, releaseLogBatchNumbers: ["LVT019", "LVT020"], releaseLog: product ? getQpReleaseLogDefaults(product) : {} };
  });
  qpReleaseRecords.LVT019 = { ...(qpReleaseRecords.LVT019 || {}), decision: "Approve", approved: true, decisionBy: "qp.release", decisionDateTime: "24 Jun 2026, 17:25:00" };
  qpReleaseRecords.LVT020 = { ...(qpReleaseRecords.LVT020 || {}), decision: "Hold", decisionBy: "qp.release", decisionDateTime: "24 Jun 2026, 17:40:00" };
  addMany(qpCertifiedBatchNumbers, ["LVT019", "LVT020"]);

  const liveBatchCheckerRows = liveProducts.slice(0, 8).map((product, index) => ({
    orderNo: index < 4 ? "C13810" : "C13811",
    foreignName: product.foreignName,
    strength: product.strength,
    packSize: product.packSize,
    ecma: product.ecma,
    batchNo: product.batch,
    mfgLotNo: product.manufLotNo,
    expiryDate: product.expiry,
    qty: product.quantity,
    boxes: String(Math.max(1, Math.ceil(Number(product.quantity || 0) / 120))),
    manufacturer: index % 2 ? "Novartis Farma S.p.A." : "Boehringer Ingelheim Pharma GmbH",
    foreignLicense: product.supplierName,
    partNo: product.partNo,
    imp: product.imp,
    printType: index === 2 ? "Printed - PCL" : "",
    invoice: product.invoice,
    invoiceDate: "24-06-2026",
    supplier: product.supplierName,
    reviewDate: "15/06/2026",
    country: product.country,
    originCountry: product.country,
    actionCount: String(8 + index),
    description: product.description,
    prodStatus: "Active",
    status: index === 2 ? "Printer" : "",
    warehouse: product.warehouse,
    product: product.product,
    productId: product.productId,
    mfgId: String(400 + index),
    contractSign: "Yes",
    contractStatus: "Active",
    category: product.category,
    comments: "Live test data",
    mockup: "Product Mockup",
    scans: "Raw Pack Scans",
    objId: `LVT-OBJ-${index + 1}`,
    piObjId: `LVT-PI-${index + 1}`,
    packingId: `LVT-PACK-${index + 1}`,
    invoiceFile: "F:\\PI GOOD...",
    site: "WHO",
    coldChain: index === 3 ? "Yes" : "No",
    controlDr: "No",
    foreignLeaflet: "06/2026"
  }));
  liveBatchCheckerRows.forEach((row) => {
    if (!batchCheckerDb.some((existing) => existing.orderNo === row.orderNo && existing.batchNo === row.batchNo)) batchCheckerDb.push(row);
  });
}

seedLiveTestingData();
function getRpPackCreationDocument(poNo, docId) {
  return rpPackWorkflows[poNo]?.documents?.find((documentItem) => documentItem.id === docId && documentItem.uploaded) || null;
}
function ensureBatchCheckerInvoiceSources() {
  const poRows = new Map();
  batchCheckerDb.forEach((row) => { if (row.orderNo && !poRows.has(row.orderNo)) poRows.set(row.orderNo, row); });
  poRows.forEach((row, poNo) => {
    const workflow = rpPackWorkflows[poNo] || createPackingWorkflow(poNo);
    workflow.supplier = workflow.supplier || row.supplier || row.foreignLicense || "Supplier from PO";
    workflow.rpDocumentsQueueCreated = true;
    workflow.rpDocumentsQueueSource = workflow.rpDocumentsQueueSource || "RPi Pack Creation";
    workflow.status = "RPi Approved";
    workflow.documents.forEach((documentItem) => {
      documentItem.uploaded = true;
      documentItem.fileName = documentItem.fileName || `${poNo}_${documentItem.name.replace(/\s+/g, "_")}.pdf`;
      documentItem.uploadedFrom = documentItem.uploadedFrom || "RPi Pack Creation";
    });
    rpPackWorkflows[poNo] = workflow;
    rpApprovalSignoffs[poNo] = rpApprovalSignoffs[poNo] || { user: "rp.user", dateTime: "22 Jul 2026, 15:05" };
  });
}
ensureBatchCheckerInvoiceSources();
function getRpApprovedPoKeysForBatchChecker() {
  const approved = Object.keys(rpPackWorkflows).filter((poNo) => rpApprovalSignoffs[poNo] || rpPackWorkflows[poNo]?.status === "RPi Approved");
  const seededPoKeys = [...new Set(batchCheckerDb.map((row) => row.orderNo).filter(Boolean))];
  return [...new Set([...approved, ...seededPoKeys])];
}

function getBatchCheckerRowsForPo(poNo) {
  const previousPo = batchCheckerSelectedPo;
  batchCheckerSelectedPo = poNo;
  const rows = getBatchCheckerRows();
  batchCheckerSelectedPo = previousPo;
  return rows;
}

function getBatchCheckerPoSummary(poNo) {
  const rows = getBatchCheckerRowsForPo(poNo);
  const signed = rows.filter((row) => isBatchCheckerPclComplete(row)).length;
  const verified = rows.filter((row) => batchCheckerVerifiedRows[getBatchCheckerRowKey(row)]).length;
  const lots = [...new Set(rows.map((row) => getMfgLotNo(row)).filter(Boolean))];
  const batches = [...new Set(rows.map((row) => row.batchNo || row.batch || "").filter(Boolean))];
  const invoices = [...new Set(rows.map((row) => row.invoice || row.invoiceNo || "").filter(Boolean))];
  const products = [...new Set(rows.map((row) => row.product || row.foreignName || row.description || "").filter(Boolean))];
  const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || row.quantity || 0), 0);
  const totalBoxes = rows.reduce((sum, row) => sum + Number(row.boxes || row.goodsInBoxes || 0), 0);
  return { rows, signed, verified, lots, batches, invoices, products, totalQty, totalBoxes };
}

function getBatchCheckerVerificationItems(row) {
  const mfg = batchCheckerMfgList.find((item) => item.name === row.manufacturer);
  const mfgAddress = mfg ? mfg.address : (row.manufacturer || "Not selected");
  return [
    { key: "product", label: "Product name", value: row.product || row.description || row.foreignName || "-" },
    { key: "strengthPack", label: "Strength and Pack Size", value: `${row.strength || "-"} / ${row.packSize || "-"}` },
    { key: "ecma", label: "ECMA", value: row.ecma || "-" },
    { key: "sourceCountry", label: "Source Country", value: row.country || "-" },
    { key: "originCountry", label: "Country of origin", value: row.originCountry || row.country || "-" },
    { key: "invoice", label: "Invoice no.", value: row.invoice || "-" },
    { key: "rawScan", label: "Raw Product Scan", value: row.productId || row.objId || "Available" },
    { key: "batch", label: "Batch No.", value: row.batchNo || "-" },
    { key: "expiry", label: "Expiry", value: row.expiryDate || "-" },
    { key: "quantity", label: "Quantity Received", value: row.qty || "-" },
    { key: "boxes", label: "Number of boxes in the Batch", value: row.boxes || "-" },
    { key: "manufacturer", label: "Manufacturer", value: row.manufacturer || "Not selected" },
    { key: "manufacturerAddress", label: "Manufacturer Address", value: mfgAddress },
    { key: "foreignEcma", label: "Foreign ECMA Holder", value: row.foreignLicense || row.supplier || "-" },
    { key: "leafletDate", label: "Foreign leaflet date", value: row.foreignLeaflet || "-" }
  ];
}

function getBatchCheckerLineChecks(row) {
  const rowKey = getBatchCheckerRowKey(row);
  const requiredLength = getBatchCheckerVerificationItems(row).length;
  if (!batchCheckerDetailChecks[rowKey]) {
    batchCheckerDetailChecks[rowKey] = Array(requiredLength).fill(false);
  }
  while (batchCheckerDetailChecks[rowKey].length < requiredLength) {
    batchCheckerDetailChecks[rowKey].push(false);
  }
  if (batchCheckerDetailChecks[rowKey].length > requiredLength) {
    batchCheckerDetailChecks[rowKey] = batchCheckerDetailChecks[rowKey].slice(0, requiredLength);
  }
  return batchCheckerDetailChecks[rowKey];
}

function capturePclBarRecord(row, rowKey, comments, printMode, incompleteCount) {
  if (!row) return null;
  const verificationItems = getBatchCheckerVerificationItems(row);
  const checkValues = getBatchCheckerLineChecks(row);
  const verification = batchCheckerVerifiedRows[rowKey] || {};
  const record = {
    batchNumber: row.batchNo,
    sourceRow: { ...row },
    poNumber: row.orderNo || "",
    printMode,
    checks: verificationItems.map((item, index) => ({
      label: item.label,
      value: item.value,
      checked: Boolean(checkValues[index])
    })),
    lineClearanceConfirmed: true,
    comments: String(comments || ""),
    completedBy: currentLogin ? currentLogin.user : verification.checker || "batch.checker",
    completedAt: getAssemblyAuditTimestamp(),
    verificationBy: verification.checker || "",
    verificationDate: [verification.date, verification.time].filter(Boolean).join(" "),
    regulatoryReviewComplete: incompleteCount === 0,
    incompleteCount
  };
  pclBarRecords[row.batchNo] = record;
  return record;
}

function areBatchCheckerLineChecksComplete(row) {
  return getBatchCheckerLineChecks(row).every(Boolean);
}

function getBatchCheckerStatusText(row) {
  const rowKey = getBatchCheckerRowKey(row);
  const pclRecord = batchCheckerPclGeneratedRows[rowKey];
  if (pclRecord?.incompleteRegulatoryReviewCopy) return "Incomplete Regulatory Review";
  if (isBatchCheckerPclComplete(row)) return "PCL Generated";
  if (batchCheckerVerifiedRows[rowKey]) return "Ready for PCL";
  return "Awaiting Batch Check";
}

function isBatchCheckerPclComplete(row) {
  if (!row) return false;
  const record = batchCheckerPclGeneratedRows[getBatchCheckerRowKey(row)];
  return Boolean(row.printType === "Printed - PCL" || (record && record.regulatoryReviewComplete !== false && !record.incompleteRegulatoryReviewCopy));
}

function hasBatchCheckerSavedVerification(row) {
  if (!row) return false;
  const rowKey = getBatchCheckerRowKey(row);
  return Boolean(batchCheckerVerifiedRows[rowKey] || row.printType === "Printed - PCL");
}

function resetBatchCheckerPclAfterEdit(row) {
  if (!row) return false;
  const rowKey = getBatchCheckerRowKey(row);
  const pclRecord = batchCheckerPclGeneratedRows[rowKey];
  const hadWorkflowState = Boolean(
    pclRecord ||
    batchCheckerColdPclPrintedRows[rowKey] ||
    batchCheckerVerifiedRows[rowKey] ||
    batchCheckerCheckedRows[rowKey] ||
    row.printType === "Printed - PCL"
  );
  if (pclRecord?.addedToBns) {
    const generatedIndex = bnsProducts.findIndex((product) => product.batch === row.batchNo && product.imp === row.orderNo);
    if (generatedIndex >= 0) bnsProducts.splice(generatedIndex, 1);
  }
  delete batchCheckerPclGeneratedRows[rowKey];
  delete batchCheckerColdPclPrintedRows[rowKey];
  delete batchCheckerVerifiedRows[rowKey];
  delete batchCheckerCheckedRows[rowKey];
  delete batchCheckerDetailChecks[rowKey];
  delete batchCheckerPrintedLabelRows[rowKey];
  delete batchCheckerPclRegulatoryComments[rowKey];
  row.printType = "";
  row.status = "Awaiting Batch Check";
  row.batchChecker = "";
  row.checker = "";
  row.batchCheckDate = "";
  return hadWorkflowState;
}

function renderBatchCheckerFilters() {
  return `
    <div class="batchchecker-reference-toolbar batchchecker-one-line-filter">
      <label>Supplier : <input value=""></label>
      <label>Invoice No : <input data-batchchecker-filter="po" value="${batchCheckerFilters.po}"></label>
      <label>Contract Supp : <input value=""></label>
      <label class="compact-filter-field">IMP : <input value="${batchCheckerSelectedPo || ""}" readonly></label>
      <label class="compact-filter-field">Batch No : <input data-batchchecker-filter="mfgLot" value="${batchCheckerFilters.mfgLot}"></label>
      <label>Product : <input data-batchchecker-filter="product" value="${batchCheckerFilters.product}"></label>
      <button class="classic-button small" type="button" data-batchchecker-search-btn>Search</button>
    </div>
  `;
}
function renderBatchCheckerWork(stage) {
  const approvedPoKeys = getRpApprovedPoKeysForBatchChecker();
  const activePoKeys = approvedPoKeys.filter((poNo) => {
    const summary = getBatchCheckerPoSummary(poNo);
    return summary.rows.length > 0;
  });

  if (batchCheckerDashboardOpen) {
    const poRows = activePoKeys.map((poNo) => {
      const po = rpPackWorkflows[poNo] || { poNo };
      const summary = getBatchCheckerPoSummary(poNo);
      return `
        <tr class="clickable-row" data-batchchecker-open-po="${poNo}" title="Open PO ${poNo}">
          <td><strong>${poNo}</strong></td>
          <td>${po.supplier || summary.rows[0]?.supplier || "Supplier from PO"}</td>
          <td class="batchchecker-summary-list" title="${summary.invoices.join(", ")}">${summary.invoices.length ? summary.invoices.join(", ") : "-"}</td>
          <td class="batchchecker-summary-list" title="${summary.products.join(", ")}">${summary.products.length ? summary.products.join(", ") : "-"}</td>
          <td class="batchchecker-summary-list" title="${summary.batches.join(", ")}">${summary.batches.length ? summary.batches.join(", ") : "Pending"}</td>
          <td><strong>${summary.totalQty}</strong></td>
          <td>${summary.totalBoxes}</td>
        </tr>
      `;
    }).join("");

    return `
      <div class="batchchecker-live-layout">
        <div class="batchchecker-live-header">
          <div>
            <h3>Batch Checker - RPi Approved PO List</h3>
            
          </div>
        </div>
        ${renderBatchCheckerFilters()}
        <div class="batchchecker-list-wrap">
          <table class="batchchecker-po-list">
            <thead><tr><th>PO</th><th>Supplier</th><th>Invoice</th><th>Product</th><th>Batch No</th><th>Quantity</th><th>Boxes</th></tr></thead>
            <tbody>${poRows || `<tr><td colspan="7" class="batchchecker-empty-state">No RPi approved POs are available yet. Complete RPi Approval first.</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  const rows = getBatchCheckerRows();
  const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
  const selectedRow = selectedBatchCheckerRowKey !== null ? rows[selectedBatchCheckerRowKey] : null;

  if (selectedRow && batchCheckerChecklistOpen) {
    const row = selectedRow;
    const rowKey = getBatchCheckerRowKey(row);
    const checks = getBatchCheckerLineChecks(row);
    const labelRecord = batchCheckerPrintedLabelRows[rowKey];
    const verificationRows = [
      ["Product / description", row.product || row.description, row.description || row.product],
      ["Strength", row.strength, row.strength],
      ["Pack size", row.packSize, row.packSize],
      ["ECMA", row.ecma, row.ecma],
      ["Batch number", row.batchNo, row.batchNo],
      ["MFG lot number", getMfgLotNo(row) || "Pending", getMfgLotNo(row) || "Pending"],
      ["Quantity and boxes", `${row.qty} units / ${row.boxes} boxes`, `${row.qty} units / ${row.boxes} boxes`],
      ["Expiry and country", `${row.expiryDate} / ${row.country}`, `${row.expiryDate} / ${row.country}`]
    ];

    return `
      <div class="batchchecker-live-layout">
        <div class="batchchecker-live-header">
          <button class="classic-button" type="button" data-batchchecker-back-dashboard>Back to PO Dashboard</button>
          <div><h3>Checklist</h3><p>${row.orderNo} / ${row.product || row.description} / ${getMfgLotNo(row) || "MFG lot pending"}</p></div>
        </div>
        <div class="batchchecker-compare-grid">
          <div><strong>Supplier Packing List</strong><span>${row.supplier}</span><span>${row.product || row.description}</span><span>${row.strength} / ${row.packSize}</span><span>Qty ${row.qty}, Boxes ${row.boxes}</span></div>
          <div><strong>Checklist Data</strong><span>${row.orderNo}</span><span>${row.batchNo}</span><span>${getMfgLotNo(row) || "MFG lot pending"}</span><span>${row.expiryDate} / ${row.country}</span></div>
        </div>
        <div class="batchchecker-check-table-wrap">
          <table class="classic-table batchchecker-check-table">
            <thead><tr><th>Verification</th><th>Supplier data</th><th>System data</th><th>Checked</th></tr></thead>
            <tbody>${verificationRows.map((item, index) => `
              <tr>
                <td>${item[0]}</td>
                <td>${item[1] || "-"}</td>
                <td>${item[2] || "-"}</td>
                <td><input type="checkbox" data-batchchecker-verify-check="${index}" ${checks[index] ? "checked" : ""}></td>
              </tr>
            `).join("")}</tbody>
          </table>
        </div>
        <div class="batchchecker-detail-actions">
          <span>${labelRecord ? `Line clearance and label printed by ${labelRecord.user} at ${labelRecord.dateTime}` : "Tick every verification item, then Print PCL and Print Label."}</span>
          <button class="classic-button primary" type="button" id="batchchecker-detail-print-label">${labelRecord ? "Reprint Label" : "Print Label"}</button>
          <button class="classic-button primary" type="button" id="batchchecker-generate-pcl">${batchCheckerPclGeneratedRows[rowKey] ? "Reprint PCL" : "Print PCL"}</button>
          ${row.coldChain === "Yes" ? `<button class="classic-button" type="button" id="batchchecker-generate-pcl-cold">${batchCheckerColdPclPrintedRows[rowKey] ? "Reprint PCL Cold Chain Continuation" : "Print PCL Cold Chain Continuation"}</button>` : ""}
        </div>
      </div>
    `;
  }

  const signed = rows.filter((row) => isBatchCheckerPclComplete(row)).length;
  const verified = rows.filter((row) => batchCheckerVerifiedRows[getBatchCheckerRowKey(row)]).length;
  const selectedKey = selectedRow ? getBatchCheckerRowKey(selectedRow) : "";
  const selectedVerified = selectedRow && batchCheckerVerifiedRows[selectedKey];
  const selectedColdChain = selectedRow && selectedRow.coldChain === "Yes";
  const tableRowsHtml = rows.map((row, index) => {
    const rowKey = getBatchCheckerRowKey(row);
    const isPclGenerated = isBatchCheckerPclComplete(row);
    const verificationSaved = hasBatchCheckerSavedVerification(row);
    const lineChecked = Boolean(batchCheckerCheckedRows[rowKey]);
    const selected = selectedBatchCheckerRowKey === index;
    const scanRef = row.productId || row.objId || index;
    const supplierInvoice = getRpPackCreationDocument(row.orderNo, "supplier-invoice");
    return `
      <tr class="${selected ? "selected-row" : ""} ${lineChecked ? "batchchecker-checked-row" : ""} ${verificationSaved && !isPclGenerated ? "batchchecker-verified-row" : ""} ${isPclGenerated ? "pcl-generated-row" : ""}" data-batchchecker-row-index="${index}">
        <td class="batchchecker-select-cell"><button class="batchchecker-row-arrow" type="button" data-batchchecker-split="${index}" title="Split batch and enter the new Batch No, Quantity, and Expiry Date">&#9656;</button><input type="checkbox" data-batchchecker-row-select="${index}" ${selected ? "checked" : ""}></td>
        <td>${row.foreignName || row.product || row.description || ""}</td>
        <td>${row.strength || ""}</td>
        <td>${row.packSize || ""}</td>
        <td>${row.ecma || ""}</td>
        <td>${row.batchNo || ""}</td>
        <td class="batchchecker-readonly-value">${row.expiryDate || ""}</td>
        <td class="batchchecker-readonly-value">${row.qty || ""}</td>
        <td class="batchchecker-readonly-value">${row.boxes || ""}</td>
        <td class="manufacturer-cell ${row.manufacturer ? "" : "missing-manufacturer"}" data-batchchecker-mfg-click="${index}">${row.manufacturer || "Select manufacturer"}</td>
        <td>${row.foreignEcn || row.foreignLicense || ""}</td>
        <td>${row.partNo || ""}</td>
        <td>${row.imp || row.orderNo || ""}</td>
        <td>${row.printType || ""}</td>
        <td>${row.invoice || ""}</td>
        <td>${row.invoiceDate || ""}</td>
        <td><button class="classic-button small" type="button" data-batchchecker-view-invoice="${index}" title="${supplierInvoice ? `Open ${supplierInvoice.fileName}` : "Supplier invoice is not available in RPi Pack Creation"}" ${supplierInvoice ? "" : "disabled"}>View invoice</button></td>
        <td><button class="classic-button small" type="button" data-batchchecker-view-mockup="${scanRef}">Product Mockup</button></td>
        <td><button class="classic-button small" type="button" data-batchchecker-view-scan="${scanRef}">Raw Pack Scans</button></td>
        <td><button class="classic-button small" type="button" data-batchchecker-view-supplier-declaration="${index}">Supplier Declaration</button></td>
        <td><button class="classic-button small" type="button" data-batchchecker-view-temperature-record="${index}">Temperature Record</button></td>
        <td>${row.supplier || row.foreignLicense || ""}</td>
        <td>${row.reviewDate || ""}</td>
        <td>${row.country || ""}</td>
        <td>${row.originCountry || row.country || ""}</td>
        <td>${row.actionCount || ""}</td>
        <td>${row.ifsPartNo || row.partNo || ""}</td>
        <td>${row.batchChecker || row.checker || ""}</td>
        <td>${row.batchCheckDate || (batchCheckerVerifiedRows[rowKey] ? batchCheckerVerifiedRows[rowKey].date : "")}</td>
        <td>${row.description || row.product || row.foreignName || ""}</td>
        <td>${row.prodStatus || ""}</td>
        <td>${isPclGenerated ? "PCL Generated" : (row.status || getBatchCheckerStatusText(row))}</td>
        <td>${row.warehouse || ""}</td>
        <td>${row.product || row.description || row.foreignName || ""}</td>
        <td>${row.productId || ""}</td>
        <td>${row.mfgId || ""}</td>
        <td>${row.contractSign || ""}</td>
        <td>${row.contractStatus || ""}</td>
        <td>${row.category || ""}</td>
        <td>${row.comments || ""}</td>
        <td>${row.objId || ""}</td>
        <td>${row.piObjId || ""}</td>
        <td>${row.packingId || ""}</td>
        <td>${row.site || ""}</td>
        <td>${row.coldChain || ""}</td>
        <td>${row.controlDr || ""}</td>
        <td>${row.foreignLeaflet || ""}</td>
      </tr>
    `;
  }).join("");

  return `
    <div class="batchchecker-live-layout">
      <div class="batchchecker-live-header">
        <button class="classic-button" type="button" data-batchchecker-back-list>Back to Approved PO List</button>
        <div><h3>PO Dashboard - ${batchCheckerSelectedPo}</h3></div>
      </div>

      <div class="batchchecker-check-table-wrap detailed-list">
        <table class="classic-table batchchecker-dashboard-table batchchecker-product-list">
          <thead><tr><th>Select</th><th>FOREIGN_NAME</th><th>STRENGTH</th><th>PACKSIZE</th><th>ECMA</th><th>BATCHNO</th><th>EXPIRATION</th><th>QUANTITY</th><th>GOODS_IN_BOXES</th><th>Manufacturer</th><th>FOREIGN_ECN</th><th>PARTNO</th><th>IMP</th><th>PRINT_TYPE</th><th>INVOICENO</th><th>INVOICEDATE</th><th>INVOICE_FILE</th><th>Product Mockup</th><th>Raw Pack Scans</th><th>Supplier Declaration</th><th>Temperature Record</th><th>SUPPLIER</th><th>REVIEWDATE</th><th>COUNTRY</th><th>ORIGINCOUNTRY</th><th>ACTION_COUNT</th><th>IFS_PART_NO</th><th>BATCH_CHECKER</th><th>BATCH_CHECK_DATE</th><th>DESCRIPTION</th><th>PROD_STATUS</th><th>STATUS</th><th>WAREHOUSE</th><th>PRODUCT</th><th>PRODUCT_ID</th><th>MFG_ID</th><th>CONTRACT_SIGN</th><th>CONTRACT_STATUS</th><th>CATEGORY</th><th>COMMENTS</th><th>OBJID</th><th>PIOBJID</th><th>PACKING_ID</th><th>SITE</th><th>Cold Chain</th><th>CONTROL_DR</th><th>FOREIGN_LEAFLET</th></tr></thead>
          <tbody>${tableRowsHtml || `<tr><td colspan="47" class="batchchecker-empty-cell">No product lines match the filters.</td></tr>`}</tbody>
        </table>
      </div>
      <div class="batchchecker-selected-actions">
        ${selectedRow ? `<span>Selected: ${selectedRow.product || selectedRow.description || selectedRow.batchNo}</span>` : ""}
        <button class="classic-button primary" type="button" id="batchchecker-btn-check">Batch Check</button>
        <button class="classic-button primary" type="button" id="batchchecker-generate-pcl">${selectedRow && batchCheckerPclGeneratedRows[getBatchCheckerRowKey(selectedRow)] ? "Reprint PCL" : "Print PCL"}</button>
        <button class="classic-button" type="button" id="batchchecker-generate-pcl-cold">${selectedRow && batchCheckerColdPclPrintedRows[getBatchCheckerRowKey(selectedRow)] ? "Reprint PCL Cold Chain Continuation" : "Print PCL Cold Chain Continuation"}</button>
        <button class="classic-button" type="button" id="batchchecker-print-box">${selectedRow && batchCheckerPrintedLabelRows[getBatchCheckerRowKey(selectedRow)] ? "Reprint Box Label" : "Print Box Label"}</button>
      </div>
    </div>
  `;
}
function updateBatchCheckerAvailability() {
  const rows = getBatchCheckerRows();
  const row = selectedBatchCheckerRowKey !== null ? rows[selectedBatchCheckerRowKey] : null;
  const rowKey = row ? getBatchCheckerRowKey(row) : "";
  const verificationSaved = hasBatchCheckerSavedVerification(row);
  const standardPclButton = document.querySelector("#batchchecker-generate-pcl");
  const coldPclButton = document.querySelector("#batchchecker-generate-pcl-cold");
  if (standardPclButton) {
    standardPclButton.disabled = !verificationSaved;
    standardPclButton.title = verificationSaved ? "Open PCL preview" : "Save Product Verification through Save Batch Check first.";
  }
  if (coldPclButton) {
    coldPclButton.disabled = !verificationSaved;
    coldPclButton.title = verificationSaved
      ? "Open PCL cold chain continuation preview"
      : "Save Product Verification through Save Batch Check first.";
  }
  document.querySelectorAll("#batchchecker-btn-check, #batchchecker-print-box, #batchchecker-detail-print-label").forEach((button) => {
    button.disabled = !row;
  });
}
function openBatchCheckerDocumentViewer(row, documentType) {
  const title = documentType === "temperature" ? "Temperature Record" : "Supplier Declaration";
  const subtitle = documentType === "temperature"
    ? "Temperature readings checked and within accepted parameters."
    : "Supplier declaration confirms goods comply with Article 51 and approved supplier sourcing.";
  const documentNo = documentType === "temperature" ? `TEMP-${row.orderNo || "PO"}-${row.batchNo || "BATCH"}` : `DECL-${row.orderNo || "PO"}-${row.batchNo || "BATCH"}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520">
      <rect width="760" height="520" fill="#f8fafc"/>
      <rect x="34" y="28" width="692" height="464" rx="10" fill="#ffffff" stroke="#b9c8d6" stroke-width="2"/>
      <rect x="34" y="28" width="692" height="62" rx="10" fill="#dfeef8"/>
      <text x="60" y="66" font-family="Segoe UI, Arial" font-size="24" font-weight="700" fill="#12395a">${title}</text>
      <text x="60" y="118" font-family="Segoe UI, Arial" font-size="15" fill="#334155">${subtitle}</text>
      <line x1="60" y1="145" x2="700" y2="145" stroke="#cbd5e1" stroke-width="2"/>
      <text x="60" y="185" font-family="Segoe UI, Arial" font-size="15" font-weight="700" fill="#0f172a">PO No</text>
      <text x="250" y="185" font-family="Segoe UI, Arial" font-size="15" fill="#0f172a">${row.orderNo || "-"}</text>
      <text x="60" y="225" font-family="Segoe UI, Arial" font-size="15" font-weight="700" fill="#0f172a">Supplier Name</text>
      <text x="250" y="225" font-family="Segoe UI, Arial" font-size="15" fill="#0f172a">${row.supplier || row.foreignLicense || "Supplier from PO"}</text>
      <text x="60" y="265" font-family="Segoe UI, Arial" font-size="15" font-weight="700" fill="#0f172a">Batch No</text>
      <text x="250" y="265" font-family="Segoe UI, Arial" font-size="15" fill="#0f172a">${row.batchNo || "-"}</text>
      <text x="60" y="305" font-family="Segoe UI, Arial" font-size="15" font-weight="700" fill="#0f172a">MFG Lot No</text>
      <text x="250" y="305" font-family="Segoe UI, Arial" font-size="15" fill="#0f172a">${getMfgLotNo(row) || "-"}</text>
      <text x="60" y="345" font-family="Segoe UI, Arial" font-size="15" font-weight="700" fill="#0f172a">Document Ref</text>
      <text x="250" y="345" font-family="Segoe UI, Arial" font-size="15" fill="#0f172a">${documentNo}</text>
      <rect x="60" y="385" width="640" height="58" rx="7" fill="#eef6fc" stroke="#cbd5e1"/>
      <text x="82" y="420" font-family="Segoe UI, Arial" font-size="15" font-weight="700" fill="#14532d">Viewed document preview for wireframe demonstration</text>
    </svg>`;
  const imgEl = document.querySelector("#image-viewer-img");
  imgEl.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  document.querySelector("#image-viewer-title").textContent = `${title} - ${row.batchNo || row.orderNo || "Document"}`;
  document.querySelector("#image-viewer-modal").classList.remove("hidden");
}
function openMfgPopup() {
  const mfgBody = document.querySelector("#mfg-popup-body");
  mfgBody.innerHTML = batchCheckerMfgList.map((mfg, idx) => `
    <tr class="${idx === 0 ? "selected-mfg-row" : ""}">
      <td><input type="radio" name="mfg-select-radio" value="${idx}" ${idx === 0 ? "checked" : ""}></td>
      <td><strong>${mfg.name}</strong></td>
      <td>${mfg.address}</td>
    </tr>
  `).join("");
  document.querySelector("#mfg-popup-modal").classList.remove("hidden");
}

function openSplitBatchPopup(idx) {
  selectedBatchCheckerRowIndexForSplit = idx;
  const rows = getBatchCheckerRows();
  const row = rows[idx];
  document.querySelector("#split-batch-no").value = "";
  document.querySelector("#split-qty").value = row.qty;
  document.querySelector("#split-exp").value = row.expiryDate;
  document.querySelector("#split-batch-modal").classList.remove("hidden");
}

function openBatchCheckVerifyPopup() {
  const rows = getBatchCheckerRows();
  const row = rows[selectedBatchCheckerRowKey];
  if (!row) {
    statusMessage.textContent = "Select one product line before opening Batch Check.";
    return;
  }

  const items = getBatchCheckerVerificationItems(row);
  const checks = getBatchCheckerLineChecks(row);
  const modal = document.querySelector("#batch-check-verify-modal");
  const body = modal.querySelector(".confirm-body");
  const title = modal.querySelector("#batch-check-verify-title");
  if (title) title.textContent = "Batch Check - Product Verification";

  body.innerHTML = `
    <h3 style="margin-bottom: 8px;">Checklist</h3>
    <p style="font-size: 11px; margin-bottom: 12px; color: #555;">Confirm every product detail against the supplier documents and raw pack scans before generating the PCL.</p>
    <div class="batchcheck-verification-grid">
      ${items.map((item, index) => `
        <label class="batchcheck-verification-row">
          <input type="checkbox" data-batchcheck-field-check="${index}" ${checks[index] ? "checked" : ""}>
          <span class="batchcheck-verification-label">${item.label}</span>
          <strong class="batchcheck-verification-value">${item.value}</strong>
        </label>
      `).join("")}
    </div>
    <div class="confirm-actions" style="justify-content: center; margin-top: 14px;">
      <button class="classic-button primary" type="button" id="batch-check-confirm-btn">Save Batch Check</button>
      <button class="classic-button" type="button" data-close-batch-check-verify>Cancel</button>
    </div>
  `;

  modal.classList.remove("hidden");
}

function updatePclSubmissionAvailability() {
  const submitBtn = document.querySelector("#pcl-clearance-submit-btn");
  const rows = getBatchCheckerRows();
  const row = rows[selectedBatchCheckerRowKey];
  if (!submitBtn || !row) return;

  const checks = getBatchCheckerLineChecks(row);
  const verificationSaved = hasBatchCheckerSavedVerification(row);
  const incompleteCount = checks.filter((checked) => !checked).length;
  const commentEditor = document.querySelector("#batchchecker-pcl-comments");
  const comment = String(commentEditor ? commentEditor.textContent : row.comments || "").trim();
  const commentRequired = incompleteCount > 0;
  const missingRequiredComment = commentRequired && !comment;
  const notice = document.querySelector("#batchchecker-pcl-regulatory-notice");

  submitBtn.disabled = !verificationSaved || missingRequiredComment;
  submitBtn.title = !verificationSaved
    ? "Save Product Verification through Save Batch Check before printing."
    : missingRequiredComment
      ? "Enter a regulatory comment explaining the incomplete Batch Check before printing."
      : "Ready to print PCL";
  if (notice) {
    notice.classList.toggle("resolved", commentRequired && Boolean(comment));
    const state = notice.querySelector("[data-pcl-regulatory-state]");
    if (state) state.textContent = comment ? "Comment entered â€” printing is enabled." : "Enter a comment to enable Print PCL.";
  }
}
function renderBatchCheckerPclPages(row, isVerified, printMode, regulatoryCommentRequired, pclComment, incompleteBatchCheckCount) {
  const mfg = batchCheckerMfgList.find(m => m.name === row.manufacturer);
  const mfgAddress = mfg ? mfg.address : (row.manufacturer ? row.manufacturer : "5th km Paiania - Markopoulo, Koropi Attiki, 194 00, Greece");

  const checkDetails = isVerified ? `${isVerified.checker}, ${isVerified.time || "15:45:00"}, ${isVerified.date}` : '';
  const includeColdContinuation = printMode === "cold-continuation" || row.coldChain === "Yes";
  const totalPages = includeColdContinuation ? 2 : 1;

  let page2Html = "";
  if (includeColdContinuation) {
    page2Html = `
  <!-- Page Break or Separator -->
  <div style="page-break-before: always; margin-top: 25px; border-top: 2px dashed #000; padding-top: 25px;"></div>
  
  <div class="pcl-sheet" style="font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; padding: 20px; border: 1px solid #000; line-height: 1.4; box-sizing: border-box; margin-top: 15px;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
      <div style="display: flex; align-items: center; gap: 8px;">
<div style="position: relative; width: 40px; height: 40px;">
  <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #0f52ba; top: 0; left: 0; opacity: 0.85;"></div>
  <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #228b22; bottom: 0; right: 0; opacity: 0.85; display: flex; align-items: center; justify-content: center;">
    <strong style="color: #0f52ba; font-size: 12px; font-family: 'Times New Roman', serif;">B&S</strong>
  </div>
</div>
<div>
  <div style="font-size: 14px; font-weight: bold; color: #0b3c5d; letter-spacing: 0.5px; line-height: 1.1;">B&S HEALTHCARE</div>
  <div style="font-size: 8px; color: #666; letter-spacing: 1px;">PARALLEL IMPORT</div>
</div>
      </div>
      <div style="display: flex; gap: 1px; height: 30px; align-items: flex-end;">
<div style="width: 2px; height: 25px; background: #000;"></div>
<div style="width: 1px; height: 25px; background: #000;"></div>
<div style="width: 3px; height: 25px; background: #000;"></div>
<div style="width: 1px; height: 25px; background: #000;"></div>
<div style="width: 2px; height: 25px; background: #000;"></div>
<div style="width: 4px; height: 25px; background: #000;"></div>
<div style="width: 1px; height: 25px; background: #000;"></div>
<div style="width: 2px; height: 25px; background: #000;"></div>
<div style="width: 3px; height: 25px; background: #000;"></div>
      </div>
    </div>
  
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 15px; text-decoration: underline; font-weight: bold; letter-spacing: 1px; color: #111;">CHECKLIST CONTINUATION</h2>
    </div>
  
    <div style="margin-bottom: 15px; font-size: 11px;">
      <p>This continuation page contains temperature log verification for cold chain goods (+2C to +8C) during transit and receipt.</p>
      <div style="margin-bottom: 10px;">PO Number: <strong>${row.orderNo}</strong> | Batch No: <strong>${row.batchNo}</strong></div>
    </div>
  
    <!-- Temp logs table -->
    <table class="classic-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
      <thead>
<tr style="background: #f4f6f8;">
  <th style="border: 1px solid #000; padding: 4px;">Time/Date of Reading</th>
  <th style="border: 1px solid #000; padding: 4px;">Temp Recording Device ID</th>
  <th style="border: 1px solid #000; padding: 4px;">Minimum Temp (C)</th>
  <th style="border: 1px solid #000; padding: 4px;">Maximum Temp (C)</th>
  <th style="border: 1px solid #000; padding: 4px;">Satisfactory? (2C to 8C)</th>
  <th style="border: 1px solid #000; padding: 4px;">Verified By (Initial)</th>
</tr>
      </thead>
      <tbody>
<tr>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">${isVerified ? isVerified.date + ' ' + isVerified.time : ''}</td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">LOG-9921</td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">3.4 C</td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">5.8 C</td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes <input type="checkbox" checked disabled> No <input type="checkbox" disabled></td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">${isVerified ? isVerified.checker : 'batch.checker'}</td>
</tr>
<tr>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">&nbsp;</td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">&nbsp;</td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">&nbsp;</td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">&nbsp;</td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">Yes <input type="checkbox" disabled> No <input type="checkbox" disabled></td>
  <td style="border: 1px solid #000; padding: 4px; text-align: center;">&nbsp;</td>
</tr>
      </tbody>
    </table>
  
    <div style="border: 1px solid #000; padding: 10px; margin-bottom: 20px; font-weight: bold;">
      <div>Cold Chain Checklist:</div>
      <div style="font-weight: normal; margin-top: 8px;">
<label style="display: block; margin-bottom: 5px; cursor: pointer;"><input type="checkbox" class="pcl-checkbox" style="cursor: pointer;"> Transit Temp graph downloaded and checked</label>
<label style="display: block; margin-bottom: 5px; cursor: pointer;"><input type="checkbox" class="pcl-checkbox" style="cursor: pointer;"> No alarms or temperature excursions recorded</label>
<label style="display: block; cursor: pointer;"><input type="checkbox" class="pcl-checkbox" style="cursor: pointer;"> Quarantine status removed and cleared for batching</label>
      </div>
    </div>
  
    <!-- Footer -->
    <div style="display: flex; justify-content: space-between; font-size: 8px; color: #555; border-top: 1px solid #ccc; padding-top: 5px; font-family: Arial, sans-serif; line-height: 1.2; margin-top: 40px;">
      <div>
<div>Parent SOP SOP/PLPI/0002</div>
<div>Effective Date: 02Jan2025</div>
      </div>
      <div style="text-align: center; font-weight: bold;">Page 2 of 2</div>
      <div style="text-align: right;">
<div>Form Number F/PLPI/0002/002/v14</div>
<div>Review Date: 31Dec2026</div>
      </div>
    </div>
  </div>
    `;
  }

  const page1Html = `
<div class="pcl-sheet" style="font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; padding: 20px; border: 1px solid #000; line-height: 1.4; box-sizing: border-box;">
  
  <!-- Header: Logo on left, Barcode on right -->
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="position: relative; width: 40px; height: 40px;">
<div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #0f52ba; top: 0; left: 0; opacity: 0.85;"></div>
<div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #228b22; bottom: 0; right: 0; opacity: 0.85; display: flex; align-items: center; justify-content: center;">
  <strong style="color: #0f52ba; font-size: 12px; font-family: 'Times New Roman', serif;">B&S</strong>
</div>
      </div>
      <div>
<div style="font-size: 14px; font-weight: bold; color: #0b3c5d; letter-spacing: 0.5px; line-height: 1.1;">B&S HEALTHCARE</div>
<div style="font-size: 8px; color: #666; letter-spacing: 1px;">PARALLEL IMPORT</div>
      </div>
    </div>
    <div style="display: flex; gap: 1px; height: 30px; align-items: flex-end;">
      <div style="width: 2px; height: 25px; background: #000;"></div>
      <div style="width: 1px; height: 25px; background: #000;"></div>
      <div style="width: 3px; height: 25px; background: #000;"></div>
      <div style="width: 1px; height: 25px; background: #000;"></div>
      <div style="width: 2px; height: 25px; background: #000;"></div>
      <div style="width: 4px; height: 25px; background: #000;"></div>
      <div style="width: 1px; height: 25px; background: #000;"></div>
      <div style="width: 2px; height: 25px; background: #000;"></div>
      <div style="width: 3px; height: 25px; background: #000;"></div>
    </div>
  </div>

  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0; font-size: 15px; text-decoration: underline; font-weight: bold; letter-spacing: 1px; color: #111;">CHECKLIST</h2>
  </div>

  <!-- Initial Line Clearances -->
  <div style="margin-bottom: 15px; font-weight: bold; font-size: 11px;">
    <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
      <span>Line clearance by PCL and Invoice issuer (Initial, time and Date):</span>
      <span style="border-bottom: 1px solid #000; width: 250px; text-align: center; font-weight: normal; font-size: 10px; height: 14px;">${checkDetails}</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span>Line clearance verification before batch checking (Initial, time and Date):</span>
      <span style="border-bottom: 1px solid #000; width: 250px; text-align: center; font-weight: normal; font-size: 10px; height: 14px;">${checkDetails}</span>
    </div>
  </div>

  <!-- Fields with square check boxes on right -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 12px; gap: 20px;">
    <div style="display: flex; align-items: center;">
      <span style="font-weight: bold;">Controlled Drug Product:</span>
      <span style="width: 30px; height: 18px; border: 1px solid #000; margin-left: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">
${row.controlDr === 'Yes' ? 'X' : ''}
      </span>
    </div>
    <div style="display: flex; align-items: center;">
      <span style="font-weight: bold;">Cold Chain Product:</span>
      <span style="width: 30px; height: 18px; border: 1px solid #000; margin-left: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">
${row.coldChain === 'Yes' ? 'X' : ''}
      </span>
    </div>
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">PO No:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.orderNo || ''}</span>
    <input type="checkbox" data-pcl-default-checked="true" class="pcl-checkbox" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Supplier Name:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.supplier || row.foreignLicense || 'Supplier from PO'}</span>
    <input type="checkbox" data-pcl-default-checked="true" class="pcl-checkbox" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>
  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Contract Supplier:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.supplier} / ${row.contract || 'WHO'}</span>
    <input type="checkbox" data-pcl-default-checked="true" class="pcl-checkbox" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Product Name:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.product || row.description}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="product" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Strength & Pack Size:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.strength} & ${row.packSize}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="strengthPack" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">ECMA:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.ecma}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="ecma" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 10px;">
    <span style="font-weight: bold; width: 100px; flex-shrink: 0;">Source Country:</span>
    <span style="border-bottom: 1px solid #000; width: 100px; padding-left: 8px; height: 16px;">${row.country}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="sourceCountry" style="width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;">
    
    <span style="font-weight: bold; margin-left: 10px; flex-shrink: 0;">Country of origin (if different from Source Country):</span>
    <span style="border-bottom: 1px solid #000; flex-grow: 1; padding-left: 8px; height: 16px; text-align: center;">${row.originCountry}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="originCountry" style="width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Invoice No:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.invoice}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="invoice" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 10px;">
    <span style="font-weight: bold; width: 170px; flex-shrink: 0;">Raw Product scans checked:</span>
    <span>Yes</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="rawScan" style="width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;">
    <span>No</span>
    <input type="checkbox" style="width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;">
    
    <span style="font-weight: bold; margin-left: auto; flex-shrink: 0;">Expiry:</span>
    <span style="border-bottom: 1px solid #000; width: 100px; padding-left: 8px; height: 16px; text-align: center;">${row.expiryDate}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="expiry" style="width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Batch No:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.batchNo}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="batch" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 10px;">
    <span style="font-weight: bold; width: 110px; flex-shrink: 0;">Quantity Received:</span>
    <span style="border-bottom: 1px solid #000; width: 100px; padding-left: 8px; height: 16px;">${row.qty}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="quantity" style="width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;">
    
    <span style="font-weight: bold; margin-left: auto; flex-shrink: 0;">All packs are in good condition</span>
    <input type="checkbox" data-pcl-default-checked="true" class="pcl-checkbox" style="width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;">
  </div>

  <div style="display: flex; align-items: center; margin-bottom: 8px;">
    <span style="font-weight: bold; flex-shrink: 0;">Number of boxes in this batch:</span>
    <span style="border: 1px solid #000; width: 60px; height: 18px; margin-left: 15px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">${row.boxes}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="boxes" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Manufacturer:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.manufacturer || '(Not Selected)'}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="manufacturer" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Manufacturer Address:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px; font-size: 9px; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;" title="${mfgAddress}">${mfgAddress}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="manufacturerAddress" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Foreign ECMA Holder:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.foreignLicense || 'Boehringer Ingelheim'}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="foreignEcma" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>

  <div class="pcl-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
    <span class="pcl-label" style="font-weight: bold; width: 140px; flex-shrink: 0;">Foreign leaflet Date:</span>
    <span class="pcl-value" style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 8px; height: 16px;">${row.foreignLeaflet || '04/2022'}</span>
    <input type="checkbox" class="pcl-checkbox" data-pcl-check-key="leafletDate" style="width: 16px; height: 16px; margin-left: 15px; flex-shrink: 0; cursor: pointer;">
  </div>
  <!-- Any Comments -->
  <div style="margin-top: 15px; margin-bottom: 15px;">
    <div style="font-weight: bold; text-decoration: underline; margin-bottom: 5px;">${regulatoryCommentRequired ? "Regulatory Comment (required):" : "Any Comments:"}</div>
    ${regulatoryCommentRequired ? `<div id="batchchecker-pcl-regulatory-notice" class="pcl-regulatory-comment-notice ${String(pclComment || "").trim() ? "resolved" : ""}"><strong>Incomplete Regulatory Review Copy</strong><span>${incompleteBatchCheckCount} verification item${incompleteBatchCheckCount === 1 ? " is" : "s are"} unchecked. A regulatory justification is required before this PCL can be printed.</span><em data-pcl-regulatory-state>${String(pclComment || "").trim() ? "Comment entered â€” printing is enabled." : "Enter a comment to enable Print PCL."}</em></div>` : ""}
    <div id="batchchecker-pcl-comments" class="${regulatoryCommentRequired ? "comment-required" : ""}" contenteditable="true" role="textbox" aria-label="PCL comments" data-placeholder="${regulatoryCommentRequired ? "Enter regulatory justification for the incomplete Batch Check" : "Add comments before printing"}" style="border: 1px solid #000; min-height: 40px; padding: 8px; background: #fffef2; font-family: monospace; outline: none; white-space: pre-wrap;">${pclComment || ''}</div>
    <div style="font-size: 9px; color: #555; margin-top: 4px;">Comments entered here will be included in the printed PCL.</div>
  </div>

  <!-- Checks carried out by -->
  <div style="font-weight: bold; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 15px; font-size: 11px;">
    <span>Checks carried out by: <span style="font-weight: normal; border-bottom: 1px solid #000; padding: 0 10px;">${isVerified ? isVerified.checker : 'batch.checker'}</span></span>
    <span>and found satisfactory on: <span style="font-weight: normal; border-bottom: 1px solid #000; padding: 0 10px;">${isVerified ? isVerified.date : ''}</span></span>
  </div>

  <!-- Footer -->
  <div style="display: flex; justify-content: space-between; font-size: 8px; color: #555; border-top: 1px solid #ccc; padding-top: 5px; font-family: Arial, sans-serif; line-height: 1.2;">
    <div>
      <div>Parent SOP SOP/PLPI/0002</div>
      <div>Effective Date: 02Jan2025</div>
    </div>
    <div style="text-align: center; font-weight: bold;">Page 1 of ${totalPages}</div>
    <div style="text-align: right;">
      <div>Form Number F/PLPI/0002/002/v14</div>
      <div>Review Date: 31Dec2026</div>
    </div>
  </div>
</div>
  `;

  return { page1Html, page2Html };
}

function openGeneratePclPopup(printMode = "standard") {
  batchCheckerPclPrintMode = printMode;
  const rows = getBatchCheckerRows();
  const row = rows[selectedBatchCheckerRowKey];
  if (!row) {
    statusMessage.textContent = "Select one Batch Checker line before generating PCL.";
    updateBatchCheckerAvailability();
    return;
  }
  
  const rowKey = getBatchCheckerRowKey(row);
  if (!hasBatchCheckerSavedVerification(row)) {
    statusMessage.textContent = "Save Product Verification through Save Batch Check before opening the PCL preview.";
    updateBatchCheckerAvailability();
    return;
  }
  const batchCheckValues = getBatchCheckerLineChecks(row);
  const incompleteBatchCheckCount = batchCheckValues.filter((checked) => !checked).length;
  const regulatoryCommentRequired = incompleteBatchCheckCount > 0;
  const storedPclComment = batchCheckerPclRegulatoryComments[rowKey];
  const pclComment = storedPclComment !== undefined ? storedPclComment : (regulatoryCommentRequired ? "" : (row.comments || ""));
  const isVerified = batchCheckerVerifiedRows[rowKey];
  const { page1Html, page2Html } = renderBatchCheckerPclPages(row, isVerified, printMode, regulatoryCommentRequired, pclComment, incompleteBatchCheckCount);

  const pclContainer = document.querySelector("#pcl-sheet-container");
  const coldRegulatoryCommentHtml = printMode === "cold-continuation" && regulatoryCommentRequired ? `
    <div class="pcl-cold-regulatory-comment">
      <div id="batchchecker-pcl-regulatory-notice" class="pcl-regulatory-comment-notice ${String(pclComment || "").trim() ? "resolved" : ""}"><strong>Incomplete Regulatory Review Copy</strong><span>${incompleteBatchCheckCount} verification item${incompleteBatchCheckCount === 1 ? " is" : "s are"} unchecked. A regulatory justification is required before this continuation can be printed.</span><em data-pcl-regulatory-state>${String(pclComment || "").trim() ? "Comment entered â€” printing is enabled." : "Enter a comment to enable printing."}</em></div>
      <label for="batchchecker-pcl-comments">Regulatory Comment (required)</label>
      <div id="batchchecker-pcl-comments" class="comment-required" contenteditable="true" role="textbox" aria-label="PCL comments" data-placeholder="Enter regulatory justification for the incomplete Batch Check">${pclComment || ""}</div>
    </div>
  ` : "";
  pclContainer.innerHTML = printMode === "cold-continuation" ? `${coldRegulatoryCommentHtml}${page2Html}` : page1Html;
  document.querySelector("#generate-pcl-title").textContent = printMode === "cold-continuation" ? "PCL Cold Chain Continuation" : "Product Check Log (PCL) Sheet";
  const printButton = document.querySelector("#pcl-clearance-submit-btn");
  if (printButton) printButton.textContent = printMode === "cold-continuation" ? "Print Cold Chain Continuation" : "Print PCL";

  const savedChecks = getBatchCheckerLineChecks(row);
  const savedCheckMap = Object.fromEntries(
    getBatchCheckerVerificationItems(row).map((item, index) => [item.key, Boolean(savedChecks[index])])
  );
  document.querySelectorAll("#pcl-sheet-container .pcl-checkbox").forEach((checkbox) => {
    const checkKey = checkbox.dataset.pclCheckKey;
    checkbox.checked = checkKey ? Boolean(savedCheckMap[checkKey]) : checkbox.dataset.pclDefaultChecked === "true";
    checkbox.disabled = true;
  });
  const lineClearance = document.querySelector("#chk-line-clearance");
  if (lineClearance) lineClearance.checked = true;
  document.querySelector("#generate-pcl-modal").classList.remove("hidden");
  updatePclSubmissionAvailability();
  if (regulatoryCommentRequired && !String(pclComment || "").trim()) {
    statusMessage.textContent = `A regulatory comment is required because ${incompleteBatchCheckCount} Batch Check item${incompleteBatchCheckCount === 1 ? " is" : "s are"} incomplete.`;
  }
}

function loadChangeOfPackSizeData() {
  try {
    const saved = window.localStorage.getItem(CHANGE_OF_PACK_SIZE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function persistChangeOfPackSizeData() {
  try {
    window.localStorage.setItem(CHANGE_OF_PACK_SIZE_STORAGE_KEY, JSON.stringify(changeOfPackSizeData));
  } catch (error) {
    return;
  }
}

function isChangeOfPackSizeComplete(product) {
  if (!product || product.routeType !== "Reboxing") return true;
  const data = changeOfPackSizeData[product.batch];
  if (!data) return false;
  const received = data.receivedAs || {};
  const assembled = data.assembledAs || {};
  const receivedComplete = Boolean(received.ecma && received.packSize && received.blisterPerPack && received.qty && received.totalBlisters && received.initials);
  const assembledComplete = Boolean(assembled.ecma && assembled.packSize && assembled.blisterPerPack && assembled.finishedQty && assembled.initials);
  return Boolean(receivedComplete && assembledComplete);
}

function renderChangeOfPackSizeForm(batchNumber, isReadOnly, stage, isQcSignOnly = false) {
  const product = bnsProducts.find(p => p.batch === batchNumber);
  if (!product) return "";
  
  if (!changeOfPackSizeData[batchNumber]) {
    changeOfPackSizeData[batchNumber] = {
      receivedAs: {
ecma: product.ecma || "",
packSize: product.receivedPackSize || product.packSize || "",
blisterPerPack: product.receivedBlisterPerPack || "10",
qty: product.quantity || "",
totalBlisters: (parseInt(product.quantity) || 0) * (parseInt(product.receivedBlisterPerPack) || 10),
initials: ""
      },
      assembledAs: {
ecma: product.ecma || "",
packSize: product.packSize || "",
blisterPerPack: product.assembledBlisterPerPack || product.receivedBlisterPerPack || "10",
finishedQty: product.quantity || "",
surplus: "0",
initials: ""
      },
      printerAmendmentsInitials: "",
      qcAmendmentsInitials: ""
    };
    persistChangeOfPackSizeData();
  }
  
  const data = changeOfPackSizeData[batchNumber];
  const disableInputs = isReadOnly || isQcSignOnly ? "disabled" : "";
  const amendmentSignDisabled = !isQcSignOnly || isReadOnly ? "disabled" : "";
  const record = cartonPrintRecords[batchNumber] || {};
  
  return `
    <section class="change-of-pack-size-container reboxing-form-card">
      <!-- Header -->
      <div class="reboxing-form-header">
<div class="reboxing-form-heading">
  <span>REBOXING</span>
  <h3>Change of Pack Size</h3>
</div>
<div class="reboxing-form-meta">
  <div>Form Number: F/PLPI/0044/001/v7</div>
</div>
      </div>
      
      <!-- Top Details Table -->
      <table class="reboxing-summary-table">
<tr>
  <td style="width: 25%; padding: 4px 6px; font-weight: bold; background: #f0f4f8; border-right: 1px solid #000; border-bottom: 1px solid #000;">PRODUCT NAME</td>
  <td style="padding: 4px 6px; border-bottom: 1px solid #000; border-right: 1px solid #000;">${product.product}</td>
  <td style="width: 25%; padding: 4px 6px; font-weight: bold; background: #f0f4f8; border-bottom: 1px solid #000; border-right: 1px solid #000;">INT. BATCH NUMBER</td>
  <td style="padding: 4px 6px; border-bottom: 1px solid #000; font-weight: bold;">${product.batch}</td>
</tr>
<tr>
  <td style="padding: 4px 6px; font-weight: bold; background: #f0f4f8; border-right: 1px solid #000;">STRENGTH</td>
  <td style="padding: 4px 6px;" colspan="3">${product.strength}</td>
</tr>
      </table>

      <!-- RECEIVED AS Section -->
      <div class="reboxing-section-title">Received As</div>
      <table class="reboxing-data-table">
<thead>
  <tr style="background: #f0f4f8; border-bottom: 1px solid #000; font-weight: bold; text-align: center;">
    <td style="padding: 4px; border-right: 1px solid #000; width: 20%;">ECMA</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 16%;">PACK SIZE</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 16%;">NO. OF BLISTER/PACK</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 12%;">QTY</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 16%;">TOTAL BLISTERS</td>
    <td style="padding: 4px; width: 20%;">INITIAL AND DATE</td>
  </tr>
</thead>
<tbody>
  <tr style="text-align: center;">
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="text" data-ps-batch="${batchNumber}" data-ps-section="receivedAs" data-ps-field="ecma" value="${data.receivedAs.ecma}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="text" data-ps-batch="${batchNumber}" data-ps-section="receivedAs" data-ps-field="packSize" value="${data.receivedAs.packSize}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="number" data-ps-batch="${batchNumber}" data-ps-section="receivedAs" data-ps-field="blisterPerPack" value="${data.receivedAs.blisterPerPack}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="number" data-ps-batch="${batchNumber}" data-ps-section="receivedAs" data-ps-field="qty" value="${data.receivedAs.qty}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="number" data-ps-batch="${batchNumber}" data-ps-section="receivedAs" data-ps-field="totalBlisters" value="${data.receivedAs.totalBlisters}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; font-size: 9px; vertical-align: middle;">
      ${data.receivedAs.initials ? `
<div style="color: #0d9488; font-weight: bold; line-height: 1.1;">
  Signed ${data.receivedAs.initials}
  ${!isReadOnly && !isQcSignOnly ? `<button type="button" class="classic-button" data-ps-clear-sig="receivedAs" data-ps-batch="${batchNumber}" style="background: #ef4444; color: #fff; border: none; font-size: 8px; padding: 1px 3px; cursor: pointer; margin-top: 2px; border-radius: 2px; line-height: 1;">Clear</button>` : ""}
</div>
      ` : `
<button type="button" class="classic-button primary" data-ps-sign="receivedAs" data-ps-batch="${batchNumber}" ${disableInputs} style="font-size: 9px; padding: 2px 4px; height: auto; line-height: 1;">Sign</button>
      `}
    </td>
  </tr>
</tbody>
      </table>

      <!-- ASSEMBLED AS Section -->
      <div class="reboxing-section-title">Assembled As</div>
      <table class="reboxing-data-table">
<thead>
  <tr style="background: #f0f4f8; border-bottom: 1px solid #000; font-weight: bold; text-align: center;">
    <td style="padding: 4px; border-right: 1px solid #000; width: 20%;">ECMA</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 16%;">PACK SIZE</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 16%;">NO. OF BLISTER/PACK</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 12%;">FINISHED QTY</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 16%;">SURPLUS BLISTER (IF ANY)</td>
    <td style="padding: 4px; width: 20%;">INITIAL AND DATE</td>
  </tr>
</thead>
<tbody>
  <tr style="text-align: center;">
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="text" data-ps-batch="${batchNumber}" data-ps-section="assembledAs" data-ps-field="ecma" value="${data.assembledAs.ecma}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="text" data-ps-batch="${batchNumber}" data-ps-section="assembledAs" data-ps-field="packSize" value="${data.assembledAs.packSize}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="number" data-ps-batch="${batchNumber}" data-ps-section="assembledAs" data-ps-field="blisterPerPack" value="${data.assembledAs.blisterPerPack}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="number" data-ps-batch="${batchNumber}" data-ps-section="assembledAs" data-ps-field="finishedQty" value="${data.assembledAs.finishedQty}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; border-right: 1px solid #000;"><input type="text" data-ps-batch="${batchNumber}" data-ps-section="assembledAs" data-ps-field="surplus" value="${data.assembledAs.surplus}" style="width: 95%; text-align: center; border: 1px solid #ccc; font-size: 10px; padding: 2px;" ${disableInputs}></td>
    <td style="padding: 4px; font-size: 9px; vertical-align: middle;">
      ${data.assembledAs.initials ? `
<div style="color: #0d9488; font-weight: bold; line-height: 1.1;">
  Signed ${data.assembledAs.initials}
  ${!isReadOnly && !isQcSignOnly ? `<button type="button" class="classic-button" data-ps-clear-sig="assembledAs" data-ps-batch="${batchNumber}" style="background: #ef4444; color: #fff; border: none; font-size: 8px; padding: 1px 3px; cursor: pointer; margin-top: 2px; border-radius: 2px; line-height: 1;">Clear</button>` : ""}
</div>
      ` : `
<button type="button" class="classic-button primary" data-ps-sign="assembledAs" data-ps-batch="${batchNumber}" ${disableInputs} style="font-size: 9px; padding: 2px 4px; height: auto; line-height: 1;">Sign</button>
      `}
    </td>
  </tr>
</tbody>
      </table>

      <!-- AMENDMENTS ON BAR Section -->
      <div class="reboxing-section-title">Amendments on BAR</div>
      <table class="reboxing-data-table reboxing-amendments-table">
<thead>
  <tr style="background: #f0f4f8; border-bottom: 1px solid #000; font-weight: bold; text-align: center;">
    <td style="padding: 4px; border-right: 1px solid #000; width: 50%;">AMENDMENTS</td>
    <td style="padding: 4px; border-right: 1px solid #000; width: 25%;">PRINTER (INITIAL AND DATE)</td>
    <td style="padding: 4px; width: 25%;">PRE-ASSEMBLY QUALITY CHECKER (INITIAL AND DATE)</td>
  </tr>
</thead>
<tbody>
  <tr style="border-bottom: 1px solid #000;">
    <td style="padding: 6px 8px; border-right: 1px solid #000; text-align: left; font-weight: 500;">CHANGE MADE IN PACK QUANTITY IN PROCESS 1 and LAST PAGE</td>
    <td style="padding: 6px; border-right: 1px solid #000; text-align: center; font-size: 9px; vertical-align: middle;" rowspan="2">
      ${data.printerAmendmentsInitials ? `
<div style="color: #0d9488; font-weight: bold; line-height: 1.1;">
  Signed ${data.printerAmendmentsInitials}
  ${isQcSignOnly && !isReadOnly ? `<button type="button" class="classic-button" data-ps-clear-sig="printerAmendments" data-ps-batch="${batchNumber}" style="background: #ef4444; color: #fff; border: none; font-size: 8px; padding: 1px 3px; cursor: pointer; margin-top: 2px; border-radius: 2px; line-height: 1;">Clear</button>` : ""}
</div>
      ` : `
<button type="button" class="classic-button primary" data-ps-sign="printerAmendments" data-ps-batch="${batchNumber}" ${amendmentSignDisabled} style="font-size: 9px; padding: 2px 4px; height: auto; line-height: 1;">Sign</button>
      `}
    </td>
    <td style="padding: 6px; text-align: center; font-size: 9px; vertical-align: middle;" rowspan="2">
      ${data.qcAmendmentsInitials ? `
<div style="color: #0d9488; font-weight: bold; line-height: 1.1;">
  Signed ${data.qcAmendmentsInitials}
  ${isQcSignOnly && !isReadOnly ? `<button type="button" class="classic-button" data-ps-clear-sig="qcAmendments" data-ps-batch="${batchNumber}" style="background: #ef4444; color: #fff; border: none; font-size: 8px; padding: 1px 3px; cursor: pointer; margin-top: 2px; border-radius: 2px; line-height: 1;">Clear</button>` : ""}
</div>
      ` : `
<button type="button" class="classic-button primary" data-ps-sign="qcAmendments" data-ps-batch="${batchNumber}" ${!isQcSignOnly || isReadOnly ? "disabled" : ""} style="font-size: 9px; padding: 2px 4px; height: auto; line-height: 1;">Sign</button>
      `}
    </td>
  </tr>
  <tr>
    <td style="padding: 6px 8px; border-right: 1px solid #000; text-align: left; font-weight: 500;">CHANGES MADE FOR RECONCILIATION ON PROCESS 8</td>
  </tr>
</tbody>
      </table>

      <!-- SOP Footer -->
      <div class="reboxing-form-footer">
<div>
  <div>Parent SOP: SOP/PLPI/0044</div>
  <div>Effective Date: 03Aug2024</div>
</div>
<div style="text-align: right;">
  <div>Form Number: F/PLPI/0044/001/v7</div>
  <div>Review Date: 02Aug2026</div>
</div>
      </div>
    </section>
  `;
}

function renderRpApprovalFormInteractive(activePoKey, isApprovedByRp, stage) {
  const details = getRpApprovalPrefilledDetails(activePoKey);
  const answers = rpApprovalAnswers[activePoKey] || (rpApprovalAnswers[activePoKey] = {});
  const comments = rpApprovalComments[activePoKey] || "";
  const diagnosticBatch = isRpWorkflowSetDiagnostic(getRpMergePoNos(activePoKey));
  if (diagnosticBatch) {
    ["art51-decl", "fmd-compliance", "fmd-decom"].forEach((field) => {
      if (answers[field] === undefined) answers[field] = "NA";
    });
  }
  
  const renderPillOptions = (field, hasNa = false) => {
    const val = answers[field];
    const disableAttr = isApprovedByRp ? "disabled" : "";
    const verifiedSource = getRpApprovalVerifiedDocumentSource(activePoKey, field);
    return `
      <div class="modern-check-options ${verifiedSource ? "document-synced" : ""}">
        <button type="button" class="modern-pill-btn ${val === "Y" || val === true ? "active-yes" : ""}" data-rp-field="${field}" data-val="Y" ${disableAttr}>YES</button>
        <button type="button" class="modern-pill-btn ${val === "N" || val === false ? "active-no" : ""}" data-rp-field="${field}" data-val="N" ${disableAttr}>NO</button>
        ${hasNa ? `
          <button type="button" class="modern-pill-btn ${val === "NA" ? "active-na" : ""}" data-rp-field="${field}" data-val="NA" ${disableAttr}>N/A</button>
        ` : ""}
        ${verifiedSource ? `<span class="rp-auto-verified-note">Marked from ${verifiedSource}</span>` : ""}
      </div>
    `;
  };

  return `
    <div style="padding: 15px; background: #f8fafc; border-radius: 8px; font-family: Tahoma, sans-serif;">
      <h3 class="rp-checklist-heading">Checklist</h3>
      
      <!-- Custom Details Check Card -->
      <div class="modern-checklist-section">
        <div class="modern-checklist-title">1. Custom Details Check</div>
        <div class="modern-check-card">
          <span class="modern-check-question">EORI Verification</span>
          ${renderPillOptions("eori")}
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">Commodity Code Verification</span>
          ${renderPillOptions("commodity")}
        </div>
      </div>
      
      <!-- Supplier Compliance Check Card -->
      <div class="modern-checklist-section">
        <div class="modern-checklist-title">2. Supplier Compliance Check</div>
        <div class="modern-check-card supplier-status-card">
          <div class="supplier-status-row">
            <span class="modern-check-question">Supplier Status in FE</span>
            <div class="modern-check-options">
              <button type="button" class="modern-pill-btn ${answers["fe-status"] === "Y" ? "active-yes" : ""}" data-rp-field="fe-status" data-val="Y" ${isApprovedByRp ? "disabled" : ""}>Active</button>
              <button type="button" class="modern-pill-btn ${answers["fe-status"] === "N" ? "active-no" : ""}" data-rp-field="fe-status" data-val="N" ${isApprovedByRp ? "disabled" : ""}>Inactive</button>
            </div>
          </div>
          <label class="inactive-reason-field">
            <span>Give Reason if Inactive${answers["fe-status"] === "N" ? " *" : ""}</span>
            <input type="text" id="rp-form-inactive-reason" value="${answers["inactive-reason"] || ""}" ${isApprovedByRp ? "disabled" : ""} placeholder="Enter reason when Inactive is selected">
          </label>
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">Is the collection address matches with the WDA?</span>
          ${renderPillOptions("wda-match")}
        </div>
      </div>
      
      <!-- Temperature Compliance Card -->
      <div class="modern-checklist-section">
        <div class="modern-checklist-title">3. Temperature Compliance During Transit</div>
        <div class="modern-check-card">
          <span class="modern-check-question">Stock Transported by Authorised Transporter?</span>
          ${renderPillOptions("transporter")}
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">Temperature records in transit checked and within parameters</span>
          ${renderPillOptions("temp-transit")}
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">Temperature Records at Storage Site checked and within parameters</span>
          ${renderPillOptions("temp-storage", true)}
        </div>
      </div>
      
      <!-- Article 51 Compliance Card -->
      <div class="modern-checklist-section">
        <div class="modern-checklist-title">4. Compliance check in line with Article 51 of Directive 2001/83/EC ${diagnosticBatch ? `<span class="rp-diagnostic-na-label">Diagnostic batch · Supplier Declaration not required</span>` : ""}</div>
        <div class="modern-check-card">
          <span class="modern-check-question">Supplier declaration that all Goods on delivery note comply with Article 51 of Directive 2001/83/EC and sourced from approved suppliers</span>
          ${renderPillOptions("art51-decl", diagnosticBatch)}
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">Does the declaration contain compliance with FMD</span>
          ${renderPillOptions("fmd-compliance", diagnosticBatch)}
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">Does the declaration states that all FMD applicable products has been Decommissioned in accordance with FMD 2011/62/EU</span>
          ${renderPillOptions("fmd-decom", diagnosticBatch)}
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">Italian and Greek packs checked for presence of Bollino/Vignate stickers</span>
          ${renderPillOptions("bollino", true)}
        </div>
      </div>
      
      <!-- Conclusion Card -->
      <div class="modern-checklist-section">
        <div class="modern-checklist-title">5. Conclusion</div>
        <div style="padding: 10px 0;">
          <label style="font-size: 11px; font-weight: bold; color: #475569; display: block; margin-bottom: 4px;">RPi Comments:</label>
          <textarea id="rp-form-comments" style="width: 100%; height: 60px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px; font-size: 11px;" ${isApprovedByRp ? "disabled" : ""} placeholder="Enter any RPi comments...">${comments}</textarea>
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">RPi Checks completed and stock is suitable for processing</span>
          ${renderPillOptions("stock-suitable")}
        </div>
        <div class="modern-check-card">
          <span class="modern-check-question">Any Deviation to be raised?</span>
          ${renderPillOptions("deviation")}
        </div>
      </div>
    </div>
  `;
}

function mergeSelectedRpPos() {
  const poNos = [...rpMergeSelections];
  if (poNos.length < 2) return { ok: false, message: "Select at least two POs to merge." };
  const workflows = poNos.map((poNo) => rpPackWorkflows[poNo]).filter(Boolean);
  if (workflows.length !== poNos.length) return { ok: false, message: "One or more selected POs are not available." };
  if (workflows.some((workflow) => workflow.mergeGroupId)) return { ok: false, message: "A selected PO already belongs to a merged PO set." };
  const supplier = String(workflows[0].supplier || "").trim().toLowerCase();
  if (!supplier) return { ok: false, message: "Supplier must be recorded before POs can be merged." };
  const sameSupplier = workflows.every((workflow) => String(workflow.supplier || "").trim().toLowerCase() === supplier);
  if (!sameSupplier) return { ok: false, message: "POs can only be merged when the supplier is the same." };
  const groupId = `MRG-${Date.now()}`;
  rpMergeGroups[groupId] = { id: groupId, poNos, supplier: workflows[0].supplier, sharedDocIds: [...rpSharedDocumentIds] };
  workflows.forEach((workflow) => { workflow.mergeGroupId = groupId; });
  rpMergeSelections.clear();
  selectedRpPackPo = poNos[0];
  selectedRpApprovalPo = null;
  return { ok: true, message: `${poNos.length} POs merged for ${workflows[0].supplier}. Shared files now require one review.` };
}

function escapeQaChecklistText(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getQaChecklistReviewComplete(item) {
  return item?.qaDecisionChoice === "approved";
}

function renderGoodsReceivingChecklistDocument(item, interactive = true) {
  const data = item.checklistData || {};
  const checks = data.checks || [];
  const getCheck = (id) => checks.find((check) => check.id === id) || { id, answer: "â€”" };
  const renderSubmittedCheck = (check) => `<strong class="grc-answer ${check.answer === "No" ? "no" : "yes"}">${escapeQaChecklistText(check.answer)}</strong>`;
  const clean = getCheck("clean");
  const nonpharma = getCheck("nonpharma");
  const damage = getCheck("damage");
  const confirmed = getCheck("confirmed");
  const decision = item.qaDecisionChoice || (item.qaDecision ? "approved" : "");
  const qaName = item.qaDecision?.user || "";
  const qaDate = item.qaDecision?.dateTime || "";
  const receiverName = data.receiverName || item.raisedBy || "â€”";
  const receiverDate = data.receiverDate || item.raisedAt || "â€”";
  const goodsInName = data.goodsInTeamName || data.confirmedBy || item.goodsInTeamName || item.raisedBy || "â€”";
  const approvalComment = data.approvalComment || item.approvalComment || "N/A";
  const decisionControls = interactive ? `
    <label><input type="checkbox" data-qa-decision="quarantine" data-qa-decision-po="${item.poNo}" ${decision === "quarantine" ? "checked" : ""}> Quarantine for investigation</label>
    <label><input type="checkbox" data-qa-decision="approved" data-qa-decision-po="${item.poNo}" ${decision === "approved" ? "checked" : ""}> Approved for unpacking</label>
    <label><input type="checkbox" data-qa-decision="reject" data-qa-decision-po="${item.poNo}" ${decision === "reject" ? "checked" : ""}> Reject</label>
  ` : `
    <span>â˜ Quarantine for investigation</span>
    <span>${decision === "approved" ? "â˜‘" : "â˜"} Approved for unpacking</span>
    <span>${decision === "reject" ? "â˜‘" : "â˜"} Reject</span>
  `;
  const commentControl = interactive
    ? `<input type="text" data-qa-decision-comment="${item.poNo}" value="${escapeQaChecklistText(item.qaDecisionComment || "")}" aria-label="QA comment">`
    : `<span>${escapeQaChecklistText(item.qaDecision?.comment || item.qaDecisionComment || "N/A")}</span>`;
  return `
    <article class="grc-document" aria-label="Goods Receiving Check List document">
      <header class="grc-doc-head">
        <div class="grc-doc-brand">B&amp;S HEALTHCARE<br><span>PARALLEL IMPORT</span></div>
        <div class="grc-doc-title">GOODS RECEIVING<br>CHECK LIST</div>
        <div class="grc-doc-address">Gowrie Laxmico Ltd<br>Unit 4 Bradfield Road,<br>South Ruislip, HA4 0NU</div>
      </header>
      <table class="grc-doc-table">
        <thead><tr><th class="grc-type-col">TYPE</th><th>DETAIL</th></tr></thead>
        <tbody>
          <tr><td>PO Number:</td><td>${escapeQaChecklistText(data.poNumbers || item.poNo)}</td></tr>
          <tr><td>Supplier Name:</td><td>${escapeQaChecklistText(data.supplier || item.supplier)}</td></tr>
          <tr><td>Approved Transporter:</td><td>${escapeQaChecklistText(data.transporter || "VTS")}</td></tr>
          <tr><td>Vehicle No:</td><td class="grc-inline-detail grc-vehicle-detail"><span>${escapeQaChecklistText(data.vehicleNumber || "â€”")}</span><span>Driver's Name: ${escapeQaChecklistText(data.driverName || "â€”")}</span><span>Driver's Sign: <em class="grc-written-signature">${data.driverSigned ? escapeQaChecklistText(data.driverSignature || data.driverName || "Signed") : ""}</em></span></td></tr>
          <tr><td>Delivery / Collection<br>Address:</td><td>${escapeQaChecklistText(data.deliveryAddress || "1 Kranidioti 3, Pilea Thessaloniki, 55535, Greece")}</td></tr>
          <tr><td>Delivery / Collection Note:</td><td>${escapeQaChecklistText(data.deliveryNote || "N/A")}</td></tr>
          <tr><td>Delivery Vehicle:</td><td class="grc-doc-checks">
            <span>Cleanliness of vehicle: ${renderSubmittedCheck(clean)}</span>
            <span>No non-pharmaceutical products: ${renderSubmittedCheck(nonpharma)}</span>
            <span>Pallets / boxes undamaged: ${renderSubmittedCheck(damage)}</span>
          </td></tr>
          <tr><td>Goods Receiver Name:</td><td class="grc-inline-detail grc-receiver-detail"><span>${escapeQaChecklistText(receiverName)}</span><span>Sign: <em class="grc-written-signature">${data.receiverSigned ? escapeQaChecklistText(data.receiverSignature || receiverName) : ""}</em></span><span>Date: ${escapeQaChecklistText(receiverDate)}</span></td></tr>
          <tr><td>Goods Receiver Comments:</td><td>${escapeQaChecklistText(item.goodsInComment || data.receiverComments || "N/A")}</td></tr>
          <tr><td>Information Confirmed â€“<br>Goods In Team:</td><td class="grc-information-confirmed">
            <div class="grc-confirmation-line"><span>${renderSubmittedCheck(confirmed)}</span><span>Name: ${escapeQaChecklistText(goodsInName)}</span><span>Sign: <em class="grc-written-signature">${escapeQaChecklistText(data.goodsInSignature || goodsInName)}</em></span></div>
            <div class="grc-approval-comment">Approval comment: <strong>${escapeQaChecklistText(approvalComment)}</strong></div>
            <span class="grc-small">If YES start unpacking process as per SOP/PLPI/0002. If NO quarantine stock and pass documents to QA.</span>
          </td></tr>
          <tr><td>QA Decision:</td><td class="grc-qa-decisions"><div class="grc-decision-options">${decisionControls}</div><div class="grc-comment-line"><span>Comment:</span>${commentControl}</div></td></tr>
          <tr><td>QA Name:</td><td class="grc-qa-signoff"><span>${escapeQaChecklistText(qaName)}</span><span>Sign: ${item.qaDecision ? `<em class="grc-written-signature">${escapeQaChecklistText(qaName)}</em>` : "____________________"}</span><span>Date: ${escapeQaChecklistText(qaDate || "________________")}</span></td></tr>
        </tbody>
      </table>
      <footer class="grc-doc-foot"><span>Page 1 of 1</span><span>Goods Receiving Check List/08/2023/v3</span></footer>
    </article>
  `;
}
function renderQaChecklistReviewModal(item) {
  const isQaDecisionPending = item.status === "Waiting for QA decision";
  const readyToApprove = getQaChecklistReviewComplete(item);
  return `
    <div class="qa-checklist-modal-backdrop" id="qa-checklist-review-modal" role="dialog" aria-modal="true" aria-labelledby="qa-checklist-review-title">
      <div class="qa-checklist-modal-window grc-exact-modal">
        <div class="grc-review-toolbar"><div><strong id="qa-checklist-review-title">Goods Receiving Check List</strong><span>${isQaDecisionPending ? "Completed by Goods In and ready for QA decision" : "QA-approved checklist ready for acceptance"}</span></div><button type="button" class="qa-modal-close" data-close-qa-checklist-review aria-label="Close">&times;</button></div>
        <div class="qa-checklist-modal-body grc-exact-body">
          ${renderGoodsReceivingChecklistDocument(item, isQaDecisionPending)}
        </div>
        <footer class="qa-checklist-modal-footer grc-review-footer">
          <button type="button" class="classic-button" data-close-qa-checklist-review>Close</button>
          ${isQaDecisionPending ? `<div><span id="qa-approval-help">${readyToApprove ? "Approved for unpacking selected. Ready to approve." : "Select Approved for unpacking to continue."}</span><button type="button" class="classic-button primary" data-qa-modal-approve="${item.poNo}" ${readyToApprove ? "" : "disabled"}>Approve checklist</button></div>` : ""}
        </footer>
      </div>
    </div>
  `;
}

function downloadApprovedGoodsReceivingChecklist(poNo) {
  const item = checklistDecisionQueue.find((entry) => entry.poNo === poNo && entry.status === "Approved for unpacking");
  if (!item) return false;
  const checklistMarkup = renderGoodsReceivingChecklistDocument(item, false);
  const fileContent = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Goods Receiving Check List</title><style>
    *{box-sizing:border-box}body{background:#fff;color:#111;font:12px Arial,Helvetica,sans-serif;margin:0;padding:18px}.grc-document{display:grid;gap:10px;margin:0 auto;max-width:900px}.grc-doc-head{align-items:start;display:grid;gap:12px;grid-template-columns:1fr 1.2fr 1fr;text-align:center}.grc-doc-brand{font-weight:700;line-height:1.5;text-align:left}.grc-doc-brand span{font-size:10px;font-weight:400}.grc-doc-title{border-bottom:1px solid #111;border-top:1px solid #111;font-weight:700;line-height:1.5;padding:4px}.grc-doc-address{line-height:1.35;text-align:right}.grc-doc-table{border-collapse:collapse;table-layout:fixed;width:100%}.grc-doc-table th,.grc-doc-table td{border:1px solid #c7c7c7;padding:8px;text-align:left;vertical-align:top}.grc-doc-table th{font-weight:700}.grc-type-col{width:28%}.grc-doc-checks{line-height:1.8}.grc-inline-detail,.grc-qa-signoff{display:flex;gap:18px;justify-content:space-between}.grc-answer{font-weight:700}.grc-answer.no{color:#b91c1c}.grc-written-signature{font-family:cursive;font-size:16px}.grc-small{font-size:10px}.grc-decision-options{display:flex;gap:14px}.grc-comment-line{display:flex;gap:8px;margin-top:7px}.grc-doc-foot{display:flex;font-size:10px;justify-content:space-between;padding-top:10px}@media print{body{padding:0}}
  </style></head><body>${checklistMarkup}</body></html>`;
  const blob = new Blob([fileContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const poLabel = String(item.checklistData?.poNumbers || item.poNo).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/-+$/g, "");
  link.href = url;
  link.download = `Goods_Receiving_Checklist_${poLabel}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
function openQaChecklistReview(poNo) {
  const item = checklistDecisionQueue.find((entry) => entry.poNo === poNo);
  if (!item) return;
  document.querySelector("#qa-checklist-review-modal")?.remove();
  const container = document.createElement("div");
  container.innerHTML = renderQaChecklistReviewModal(item);
  document.body.appendChild(container.firstElementChild);
}

function refreshQaChecklistReviewState(item) {
  const modal = document.querySelector("#qa-checklist-review-modal");
  if (!modal) return;
  const complete = getQaChecklistReviewComplete(item);
  const help = modal.querySelector("#qa-approval-help");
  const approve = modal.querySelector("[data-qa-modal-approve]");
  if (help) help.textContent = complete ? "Approved for unpacking selected. Ready to approve." : "Select Approved for unpacking to continue.";
  if (approve) approve.disabled = !complete;
}
function approveChecklistException(poNo) {
  const item = checklistDecisionQueue.find((entry) => entry.poNo === poNo);
  if (!item || !getQaChecklistReviewComplete(item)) return false;
  item.status = "Approved for unpacking";
  item.qaDecision = { outcome: "Approved for unpacking", user: currentLogin?.user || "qa.user", dateTime: getAssemblyAuditTimestamp(), comment: item.qaDecisionComment || "QA reviewed the checklist exception and approved unpacking." };
  const checklistPoNos = getGoodsReceivingChecklistPoNumbers(item);
  checklistPoNos.forEach((memberPoNo) => {
    const workflow = rpPackWorkflows[memberPoNo] || (rpPackWorkflows[memberPoNo] = createPackingWorkflow(memberPoNo));
    workflow.status = "Checklist decision approved";
    workflow.checklistExceptionStatus = "Approved for unpacking";
  });
  const exceptionWorkflow = rpPackWorkflows[poNo];
  if (exceptionWorkflow) {
    exceptionWorkflow.status = "Checklist decision approved";
    exceptionWorkflow.checklistExceptionStatus = "Approved for unpacking";
  }
  selectedChecklistDecisionPo = poNo;
  return true;
}

function acceptChecklistDecision(poNo) {
  const item = checklistDecisionQueue.find((entry) => entry.poNo === poNo && entry.status === "Approved for unpacking");
  if (!item) return { ok: false, message: "This checklist is not ready for acceptance." };
  const checklistPoNos = getGoodsReceivingChecklistPoNumbers(item);
  if (!checklistPoNos.length) return { ok: false, message: "No PO numbers were found in the Goods Receiving checklist." };
  createRpDocumentsQueueFromTabletConfirmation(checklistPoNos, item.supplier || item.checklistData?.supplier || "");
  checklistPoNos.forEach((memberPoNo) => {
    const workflow = rpPackWorkflows[memberPoNo];
    if (!workflow) return;
    workflow.status = "Documents Pending";
    workflow.signoff = null;
    workflow.checklistExceptionStatus = "";
    workflow.rpChecklistOpen = false;
    delete rpApprovalSignoffs[memberPoNo];
  });
  const exceptionWorkflow = rpPackWorkflows[item.poNo];
  if (exceptionWorkflow && !checklistPoNos.includes(item.poNo)) {
    exceptionWorkflow.status = "Checklist accepted";
    exceptionWorkflow.checklistExceptionStatus = "";
  }
  item.status = "Accepted";
  item.acceptedBy = currentLogin?.user || "goods.in";
  item.acceptedAt = getAssemblyAuditTimestamp();
  selectedChecklistDecisionPo = null;
  selectedRpPackPo = null;
  selectedRpApprovalPo = null;
  return {
    ok: true,
    poNos: checklistPoNos,
    message: `${checklistPoNos.join(", ")} accepted and returned to the RPi Pack Creation queue.`
  };
}

function renderRpiModule(stage) {
  return rpiModuleView === "pack-creation" ? renderPackingRpDocuments(stage) : renderRpPackWork(stage);
}
function renderRpPackWork(stage) {
  if (Object.keys(rpPackWorkflows).length === 0) {
    rpPackWorkflows["C13719"] = {
      poNo: "C13719",
      status: "Pending Uploads",
      signoff: null,
      documents: [
        { id: "supplier-invoice", name: "Supplier invoice", required: true, uploaded: false, fileName: "", verified: false },
        { id: "po", name: "Purchase Order", required: true, uploaded: false, fileName: "", verified: false },
        { id: "supplier-packing-list", name: "Supplier packing list", required: true, uploaded: false, fileName: "", verified: false },
        { id: "supplier-declaration", name: "Supplier declaration", required: true, uploaded: false, fileName: "", verified: false },
        { id: "temperature-record", name: "Temperature record", required: true, uploaded: false, fileName: "", verified: false },
        { id: "goods-receiving-checklist", name: "Goods receiving checklist", required: true, uploaded: false, fileName: "", verified: false },
        { id: "cmr", name: "CMR", required: true, uploaded: false, fileName: "", verified: false },
        { id: "import-export", name: "Import / Export", required: true, uploaded: false, fileName: "", verified: false },
        { id: "additional-files", name: "CD License if applicable", required: false, uploaded: false, fileName: "", verified: false },
        { id: "optional-additional-files", name: "Additional Files", required: false, uploaded: false, fileName: "", verified: false }
      ]
    };
  }
  
  const completedPoKeys = getRpTaskFilteredPoKeys();
  const waitingQaItems = checklistDecisionQueue.filter((item) => item.status === "Waiting for QA decision");
  const waitingQaHtml = waitingQaItems.map((item) => {
    const exceptionCount = item.failedChecks.length;
    return `
      <div class="rp-qa-list-row">
        <strong class="rp-qa-list-po">${escapeQaChecklistText(item.checklistData?.poNumbers || item.poNo)}</strong>
        <span class="rp-qa-list-issue"><b>Goods Receiving response: NO</b><small>${escapeQaChecklistText(item.failedChecks.join("; "))}</small></span>
        <span class="rp-qa-list-progress"><strong>${exceptionCount}</strong> checklist exceptions</span>
        <span class="rp-qa-list-status">QA decision required</span>
        <button class="classic-button primary" type="button" data-qa-view-checklist="${item.poNo}">Review checklist</button>
      </div>
    `;
  }).join("");
  // Keep selectedRpApprovalPo null unless selected explicitly.

  const poListHtml = completedPoKeys.length > 0
    ? completedPoKeys.map((poKey) => {
        const mergeGroup = getRpMergeGroup(poKey);
        const poNumbers = mergeGroup ? mergeGroup.poNos : [poKey];


        return `
          <button class="rp-dashboard-po-card" type="button" data-rp-approval-select-po="${poKey}" aria-label="Open PO ${poNumbers.join(", ")}">
            <span>PO</span>
            <div class="rp-dashboard-po-details">
              <strong>${poNumbers.join(" &middot; ")}</strong>
              <small>Ready for RPi review</small>
            </div>
            <i aria-hidden="true">&rsaquo;</i>
          </button>
        `;
      }).join("")
    : `<div class="rp-dashboard-empty">No PO numbers are waiting for RPi review.</div>`;  const activePo = selectedRpApprovalPo ? rpPackWorkflows[selectedRpApprovalPo] : null;
  if (!activePo) {
    const totalActiveTasks = completedPoKeys.length + waitingQaItems.length;
    const activeQueueHtml = rpTaskQueueTab === "qa" ? `
      <section class="rp-task-card-section qa rp-task-tab-panel">
        <div class="rp-qa-decision-list"><div class="rp-qa-list-head"><span>PO Number</span><span>Checklist exception</span><span>Checklist result</span><span>Status</span><span>Action</span></div>${waitingQaHtml || `<div class="rp-dashboard-empty">No checklist exceptions are waiting for QA.</div>`}</div>
      </section>
    ` : `
      <section class="rp-task-card-section rp-task-tab-panel">
        <div class="rp-task-card-search">
          <label for="rp-task-po-search">PO Number</label>
          <input class="classic-search-input" id="rp-task-po-search" data-rp-approval-search value="${escapeQaChecklistText(rpApprovalSearch)}">
          <button class="classic-search-button" type="button" data-rp-approval-search-button>Search</button>
        </div>
        <div class="rp-dashboard-po-grid">${poListHtml}</div>
      </section>
    `;
    return `
      <div class="packing-list-panel rp-task-card-page">
        <div class="rp-task-card-page-header">
          <div><h3>RPi Approval</h3><p>Select a PO for document review or open a Goods Receiving exception.</p></div>
          <span>${totalActiveTasks} active</span>
        </div>
        <div class="rp-task-queue-tabs" role="tablist" aria-label="RPi task queues">
          <button class="${rpTaskQueueTab === "po" ? "active" : ""}" type="button" role="tab" aria-selected="${rpTaskQueueTab === "po"}" data-rp-task-queue-tab="po">PO Work Queue <span>${completedPoKeys.length}</span></button>
          <button class="${rpTaskQueueTab === "qa" ? "active" : ""}" type="button" role="tab" aria-selected="${rpTaskQueueTab === "qa"}" data-rp-task-queue-tab="qa">QA Decision <span>${waitingQaItems.length}</span></button>
        </div>
        <div class="rp-task-tab-content">${activeQueueHtml}</div>
      </div>
    `;
  }  let mainContentHtml = "";

  {
    const isApprovedByRp = rpApprovalSignoffs[selectedRpApprovalPo] !== undefined;
    const rpSignoff = rpApprovalSignoffs[selectedRpApprovalPo];
    const activeMergeGroup = getRpMergeGroup(activePo.poNo);
    const activePoNos = activeMergeGroup ? activeMergeGroup.poNos : [activePo.poNo];
    const activePoLabel = activePoNos.join(", ");

    const rpTaskViewedDocs = getRpTaskViewedDocs(activePo);
    const operationalDocIds = ["temperature-record", "goods-receiving-checklist"];
    const diagnosticBatch = isRpWorkflowSetDiagnostic(activePoNos);
    const visibleActiveDocuments = activePo.documents.filter((doc) => !(diagnosticBatch && doc.id === "supplier-declaration"));
    const activeDocTiles = visibleActiveDocuments
      .map((doc, index) => {
        const isUploaded = doc.uploaded || operationalDocIds.includes(doc.id);
        const isVerified = rpTaskViewedDocs[doc.id] === true;
        const isRejected = rpTaskViewedDocs[doc.id] === "rejected";
        const isSharedDocument = Boolean(activeMergeGroup && rpSharedDocumentIds.includes(doc.id));
        const fileLabel = doc.fileName || (doc.uploaded ? "Uploaded File" : "Available in PLPI workflow");
        
        let statusClass = "missing";
        let statusText = "No File";
        if (isUploaded) {
          statusClass = isRejected ? "rejected-status" : (isVerified ? "verified" : "pending");
          statusText = isRejected ? "Rejected" : (isVerified ? "Approved" : "Pending Decision");
        }

        return `
          <div class="rp-doc-tile">
            <span class="rp-tile-index">${String(index + 1).padStart(2, "0")}</span>
            <div class="rp-tile-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #1e3a8a; margin-bottom: 4px; display: block;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <div class="rp-tile-title">${doc.name}${isSharedDocument ? " · Shared" : ""}</div>
              <div class="rp-tile-subtitle">${isSharedDocument ? `One file for ${activePoNos.length} POs · ` : `${activePo.poNo} · `}${isUploaded ? fileLabel : "No File Uploaded"}</div>
            </div>
            <div class="rp-tile-status rp-task-decision-row">
              <span class="rp-tile-badge ${statusClass}">${statusText}</span>
              ${isUploaded ? `<button class="classic-button link-button rp-task-view-file" type="button" data-rp-view-file="${doc.id}" data-rp-po="${activePo.poNo}">View File</button>` : ""}
            </div>
            <div class="rp-tile-action rp-task-document-actions">
              ${isUploaded ? `
                <button class="classic-button primary" type="button" data-rp-approve-file="${doc.id}" data-rp-po="${activePo.poNo}" ${isVerified ? "disabled" : ""}>${isVerified ? "Approved" : "Approve"}</button>
                <button class="classic-button danger" type="button" data-rp-reject-file="${doc.id}" data-rp-po="${activePo.poNo}" ${isRejected ? "disabled" : ""}>${isRejected ? "Rejected" : "Reject"}</button>
              ` : `
                <span class="disabled-text" style="font-size: 11px; text-align: center; width: 100%; display: block;">N/A</span>
              `}
            </div>
          </div>
        `;
      });
    const docTilesHtml = activeDocTiles.join("");
    const activeSharedDocTilesHtml = activeDocTiles
      .filter((tile, index) => rpSharedDocumentIds.includes(visibleActiveDocuments[index].id))
      .join("");
    const activeIndividualDocTilesHtml = activeDocTiles
      .filter((tile, index) => !rpSharedDocumentIds.includes(visibleActiveDocuments[index].id))
      .join("");

    const mergedIndividualDocTilesByPo = Object.fromEntries(activePoNos.slice(1).map((memberPoNo) => {
      const memberWorkflow = rpPackWorkflows[memberPoNo];
      if (!memberWorkflow) return [memberPoNo, ""];
      const memberViewedDocs = getRpTaskViewedDocs(memberWorkflow);
      const tilesHtml = memberWorkflow.documents.filter((doc) => !(diagnosticBatch && doc.id === "supplier-declaration") && !rpSharedDocumentIds.includes(doc.id)).map((doc) => {
        const isUploaded = doc.uploaded || operationalDocIds.includes(doc.id);
        const isVerified = memberViewedDocs[doc.id] === true;
        const isRejected = memberViewedDocs[doc.id] === "rejected";
        return `
          <div class="rp-doc-tile">
            <span class="rp-tile-index">${memberPoNo.slice(-2)}</span>
            <div class="rp-tile-header"><div class="rp-tile-title">${doc.name}</div><div class="rp-tile-subtitle">${memberPoNo} · ${doc.fileName || "Available in PLPI workflow"}</div></div>
            <div class="rp-tile-status rp-task-decision-row"><span class="rp-tile-badge ${isUploaded ? (isRejected ? "rejected-status" : (isVerified ? "verified" : "pending")) : "missing"}">${isUploaded ? (isRejected ? "Rejected" : (isVerified ? "Approved" : "Pending Decision")) : "No File"}</span>${isUploaded ? `<button class="classic-button link-button rp-task-view-file" type="button" data-rp-view-file="${doc.id}" data-rp-po="${memberPoNo}">View File</button>` : ""}</div>
            <div class="rp-tile-action rp-task-document-actions">${isUploaded ? `<button class="classic-button primary" type="button" data-rp-approve-file="${doc.id}" data-rp-po="${memberPoNo}" ${isVerified ? "disabled" : ""}>${isVerified ? "Approved" : "Approve"}</button><button class="classic-button danger" type="button" data-rp-reject-file="${doc.id}" data-rp-po="${memberPoNo}" ${isRejected ? "disabled" : ""}>${isRejected ? "Rejected" : "Reject"}</button>` : `<span class="disabled-text">N/A</span>`}</div>
          </div>
        `;
      }).join("");
      return [memberPoNo, tilesHtml];
    }));
    const mergedIndividualDocTilesHtml = activePoNos.slice(1).map((poNo) => mergedIndividualDocTilesByPo[poNo]).join("");

    const isPackingListVerified = rpTaskViewedDocs["generated-packing-list"] === true;
    const isPackingListRejected = rpTaskViewedDocs["generated-packing-list"] === "rejected";
    let plStatusClass = packingListGenerated ? (isPackingListRejected ? "rejected-status" : (isPackingListVerified ? "verified" : "pending")) : "missing";
    let plStatusText = packingListGenerated ? (isPackingListRejected ? "Rejected" : (isPackingListVerified ? "Approved" : "Pending Decision")) : "Not Generated";

    const packingListTileHtml = `
      <div class="rp-doc-tile" style="background-color: #fffbeb; border-color: #fcd34d;">
        <span class="rp-tile-index">08</span>
        <div class="rp-tile-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #b45309; margin-bottom: 4px; display: block;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <div class="rp-tile-title" style="color: #92400e;">Generated PO Packing List</div>
          <div class="rp-tile-subtitle">Generated by PLPI</div>
        </div>
        <div class="rp-tile-status rp-task-decision-row">
          <span class="rp-tile-badge ${plStatusClass}">${plStatusText}</span>
          ${packingListGenerated ? `<button class="classic-button link-button rp-task-view-file" type="button" data-pl-preview-generated-packing-list data-pl-preview-po="${activePo.poNo}">View File</button>` : ""}
        </div>
        <div class="rp-tile-action rp-task-document-actions">
          ${packingListGenerated ? `
            <button class="classic-button primary" type="button" data-rp-approve-generated-packing-list="${activePo.poNo}" ${isPackingListVerified ? "disabled" : ""}>${isPackingListVerified ? "Approved" : "Approve"}</button>
            <button class="classic-button danger" type="button" data-rp-reject-generated-packing-list="${activePo.poNo}" ${isPackingListRejected ? "disabled" : ""}>${isPackingListRejected ? "Rejected" : "Reject"}</button>
          ` : `
            <span class="disabled-text" style="font-size: 11px; color: #92400e; text-align: center; width: 100%; display: block; font-weight: bold;">N/A</span>
          `}
        </div>
      </div>
    `;

    const mergedPackingListTilesByPo = Object.fromEntries(activePoNos.slice(1).map((memberPoNo) => {
      const memberWorkflow = rpPackWorkflows[memberPoNo];
      const isViewed = memberWorkflow && getRpTaskViewedDocs(memberWorkflow)["generated-packing-list"] === true;
      const isRejected = memberWorkflow && getRpTaskViewedDocs(memberWorkflow)["generated-packing-list"] === "rejected";
      const tileHtml = `
        <div class="rp-doc-tile" style="background-color: #fffbeb; border-color: #fcd34d;">
          <span class="rp-tile-index">PL</span>
          <div class="rp-tile-header"><div class="rp-tile-title" style="color:#92400e;">Generated PO Packing List</div><div class="rp-tile-subtitle">${memberPoNo} · Separate packing list</div></div>
          <div class="rp-tile-status rp-task-decision-row"><span class="rp-tile-badge ${isRejected ? "rejected-status" : (isViewed ? "verified" : "pending")}">${isRejected ? "Rejected" : (isViewed ? "Approved" : "Pending Decision")}</span><button class="classic-button link-button rp-task-view-file" type="button" data-pl-preview-generated-packing-list data-pl-preview-po="${memberPoNo}">View File</button></div>
          <div class="rp-tile-action rp-task-document-actions"><button class="classic-button primary" type="button" data-rp-approve-generated-packing-list="${memberPoNo}" ${isViewed ? "disabled" : ""}>${isViewed ? "Approved" : "Approve"}</button><button class="classic-button danger" type="button" data-rp-reject-generated-packing-list="${memberPoNo}" ${isRejected ? "disabled" : ""}>${isRejected ? "Rejected" : "Reject"}</button></div>
        </div>
      `;
      return [memberPoNo, tileHtml];
    }));
    const mergedPackingListTilesHtml = activePoNos.slice(1).map((poNo) => mergedPackingListTilesByPo[poNo]).join("");
    const rpTaskMergedDocumentSectionsHtml = activeMergeGroup ? `
      <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px;">
        <div style="font-weight: bold; font-size: 13px; color: #1f3a5f; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Common files</div>
        <div class="rp-doc-tiles-grid">${activeSharedDocTilesHtml}</div>
      </div>
      ${activePoNos.map((poNo) => {
        const poDocumentTiles = poNo === activePo.poNo ? activeIndividualDocTilesHtml : (mergedIndividualDocTilesByPo[poNo] || "");
        const poPackingListTile = poNo === activePo.poNo ? packingListTileHtml : (mergedPackingListTilesByPo[poNo] || "");
        return `<div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px;"><div style="font-weight: bold; font-size: 13px; color: #1f3a5f; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">PO ${poNo}</div><div class="rp-doc-tiles-grid">${poDocumentTiles}${poPackingListTile}</div></div>`;
      }).join("")}
    ` : "";

    const checksHtml = renderRpApprovalFormInteractive(activePo.poNo, isApprovedByRp, stage);
    const allRpDocumentsVerified = areAllRpDocumentsVerified(activePo.poNo);
    const anyRpDocumentRejected = hasAnyRpDocumentRejected(activePo.poNo);
    const checklistApprovedToOpen = activePo.rpChecklistOpen === true;

    if (checklistApprovedToOpen) {
      mainContentHtml = `
        <div class="rp-documents-main rp-checklist-full-window" style="display: flex; flex-direction: column; gap: 12px; font-family: Tahoma, sans-serif; min-height: 650px;">
          <div class="rp-documents-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            <div>
              <h3 style="margin: 0; color: #1f3a5f; font-size: 20px; font-weight: bold;">RPi Approval Checklist - PO ${activePoLabel}</h3>
              <p style="margin: 2px 0 0; font-size: 12px; color: #666;">${activeMergeGroup ? `Shared files were reviewed once; ${activePoNos.length} separate packing lists and PO files were reviewed individually.` : "All required documents have been viewed by RPi."} Complete the checklist and generate the signed form.</p>
            </div>
            <div class="rp-task-header-actions"><button class="classic-button" type="button" data-rp-task-back>Back to task queue</button><span class="viewed-badge ${isApprovedByRp ? "viewed" : "pending"}">${isApprovedByRp ? "Approved" : "Pending RPi Sign-Off"}</span></div>
          </div>
          <div class="rp-task-checklist-scroll-panel" style="flex: 1; overflow-y: auto; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; padding: 8px; min-height: 540px;">
            ${checksHtml}
          </div>
          <div class="signature-grid rp-doc-signoff-row" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
            <label>Responsible Person <input value="${currentLogin ? currentLogin.user : stage.user}" readonly></label>
            <label>Date / Time <input value="${isApprovedByRp ? rpSignoff.dateTime : "Pending RPi approval"}" readonly></label>
            <div class="signoff-action process-signoff-action">
              <button class="classic-button primary" type="button" id="rp-verify-signoff-btn" ${isApprovedByRp ? "disabled" : ""}>Generate & Sign</button>
            </div>
          </div>
        </div>
      `;
    } else {
      mainContentHtml = `
        <div class="rp-documents-main" style="display: flex; flex-direction: column; gap: 12px; font-family: Tahoma, sans-serif;">
          <div class="rp-documents-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            <div>
              <h3 style="margin: 0; color: #1f3a5f; font-size: 18px; font-weight: bold;">RPi Review Dashboard - PO ${activePoLabel}</h3>
              <p style="margin: 2px 0 0; font-size: 12px; color: #666;">View each document and approve it before opening the approval decision.</p>
            </div>
            <div class="rp-task-header-actions"><button class="classic-button" type="button" data-rp-task-back>Back to task queue</button></div>
          </div>
          ${activeMergeGroup ? rpTaskMergedDocumentSectionsHtml : `
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px;">
              <div style="font-weight: bold; font-size: 13px; color: #1f3a5f; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Supplier Compliance Documents</div>
              <div class="rp-doc-tiles-grid">${docTilesHtml}${packingListTileHtml}</div>
            </div>
          `}
          <div class="rp-checklist-placeholder" style="padding: 25px; text-align: center; border: 2px dashed #cbd5e1; border-radius: 8px; background: #fafafa; font-family: Tahoma, sans-serif;">
            <h4 style="margin: 0 0 6px; color: #334155; font-size: 14px; font-weight: bold;">${allRpDocumentsVerified ? "All files approved" : (anyRpDocumentRejected ? "Rejected file selected" : "Approval decision pending")}</h4>${allRpDocumentsVerified || anyRpDocumentRejected ? `<p style="margin: 0 0 12px; color: #64748b; font-size: 11px;">Choose the final approval decision.</p>` : ""}<div style="display:flex; justify-content:center; gap:10px;"><button class="classic-button primary" type="button" data-rp-approve-open-checklist="${activePo.poNo}" ${allRpDocumentsVerified || anyRpDocumentRejected ? "" : "disabled"}>Approve</button><button class="classic-button danger" type="button" data-rp-reject-po="${activePo.poNo}" ${allRpDocumentsVerified || anyRpDocumentRejected ? "" : "disabled"}>Reject</button></div>
          </div>
        </div>
      `;
    }
  }

  return `
    <div class="packing-list-panel rp-documents-panel">
      <div class="rp-pack-layout rp-pack-layout-full">
        <section class="rp-main-content">
          ${mainContentHtml}
        </section>
      </div>
    </div>
  `;
}

function updateRpApprovalAvailability() {
  const button = document.querySelector("#rp-verify-signoff-btn");
  if (!button) return;
  const activePoKey = selectedRpApprovalPo;
  const activePo = rpPackWorkflows[activePoKey];
  const isApprovedByRp = rpApprovalSignoffs[activePoKey] !== undefined;
  if (!activePo || isApprovedByRp) {
    button.disabled = true;
    return;
  }
  
  const answers = rpApprovalAnswers[activePoKey] || {};
  const fields = [
    "eori", "commodity", "fe-status", "wda-match", "transporter", 
    "temp-transit", "temp-storage", "art51-decl", "fmd-compliance", 
    "fmd-decom", "bollino", "stock-suitable", "deviation"
  ];
  
  const allAnswered = fields.every(field => answers[field] !== undefined);
  
  let reasonOk = true;
  if (answers["fe-status"] === "N") {
    reasonOk = answers["inactive-reason"] && answers["inactive-reason"].trim().length > 0;
  }
  
  const docsDecided = areAllRpDocumentsDecided(activePoKey);
  button.disabled = !(allAnswered && reasonOk && docsDecided);
  button.title = button.disabled ? "Complete all checklist answers and record a decision for every document before sign off." : "Ready for RPi Approval Sign Off";
}

function getRpApprovalPrefilledDetails(poNo) {
  const rows = getPackingListRows().filter(r => r.orderNo === poNo);
  const firstRow = rows.length > 0 ? rows[0] : null;
  return {
    poNo: poNo,
    supplier: firstRow ? `${firstRow.suppName} / ${firstRow.country}` : "EUROSERV, S.A. / SPAIN",
    invoice: firstRow && (firstRow.invoice || firstRow.comments) ? (firstRow.invoice || firstRow.comments) : "77337"
  };
}

function markGeneratedPackingListViewedForCurrentContext(poNo) {
  if (!poNo) return;
  const workflow = rpPackWorkflows[poNo];
  if (!workflow) return;
  workflow.viewedDocs = workflow.viewedDocs || {};
  workflow.viewedDocs["generated-packing-list"] = true;

  if (currentStageId === "rp-pack" && rpiModuleView === "pack-creation") {
    workflow.viewedDocs["generated-packing-list"] = true;
  }
}
function closePoPackingListInlineSignoffConfirm() {
  const existing = document.querySelector("#po-inline-signoff-confirm");
  if (existing) existing.remove();
}

function openPoPackingListInlineSignoffConfirm() {
  closePoPackingListInlineSignoffConfirm();
  document.body.classList.remove("generated-po-signoff-active");
  appConfirmModal.classList.remove("generated-po-signoff-confirm");
  appConfirmModal.classList.add("hidden");
  const dialog = document.createElement("div");
  dialog.id = "po-inline-signoff-confirm";
  dialog.className = "po-inline-signoff-confirm";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.innerHTML = `
    <div class="po-inline-signoff-window">
      <div class="internal-title"><span>Confirm Sign Off</span><button type="button" class="close-button" data-po-inline-signoff-no>X</button></div>
      <div class="app-confirm-body">
        <div class="app-confirm-icon">OK</div>
        <div>
          <h3>Are you sure you want to sign off Packing List?</h3>
          <p>This will capture the current user and timestamp.</p>
        </div>
        <div class="confirm-actions">
          <button class="classic-button" type="button" data-po-inline-signoff-no>No</button>
          <button class="classic-button primary" type="button" data-po-inline-signoff-yes>Yes, Sign Off</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  statusMessage.textContent = "Packing List sign off confirmation requested";
}
function renderGeneratedPackingListSheet(poNo, rows, createdOn, createdBy) {
  return `<div class="packing-list-preview-header">
  <div class="preview-logo">B&amp;S GROUP</div>
  <h2>Packing List</h2>
</div>
<div class="packing-list-preview-meta">
  <span>PO No : ${poNo}</span>
  <span>Created By : ${htmlSafe(createdBy)}</span>
  <span>Created on : ${createdOn}</span>
</div>
<table class="packing-list-preview-table">
  <thead>
    <tr>
      <th>Product name</th>
      <th>ECMA No</th>
      <th>Batch No</th>
      <th>Expiry Date</th>
      <th>Qty</th>
      <th>No of boxes</th>
      <th>2D Barcode</th>
      <th>Comments</th>
    </tr>
  </thead>
  <tbody>
    ${rows
      .map((row) => {
const isInactive = row.status === "Not Active";
return `
<tr class="${isInactive ? "inactive-row" : ""}">
  <td>
    <strong>${row.description}</strong>
    <div class="preview-row-status">Status : ${row.status || "Active"}</div>
  </td>
  <td>${row.ecma || ""}</td>
  <td>${isInactive ? "/" : row.batchNo || "Pending"}</td>
  <td>${isInactive ? "/" : row.expiryDate || "Pending"}</td>
  <td>${isInactive ? "/" : row.qty}</td>
  <td>${isInactive ? "/" : row.boxes}</td>
  <td class="preview-2d-barcode-cell"><input type="checkbox" disabled ${row.presenceOf2D ? "checked" : ""}></td>
  <td>${getPackingLineUserComment(row) || ""}</td>
</tr>
      `;
      })
      .join("")}
  </tbody>
</table>
<div class="packing-list-preview-comment-section"><strong>Comments:</strong> ${rows.map((row) => getPackingLineUserComment(row)).filter(Boolean).join("; ") || "No comments recorded."}</div>
<div class="packing-list-preview-footer">Page 1 of 1</div>`;
}

function openPackingListPreview(poNoOverride = null, rowsOverride = null) {
  const poNo = poNoOverride || selectedRpPackPo || selectedRpApprovalPo || packingListSelectedPo || packingListSearch || "C13719";
  activePreviewPo = poNo;
  const existingSnapshot = getGeneratedPackingRows(poNo);
  const hasRowsOverride = Array.isArray(rowsOverride) && rowsOverride.length > 0;
  const rows = hasRowsOverride ? rowsOverride : existingSnapshot || getFilteredPackingListRows().filter((row) => row.orderNo === poNo);
  const createdOn = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  packingListGenerated = true;
  if (rpPackWorkflows[poNo] && !rpPackWorkflows[poNo].packingListGeneratedAt) {
    const generatedBy = currentLogin?.user || "goods.in";
    rpPackWorkflows[poNo].packingListGeneratedAt = createdOn;
    rpPackWorkflows[poNo].packingListGeneratedBy = generatedBy;
    recordPackingListAudit(poNo, `Generated Packing List for ${poNo}.`, generatedBy, createdOn);
  }
  if (rows.length && (hasRowsOverride || !generatedPackingListSnapshots[poNo])) {
    generatedPackingListSnapshots[poNo] = rows.map((row) => ({ ...row }));
  }
  if (currentStageId === "rp-pack" && (rpiModuleView === "tasks" || rpiModuleView === "pack-creation") && rpPackWorkflows[poNo]) {
    rpPackWorkflows[poNo].viewedDocs = rpPackWorkflows[poNo].viewedDocs || {};
    rpPackWorkflows[poNo].viewedDocs["generated-packing-list"] = true;
  }

  const previewTitle = document.getElementById("print-preview-title");
  const previewBody = document.getElementById("print-preview-body");

  if (previewTitle) previewTitle.textContent = "Packing List";
  if (previewBody) {
    previewBody.innerHTML = `
      <div class="packing-list-preview">
${renderGeneratedPackingListSheet(poNo, rows, createdOn, currentLogin ? currentLogin.user : "goods.in")}
<div class="packing-list-preview-actions">
    ${(currentStageId === "rp-pack" && (rpiModuleView === "tasks" || rpiModuleView === "pack-creation")) ? `
      <button class="classic-button" type="button" id="pl-preview-download-btn" style="background-color: #2563eb; color: white;">Download</button>
    ` : `
      <button class="classic-button" type="button" id="pl-preview-download-btn" style="background-color: #2563eb; color: white;">Download</button>
      <button class="classic-button primary" type="button" data-sign-po-packing-list>User Sign Off</button>
    `}
</div>
      </div>
    `;
  }
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = "Packing list generated and ready to view.";
}

function signPoPackingList() {
  const now = getAssemblyAuditTimestamp();
  const poNo = activePreviewPo || packingListSelectedPo || packingListSearch || "C13719";
  poPackingListSignoff = { user: currentLogin ? currentLogin.user : "goods.in", dateTime: now, poNo };
  recordPackingListAudit(poNo, `Signed off the generated Packing List for ${poNo}.`, poPackingListSignoff.user, now);

  if (!rpPackWorkflows[poNo]) {
    rpPackWorkflows[poNo] = createPackingWorkflow(poNo);
  }
  packingListSelectedPo = poNo;
  packingListSearch = poNo;
  selectedRpPackPo = null;
  packingListMode = "view";

  statusMessage.textContent = `PO Packing List signed off. PO ${poNo} workflow created in RPi Pack.`;
  closePrintPreview();
  renderStage("packing-list");
}

function printPackingLabel(lineKey) {
  const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const user = currentLogin ? currentLogin.user : "goods.in";
  const row = getPackingListRows().find((item) => getPackingLineKey(item) === lineKey);
  packingLabelPrintRecords[lineKey] = { user, dateTime: now };
  if (row) recordPackingListAudit(row.orderNo, `Printed the packing label for line ${row.lineNo} â€“ ${row.description}.`, user, now, lineKey);
  statusMessage.textContent = `Packing label printed and signed off for ${lineKey}.`;
  renderStage("packing-list");
}

function updatePackingListAvailability() {
  const button = document.querySelector("#packing-complete-button");
  if (!button) return;
  button.disabled = packingListSignedOff;
}

function renderBarCreationWork(stage) {
  if (!barCreated) {
    const productRows = getFilteredBnsProducts();
    return `
      <div class="bar-create-start">
<section class="bns-window" style="padding: 15px;">
  <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 12px; font-family: Tahoma, sans-serif;">BNS Batch Creation</div>
  <div class="search-form minimal-search" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
    <label class="classic-search-label" style="font-size: 11px;">Country : <select data-bns-filter="country" style="min-height: 22px; width: 100px;"><option value="All"></option><option>Spain</option></select></label>
    <label class="classic-search-label" style="font-size: 11px;">Site : <select data-bns-filter="site" style="min-height: 22px; width: 80px;"><option value="All"></option><option>WHO</option></select></label>
    <label class="classic-search-label" style="font-size: 11px;">Category : <select data-bns-filter="category" style="min-height: 22px; width: 100px;"><option value="All"></option><option>Reboxing</option><option>Relabelling</option></select></label>
    <label class="classic-search-label" style="font-size: 11px;">Stock : <select style="min-height: 22px; width: 100px;"><option></option></select></label>
    <label class="classic-search-label" style="font-size: 11px;">Status : <select data-bns-filter="status" style="min-height: 22px; width: 100px;"><option value="All" ${bnsFilters.status === "All" ? "selected" : ""}>All</option><option value="Not Printed BAR" ${bnsFilters.status === "Not Printed BAR" ? "selected" : ""}>Not Printed BAR</option><option value="Printed BAR" ${bnsFilters.status === "Printed BAR" ? "selected" : ""}>Printed BAR</option></select></label>
    <label class="classic-search-label" style="font-size: 11px;">Batch_No : <input class="classic-search-input" data-bns-filter="batch" value="${bnsFilters.batch}" style="min-height: 22px; width: 130px;"></label>
    <button class="classic-search-button" type="button" data-bns-search>Search</button>
  </div>
  <div class="grid-scroll">
    <table class="classic-table product-grid minimal-product-grid">
      <thead>
<tr>
  <th style="width: 50px;">Select</th>
  <th>PRODUCT_STATUS</th>
  <th>SITE</th>
  <th>COUNTRY</th>
  <th>PART_NO</th>
  <th>FOREIGN_NAME</th>
  <th>ECMA</th>
  <th>STRENGTH</th>
  <th>PACK_SIZE</th>
  <th>BATCH_NO</th>
  <th>EXPIRY_DATE</th>
  <th>QUANTITY</th>
  <th>IMP</th>
  <th>INVOICE_NO</th>
  <th>DESCRIPTION</th>
  <th>WAREHOUSE_LO</th>
  <th>CONTRACT_SUPP</th>
  <th>PL</th>
  <th>PRODUCT_ID</th>
  <th>MFG_ID</th>
  <th>ACTION_COUNT</th>
  <th>OBJID</th>
  <th>SPL_FLAG</th>
  <th>CATEGORY</th>
  <th>STOCK</th>
  <th>REGULATORY</th>
  <th>WFIMPLEMENTED</th>
  <th>LEGAL_CATEGORY</th>
</tr>
      </thead>
      <tbody>
${
  productRows.length
    ? productRows
.map(
  (product, index) => `
      <tr class="${generatedBatchNumbers.includes(product.batch) ? "completed-stage-row" : ""} ${bnsSelectedRowIds.includes(getBnsRowId(product)) ? "selected-row" : ""}">
<td style="text-align: center;"><input type="checkbox" data-bns-select="${getBnsRowId(product)}" ${bnsSelectedRowIds.includes(getBnsRowId(product)) ? "checked" : ""} ${generatedBatchNumbers.includes(product.batch) ? "disabled" : ""}></td>
<td>${generatedBatchNumbers.includes(product.batch) ? "Completed" : product.status}</td>
<td>${product.site}</td>
<td>${product.country}</td>
<td>${product.partNo}</td>
<td>${product.foreignName || ""}</td>
<td>${product.ecma}</td>
<td>${product.strength}</td>
<td>${product.packSize}</td>
<td>${product.batch}</td>
<td>${product.expiry}</td>
<td>${product.quantity}</td>
<td>${product.imp}</td>
<td>${product.invoice}</td>
<td>${product.description}</td>
<td>${product.warehouse}</td>
<td>${product.contractSupplier || product.supplierName || ""}</td>
<td>${product.pl || ""}</td>
<td>${product.productId || ""}</td>
<td>${product.mfgId ?? "0"}</td>
<td>${product.actionCount ?? (product.category === "Reboxing" ? "9" : "19")}</td>
<td>${product.objId || `AAAr${String(product.productId || index + 1).padStart(8, "0")}`}</td>
<td>${product.splFlag || (product.brailleRequired ? "Yes" : "No")}</td>
<td>${product.category || ""}</td>
<td>${product.stock ?? "0"}</td>
<td>${product.regulatory || "MHRA"}</td>
<td>${product.wfImplemented || "Yes"}</td>
<td>${product.legalCategory || "POM"}</td>
      </tr>
    `
)
.join("")
    : `<tr><td colspan="28">No products available for BAR creation.</td></tr>`
}
      </tbody>
    </table>
  </div>
  <div class="bns-count-footer" style="display: flex; align-items: center; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 1px solid #c0c0c0; font-family: Tahoma, sans-serif; font-size: 11px;">
    <div>
      <div class="bns-primary-actions">
        <button class="classic-button" type="button" data-bns-create-selected>Generate BAR</button>
        <button class="classic-button" type="button" data-bns-print-batch-details>Print Batch Details</button>
      </div>
    </div>
    <div style="display: flex; gap: 15px; align-items: center; color: #000;">
      <span>Total BNS Batch : <strong style="background: #ffe3e3; padding: 2px 6px; border: 1px solid #ffc0c0; color: #b91c1c; font-size: 12px; border-radius: 2px;">189</strong></span>
      <span>Total Composite Batch : <strong style="background: #ffe3e3; padding: 2px 6px; border: 1px solid #ffc0c0; color: #b91c1c; font-size: 12px; border-radius: 2px;">361</strong></span>
      <span>Total Packs : <strong style="background: #ffe3e3; padding: 2px 6px; border: 1px solid #ffc0c0; color: #b91c1c; font-size: 12px; border-radius: 2px;">51247</strong></span>
      <button class="classic-button" type="button" style="background: #f0f4f8 !important; color: #333 !important; border-color: #b0c2d4 !important; padding: 3px 12px; font-size: 11px; font-weight: bold;">Not Printed BAR</button>
    </div>
  </div>
</section>
      </div>
    `;
  }

  const product = selectedProduct || bnsProducts[0];
  const createdBy = barCreatedRecord ? barCreatedRecord.user : currentLogin ? currentLogin.user : stage.user;
  const createdDateTime = barCreatedRecord ? barCreatedRecord.dateTime : "";
  const generatedBarRecord = generatedBarRecords[product.batch] || {};
  const savedLineClearance = getSavedBnsLineClearance(product.batch) || generatedBarRecord.bnsLineClearance || {};
  const savedChecks = savedLineClearance.checks || [];
  const isLineClearanceSignedOff = Boolean(savedLineClearance.signedOff);

  return `
    <div class="bar-creation-layout process-only">
      <section class="process-one-form">
<div class="panel-title">BAR Generated - Line Clearance</div>
${renderBatchDetails(product)}

<div class="process-checks">
  <div class="process-instruction">Line Clearance checks</div>
  ${getBnsLineClearanceItems().map((label, index) => `<label class="process-tick"><input type="checkbox" data-process-check data-bar-check-index="${index}" ${savedChecks[index]?.checked ? "checked" : ""} ${isLineClearanceSignedOff ? "disabled" : ""}> ${label}</label>`).join("")}
</div>

<div class="signature-grid">
  <label class="span-three">Comments <textarea id="process-comments" data-process-comment ${isLineClearanceSignedOff ? "readonly" : ""}>${htmlSafe(savedLineClearance.comments || "")}</textarea></label>
  <label>BAR Created By <input value="${createdBy}" readonly></label>
  <label>Created Date / Time <input value="${createdDateTime}" readonly></label>
  <div class="signoff-action process-signoff-action">
    <button class="classic-button" type="button" data-view-generated-bar="${product.batch}">View Generated BAR</button>
    <button class="classic-button primary" type="button" id="user-signoff-button" disabled>${isLineClearanceSignedOff ? "Signed Off" : "User Sign Off"}</button>
  </div>
</div>

${
  barMovedToNextStage && signOffRecord
    ? `<div class="workflow-note" id="bar-workflow-state">Signed off by <strong>${signOffRecord.user}</strong> at <strong>${signOffRecord.dateTime}</strong>. Batch <strong>${product.batch}</strong> moved to Printer - Label Printing list view.</div>`
    : `<div class="workflow-note hidden" id="bar-workflow-state"></div>`
}
      </section>
    </div>
  `;
}

function getLabelPrintingProducts() {
  const seen = new Set();
  return bnsProducts
    .filter((product) => generatedBatchNumbers.includes(product.batch))
    .map((product) => combinedBarProducts[product.batch] || product)
    .filter((product) => !seen.has(product.batch) && seen.add(product.batch));
}

function getLeafletPrintingProducts() {
  const seen = new Set();
  return bnsProducts
    .filter((product) => labelPrintedBatchNumbers.includes(product.batch) && product.leafletRequired)
    .map((product) => combinedBarProducts[product.batch] || product)
    .filter((product) => !seen.has(product.batch) && seen.add(product.batch));
}

function getCartonPrintingProducts() {
  return bnsProducts.filter(
    (product) => leafletPrintedBatchNumbers.includes(product.batch) && product.routeType === "Reboxing"
  );
}

function getBraillePrintingProducts() {
  return bnsProducts.filter(
    (product) => leafletPrintedBatchNumbers.includes(product.batch) && product.routeType === "Relabelling" && product.brailleRequired
  );
}

function getLeafletFoldingProducts() {
  const seen = new Set();
  return bnsProducts
    .filter((product) => leafletPrintedBatchNumbers.includes(product.batch))
    .map((product) => combinedBarProducts[product.batch] || product)
    .filter((product) => !seen.has(product.batch) && seen.add(product.batch));
}

function renderLeafletFoldingList() {
  const normalizedBatchSearch = leafletFoldingBatchSearch.trim().toLowerCase();
  const normalizedMfgSearch = leafletFoldingMfgSearch.trim().toLowerCase();
  const products = getLeafletFoldingProducts().filter((product) => {
    const batchMatches = !normalizedBatchSearch || String(product.batch || "").toLowerCase().includes(normalizedBatchSearch);
    const mfgMatches = !normalizedMfgSearch || String(getMfgLotNo(product) || "").toLowerCase().includes(normalizedMfgSearch);
    return batchMatches && mfgMatches;
  });
  return `
    <div class="label-printing-layout leaflet-folding-queue">
      <section class="bns-window">
<div class="sub-window-title">Leaflet Folding List</div>
<div class="printer-list-search leaflet-folding-queue-search">
  <label class="classic-search-label">B&amp;S Batch Number : <input class="classic-search-input" data-leaflet-folding-batch-search value="${leafletFoldingBatchSearch}"></label>
  <label class="classic-search-label">MFG Lot No : <input class="classic-search-input" data-leaflet-folding-mfg-search value="${leafletFoldingMfgSearch}"></label>
  <button class="classic-search-button" type="button" data-leaflet-folding-search-button>Search</button>
</div>
<div class="grid-scroll label-grid-scroll">
  <table class="classic-table product-grid label-product-grid leaflet-folding-queue-table">
    <thead>
      <tr>
<th>B&S Batch Number</th>
<th class="mfg-lot-col">MFG Lot No</th>
<th>Product Name</th>
<th>Strength</th>
<th>Pack Size</th>
<th>ECMA</th>
<th>Expiry Date</th>
<th>Required Qty</th>
<th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${
products.length
  ? products
      .map(
(product, index) => `
  <tr class="clickable-row leaflet-folding-queue-row-${leafletFoldedBatchNumbers.includes(product.batch) ? "completed" : "active"}" data-open-leaflet-folding="${product.batch}">
    <td>${product.batch}</td>
    <td class="mfg-lot-col">${getMfgLotNo(product) || "-"}</td>
    <td>${product.product}</td>
    <td>${product.strength}</td>
    <td>${product.packSize}</td>
    <td>${product.ecma}</td>
    <td>${product.expiry}</td>
    <td>${product.leafletQuantity}</td>
    <td><span class="printer-list-status printer-list-status-${leafletFoldedBatchNumbers.includes(product.batch) ? "completed" : "active"}">${leafletFoldedBatchNumbers.includes(product.batch) ? "Completed" : "Active"}</span></td>
  </tr>
`
      )
      .join("")
  : `<tr><td colspan="9">No batches available for Leaflet Folding.</td></tr>`
      }
    </tbody>
  </table>
</div>
      </section>
    </div>
  `;
}

function renderLeafletFoldingWork(stage) {
  if (!leafletFoldingSelectedProduct) return renderLeafletFoldingList();
  const product = leafletFoldingSelectedProduct;
  const record = leafletFoldingRecords[product.batch] || {};
  const isCompleted = Boolean(record.dateTime || leafletFoldedBatchNumbers.includes(product.batch));
  const requiredQuantity = Number(product.leafletQuantity || product.quantity || 0);
  const foldedBy = record.user || (isCompleted ? "leaflet.fold" : "Pending confirmation");
  const foldedAt = record.dateTime || (isCompleted ? "Completed" : "Pending confirmation");
  return `
    <div class="label-printing-layout label-detail-layout label-reference-layout leaflet-folding-detail">
      <section class="label-reference-window">
        <header class="label-reference-header">
          <div><strong>Leaflet Folding - ${product.batch}</strong></div>
          <button class="classic-button" type="button" data-folding-back-queue>Back to Batch Queue</button>
        </header>
        <div class="label-reference-grid">
          ${renderPrintingProductSidebar(product)}
          <main class="label-workflow-card">
            <section class="label-workflow-section label-table-section">
              <div class="label-workflow-section-title"><h3>Leaflet Folding</h3><span>${isCompleted ? "Completed" : "Active"}</span></div>
              <div class="label-reference-table-wrap">
                <table class="classic-table label-requirements-table label-reference-table leaflet-folding-issue-table">
                  <thead><tr><th>Leaflet Reference</th><th>Leaflet Size</th><th>Required Qty</th><th>Folded By</th><th>Date / Time</th><th>Action</th></tr></thead>
                  <tbody><tr>
                    <td>${product.ecma || "-"}</td>
                    <td>${product.packSize || "-"} leaflet</td>
                    <td>${requiredQuantity}</td>
                    <td>${foldedBy}</td>
                    <td>${foldedAt}</td>
                    <td><button class="classic-button row-print-button primary" type="button" data-leaflet-folding-done="${product.batch}" ${isCompleted ? "disabled" : ""}>${isCompleted ? "Completed" : "Done"}</button></td>
                  </tr></tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </section>
    </div>
  `;
}

function getPreAssemblyProducts() {
  const completedProducts = bnsProducts.filter((product) => leafletFoldedBatchNumbers.includes(product.batch));
  const sourceProducts = completedProducts.length ? completedProducts : [bnsProducts[0]];
  return sourceProducts.filter((product) => matchesBatchOrMfgLot(product, preAssemblySearch));
}

function renderPreAssemblyList() {
  const products = getPreAssemblyProducts();
  return `
    <div class="label-printing-layout preassembly-printing-queue">
      <section class="bns-window">
        <div class="sub-window-title">Pre Assembly List</div>
        <div class="printer-list-search preassembly-batch-search-panel">
          <label class="classic-search-label">B&amp;S Batch Number : <input class="classic-search-input" data-preassembly-search value="${preAssemblySearch}" placeholder="Search batch number"></label>
          <label class="classic-search-label">MFG Lot No : <input class="classic-search-input" data-preassembly-search value="${preAssemblySearch}" placeholder="Search MFG lot"></label>
          <button class="classic-search-button preassembly-search-button" type="button" data-preassembly-search-button>Search</button>
        </div>
        <div class="grid-scroll label-grid-scroll">
          <table class="classic-table product-grid label-product-grid preassembly-queue-table">
            <thead>
              <tr>
                <th>B&amp;S Batch Number</th>
                <th class="mfg-lot-col">MFG Lot No</th>
                <th>Product Name</th>
                <th>Strength</th>
                <th>Pack Size</th>
                <th>ECMA</th>
                <th>Expiry Date</th>
                <th>Required Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${products.length
                ? products.map((product) => {
                    const status = preAssemblyCheckedBatchNumbers.includes(product.batch) ? "Completed" : "Active";
                    const statusClass = getPrinterStatusClass(status);
                    return `
                      <tr class="clickable-row printer-queue-${statusClass}" data-open-preassembly="${product.batch}">
                        <td>${product.batch}</td>
                        <td class="mfg-lot-col">${getMfgLotNo(product) || "-"}</td>
                        <td>${product.product}</td>
                        <td>${product.strength}</td>
                        <td>${product.packSize}</td>
                        <td>${product.ecma}</td>
                        <td>${product.expiry}</td>
                        <td>${product.quantity}</td>
                        <td><span class="printer-list-status printer-list-status-${statusClass}">${status}</span></td>
                      </tr>`;
                  }).join("")
                : '<tr><td colspan="9">No batches available for Pre Assembly.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderPreAssemblyRouteFields(product) {
  if (product.routeType === "Reboxing") {
    const record = preAssemblyRecords[product.batch] || {};
    const originalMarks = String(product.marks || "9");
    const currentMarks = String(record.marks ?? originalMarks);
    const marksChanged = currentMarks !== originalMarks;
    return `
      <div class="double-check-scan-panel preassembly-inline-route-fields">
<label>MARKS : <input id="preassembly-marks" data-preassembly-input data-original-marks="${originalMarks}" value="${currentMarks}"></label>
<label>Reason : <input id="preassembly-marks-reason" data-preassembly-input value="${record.marksReason || ""}" placeholder="Enter reason" ${marksChanged ? "" : "disabled"}></label>
<label>Cartons Per Pack : <input value="${product.cartonsPerPack || "1"}" readonly></label>
      </div>
    `;
  }

  return `
    <div class="double-check-scan-panel">
            <label>Product Reference : <input value="${product.partNo}" readonly></label>
      <label>Leaflet Reference : <input value="${product.ecma}" readonly></label>
      <label>Braille Required : <input value="${product.brailleRequired ? "Yes" : "No"}" readonly></label>
    </div>
  `;
}

function getPreAssemblyMaterialRows(product) {
  if (product.routeType === "Reboxing") {
    return [
      { type: "Carton/Braille Label 1", reference: `FLU250-10/120/CZ (${product.ecma})` },
      { type: "Blister Label 1", reference: `FLU250-10/120/CZ/B1 (${product.partNo})` },
      { type: "Blister/Carton Label 2", reference: `FLU250-10/120/CZ/B2 (${product.pl})` },
      { type: "Leaflet 1", reference: `FLU250-10/120/CZ/LT (${product.leafletDate})` }
    ];
  }

  const rows = [
    { type: "Blister Label 1", reference: `${product.partNo}` },
    { type: "Obscure Label", reference: `${product.ecma}` },
    { type: "Leaflet 1", reference: `${product.leafletDate}` }
  ];
  if (product.brailleRequired) rows.push({ type: "Braille Label", reference: `${product.ecma}` });
  return rows;
}

function renderPreAssemblyProductInformation(product) {
  return `
    <section class="preassembly-product-information" aria-label="Product Information">
      <h2>Product Information</h2>
      <dl class="label-sidebar-details">
        <div><dt>Product Name</dt><dd>${product.product}</dd></div>
        <div><dt>Foreign Name</dt><dd>${product.foreignName || "-"}</dd></div>
        <div><dt>Strength</dt><dd>${product.strength}</dd></div>
        <div><dt>Country of origin</dt><dd>${product.country}</dd></div>
        <div><dt>Pack Size</dt><dd>${product.packSize}</dd></div>
        <div><dt>Units per pack</dt><dd>${product.unitsPerPack || "1"}</dd></div>
        <div><dt>B&amp;S Batch Number</dt><dd>${product.batch}</dd></div>
        <div><dt>ECMA</dt><dd>${product.ecma}</dd></div>
        <div><dt>Expiry Date</dt><dd>${product.expiry}</dd></div>
        <div><dt>PL No.</dt><dd>${product.pl}</dd></div>
        <div><dt>Quantity</dt><dd>${product.quantity}</dd></div>
        <div><dt>Product Introduced</dt><dd>${product.productIntroduced || "-"}</dd></div>
        <div><dt>Mfg. Lot No.</dt><dd>${product.manufLotNo || product.manufacturingLot || "-"}</dd></div>
        <div><dt>Leaflet Date</dt><dd>${product.leafletDate || "-"}</dd></div>
        <div><dt>Date Revised</dt><dd>${product.dateRevised || "-"}</dd></div>
      </dl>
    </section>`;
}

function renderPreAssemblyWork(stage) {
  if (!preAssemblySelectedProduct) return renderPreAssemblyList();
  const product = preAssemblySelectedProduct;
  const record = preAssemblyRecords[product.batch] || {};
  const isCompleted = preAssemblyCheckedBatchNumbers.includes(product.batch);
  const completedDisabled = isCompleted ? "disabled" : "";
  const routeLabel = product.routeType === "Reboxing" ? "Carton information required" : "Product details verification";
  const materialRows = getPreAssemblyMaterialRows(product);
  return `
    <div class="bar-creation-layout process-only">
      <section class="process-one-form double-check-detail preassembly-printing-reference">
<header class="label-reference-header preassembly-reference-header"><div><strong>Pre Assembly - Process 6</strong></div><button class="classic-button" type="button" data-print-generated-bar="${product.batch}">Print BAR</button></header>
${renderPreAssemblyProductInformation(product)}
<div class="route-banner">${routeLabel}</div>
${renderPreAssemblyRouteFields(product)}
${product.routeType === "Reboxing" ? renderChangeOfPackSizeForm(product.batch, isCompleted, stage, !isCompleted) : ""}

<div class="preassembly-reference-list">
  <div class="preassembly-verification-layout">
    <section class="preassembly-material-section" aria-label="Type of label checklist">
      <table class="classic-table preassembly-material-table">
        <thead>
          <tr>
<th>Type Of label</th>
<th>Reference code</th>
<th>Checked & Confirmed</th>
          </tr>
        </thead>
        <tbody>
          ${materialRows
.map(
  (row, index) => `
            <tr>
              <td>${row.type}</td>
              <td>${row.reference}</td>
              <td class="preassembly-confirm-cell" data-preassembly-confirm-cell>
                <input type="checkbox" data-preassembly-material="${index}" ${isCompleted ? "checked disabled" : ""}>
              </td>
            </tr>
  `
)
.join("")}
        </tbody>
      </table>
    </section>
    <section class="preassembly-count-section" aria-label="Specimen and pack quantities">
      <div class="preassembly-count-grid">
        <label>No of specimen <input data-preassembly-input id="preassembly-specimen-count" type="number" min="0" value="${record.specimenCount || "2"}" ${completedDisabled}></label>
        <label>No Of Leaflet Folds <input data-preassembly-input id="preassembly-leaflet-folds" type="number" min="0" value="${record.leafletFolds || "3"}" ${completedDisabled}></label>
        <label>Tamper seal per pack <input data-preassembly-input id="preassembly-tamper-seal" type="number" min="0" value="${record.tamperSeal || "0"}" ${completedDisabled}></label>
        <button class="classic-button compact-action preassembly-mockup-button" type="button" data-view-mockup="${product.batch}">Mockup</button>
      </div>
    </section>
  </div>
  <ul class="preassembly-note-list">
    <li>Stamp a Dot on the inner flap of the specimen pack and initial the Dot</li>
    <li>Details in working copy of BAR are satisfactory and printed materials are correct</li>
  </ul>
  <label>Comments <textarea id="preassembly-comments" data-preassembly-input ${completedDisabled}>${record.comments || ""}</textarea></label>
</div>


<div class="signature-grid preassembly-signoff-grid">
  <label>Checked By <input value="${currentLogin ? currentLogin.user : stage.user}" readonly></label>
  <label>Date / Time <input value="${record.dateTime || "Pending sign off"}" readonly></label>
  <button class="classic-button primary compact-action preassembly-corner-signoff" type="button" id="preassembly-complete-button" disabled>${isCompleted ? "Completed" : "User Sign Off"}</button>
</div>
      </section>
    </div>
  `;
}

function updatePreAssemblyMarksReasonState() {
  const marksInput = document.querySelector("#preassembly-marks");
  const reasonInput = document.querySelector("#preassembly-marks-reason");
  if (!marksInput || !reasonInput) return { changed: false, complete: true };
  const originalMarks = String(marksInput.dataset.originalMarks || "").trim();
  const currentMarks = String(marksInput.value || "").trim();
  const changed = currentMarks !== originalMarks;
  reasonInput.disabled = !changed;
  reasonInput.required = changed;
  reasonInput.setAttribute("aria-required", changed ? "true" : "false");
  if (!changed) reasonInput.value = "";
  return { changed, complete: !changed || Boolean(reasonInput.value.trim()) };
}

function updatePreAssemblyAvailability() {
  const submitButton = document.querySelector("#preassembly-complete-button");
  if (!submitButton || !preAssemblySelectedProduct) return;
  if (preAssemblyCheckedBatchNumbers.includes(preAssemblySelectedProduct.batch)) {
    submitButton.disabled = true;
    return;
  }
  const materials = [...document.querySelectorAll("[data-preassembly-material]")];
  const specimenCount = document.querySelector("#preassembly-specimen-count");
  const leafletFolds = document.querySelector("#preassembly-leaflet-folds");
  const tamperSeal = document.querySelector("#preassembly-tamper-seal");
  const materialsComplete = materials.length > 0 && materials.every((check) => check.checked);
  const countsEntered = [specimenCount, leafletFolds, tamperSeal].every((input) => input && input.value !== "");
  const marksReasonState = updatePreAssemblyMarksReasonState();
  const packSizeForm = changeOfPackSizeData[preAssemblySelectedProduct.batch] || {};
  const amendmentsComplete = preAssemblySelectedProduct.routeType !== "Reboxing"
    || Boolean(packSizeForm.printerAmendmentsInitials && packSizeForm.qcAmendmentsInitials);
  
  submitButton.disabled = !(materialsComplete && countsEntered && marksReasonState.complete && amendmentsComplete);

  if (!materialsComplete) {
    statusMessage.textContent = "Confirm all received printed material rows.";
  } else if (!countsEntered) {
    statusMessage.textContent = "Enter specimen, leaflet fold, and tamper seal counts.";
  } else if (!marksReasonState.complete) {
    statusMessage.textContent = "Enter a reason for changing MARKS.";
  } else if (!amendmentsComplete) {
    statusMessage.textContent = "Complete both Change of Pack Size amendment sign-offs.";
  } else {
    statusMessage.textContent = "Process 6 Pre Assembly is ready for sign off.";
  }
}

function openMockupPreview(batchNumber) {
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  document.querySelector("#print-preview-title").textContent = "Mockup";
  printPreviewRequest = null;
  printPreviewBody.innerHTML = `
    <div class="mockup-viewer">
      <div class="mockup-toolbar">
<strong>${product.product}</strong>
<button class="classic-button" type="button" data-close-print-preview>Close</button>
      </div>
      <div class="mockup-image">
<div class="finished-product-mockup">
  <div class="finished-carton">
    <div class="carton-face carton-front">
      <span class="mockup-brand">${product.product}</span>
      <span class="mockup-strength">${product.strength}</span>
      <span>${product.packSize}</span>
      <span>PL ${product.pl}</span>
      <span>EXP ${product.expiry}</span>
    </div>
    <div class="carton-face carton-side">
      <span>${product.ecma}</span>
      <span>${product.batch}</span>
    </div>
  </div>
  <div class="sample-label-preview">
    <strong>Finished sample label position</strong>
    <span>${product.foreignName || product.product}</span>
    <span>B&S Batch Number ${product.batch}</span>
    <span>Leaflet and ${product.routeType === "Reboxing" ? "carton" : "braille"} reference checked</span>
  </div>
</div>
<div class="mockup-label-strip">
  <span>Expected finished presentation</span>
  <span>Use this mockup to prepare and compare the assembly reference sample.</span>
</div>
      </div>
    </div>
  `;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = `Mockup opened for ${product.batch}.`;
}

function completePreAssemblyCheck() {
  if (!preAssemblySelectedProduct) return;
  const batchNumber = preAssemblySelectedProduct.batch;
  if (preAssemblyCheckedBatchNumbers.includes(batchNumber)) {
    statusMessage.textContent = `Batch ${batchNumber} is already completed in Pre Assembly.`;
    return;
  }
  const now = getAssemblyAuditTimestamp();
  preAssemblyRecords[batchNumber] = {
    user: currentLogin ? currentLogin.user : "preassembly.qc",
    dateTime: now,
    specimenCount: document.querySelector("#preassembly-specimen-count") ? document.querySelector("#preassembly-specimen-count").value : "",
    leafletFolds: document.querySelector("#preassembly-leaflet-folds") ? document.querySelector("#preassembly-leaflet-folds").value : "",
    tamperSeal: document.querySelector("#preassembly-tamper-seal") ? document.querySelector("#preassembly-tamper-seal").value : "",
    marks: document.querySelector("#preassembly-marks") ? document.querySelector("#preassembly-marks").value : "",
    marksReason: document.querySelector("#preassembly-marks-reason") ? document.querySelector("#preassembly-marks-reason").value : "",
    comments: document.querySelector("#preassembly-comments") ? document.querySelector("#preassembly-comments").value : "",
    mockupViewed: true
  };
  if (!preAssemblyCheckedBatchNumbers.includes(batchNumber)) {
    preAssemblyCheckedBatchNumbers.push(batchNumber);
  }
  statusMessage.textContent = `Batch ${batchNumber} moved to Production Control / Room Allocation after Pre Assembly.`;
  window.setTimeout(() => {
    preAssemblySelectedProduct = null;
    renderStage("pre-assembly-qc");
    statusMessage.textContent = `Batch ${batchNumber} removed from Pre Assembly list.`;
  }, 1200);
}

function getProductionProducts() {
  const completedProducts = bnsProducts.filter((product) => preAssemblyCheckedBatchNumbers.includes(product.batch));
  const sourceProducts = completedProducts.length ? completedProducts : [bnsProducts[0], bnsProducts[1]].filter(Boolean);
  return sourceProducts.filter((product) => matchesBatchOrMfgLot(product, productionSearch));
}

function renderProductionControlList() {
  const products = getProductionProducts();
  const totalQuantity = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const rowsHtml = products.map((product) => {
    const boxCount = Math.max(1, Math.ceil(Number(product.quantity || 0) / 100));
    const completed = productionAllocatedBatchNumbers.includes(product.batch);
    return `
    <tr class="production-queue-row ${completed ? "completed-stage-row" : ""}">
      <td><strong>${product.batch}</strong><span class="production-mfg-lot">${getMfgLotNo(product) || "MFG lot pending"}</span></td>
      <td>${product.description || product.product}</td>
      <td>${product.quantity}</td>
      <td>${boxCount}</td>
      <td><span class="printer-list-status printer-list-status-${completed ? "completed" : "active"}">${completed ? "Completed" : "Active"}</span></td>
      <td><button class="classic-button primary production-action-button" type="button" data-open-production="${product.batch}">${completed ? "View" : "Open Checklist"}</button></td>
    </tr>
  `;
  }).join("");

  return `
    <div class="production-layout production-queue-layout production-controller-modern">
      <section class="production-window production-queue-window">
        <div class="sub-window-title">Production Controller</div>
        <div class="production-queue-header">
          <div>
            <h3>Production Controller Queue</h3>
          </div>
          <div class="production-queue-summary"><span>Total Batches</span><strong>${products.length}</strong><span>Total Quantity</span><strong>${totalQuantity}</strong></div>
        </div>
        <div class="production-single-list-shell">
          <table class="classic-table production-table production-queue-table">
            <thead>
                <tr><th>BNS_BATCH_NO</th><th>DESCRIPTION</th><th>QUANTITY</th><th>NUMBER_OF_BOXES</th><th>STATUS</th><th>ACTION</th></tr>
            </thead>
            <tbody>${rowsHtml || `<tr><td colspan="6">No batches available in Production Controller stage.</td></tr>`}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderProductionControlWork(stage) {
  if (!productionSelectedProduct) return renderProductionControlList();
  const product = productionSelectedProduct;
  const record = productionRecords[product.batch] || {};
  return `
    <div class="bar-creation-layout process-only">
      <section class="process-one-form production-detail">
<div class="panel-title">Production Controller - Process 7</div>
<div class="production-summary-panel">
  <label>B&S Batch Number <input value="${product.batch}" readonly></label>
  <label>Product Name <input value="${product.product}" readonly></label>
  <label>Number of Boxes <input id="production-box-count" data-production-input type="number" min="1" value="${record.boxCount || Math.max(1, Math.ceil(Number(product.quantity || 0) / 100))}"></label>
  <label>Room No. <input id="production-room-no" data-production-input value="${record.roomNo || "Room 2"}"></label>
</div>
<div class="process-checks">
  <div class="process-instruction">Production Control checks</div>
  <label class="process-tick"><input type="checkbox" data-production-check> Number of boxes checked</label>
  <label class="process-tick"><input type="checkbox" data-production-check> Product name, strength, pack size, expiry and quantity confirmed</label>
</div>
<div class="signature-grid">
  <label>Allocated By <input value="${currentLogin ? currentLogin.user : stage.user}" readonly></label>
  <label>Date / Time <input value="${record.dateTime || "Pending sign off"}" readonly></label>
  <div class="signoff-action process-signoff-action">
    <button class="classic-button primary" type="button" id="production-complete-button" disabled>User Sign Off</button>
  </div>
</div>
      </section>
    </div>
  `;
}

function updateProductionAvailability() {
  const submitButton = document.querySelector("#production-complete-button");
  if (!submitButton || !productionSelectedProduct) return;
  const checks = [...document.querySelectorAll("[data-production-check]")];
  const boxCount = document.querySelector("#production-box-count");
  const roomNo = document.querySelector("#production-room-no");
  const checksComplete = checks.length > 0 && checks.every((check) => check.checked);
  const hasBoxes = Boolean(boxCount && Number(boxCount.value) > 0);
  const hasRoom = Boolean(roomNo && roomNo.value.trim());
  submitButton.disabled = !(checksComplete && hasBoxes && hasRoom);
}

function completeProductionControl() {
  if (!productionSelectedProduct) return;
  const batchNumber = productionSelectedProduct.batch;
  if (productionAllocatedBatchNumbers.includes(batchNumber)) {
    statusMessage.textContent = `Batch ${batchNumber} is already completed in Production Control.`;
    return;
  }
  const now = getAssemblyAuditTimestamp();
  productionRecords[batchNumber] = {
    user: currentLogin ? currentLogin.user : "production.control",
    dateTime: now,
    boxCount: document.querySelector("#production-box-count") ? document.querySelector("#production-box-count").value : "",
    roomNo: document.querySelector("#production-room-no") ? document.querySelector("#production-room-no").value : ""
  };
  if (!productionAllocatedBatchNumbers.includes(batchNumber)) productionAllocatedBatchNumbers.push(batchNumber);
  statusMessage.textContent = `Batch ${batchNumber} allocated to Assembly Room.`;
  window.setTimeout(() => {
    productionSelectedProduct = null;
    renderStage("room-allocation");
  }, 900);
}

function getAssemblyProducts() {
  const allocatedProducts = bnsProducts.filter((product) => productionAllocatedBatchNumbers.includes(product.batch));
  const sourceProducts = allocatedProducts.length ? allocatedProducts : [bnsProducts[0], bnsProducts[1]].filter(Boolean);
  return sourceProducts.filter(
    (product) =>
      !assembledBatchNumbers.includes(product.batch) &&
      matchesBatchOrMfgLot(product, assemblySearch)
  );
}

function getAssemblyReceivedQuantity(product) {
  return Number(product && (product.receivedQuantity ?? product.onHandQuantity ?? product.quantity) || 0);
}

function getBnsNewQuantity(product) {
  return Number(product && (product.bnsNewQty ?? product.quantity ?? product.receivedQuantity ?? product.onHandQuantity) || 0);
}

function getAssemblyClockTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getAssemblyCheckInRows() {
  const demoRows = [
    { user: "JACINTA FER", room: "Room 1", start: "08:32", end: "10:17" },
    { user: "SUITAI BEN", room: "Room 1", start: "08:33", end: "10:19" },
    { user: "NASNEEN", room: "Room 2", start: "08:48", end: "" },
    { user: "MONICA CAR", room: "Room 3", start: "09:33", end: "" }
  ];
  return [...assemblyAttendanceLiveRows].reverse().concat(demoRows);
}

function recordAssemblyAttendanceAction(action, scannedId, room) {
  const now = getAssemblyClockTime();
  if (action === "Check In") {
    const existingActive = assemblyAttendanceLiveRows.find((row) => row.user.toLowerCase() === scannedId.toLowerCase() && !row.end);
    if (existingActive) {
      statusMessage.textContent = `${scannedId} is already checked in to ${existingActive.room}.`;
      return;
    }
    assemblyAttendanceLiveRows.push({ user: scannedId, room, start: now, end: "", checkedInAt: getAssemblyAuditTimestamp() });
    renderStage("assembly-room");
    statusMessage.textContent = `${scannedId} checked in to ${room} at ${now}.`;
    return;
  }

  const activeRow = [...assemblyAttendanceLiveRows].reverse().find((row) => row.user.toLowerCase() === scannedId.toLowerCase() && !row.end);
  if (!activeRow) {
    statusMessage.textContent = `No active check-in was found for ${scannedId}.`;
    return;
  }
  activeRow.end = now;
  activeRow.checkedOutAt = getAssemblyAuditTimestamp();
  renderStage("assembly-room");
  statusMessage.textContent = `${scannedId} checked out from ${activeRow.room} at ${now}.`;
}

function renderAssemblyCheckInPanel() {
  const rows = getAssemblyCheckInRows().slice(0, 6).map((row) => {
    const active = !row.end;
    return `
      <tr>
        <td><strong>${htmlSafe(row.user)}</strong></td>
        <td>Assembler</td>
        <td>${htmlSafe(row.room || "Room 2")}</td>
        <td>${row.start || "-"}</td>
        <td>${row.end || "-"}</td>
        <td>${active ? '<span class="assembly-status assembly-status-present">Present</span>' : '<span class="assembly-status assembly-status-complete">Checked out</span>'}</td>
      </tr>
    `;
  }).join("");
  return `
    <section class="assembly-attendance-card assembly-room-attendance">
      <div class="assembly-section-heading">
        <div><h3>Room Attendance</h3></div>
      </div>
      <div class="assembly-attendance-toolbar">
        <label class="assembly-room-selector">Room
          <select id="assembly-attendance-room">
            <option>Room 1</option>
            <option selected>Room 2</option>
            <option>Room 3</option>
          </select>
        </label>
        <button class="classic-button assembly-attendance-action is-checkin" type="button" data-assembly-attendance="Check In">Check In</button>
        <button class="classic-button assembly-attendance-action is-checkout" type="button" data-assembly-attendance="Check Out">Check Out</button>
      </div>
      <div class="assembly-table-scroll">
        <table class="assembly-modern-table assembly-attendance-table">
          <thead><tr><th>Staff Name</th><th>Role</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}
function renderAssemblyRoomList() {
  const products = getAssemblyProducts();
  const completedProducts = bnsProducts.filter(
    (product) => assembledBatchNumbers.includes(product.batch) && matchesBatchOrMfgLot(product, assemblySearch)
  );
  const activeRowsHtml = products.map((product) => {
    const record = assemblyRecords[product.batch] || {};
    const started = Boolean(getAssemblyLifecycleRecord(record, "start").dateTime);
    const runtime = record.runtime || {};
    const runtimeStatus = runtime.status === "break" ? "On Break" : runtime.status === "partial" ? "Partial Finished" : started ? "In Progress" : "Not Started";
    const runtimeClass = runtime.status === "break" || runtime.status === "partial" ? "assembly-status-waiting" : started ? "assembly-status-progress" : "assembly-status-waiting";
    return `
      <tr>
        <td><button class="assembly-batch-link" type="button" data-open-assembly="${product.batch}">${product.batch}</button></td>
        <td class="mfg-lot-col">${getMfgLotNo(product) || "-"}</td>
        <td>${product.description}</td>
        <td>${getAssemblyReceivedQuantity(product).toLocaleString("en-GB")}</td>
        <td>${getBnsNewQuantity(product).toLocaleString("en-GB")}</td>
        <td><span class="assembly-status ${runtimeClass}">${runtimeStatus}</span></td>
        <td><button class="classic-button assembly-open-button" type="button" data-open-assembly="${product.batch}">${started ? "Continue" : "Open"}</button></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="7" class="assembly-empty-state">No active batches are available for Assembly.</td></tr>`;
  const completedRowsHtml = completedProducts.map((product) => {
    const record = assemblyRecords[product.batch] || {};
    const finished = getAssemblyLifecycleRecord(record, "finish");
    return `
      <tr>
        <td><button class="assembly-batch-link" type="button" data-open-assembly="${product.batch}">${product.batch}</button></td>
        <td class="mfg-lot-col">${getMfgLotNo(product) || "-"}</td>
        <td>${product.description}</td>
        <td>${getAssemblyReceivedQuantity(product).toLocaleString("en-GB")}</td>
        <td>${getBnsNewQuantity(product).toLocaleString("en-GB")}</td>
        <td>${finished.user || "assembly.room"}</td>
        <td><span class="assembly-status assembly-status-complete">Completed</span></td>
        <td><button class="classic-button assembly-open-button" type="button" data-open-assembly="${product.batch}">View</button></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="8" class="assembly-empty-state">No completed batches match the current search.</td></tr>`;
  const showingCompleted = assemblyQueueView === "completed";
  return `
    <div class="assembly-layout assembly-modern">
      <section class="assembly-window assembly-main-clean assembly-modern-shell">
        <header class="assembly-page-header">
          <div>
            
            <h2>Assembly Batch Queue</h2>

          </div>
          <div class="assembly-user-chip"><span>${currentLogin ? currentLogin.user : "assembly.room"}</span><small>Assembly Room User</small></div>
        </header>

        <div class="assembly-queue-tabs" role="tablist" aria-label="Assembly batch queues">
          <button class="${!showingCompleted ? "active" : ""}" type="button" data-assembly-queue-view="active">Active Batches <span>${products.length}</span></button>
          <button class="${showingCompleted ? "active" : ""}" type="button" data-assembly-queue-view="completed">Completed Batches <span>${completedProducts.length}</span></button>
        </div>

        <div class="assembly-filter-bar">
          <input class="assembly-normal-search" type="search" data-assembly-search value="${assemblySearch}" aria-label="Search assembly batches" placeholder="Search by B&amp;S Batch / Lot / Product">
          <button class="classic-button primary" type="button" data-assembly-search-button>Search</button>
          <button class="classic-button" type="button" data-assembly-refresh>Refresh</button>
        </div>

        <section class="assembly-queue-card">
          <div class="assembly-section-heading">
            <div><h3>${showingCompleted ? "Completed Batches" : "Active Batches"}</h3></div>
          </div>
          <div class="assembly-table-scroll">
            <table class="assembly-modern-table assembly-queue-table">
              <thead>${showingCompleted
                ? '<tr><th>B&amp;S Batch No.</th><th>Mfg Lot No.</th><th>Description</th><th>Quantity</th><th>B&amp;S_New_Qty</th><th>Finished By</th><th>Status</th><th>Action</th></tr>'
                : '<tr><th>B&amp;S Batch No.</th><th>Mfg Lot No.</th><th>Description</th><th>Quantity</th><th>B&amp;S_New_Qty</th><th>Status</th><th>Action</th></tr>'}
              </thead>
              <tbody>${showingCompleted ? completedRowsHtml : activeRowsHtml}</tbody>
            </table>
          </div>
        </section>

        ${renderAssemblyCheckInPanel()}
      </section>
    </div>
  `;
}
function renderAssemblyCompletedSummary(product, record, productionRecord) {
  const start = getAssemblyLifecycleRecord(record, "start");
  const finish = getAssemblyLifecycleRecord(record, "finish");
  const pageRecords = record.signedTabs || {};
  const pages = [
    ["materials", "Page 1", "Initial Checks"],
    ["samples", "Page 2", "Random Sample Check"],
    ["ipc", "Page 3", "IPC Photo Check"],
    ["recon", "Page 4", "Reconciliation & Closure"]
  ];
  const pageRows = pages.map(([key, page, title]) => {
    const completion = pageRecords[key] || (key === "recon" ? pageRecords.reconciliation : null);
    return `
      <tr>
        <td><strong>${page}</strong></td>
        <td>${title}</td>
        <td><span class="assembly-summary-status ${completion ? "is-complete" : ""}">${completion ? "Done" : "Not recorded"}</span></td>
        <td>${completion ? completion.user : "-"}</td>
        <td>${completion ? completion.dateTime : "-"}</td>
      </tr>`;
  }).join("");
  const runtime = record.runtime || {};
  const history = runtime.history || [];
  const historyRows = history.length ? history.map((entry) => `
    <tr>
      <td>${entry.action || "Batch activity"}</td>
      <td>${entry.quantity ? Number(entry.quantity).toLocaleString("en-GB") : "-"}</td>
      <td>${entry.user || "-"}</td>
      <td>${entry.dateTime || "-"}</td>
    </tr>`).join("") : '<tr><td colspan="4" class="assembly-empty-state">No break or partial-shift activity was recorded.</td></tr>';
  return `
    <div class="assembly-layout assembly-modern">
      <section class="assembly-window assembly-detail-window assembly-modern-shell assembly-completed-summary">
        <header class="assembly-page-header assembly-detail-page-header">
          <div>
            <button class="assembly-text-back" type="button" data-assembly-back="queue">&larr; Completed Batches</button>
            <h2>Completed Batch Summary</h2>
          </div>
          <div class="assembly-page-count">
            <button class="classic-button workflow-print-bar-button" type="button" data-print-generated-bar="${product.batch}">Print BAR</button>
            <strong>Completed</strong>
            <span>Read-only summary</span>
          </div>
        </header>

        <section class="assembly-batch-summary assembly-product-details-banner" aria-label="Completed batch product details">
          <div><span>B&amp;S Batch No.</span><strong>${product.batch}</strong></div>
          <div class="mfg-lot-col"><span>Mfg Lot No.</span><strong>${getMfgLotNo(product) || "-"}</strong></div>
          <div><span>Description</span><strong>${product.description || product.product}</strong></div>
          <div><span>Quantity</span><strong>${getAssemblyReceivedQuantity(product).toLocaleString("en-GB")}</strong></div>
          <div><span>Assembled Qty</span><strong>${Number(record.usedLabels || product.quantity || 0).toLocaleString("en-GB")}</strong></div>
          <div><span>Expiry Date</span><strong>${product.expiry || "-"}</strong></div>
          <div><span>Strength</span><strong>${product.strength || "-"}</strong></div>
          <div><span>Pack Size</span><strong>${product.packSize || "-"}</strong></div>
          <div><span>Status</span><strong>Completed</strong></div>
          <div><span>B&amp;S_New_Qty</span><strong>${getBnsNewQuantity(product).toLocaleString("en-GB")}</strong></div>
        </section>

        <section class="assembly-content-card">
          <div class="assembly-section-heading"><div><h3>Lifecycle Summary</h3></div></div>
          <div class="assembly-completed-lifecycle">
            <div><span>Started By</span><strong>${start.user || "-"}</strong><small>${start.dateTime || "-"}</small></div>
            <div><span>Completed By</span><strong>${finish.user || record.user || "-"}</strong><small>${finish.dateTime || record.dateTime || "-"}</small></div>
            <div><span>Final Status</span><strong>Completed</strong><small>All Assembly pages closed</small></div>
          </div>
        </section>

        <section class="assembly-content-card">
          <div class="assembly-section-heading"><div><h3>Page Completion Summary</h3></div></div>
          <div class="assembly-table-scroll">
            <table class="assembly-modern-table assembly-completed-pages-table">
              <thead><tr><th>Page</th><th>Check</th><th>Status</th><th>Completed By</th><th>Completed At</th></tr></thead>
              <tbody>${pageRows}</tbody>
            </table>
          </div>
        </section>

        <section class="assembly-content-card">
          <div class="assembly-section-heading"><div><h3>Break &amp; Partial Shift History</h3></div></div>
          <div class="assembly-table-scroll">
            <table class="assembly-modern-table assembly-completed-pages-table">
              <thead><tr><th>Activity</th><th>Quantity</th><th>Operator ID</th><th>Date &amp; Time</th></tr></thead>
              <tbody>${historyRows}</tbody>
            </table>
          </div>
          ${record.comments ? `<div class="assembly-summary-comments"><span>Comments</span><p>${record.comments}</p></div>` : ""}
        </section>

        <footer class="assembly-summary-footer">
          <button class="classic-button" type="button" data-assembly-back="queue">Back to Completed Batches</button>
        </footer>
      </section>
    </div>`;
}
function renderAssemblyReconciliationRows(record, defaults, readOnly = true, disabled = "") {
  const fields = ["qtyReceived", "usedQty", "damagedQty", "discrepancyQty"];
  const ids = ["assembly-qty-received", "assembly-used-qty", "assembly-damaged-qty", "assembly-discrepancy-qty"];
  return ["Carton / Braille Label 1", "Blister Label 1", "Blister / Carton 2", "Leaflet 1", "Other"].map((label, index) => {
    const values = fields.map((field, col) => record.reconciliationRows?.[index]?.[field] ?? defaults[col] ?? "Not recorded");
    return `<tr data-assembly-recon-row="${index}"><td><strong>${label}</strong></td>${values.map((value, col) => readOnly ? `<td>${htmlSafe(value)}</td>` : `<td><input data-assembly-input data-recon-field="${fields[col]}" value="${htmlSafe(value)}" ${index === 0 ? `id="${ids[col]}"` : ""} ${disabled}></td>`).join("")}</tr>`;
  }).join("");
}

function renderAssemblyRoomWork(stage) {
  if (!assemblySelectedProduct) return renderAssemblyRoomList();
  const product = assemblySelectedProduct;
  const record = assemblyRecords[product.batch] || {};
  const productionRecord = productionRecords[product.batch] || {};
  const startRecord = getAssemblyLifecycleRecord(record, "start");
  const signedTabs = record.signedTabs || {};
  const runtime = record.runtime || { status: startRecord.dateTime ? "running" : "not-started" };
  const batchCompleted = assembledBatchNumbers.includes(product.batch);
  if (batchCompleted) return renderAssemblyCompletedSummary(product, record, productionRecord);
  const totalBatchQuantity = getBnsNewQuantity(product);
  const partialQuantity = Number(runtime.partialQuantity || 0);
  const runtimeLabel = runtime.status === "break" ? "On Break - batch time paused" : runtime.status === "partial" ? "Partial Finish - waiting for next shift" : batchCompleted ? "Completed" : "Batch Running";
  const activeTab = assemblyActiveTab || "materials";
  const signedBy = currentLogin ? currentLogin.user : stage.user;
  const assemblyPages = {
    materials: { number: 1, title: "Assembly Room - Initial Checks", shortTitle: "Initial Checks", description: "" },
    samples: { number: 2, title: "Random Sample Check", shortTitle: "Random Sample", description: "" },
    ipc: { number: 3, title: "IPC Photo Check", shortTitle: "IPC Photo", description: "" },
    recon: { number: 4, title: "Reconciliation & Closure", shortTitle: "Reconciliation", description: "" }
  };
  const activePage = assemblyPages[activeTab];
  const tabDisabled = (tabName) => signedTabs[tabName] ? "disabled" : "";
  const tabChecked = (tabName) => signedTabs[tabName] ? "checked" : "";
  const tabSignoff = (tabName, label) => {
    const signed = signedTabs[tabName];
    const pageNumber = assemblyPages[tabName].number;
    const actionLabel = "Mark Done";
    return `
      <div class="page-signoff-row assembly-signoff-bar ${signed ? "signed" : ""}">
        <button class="classic-button" type="button" data-assembly-back>${pageNumber === 1 ? "Back to Queue" : "Back"}</button>
        <div class="assembly-signoff-guidance">
          ${signed
            ? `<strong>Page ${pageNumber} completed</strong><span>${signed.user} | ${signed.dateTime}</span>`
            : ""}
        </div>
        <button class="classic-button primary" type="button" data-assembly-page-signoff="${tabName}" ${signed ? "disabled" : ""}>${signed ? `Page ${pageNumber} Done` : actionLabel}</button>
      </div>
    `;
  };
  const boxCount = Math.max(1, Number(productionRecord.boxCount || record.boxCount || 1));

  const quantity = getBnsNewQuantity(product);
  const qtyReceived = record.qtyReceived || String(getAssemblyReceivedQuantity(product));
  const qtyUsed = record.usedQty || String(quantity);
  const damages = record.damagedQty || "0";
  const discrepancyQty = record.discrepancyQty || String(Number(qtyReceived || 0) - Number(qtyUsed || 0) - Number(damages || 0));
  const sampleRows = Array.from({ length: boxCount }).map((_, index) => {
    const boxNo = String(index + 1).padStart(3, "0");
    return `
      <tr class="assembly-confirm-row">
        <td>${index + 1}</td>
        <td><strong>BOX-${boxNo}</strong></td>
        <td class="mfg-lot-col">${product.manufacturingLot || "25088FA"}</td>
        <td>${product.expiry}</td>
        <td>
          <label class="assembly-row-confirm">
            <input type="checkbox" data-assembly-check data-assembly-tab-check="samples" ${tabChecked("samples")} ${tabDisabled("samples")}>
            <span class="assembly-pending-label">Pending</span><span class="assembly-confirmed-label">Checked</span>
          </label>
        </td>
        <td>${signedTabs.samples ? signedTabs.samples.user : "-"}</td>
        <td>${signedTabs.samples ? signedTabs.samples.dateTime : "-"}</td>
      </tr>
    `;
  }).join("");
  const reconRows = renderAssemblyReconciliationRows(record, [qtyReceived, qtyUsed, damages, discrepancyQty], false, tabDisabled("recon"));

  return `
    <div class="assembly-layout assembly-modern">
      <section class="assembly-window assembly-detail-window assembly-modern-shell">
        <header class="assembly-page-header assembly-detail-page-header">
          <div>
            <button class="assembly-text-back" type="button" data-assembly-back="queue">&larr; Assembly Batch Queue</button>
            
            <h2 id="assembly-page-title">${activePage.title}</h2>
            <p id="assembly-page-description" ${activePage.description ? "" : "hidden"}>${activePage.description}</p>
          </div>
          <div class="assembly-page-actions">
            <button class="classic-button workflow-print-bar-button" type="button" data-print-generated-bar="${product.batch}">Print BAR</button>
          </div>
        </header>

        <section class="assembly-batch-summary assembly-product-details-banner" aria-label="Selected batch product details">
          <div><span>B&amp;S Batch No.</span><strong>${product.batch}</strong></div>
          <div class="mfg-lot-col"><span>Mfg Lot No.</span><strong>${getMfgLotNo(product) || "-"}</strong></div>
          <div><span>Description</span><strong>${product.description || product.product}</strong></div>
          <div><span>Quantity</span><strong>${getAssemblyReceivedQuantity(product).toLocaleString("en-GB")}</strong></div>
          <div><span>Assembled Qty</span><strong>${partialQuantity.toLocaleString("en-GB")}</strong></div>
          <div><span>Expiry Date</span><strong>${product.expiry || "-"}</strong></div>
          <div><span>Strength</span><strong>${product.strength || "-"}</strong></div>
          <div><span>Pack Size</span><strong>${product.packSize || "-"}</strong></div>
          <div><span>Status</span><strong>${runtimeLabel}</strong></div>
          <div><span>B&amp;S_New_Qty</span><strong>${getBnsNewQuantity(product).toLocaleString("en-GB")}</strong></div>
          <div class="assembly-product-actions" aria-label="Batch controls">
            <span>Batch Actions</span>
            <button class="classic-button assembly-batch-action is-break" type="button" data-assembly-batch-action="${runtime.status === "break" ? "resume-break" : "break"}" ${runtime.status === "partial" || batchCompleted ? "disabled" : ""}>${runtime.status === "break" ? "Resume Batch" : "Break"}</button>
            <label class="assembly-partial-quantity">Quantity completed
              <input id="assembly-partial-quantity" type="number" min="1" max="${totalBatchQuantity}" value="${partialQuantity || ""}" ${runtime.status !== "running" || batchCompleted ? "disabled" : ""}>
            </label>
            <button class="classic-button assembly-batch-action is-partial-finish" type="button" data-assembly-batch-action="partial-finish" ${runtime.status !== "running" || batchCompleted ? "disabled" : ""}>Partial Finish</button>
            <button class="classic-button assembly-batch-action is-partial-resume" type="button" data-assembly-batch-action="resume-partial" ${runtime.status !== "partial" || batchCompleted ? "disabled" : ""}>Partial Start</button>
          </div>
        </section>

        <nav class="assembly-process-tabs" aria-label="Assembly checklist pages">
          ${Object.entries(assemblyPages).map(([key, page]) => `
            <button class="assembly-tab ${activeTab === key ? "active" : ""} ${signedTabs[key] ? "complete" : ""}" type="button" data-assembly-tab="${key}">
              <span>${signedTabs[key] ? "&#10003;" : page.number}</span><strong>${page.shortTitle}</strong>
            </button>
          `).join("")}
        </nav>

        <div class="assembly-tab-panel ${activeTab === "materials" ? "active" : ""}" data-assembly-panel="materials">
          <fieldset class="assembly-lock-fieldset" ${tabDisabled("materials")}>
            <section class="assembly-content-card assembly-initial-card">
              <div class="assembly-two-column">
                <div class="assembly-subpanel">
                  <div class="assembly-section-heading"><div><h3>Lifecycle Audit</h3></div></div>
                  <div class="assembly-audit-grid">
                    <label>Batch Start <input id="assembly-start-time" data-assembly-input value="${startRecord.dateTime || "Pending"}" readonly></label>
                    <label>Started By <input id="assembly-start-user" data-assembly-input value="${startRecord.user || "Pending"}" readonly></label>
                    <label>Assembly Room <input value="${productionRecord.roomNo || "Room 2"}" readonly></label>
                  </div>
                </div>
                <div class="assembly-subpanel assembly-briefing-panel">
                  <div class="assembly-section-heading"><div><h3>Team Briefing</h3></div></div>
                  <div class="assembly-briefing-confirmation ${record.briefingConfirmation ? "is-confirmed" : ""}">
                    <div class="assembly-briefing-fields">
                      <div class="assembly-briefing-value"><span>Briefing Done By</span><strong id="assembly-briefing-user">${record.briefingConfirmation ? record.briefingConfirmation.user : "-"}</strong></div>
                      <div class="assembly-briefing-value"><span>Confirmed At</span><strong id="assembly-briefing-at">${record.briefingConfirmation ? record.briefingConfirmation.dateTime : "-"}</strong></div>
                    </div>
                    <button class="classic-button primary assembly-briefing-confirm-button" type="button" data-confirm-assembly-briefing ${record.briefingConfirmation || signedTabs.materials ? "disabled" : ""}>${record.briefingConfirmation ? "Briefing Confirmed" : "Confirm Briefing"}</button>
                  </div>
                </div>
              </div>
              <div class="assembly-confirmation-list">
                <div class="assembly-section-heading"><div><h3>Initial Confirmations</h3><p>Complete every required confirmation before marking this page done.</p></div></div>
                ${[
                  "Batch Assembly Record (BAR) is available and correct",
                  "Correct specimen (physical and electronic) is available",
                  "Allocated room is clean and ready for assembly",
                  "All required printed components received from Production Control",
                  "All component boxes verified and accounted for"
                ].map((label) => `<label class="assembly-check-row"><span class="assembly-check-icon">&#9673;</span><strong>${label}</strong><input type="checkbox" data-assembly-check data-assembly-tab-check="materials" ${tabChecked("materials")}></label>`).join("")}
              </div>
            </section>
          </fieldset>
          ${tabSignoff("materials", "Initial Checks")}
        </div>

        <div class="assembly-tab-panel ${activeTab === "samples" ? "active" : ""}" data-assembly-panel="samples">
          <fieldset class="assembly-lock-fieldset" ${tabDisabled("samples")}>
            <section class="assembly-content-card">
              <div class="assembly-section-heading">
                <div><h3>Random Product Check</h3><p>Check the selected product from each of the ${boxCount} box${boxCount === 1 ? "" : "es"} against the BAR.</p></div>
                <div class="assembly-legend"><span class="is-pending">Pending</span><span class="is-confirmed">Checked</span></div>
              </div>
              <div class="assembly-table-scroll">
                <table class="assembly-modern-table assembly-sample-table">
                  <thead><tr><th>#</th><th>Box No.</th><th class="mfg-lot-col">Mfg Lot No.</th><th>Expiry Date</th><th>Status</th><th>Checked By</th><th>Checked At</th></tr></thead>
                  <tbody>${sampleRows}</tbody>
                </table>
              </div>
            </section>
          </fieldset>
          ${tabSignoff("samples", "Random Sample Check")}
        </div>

        <div class="assembly-tab-panel ${activeTab === "ipc" ? "active" : ""}" data-assembly-panel="ipc">
          <fieldset class="assembly-lock-fieldset" ${tabDisabled("ipc")}>
            <section class="assembly-content-card">
              <div class="assembly-section-heading">
                <div><h3>IPC Photo Check</h3><p>Take or upload one clear photo of the in-process product. No timer or additional result entry is required.</p></div>
              </div>
              <div class="assembly-ipc-photo-card ${signedTabs.ipc ? "is-complete" : ""}">
                <div class="assembly-ipc-photo-icon">&#128247;</div>
                <div class="assembly-ipc-photo-copy">
                  <strong>${signedTabs.ipc ? "IPC photo captured" : "Capture IPC photo"}</strong>
                  <span>${signedTabs.ipc ? `${record.ipcPhotoName || "Photo attached"} | ${signedTabs.ipc.user} | ${signedTabs.ipc.dateTime}` : "Use the camera or choose one image file."}</span>
                </div>
                <label class="assembly-evidence-button ${signedTabs.ipc ? "is-uploaded" : ""}">
                  <input type="file" accept="image/*" capture="environment" data-assembly-ipc-evidence ${tabDisabled("ipc")}>
                  <span>${signedTabs.ipc ? "Photo Attached" : "Take Picture"}</span>
                </label>
              </div>
            </section>
          </fieldset>
          ${tabSignoff("ipc", "IPC Photo Check")}
        </div>

        <div class="assembly-tab-panel ${activeTab === "recon" ? "active" : ""}" data-assembly-panel="recon">
          <fieldset class="assembly-lock-fieldset" ${tabDisabled("recon")}>
            <section class="assembly-content-card">
              <div class="assembly-section-heading"><div><h3>Material Reconciliation</h3><p>Account for issued materials before completing room clearance.</p></div></div>
              <div class="assembly-table-scroll">
                <table class="assembly-modern-table assembly-reconciliation-table">
                  <thead><tr><th>Item</th><th>Received</th><th>Used</th><th>Damaged</th><th>Discrepant</th></tr></thead>
                  <tbody>${reconRows}</tbody>
                </table>
              </div>
              <div class="assembly-metric-grid">
                <label><span>Total Used</span><input id="assembly-used-labels" data-assembly-input type="number" min="0" value="${record.usedLabels || product.quantity}"></label>
                <label><span>Retention Sample</span><input data-assembly-input value="1"></label>
                <label><span>Yield</span><input id="assembly-surplus-qty" data-assembly-input type="number" min="0" value="${record.surplusQty || Number(product.quantity || 0) - 1}"></label>
                <label><span>Total Damaged</span><input id="assembly-extra-components" data-assembly-input value="${record.extraComponents || "0"}"></label>
              </div>
            </section>
            <section class="assembly-content-card assembly-closure-optimized">
              <div class="assembly-comments-section">
                <div class="assembly-section-heading"><div><h3>Comments</h3><p>Add any discrepancy, damage or closure note in this single comments section.</p></div></div>
                <textarea id="assembly-comments" data-assembly-input placeholder="Enter comments (if any)...">${record.comments || ""}</textarea>
              </div>
              <div class="assembly-clearance-section">
                <div class="assembly-section-heading"><div><h3>End-of-Batch Clearance</h3><p>Confirm each item to clear the room and finish the batch.</p></div></div>
                <div class="assembly-clearance-list assembly-clearance-grid">
                  ${[
                    "All materials returned to stores or properly accounted for",
                    "Work area cleaned and equipment returned",
                    "Waste disposed of as per SOP",
                    "Room is clean and ready for the next batch"
                  ].map((label) => `<label class="assembly-clearance-row"><span>&#10003;</span><strong>${label}</strong><input type="checkbox" data-assembly-check data-assembly-tab-check="recon" ${tabChecked("recon")}></label>`).join("")}
                </div>
              </div>
            </section>
          </fieldset>
          ${tabSignoff("recon", "Reconciliation & Closure")}
        </div>
      </section>
    </div>
  `;
}
function updateAssemblyAvailability() {
  if (!assemblySelectedProduct) return;
  refreshAssemblyReconciliationStatus();
  document.querySelectorAll("[data-assembly-page-signoff]").forEach((button) => {
    const tabName = button.dataset.assemblyPageSignoff;
    const record = assemblyRecords[assemblySelectedProduct.batch] || {};
    const signedTabs = record.signedTabs || {};
    if (signedTabs[tabName]) {
      button.disabled = true;
      return;
    }
    const checks = [...document.querySelectorAll(`[data-assembly-tab-check="${tabName}"]`)];
    const checksComplete = checks.length === 0 || checks.every((check) => check.checked);
    const briefingComplete = tabName !== "materials" || Boolean(record.briefingConfirmation);
    const ipcInput = document.querySelector("[data-assembly-ipc-evidence]");
    const ipcComplete = tabName !== "ipc" || Boolean(record.ipcPhotoName || (ipcInput && ipcInput.files && ipcInput.files.length));
    const reconComplete = tabName !== "recon" || Boolean(document.querySelector("#assembly-used-qty") && document.querySelector("#assembly-used-qty").value !== "");
    button.disabled = !(checksComplete && briefingComplete && ipcComplete && reconComplete);
  });
}

function recordAssemblyBatchRuntimeAction(action, scannedId) {
  if (!assemblySelectedProduct) return;
  const batchNumber = assemblySelectedProduct.batch;
  const existingRecord = assemblyRecords[batchNumber] || {};
  const existingRuntime = existingRecord.runtime || { status: "running", history: [] };
  const now = getAssemblyAuditTimestamp();
  const history = [...(existingRuntime.history || [])];
  let nextRuntime = { ...existingRuntime };

  if (action === "break") {
    if (existingRuntime.status !== "running") return;
    history.push({ action: "Break Started", user: scannedId, dateTime: now });
    nextRuntime = {
      ...existingRuntime,
      status: "break",
      timerPaused: true,
      breakStartedAt: now,
      lastAction: "Break Started",
      lastActionBy: scannedId,
      lastActionAt: now,
      history
    };
  } else if (action === "resume-break") {
    if (existingRuntime.status !== "break") return;
    history.push({ action: "Break Resumed", user: scannedId, dateTime: now });
    nextRuntime = {
      ...existingRuntime,
      status: "running",
      timerPaused: false,
      breakStartedAt: "",
      lastAction: "Batch Resumed",
      lastActionBy: scannedId,
      lastActionAt: now,
      history
    };
  } else if (action === "partial-finish") {
    const quantityInput = document.querySelector("#assembly-partial-quantity");
    const completedQuantity = Number(quantityInput ? quantityInput.value : 0);
    const totalQuantity = getBnsNewQuantity(assemblySelectedProduct);
    if (!completedQuantity || completedQuantity < 1 || completedQuantity > totalQuantity) {
      statusMessage.textContent = `Enter a completed quantity between 1 and ${totalQuantity.toLocaleString("en-GB")}.`;
      return;
    }
    history.push({ action: "Partial Finish", user: scannedId, dateTime: now, quantity: completedQuantity });
    nextRuntime = {
      ...existingRuntime,
      status: "partial",
      timerPaused: true,
      partialQuantity: completedQuantity,
      remainingQuantity: Math.max(0, totalQuantity - completedQuantity),
      partialFinishedBy: scannedId,
      partialFinishedAt: now,
      lastAction: "Partial Finish",
      lastActionBy: scannedId,
      lastActionAt: now,
      history
    };
  } else if (action === "resume-partial") {
    if (existingRuntime.status !== "partial") return;
    history.push({ action: "Partial Start", user: scannedId, dateTime: now, remainingQuantity: existingRuntime.remainingQuantity });
    nextRuntime = {
      ...existingRuntime,
      status: "running",
      timerPaused: false,
      resumedBy: scannedId,
      resumedAt: now,
      lastAction: "Partial Start",
      lastActionBy: scannedId,
      lastActionAt: now,
      history
    };
  }

  assemblyRecords[batchNumber] = {
    ...existingRecord,
    runtime: nextRuntime
  };
  renderStage("assembly-room");
  const messages = {
    break: `Batch ${batchNumber} paused for room break by ${scannedId}.`,
    "resume-break": `Batch ${batchNumber} resumed after break by ${scannedId}.`,
    "partial-finish": `Partial Finish recorded for ${batchNumber} by ${scannedId}. Remaining quantity: ${Number(nextRuntime.remainingQuantity || 0).toLocaleString("en-GB")}.`,
    "resume-partial": `Partial Start recorded for ${batchNumber} by ${scannedId}.`
  };
  statusMessage.textContent = messages[action] || `Batch action recorded by ${scannedId}.`;
}
function refreshAssemblyReconciliationStatus() {
  if (!assemblySelectedProduct) return;
  const quantity = getBnsNewQuantity(assemblySelectedProduct);
  const qtyReceived = Number(document.querySelector("#assembly-qty-received") ? document.querySelector("#assembly-qty-received").value : quantity);
  const qtyUsed = Number(document.querySelector("#assembly-used-qty") ? document.querySelector("#assembly-used-qty").value : quantity);
  const damages = Number(document.querySelector("#assembly-damaged-qty") ? document.querySelector("#assembly-damaged-qty").value : 0);
  const discrepancyInput = document.querySelector("#assembly-discrepancy-qty");
  if (discrepancyInput && document.activeElement !== discrepancyInput) {
    discrepancyInput.value = String(qtyReceived - qtyUsed - damages);
  }
}

function getAssemblyAuditUser() {
  return currentLogin ? currentLogin.user : "assembly.room";
}

function getAssemblyAuditTimestamp() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function getAssemblyLifecycleRecord(record, type) {
  if (!record) return { user: "", dateTime: "" };
  const auditRecord = type === "start" ? record.startRecord : record.finishRecord;
  if (auditRecord && (auditRecord.user || auditRecord.dateTime)) {
    return {
      user: auditRecord.user || record.user || "assembly.room",
      dateTime: auditRecord.dateTime || ""
    };
  }
  const legacyDateTime = type === "start" ? record.startTime : record.finishTime;
  if (legacyDateTime && legacyDateTime !== "Pending" && legacyDateTime !== "Not started" && legacyDateTime !== "Not finished") {
    return {
      user: record.user || "assembly.room",
      dateTime: legacyDateTime
    };
  }
  return { user: "", dateTime: "" };
}

function requestAssemblyBatchStart(product) {
  requestAppConfirmation(
    () => recordAssemblyBatchStart(product),
    "Start Batch",
    `Start the Batch ${product.batch}?`,
    "This will record the current user name and date / time as the Assembly Room batch start.",
    "Yes, Start Batch"
  );
}

function requestAssemblyBatchFinish(batchNumber) {
  requestAppConfirmation(
    () => recordAssemblyBatchFinish(batchNumber),
    "Finish Batch",
    `Finish Batch ${batchNumber}?`,
    "This will record the current user name and date / time as the Assembly Room batch finish.",
    "Yes, Finish Batch"
  );
}

function recordAssemblyBatchStart(product) {
  if (!product) return;
  const batchNumber = product.batch;
  const now = getAssemblyAuditTimestamp();
  const user = getAssemblyAuditUser();
  const existingRecord = assemblyRecords[batchNumber] || {};
  assemblyRecords[batchNumber] = {
    ...existingRecord,
    user,
    startRecord: { user, dateTime: now },
    startTime: now,
    briefingTime: existingRecord.briefingTime || "",
    runtime: existingRecord.runtime || {
      status: "running",
      timerPaused: false,
      startedBy: user,
      startedAt: now,
      lastAction: "Batch Started",
      lastActionBy: user,
      lastActionAt: now,
      history: [{ action: "Batch Started", user, dateTime: now }]
    }
  };
  assemblySelectedProduct = product;
  assemblyExtraIpcRows = 0;
  assemblyActiveTab = "materials";
  renderStage("assembly-room");
  statusMessage.textContent = `Batch ${batchNumber} started by ${user} at ${now}.`;
}

function recordAssemblyBatchFinish(batchNumber) {
  const now = getAssemblyAuditTimestamp();
  const user = getAssemblyAuditUser();
  const existingRecord = assemblyRecords[batchNumber] || {};
  assemblyRecords[batchNumber] = {
    ...existingRecord,
    user,
    dateTime: now,
    finishRecord: { user, dateTime: now },
    finishTime: now,
    briefingTime: existingRecord.briefingTime || "",
    runtime: {
      ...(existingRecord.runtime || {}),
      status: "completed",
      timerPaused: false,
      lastAction: "Batch Completed",
      lastActionBy: user,
      lastActionAt: now
    }
  };
  if (!assembledBatchNumbers.includes(batchNumber)) assembledBatchNumbers.push(batchNumber);
  statusMessage.textContent = `Batch ${batchNumber} finished by ${user} at ${now} and moved to Post-Assembly QC.`;
  window.setTimeout(() => {
    assemblySelectedProduct = null;
    assemblyExtraIpcRows = 0;
    assemblyActiveTab = "materials";
    renderStage("assembly-room");
  }, 900);
}

function signOffAssemblyPage(tabName) {
  if (!assemblySelectedProduct) return;
  const batchNumber = assemblySelectedProduct.batch;
  const now = getAssemblyAuditTimestamp();
  const existingRecord = assemblyRecords[batchNumber] || {};
  assemblyRecords[batchNumber] = {
    ...existingRecord,
    user: getAssemblyAuditUser(),
    dateTime: Object.keys({ ...(existingRecord.signedTabs || {}), [tabName]: true }).length === 4 ? now : existingRecord.dateTime,
    startRecord: existingRecord.startRecord,
    finishRecord: existingRecord.finishRecord,
    startTime: existingRecord.startTime || (document.querySelector("#assembly-start-time") ? document.querySelector("#assembly-start-time").value : ""),
    finishTime: existingRecord.finishTime || (document.querySelector("#assembly-finish-time") ? document.querySelector("#assembly-finish-time").value : ""),
    briefingTime: existingRecord.briefingTime || "",
    ipcPhotoName: document.querySelector("[data-assembly-ipc-evidence]") && document.querySelector("[data-assembly-ipc-evidence]").files.length ? document.querySelector("[data-assembly-ipc-evidence]").files[0].name : existingRecord.ipcPhotoName || "",
    boxCount: productionRecords[batchNumber] ? productionRecords[batchNumber].boxCount : "",
    qtyReceived: document.querySelector("#assembly-qty-received") ? document.querySelector("#assembly-qty-received").value : "",
    reconciliationRows: document.querySelector("[data-assembly-recon-row]") ? Array.from(document.querySelectorAll("[data-assembly-recon-row]")).map(row => Object.fromEntries(Array.from(row.querySelectorAll("[data-recon-field]")).map(input => [input.dataset.reconField, input.value]))) : existingRecord.reconciliationRows,
    usedQty: document.querySelector("#assembly-used-qty") ? document.querySelector("#assembly-used-qty").value : "",
    usedLabels: document.querySelector("#assembly-used-labels") ? document.querySelector("#assembly-used-labels").value : "",
    damagedQty: document.querySelector("#assembly-damaged-qty") ? document.querySelector("#assembly-damaged-qty").value : "",
    discrepancyQty: document.querySelector("#assembly-discrepancy-qty") ? document.querySelector("#assembly-discrepancy-qty").value : "",
    surplusQty: document.querySelector("#assembly-surplus-qty") ? document.querySelector("#assembly-surplus-qty").value : "",
    extraComponents: document.querySelector("#assembly-extra-components") ? document.querySelector("#assembly-extra-components").value : "",
    comments: document.querySelector("#assembly-comments") ? document.querySelector("#assembly-comments").value : "",
    signedTabs: {
      ...(existingRecord.signedTabs || {}),
      [tabName]: {
user: getAssemblyAuditUser(),
dateTime: now
      }
    }
  };
  const signedCount = Object.keys(assemblyRecords[batchNumber].signedTabs).length;
  if (signedCount >= 4) {
    requestAssemblyBatchFinish(batchNumber);
    return;
  }
  statusMessage.textContent = `${tabName === "materials" ? "Initial Checks" : tabName === "samples" ? "Random Sample Check" : tabName === "ipc" ? "IPC Photo Check" : "Reconciliation"} marked done for ${batchNumber}.`;
  renderStage("assembly-room");
}

function getPostAssemblyProducts() {
  const completedProducts = bnsProducts.filter((product) => assembledBatchNumbers.includes(product.batch));
  const sourceProducts = completedProducts.length ? completedProducts : [bnsProducts[0], bnsProducts[1], bnsProducts[2]].filter(Boolean);
  return sourceProducts.filter((product) => matchesBatchOrMfgLot(product, postAssemblySearch));
}

function renderPostAssemblyList() {
  const products = getPostAssemblyProducts();
  const totalQuantity = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const completedCount = products.filter((product) => postAssemblyCheckedBatchNumbers.includes(product.batch)).length;
  const activeCount = products.length - completedCount;
  return `
    <div class="postassembly-layout">
      <section class="postassembly-window postassembly-list-window">
<div class="sub-window-title">Post Assembly Work Queue</div>
<div class="postassembly-list-header">
  <div class="production-search">
    <label class="classic-search-label">BNS Batch No : <input class="classic-search-input" data-postassembly-search value="${postAssemblySearch}" placeholder="Enter batch no"></label>
    <label class="classic-search-label">MFG Lot No : <input class="classic-search-input" data-postassembly-search value="${postAssemblySearch}" placeholder="Enter MFG lot"></label>
    <button class="classic-search-button" type="button" data-postassembly-search-button>Search</button>
  </div>
</div>
<div class="postassembly-list-panel">
  <table class="classic-table product-grid postassembly-table postassembly-list-table">
    <thead>
      <tr>
<th>BNS_BATCH_NO</th>
  <th class="mfg-lot-col">MFG_LOT_NO</th>
  <th>DESCRIPTION</th>
<th>QUANTITY</th>
<th>ASSEMBLED_QTY</th>
<th>EXPIRY_DATE</th>
<th>STRENGTH</th>
<th>PACK_SIZE</th>
<th>STATUS</th>
      </tr>
    </thead>
    <tbody>
      ${products
.map(
  (product, index) => {
    const completed = postAssemblyCheckedBatchNumbers.includes(product.batch);
    return `
    <tr class="clickable-row ${completed ? "completed-stage-row" : ""}" data-open-postassembly="${product.batch}">
      <td>${product.batch}</td>
      <td class="mfg-lot-col">${getMfgLotNo(product) || "-"}</td>
      <td>${product.description}</td>
      <td>${product.quantity}</td>
      <td>${assemblyRecords[product.batch] && assemblyRecords[product.batch].usedLabels ? assemblyRecords[product.batch].usedLabels : product.quantity}</td>
      <td>${product.expiry}</td>
      <td>${product.strength}</td>
      <td>${product.packSize}</td>
      <td><span class="postassembly-status-text ${completed ? "is-completed" : "is-active"}">${completed ? "COMPLETED" : "ACTIVE"}</span></td>
    </tr>
  `;
  }
)
.join("") || `<tr><td colspan="9">No batches available in Post Assembly status.</td></tr>`}
    </tbody>
  </table>
  <div class="double-check-counts postassembly-queue-counts">
    <span>Active Batches : <strong>${activeCount}</strong></span>
    <span>Completed Batches : <strong>${completedCount}</strong></span>
    <span>Total Batches : <strong>${products.length}</strong></span>
    <span>Total Quantity : <strong>${totalQuantity}</strong></span>
  </div>
</div>
      </section>
    </div>
  `;
}

function getPostAssemblyBoxAllocation(record, boxCount) {
  const saved = Array.isArray(record.boxQuantities) ? record.boxQuantities.map((value) => String(value)) : [];
  return saved.length === boxCount ? saved : Array.from({ length: boxCount }, () => "");
}

function isPostAssemblyBoxAllocationComplete(record, boxCount, totalQty) {
  if (boxCount <= 1) return true;
  const values = Array.isArray(record.boxQuantities) ? record.boxQuantities.map(Number) : [];
  return values.length === boxCount && values.every((value) => Number.isFinite(value) && value > 0)
    && values.reduce((sum, value) => sum + value, 0) === totalQty;
}

function updatePostAssemblyBoxQuantityPopup() {
  const modal = document.querySelector("#postassembly-box-quantity-modal");
  if (!modal) return;
  const totalQty = Number(modal.dataset.totalQty || 0);
  const values = [...modal.querySelectorAll("[data-postassembly-box-qty]")].map((input) => Number(input.value || 0));
  const enteredTotal = values.reduce((sum, value) => sum + value, 0);
  const remaining = totalQty - enteredTotal;
  const enteredTotalNode = modal.querySelector("[data-postassembly-entered-total]");
  const remainingNode = modal.querySelector("[data-postassembly-remaining]");
  const saveButton = modal.querySelector("#postassembly-box-quantity-save");
  if (enteredTotalNode) enteredTotalNode.textContent = String(enteredTotal);
  if (remainingNode) {
    remainingNode.textContent = String(remaining);
    remainingNode.classList.toggle("is-valid", remaining === 0 && values.every((value) => value > 0));
    remainingNode.classList.toggle("is-invalid", remaining !== 0);
  }
  if (saveButton) saveButton.disabled = !(values.length > 1 && values.every((value) => value > 0) && enteredTotal === totalQty);
}

function openPostAssemblyBoxQuantityPopup() {
  if (!postAssemblySelectedProduct) return;
  const boxCountInput = document.querySelector("#postassembly-box-count");
  const totalQtyInput = document.querySelector("#postassembly-total-qty");
  const boxCount = Math.max(1, Number(boxCountInput ? boxCountInput.value : 1));
  const totalQty = Math.max(0, Number(totalQtyInput ? totalQtyInput.value : 0));
  const batchNumber = postAssemblySelectedProduct.batch;
  const record = postAssemblyRecords[batchNumber] || {};
  if (boxCount <= 1) {
    postAssemblyRecords[batchNumber] = { ...record, boxCount: "1", totalQty: String(totalQty), boxQuantities: [String(totalQty)] };
    updatePostAssemblyAvailability();
    return;
  }

  document.querySelector("#postassembly-box-quantity-modal")?.remove();
  const values = getPostAssemblyBoxAllocation(record, boxCount);
  const overlay = document.createElement("div");
  overlay.id = "postassembly-box-quantity-modal";
  overlay.className = "postassembly-box-modal-backdrop";
  overlay.dataset.totalQty = String(totalQty);
  overlay.innerHTML = `
    <section class="postassembly-box-modal" role="dialog" aria-modal="true" aria-label="Enter quantity in each box">
      <header>
        <div>
          <strong>Quantity in Each Box</strong>
          <span>${batchNumber} &middot; ${boxCount} boxes &middot; Total quantity ${totalQty}</span>
        </div>
        <button type="button" class="postassembly-box-modal-close" data-close-postassembly-box-modal aria-label="Close">&times;</button>
      </header>
      <div class="postassembly-box-modal-instruction">Enter the exact quantity present in every box. The combined quantity must equal <strong>${totalQty}</strong>.</div>
      <div class="postassembly-box-quantity-list">
        ${values.map((value, index) => `
          <label><span>Box ${index + 1}</span><input type="number" min="1" step="1" data-postassembly-box-qty="${index}" value="${value}" placeholder="Enter quantity" autocomplete="off"></label>
        `).join("")}
      </div>
      <div class="postassembly-box-total-row">
        <span>Entered Total <strong data-postassembly-entered-total>0</strong></span>
        <span>Remaining <strong data-postassembly-remaining>${totalQty}</strong></span>
      </div>
      <footer>
        <button class="classic-button" type="button" data-close-postassembly-box-modal>Cancel</button>
        <button class="classic-button primary" type="button" id="postassembly-box-quantity-save" disabled>Confirm Box Quantities</button>
      </footer>
    </section>
  `;
  document.body.appendChild(overlay);
  updatePostAssemblyBoxQuantityPopup();
  overlay.querySelector("[data-postassembly-box-qty]")?.focus();
}

function renderPostAssemblyWork(stage) {
  if (!postAssemblySelectedProduct) return renderPostAssemblyList();
  const product = postAssemblySelectedProduct;
  const record = postAssemblyRecords[product.batch] || {};
  const assemblyRecord = assemblyRecords[product.batch] || {};
  const quantity = Number(assemblyRecord.usedLabels || product.quantity || 0);
  const defaultBoxes = Math.max(1, Math.ceil(quantity / 100));
  const sampleCount = Math.ceil(Math.sqrt(quantity)) + 1;
  const quarantinePrinted = Boolean(record.quarantinePrinted);
  const packChecksConfirmed = Boolean(record.packChecksConfirmed);
  const currentBoxCount = Number(record.boxCount || defaultBoxes);
  const currentTotalQty = Number(record.totalQty || quantity);
  const allocationComplete = isPostAssemblyBoxAllocationComplete(record, currentBoxCount, currentTotalQty);
  return `
    <div class="label-printing-layout label-detail-layout label-reference-layout production-checking-reference-layout">
      <section class="label-reference-window production-checking-reference-window">
        <header class="label-reference-header production-checking-reference-header">
          <div><strong>Post Assembly - ${product.batch}</strong></div>
          <div class="production-checking-header-actions">
            <button class="classic-button" type="button" data-print-generated-bar="${product.batch}">Print BAR</button>
            <button class="classic-button" type="button" data-postassembly-back-queue>Back to Batch Queue</button>
          </div>
        </header>
        <div class="label-reference-grid production-checking-reference-grid">
          ${renderPrintingProductSidebar(product)}
          <main class="label-workflow-card production-checking-workflow-card">
            <section class="label-workflow-section production-checking-section">
              <div class="label-workflow-section-title"><h3>Post Assembly Quantity Details</h3><span>Confirm finished packs and box allocation</span></div>
              <div class="postassembly-quantity-grid production-checking-quantity-grid">
                <label>Total Packs <input id="postassembly-total-qty" data-postassembly-input type="number" min="1" value="${record.totalQty || quantity}"></label>
                <label>Total Boxes <span class="production-box-input-row"><input id="postassembly-box-count" data-postassembly-input type="number" min="1" value="${record.boxCount || defaultBoxes}"><button class="classic-button" type="button" data-edit-postassembly-boxes ${currentBoxCount > 1 ? "" : "disabled"}>${allocationComplete ? "Edit Quantities" : "Enter Quantities"}</button></span></label>
                <label>No. of Packs Checked <input id="postassembly-packs-checked" data-postassembly-input type="number" min="1" value="${record.packsChecked || sampleCount}"></label>
              </div>
              ${currentBoxCount > 1 ? `
                <div class="postassembly-box-allocation-summary ${allocationComplete ? "is-complete" : "is-pending"}">
                  <strong>Box Allocation:</strong>
                  <span>${allocationComplete ? record.boxQuantities.map((value, index) => `Box ${index + 1}: ${value}`).join(" &middot; ") : "Enter the quantity present in each box before sign-off."}</span>
                </div>
              ` : ""}
            </section>

            <section class="label-workflow-section production-checking-section">
              <div class="label-workflow-section-title"><h3>Pack Details Against BAR</h3><span>Tick each verified line</span></div>
              <div class="production-checking-table-wrap">
                <table class="recon-clean-table postassembly-process-table">
    <colgroup>
      <col class="postassembly-col-details">
      <col class="postassembly-col-product">
      <col class="postassembly-col-reference">
      <col class="postassembly-col-mfg">
      <col class="postassembly-col-batch">
      <col class="postassembly-col-expiry">
    </colgroup>
    <thead>
      <tr>
<th>Details</th>
<th>Product Name & Strength</th>
<th>Reference Code</th>
<th>MFG Batch No.</th>
<th>B&S Batch No.</th>
<th>Expiry Date</th>
      </tr>
    </thead>
    <tbody>
      ${[
["Carton/Braille Label 1", "FLU250-10/120/CZ (R4)"],
["Blister Label 1", "FLU250-10/120/CZ/B1 (R3)"],
["Blister/Carton Label 2", "FLU250-10/120/CZ/B2 (R3)"],
["Leaflet 1", "FLU250-10/120/CZ/LT (R5)"],
["Other", "Blank Label"]
      ].map(([detail, ref]) => `
<tr>
  <td>${detail}</td>
  <td>${product.product} ${product.strength}</td>
  <td>${ref}</td>
  <td>${product.manufacturingLot || "25088FA"}</td>
  <td>${product.batch}</td>
  <td><label class="expiry-confirm"><span>${product.expiry}</span><input type="checkbox" data-postassembly-pack-check ${packChecksConfirmed ? "checked disabled" : ""}></label></td>
</tr>
      `).join("")}
    </tbody>
  </table>
              </div>
            </section>

            <section class="label-workflow-section production-checking-section production-checking-completion-section">
              <label class="postassembly-comment">Comments <textarea id="postassembly-comments" data-postassembly-input placeholder="Enter comments if required">${record.comments || ""}</textarea></label>
              <div class="postassembly-print-actions">
                <button class="classic-button primary" type="button" id="postassembly-print-button">Print Quarantine Label</button>
                <button class="classic-button" type="button" data-test-quarantine-print>Test Print</button>
                <span>Quarantine Label: <strong>${quarantinePrinted ? "Printed" : "Pending"}</strong></span>
              </div>
              <div class="signature-grid postassembly-signoff-grid">
                <label>Signed By <input value="${record.user || "Pending"}" readonly></label>
                <label>Signed At <input value="${record.dateTime || "Pending"}" readonly></label>
                <div class="signoff-action process-signoff-action">
                  <span class="postassembly-signoff-hint">${record.dateTime ? "Post Assembly signed and completed." : (allocationComplete ? "Complete all pack checks to enable user sign-off." : "Confirm the quantity in each box to enable user sign-off.")}</span>
                  <button class="classic-button primary" type="button" id="postassembly-complete-button" disabled>${record.dateTime ? "Signed Off" : "User Sign Off"}</button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </section>
    </div>
  `;
}

function updatePostAssemblyAvailability() {
  const submitButton = document.querySelector("#postassembly-complete-button");
  const printButton = document.querySelector("#postassembly-print-button");
  if (!submitButton || !postAssemblySelectedProduct) return;
  const boxCount = document.querySelector("#postassembly-box-count");
  const totalQty = document.querySelector("#postassembly-total-qty");
  const packsChecked = document.querySelector("#postassembly-packs-checked");
  const packChecks = [...document.querySelectorAll("[data-postassembly-pack-check]")];
  const packChecksComplete = packChecks.length > 0 && packChecks.every((check) => check.checked);
  const record = postAssemblyRecords[postAssemblySelectedProduct.batch] || {};
  const quantitiesComplete = Boolean(boxCount && Number(boxCount.value) > 0 && totalQty && Number(totalQty.value) > 0 && packsChecked && Number(packsChecked.value) > 0);
  const allocationComplete = isPostAssemblyBoxAllocationComplete(record, Number(boxCount?.value || 0), Number(totalQty?.value || 0));
  if (printButton) {
    printButton.disabled = false;
  }
  submitButton.disabled = Boolean(record.dateTime) || !((record.packChecksConfirmed || packChecksComplete) && quantitiesComplete && allocationComplete);
}

function printQuarantineLabel() {
  if (!postAssemblySelectedProduct) return;
  const batchNumber = postAssemblySelectedProduct.batch;
  postAssemblyRecords[batchNumber] = {
    ...(postAssemblyRecords[batchNumber] || {}),
    quarantinePrinted: true,
    packChecksConfirmed: [...document.querySelectorAll("[data-postassembly-pack-check]")].every((check) => check.checked),
    boxCount: document.querySelector("#postassembly-box-count") ? document.querySelector("#postassembly-box-count").value : "",
    totalQty: document.querySelector("#postassembly-total-qty") ? document.querySelector("#postassembly-total-qty").value : "",
    packsChecked: document.querySelector("#postassembly-packs-checked") ? document.querySelector("#postassembly-packs-checked").value : "",
    comments: document.querySelector("#postassembly-comments") ? document.querySelector("#postassembly-comments").value : ""
  };
  statusMessage.textContent = `Quarantine label printed for ${batchNumber}.`;
  renderStage("post-assembly-qc");
}

function completePostAssembly() {
  if (!postAssemblySelectedProduct) return;
  const batchNumber = postAssemblySelectedProduct.batch;
  if (postAssemblyCheckedBatchNumbers.includes(batchNumber)) {
    statusMessage.textContent = `Batch ${batchNumber} is already completed in Post Assembly.`;
    return;
  }
  const now = getAssemblyAuditTimestamp();
  postAssemblyRecords[batchNumber] = {
    ...(postAssemblyRecords[batchNumber] || {}),
    user: currentLogin ? currentLogin.user : "postassembly.qc",
    dateTime: now,
    signoffRecord: {
      user: currentLogin ? currentLogin.user : "postassembly.qc",
      dateTime: now
    },
    boxCount: document.querySelector("#postassembly-box-count") ? document.querySelector("#postassembly-box-count").value : "",
    totalQty: document.querySelector("#postassembly-total-qty") ? document.querySelector("#postassembly-total-qty").value : "",
    packsChecked: document.querySelector("#postassembly-packs-checked") ? document.querySelector("#postassembly-packs-checked").value : "",
    packChecksConfirmed: true,
    comments: document.querySelector("#postassembly-comments") ? document.querySelector("#postassembly-comments").value : ""
  };
  if (!postAssemblyCheckedBatchNumbers.includes(batchNumber)) postAssemblyCheckedBatchNumbers.push(batchNumber);
  postAssemblySelectedProduct = null;
  renderStage("post-assembly-qc");
  statusMessage.textContent = `Post Assembly signed off by ${postAssemblyRecords[batchNumber].user} at ${now}. Batch ${batchNumber} is now shown as Completed in the work queue and is available to Pre-QP.`;
}

function getQpReleaseLogId(batchNumber) {
  return qpReleaseRecords[batchNumber] && qpReleaseRecords[batchNumber].qpId ? qpReleaseRecords[batchNumber].qpId : "";
}

function createQpReleaseLogId() {
  const existingIds = Array.from(new Set(Object.values(qpReleaseRecords).map((record) => record.qpId).filter(Boolean)));
  const usedNumbers = existingIds
    .map((id) => Number(String(id)))
    .filter((id) => Number.isFinite(id));
  const nextNumber = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 28940;
  return String(nextNumber);
}

function assignQpReleaseLogId(batchNumbers) {
  const qpId = createQpReleaseLogId();
  batchNumbers.forEach((batchNumber) => {
    qpReleaseRecords[batchNumber] = {
      ...(qpReleaseRecords[batchNumber] || {}),
      qpId,
      qpReady: true,
      qpLogGeneratedAt: getAssemblyAuditTimestamp(),
      releaseLogBatchNumbers: [...batchNumbers]
    };
  });
  persistQpReleaseRecords();
  return qpId;
}

function completeReleaseLogGeneration(batchNumbers) {
  const batches = Array.from(new Set(batchNumbers));
  const relId = assignQpReleaseLogId(batches);
  preQpReleaseLogSelection = [];
  qpSelectedReleaseId = "";
  qpSelectedProduct = null;
  qpSelectedDocumentId = "";
  qpChecklistOpen = false;
  renderStage("release-log");
  statusMessage.textContent = `Release Log ${relId} generated for ${batches.length} batch${batches.length === 1 ? "" : "es"}. Data moved to the QP Dashboard; the Release Log queue is ready for the next selection.`;
}

function requestReleaseLogPasswordConfirmation(batchNumbers) {
  const batches = Array.from(new Set(batchNumbers));
  releaseLogPasswordBatches = [...batches];
  pendingSignoffAction = () => completeReleaseLogGeneration(batches);
  appConfirmModal.classList.add("release-log-password-confirm");
  document.querySelector("#app-confirm-title").textContent = "Confirm Release Log";
  document.querySelector("#app-confirm-header").textContent = "Enter password to continue";
  const copy = document.querySelector("#app-confirm-copy");
  if (copy) {
    copy.classList.remove("assembly-id-scan-prompt");
    copy.classList.add("release-log-password-prompt");
    copy.style.display = "block";
    copy.innerHTML = `
      <label class="release-log-password-field">
        <span>Password</span>
        <input id="release-log-confirm-password" type="password" autocomplete="current-password" placeholder="Enter password">
      </label>
    `;
  }
  const cancelButton = appConfirmModal.querySelector(".confirm-actions [data-app-confirm-no]");
  if (cancelButton) cancelButton.textContent = "Cancel";
  const yesButton = document.querySelector("#app-confirm-yes");
  if (yesButton) yesButton.textContent = "Confirm";
  appConfirmModal.classList.remove("hidden");
  window.setTimeout(() => document.querySelector("#release-log-confirm-password")?.focus(), 50);
  statusMessage.textContent = "Password confirmation is required to generate the Release Log.";
}

function ensurePreQpTestData() {
  ensureQpScenarioTestData();
  const addMany = (target, values) => values.forEach((value) => {
    if (!target.includes(value)) target.push(value);
  });
  const postReadyBatches = [
    "LVT009", "LVT010", "LVT011", "LVT012",
    "LVT013", "LVT014", "LVT015", "LVT016", "LVT017", "LVT018",
    "LVT019", "LVT020", "LVT021", "LVT022", "LVT023"
  ];
  const completedPreQpBatches = ["LVT013", "LVT014", "LVT015", "LVT016", "LVT017", "LVT018"];
  const qpReadyBatches = ["LVT014", "LVT015", "LVT016", "LVT017"];

  addMany(postAssemblyCheckedBatchNumbers, postReadyBatches);
  addMany(preQpCheckedBatchNumbers, completedPreQpBatches);

  postReadyBatches.forEach((batch, index) => {
    const product = bnsProducts.find((item) => item.batch === batch);
    if (!product) return;
    postAssemblyRecords[batch] = postAssemblyRecords[batch] || {
      user: "postassembly.qc",
      dateTime: `24 Jun 2026, ${14 + index}:20:00`,
      boxCount: String(Math.max(1, Math.ceil(Number(product.quantity || 0) / 100))),
      totalQty: product.quantity,
      packsChecked: String(26 + index),
      quarantinePrinted: true,
      packChecksConfirmed: true,
      comments: "Demo record ready for Pre-QP."
    };
  });

  completedPreQpBatches.forEach((batch, index) => {
    const product = bnsProducts.find((item) => item.batch === batch);
    if (!product) return;
    preQpRecords[batch] = preQpRecords[batch] || {
      sampleBox: "01",
      docs: ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
      materialChecked: true,
      comments: "Pre-QP checks completed and signed off.",
      user: "pre.qp",
      dateTime: `24 Jun 2026, 16:${String(10 + index * 8).padStart(2, "0")}:00`,
      logGenerated: true
    };
  });
  qpReadyBatches.forEach((batch, index) => {
    const product = bnsProducts.find((item) => item.batch === batch);
    if (!product) return;
    qpReleaseRecords[batch] = qpReleaseRecords[batch] || {
      qpId: index < 3 ? "28940" : "28941",
      qpReady: true,
      qpLogGeneratedAt: `24 Jun 2026, 16:${35 + index * 7}:00`,
      releaseLogBatchNumbers: index < 3 ? qpReadyBatches.slice(0, 3) : [batch],
      releaseLog: getQpReleaseLogDefaults(product)
    };
  });

  qpReleaseRecords.LVT019 = { ...(qpReleaseRecords.LVT019 || {}), decision: "Approve", approved: true, decisionBy: "qp.release", decisionDateTime: "24 Jun 2026, 17:25:00" };
  qpReleaseRecords.LVT020 = { ...(qpReleaseRecords.LVT020 || {}), decision: "Hold", decisionBy: "qp.release", decisionDateTime: "24 Jun 2026, 17:40:00" };
  addMany(qpCertifiedBatchNumbers, ["LVT019", "LVT020"]);
}
var qpScenarioFixtures = [
  { batch: "QPT001", relId: "99001", name: "All checks passed" },
  { batch: "QPT002", relId: "99001", name: "Reboxing — all checks passed", reboxing: true },
  { batch: "QPT003", relId: "99002", name: "BAR / summary quantity mismatch", quantityMismatch: true },
  { batch: "QPT004", relId: "99003", name: "Supplier invoice mismatch", check: "Supplier invoice: supplier and invoice number", detail: "BAR supplier Demo Pharma A / INV-004; invoice supplier Demo Pharma B / INV-999." },
  { batch: "QPT005", relId: "99003", name: "Wrong supplier declaration", check: "Supplier declaration from the same pharma", detail: "Declaration names Demo Pharma B; BAR supplier is Demo Pharma A." },
  { batch: "QPT006", relId: "99004", name: "Temperature excursion", check: "Temperature record: comments and excursions", detail: "Demo excursion: 12°C for 45 minutes against this fixture's 2–8°C range. Deviation assessment required." },
  { batch: "QPT007", relId: "99005", name: "IPC product description mismatch", quantityMismatch: true },
  { batch: "QPT008", relId: "99006", name: "Blister / carton reference mismatch", check: "Blister / carton sample against BAR label reference", detail: "Sample reference DEMO-OLD-R2 differs from BAR DEMO-REF-R3." },
  { batch: "QPT009", relId: "99006", name: "Leaflet licence mismatch", check: "Leaflet licence number against sample", detail: "Sample licence 18799/9999 differs from BAR 18799/6001." },
  { batch: "QPT010", relId: "99006", name: "Outdated leaflet date", check: "Leaflet date", detail: "Sample date 01 Jan 2024 differs from BAR 01 Sep 2026." },
  { batch: "QPT011", relId: "99007", name: "Braille reference mismatch", check: "Blister / carton sample against BAR label reference", detail: "Assembly Braille reference BR-02 differs from BAR reference BR-03." },
  { batch: "QPT012", relId: "99007", name: "Reconciliation discrepancy", reconciliationMismatch: true },
  { batch: "QPT013", relId: "99008", name: "PCL calculation mismatch", check: "PCL computations", detail: "Demo source line sum 298 differs from recorded PCL total 300." },
  { batch: "QPT014", relId: "99008", name: "Invoice quantity mismatch", check: "Document completeness and correctness", detail: "Supplier invoice quantity 298 differs from BAR quantity 300." },
  { batch: "QPT015", relId: "99009", name: "Completed — Approved", decision: "Certified" },
  { batch: "QPT016", relId: "99009", name: "Completed — Hold", decision: "Hold" },
  { batch: "QPT017", relId: "99009", name: "Completed — Banding", decision: "Banding" },
  { batch: "QPT018", relId: "99009", name: "Completed — Reject", decision: "Rejected" },
  { batch: "QPT019", relId: "99010", name: "PCL comment for QP review", check: "PCL computations", detail: "PCL records a packaging discrepancy assessed during Batch Check. QP review required." },
  { batch: "QPT020", relId: "99011", name: "Document replaced / re-review", rereview: true }
];

function ensureQpScenarioTestData() {
  // This function can be called during startup before fixture initialization.
  if (typeof qpScenarioFixtures === "undefined") return;
  qpScenarioFixtures.forEach((fixture, index) => {
    if (!bnsProducts.some(product => product.batch === fixture.batch)) {
      bnsProducts.push({ ...bnsProducts[0], batch: fixture.batch, product: `TEST — ${fixture.name}`, description: `TEST — ${fixture.name}`, quantity: "300", country: "UK", supplierName: "Demo Pharma A", invoice: `INV-${fixture.batch}`, manufLotNo: `DEMO-LOT-${index + 1}`, pl: "18799/6001", ecma: "DEMO-REF-R3", leafletDate: "01 Sep 2026", routeType: fixture.reboxing ? "Reboxing" : "Relabelling", category: fixture.reboxing ? "Reboxing" : "Relabelling", qpScenario: fixture.batch });
    }
    const product = bnsProducts.find(item => item.batch === fixture.batch);
    product.product = `TEST — ${fixture.name}`;
    product.description = product.product;
    product.strength ||= "10mg";
    product.packSize ||= "28 tablets";
    if (!postAssemblyCheckedBatchNumbers.includes(product.batch)) postAssemblyCheckedBatchNumbers.push(product.batch);
    if (!preQpCheckedBatchNumbers.includes(product.batch)) preQpCheckedBatchNumbers.push(product.batch);
    generatedBarRecords[product.batch] ||= { product: { ...product }, batchNumber: product.batch, generatedBy: "demo.system", generatedAt: "07 Sep 2026, 09:00:00" };
    postAssemblyRecords[product.batch] ||= { totalQty: fixture.quantityMismatch ? "298" : "300", boxCount: "3", user: "demo.qa", dateTime: "07 Sep 2026, 09:00:00" };
    assemblyRecords[product.batch] ||= { qtyReceived: "300", usedQty: fixture.reconciliationMismatch ? "298" : "300", damagedQty: "0", discrepancyQty: fixture.reconciliationMismatch ? "2" : "0", ipcPhotoName: fixture.missingIpc ? "" : "DEMO-IPC.jpg", signedTabs: { recon: { user: "demo.qa" }, ...(fixture.missingIpc ? {} : { ipc: { user: "demo.qa" } }) } };
    if (fixture.reboxing) changeOfPackSizeData[product.batch] ||= { receivedAs: { qty: "600" }, assembledAs: { finishedQty: "300" } };
    if (!qpReleaseRecords[product.batch]) {
      const samplePhotos = {};
      if (!fixture.missingPhotos) ["blister", "carton", "leaflet"].forEach(kind => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#e7f1f8"/><text x="16" y="60" font-size="18">DEMO SAMPLE: ${kind}</text><text x="16" y="95">${product.batch} — simulated evidence</text></svg>`;
        samplePhotos[kind] = [{ name: `DEMO-${kind}.svg`, data: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` }];
      });
      qpReleaseRecords[product.batch] = { qpId: fixture.relId, qpReady: true, qpLogGeneratedAt: "07 Sep 2026, 09:00:00", releaseLogBatchNumbers: qpScenarioFixtures.filter(item => item.relId === fixture.relId).map(item => item.batch), samplePhotos, ...(fixture.decision ? { decision: fixture.decision, approved: fixture.decision === "Certified", decisionBy: "demo.qp", decisionDateTime: "07 Sep 2026, 10:00:00" } : {}), ...(fixture.rereview ? { documentReviews: { "supplier-invoice": { status: "Re-review Required", version: "2.0", comments: "Demo invoice replaced after review. Recheck the new version." } } } : {}) };
    }
  });
}

function getPreQpProducts() {
  ensurePreQpTestData();
  const completedProducts = bnsProducts.filter((product) => postAssemblyCheckedBatchNumbers.includes(product.batch));
  const sourceProducts = completedProducts.length ? completedProducts : [bnsProducts[0], bnsProducts[1], bnsProducts[2], bnsProducts[3]].filter(Boolean);
  const normalizedPreQpSearch = preQpSearch.trim().toLowerCase();
  return sourceProducts.filter((product) => {
    const batch = String(product.batch || product.batchNo || "").toLowerCase();
    const qpRecord = qpReleaseRecords[product.batch] || {};
    return !normalizedPreQpSearch || batch.includes(normalizedPreQpSearch);
  });
}

function renderPreQpList() {
  const products = getPreQpProducts().map((product, index) => ({
    releaseFor: product.country || "UK",
    description: product.description || product.product,
    strength: product.strength,
    packSize: product.packSize,
    batch: product.batch,
    manufLotNo: getMfgLotNo(product),
    expiry: product.expiry,
    quantity: product.quantity,
    verified: preQpCheckedBatchNumbers.includes(product.batch),
    product
  }));
  return `
    <div class="preqp-layout">
      <section class="preqp-window preqp-list-window">
<div class="sub-window-title preqp-queue-title">Pre QP</div>
<div class="preqp-search-row preqp-list-search-row">
  <label class="classic-search-label">BNS Batch No : <input class="classic-search-input" data-preqp-search value="${preQpSearch}" placeholder=""></label>
  <button class="classic-search-button" type="button" data-preqp-search-button>Search</button>
</div>
<div class="preqp-list-panel">
  <table class="classic-table product-grid preqp-table">
    <thead>
      <tr>
<th>RELEASE_FOR</th>
<th>DESCRIPTION</th>
<th>STRENGTH</th>
<th>PACK_SIZE</th>
<th>BNS_BATCH_NO</th>
<th class="mfg-lot-col">MFG_LOT_NO</th>
<th>EXPIRY_DATE</th>
<th>QUANTITY</th>
<th>STATUS</th>
      </tr>
    </thead>
    <tbody>
      ${products.map((product) => {
const statusClass = product.verified ? "preqp-row-approved preqp-row-verified" : "preqp-row-white";
return `
  <tr class="clickable-row ${statusClass}" data-open-preqp="${product.batch}">
    <td>${product.releaseFor}</td>
    <td>${product.description}</td>
    <td>${product.strength}</td>
    <td>${product.packSize}</td>
    <td>${product.batch}</td>
    <td class="mfg-lot-col">${getMfgLotNo(product) || "-"}</td>
    <td>${product.expiry}</td>
    <td>${product.quantity}</td>
    <td><span class="printer-list-status printer-list-status-${product.verified ? "completed" : "active"}">${product.verified ? "Completed" : "Active"}</span></td>
  </tr>
`; 
      }).join("") || `<tr><td colspan="9">No batches available in Pre QP.</td></tr>`}
    </tbody>
  </table>
  <div style="display: flex; justify-content: flex-end; gap: 40px; margin-top: 8px; font-size: 11px; font-weight: normal; color: #000; font-family: Tahoma, sans-serif;">
    <span>Total Batches : <strong>${products.length}</strong></span>
    <span>Total Quantity : <strong>${products.reduce((total, product) => total + Number(product.quantity || 0), 0)}</strong></span>
  </div>
</div>
      </section>
    </div>
  `;
}
function renderReleaseLogPreview(product, record, stage) {
  return renderQpReleaseLogPaper([product]);
}

function getQpReleaseLogGroupProducts(product) {
  const record = qpReleaseRecords[product.batch] || {};
  const groupBatches = record.releaseLogBatchNumbers && record.releaseLogBatchNumbers.length
    ? record.releaseLogBatchNumbers
    : [product.batch];
  return groupBatches
    .map((batchNumber) => bnsProducts.find((item) => item.batch === batchNumber))
    .filter(Boolean);
}

function renderQpReleaseLogPaper(products, editable = false, systemDecisions = false, readOnly = false) {
  const firstProduct = products[0] || {};
  const firstLog = firstProduct.batch ? getQpReleaseLogDefaults(firstProduct) : {};
  const relId = firstProduct.batch ? getQpReleaseLogId(firstProduct.batch) : "";
  const locked = readOnly || Boolean(firstLog.signedDateTime);
  const documentDate = new Date().toLocaleDateString("en-GB");
  const rows = products.map((product) => {
    const postRecord = postAssemblyRecords[product.batch] || {};
    const log = getQpReleaseLogDefaults(product);
    const totalQty = postRecord.totalQty || product.quantity;
    const boxes = postRecord.boxCount || Math.max(1, Math.ceil(Number(product.quantity || 0) / 100));
    const yieldQty = Math.max(0, Number(totalQty || 0) - 1);
    const approvalCell = editable
      ? `<div class="qp-paper-approval-choice">
          <label><input type="radio" name="qp-log-approved-${htmlSafe(product.batch)}" data-qp-log-approved="${htmlSafe(product.batch)}" value="Yes" ${log.approved === "Yes" ? "checked" : ""} ${locked || systemDecisions ? "disabled" : ""}><span>Yes</span></label>
          <label><input type="radio" name="qp-log-approved-${htmlSafe(product.batch)}" data-qp-log-approved="${htmlSafe(product.batch)}" value="No" ${log.approved === "No" ? "checked" : ""} ${locked || systemDecisions ? "disabled" : ""}><span>No</span></label>
        </div>`
      : `<span class="qp-paper-empty-box" aria-label="Yes not selected"></span><span class="qp-paper-empty-box" aria-label="No not selected"></span>`;
    const commentsCell = editable
      ? `<textarea data-qp-log-comments="${htmlSafe(product.batch)}" aria-label="Comments for ${htmlSafe(product.batch)}" ${locked ? "disabled" : ""}>${htmlSafe(log.comments || "")}</textarea>`
      : "";
    const damagedCell = editable
      ? `<input data-qp-log-damaged="${htmlSafe(product.batch)}" aria-label="Damaged or regulatory sample for ${htmlSafe(product.batch)}" value="${htmlSafe(log.damagedSample || "")}" ${locked ? "disabled" : ""}>`
      : htmlSafe(log.damagedSample || "");
    return `
      <tr data-qp-log-row="${htmlSafe(product.batch)}">
        <td><strong>${htmlSafe(product.product)}</strong><small>${htmlSafe(product.strength || "")}</small></td>
        <td><strong>${htmlSafe(product.batch)}</strong><small>${htmlSafe(product.expiry || "")}</small></td>
        <td>${htmlSafe(product.country || "")}</td>
        <td>${htmlSafe(product.manufLotNo || product.manufacturingLot || "25088FA")} / ${htmlSafe(totalQty)} / ${htmlSafe(product.imp || "C13278")}</td>
        <td>${htmlSafe(totalQty)}</td>
        <td>01</td>
        <td>${damagedCell}</td>
        <td>${htmlSafe(log.yieldQty || yieldQty)}</td>
        <td>${htmlSafe(log.roomNo || (productionRecords[product.batch] ? productionRecords[product.batch].roomNo : "3"))}</td>
        <td>${htmlSafe(log.boxes || boxes)}</td>
        <td class="qp-paper-approved-cell">${approvalCell}</td>
        <td class="qp-paper-comments-cell">${commentsCell}</td>
      </tr>
    `;
  }).join("");
  return `
    <section class="release-log-preview qp-release-log-paper">
      <header class="qp-paper-header">
        <div class="qp-paper-brand"><span>B&amp;S</span><strong>HEALTHCARE</strong></div>
        <div class="qp-paper-title">QP RELEASE LOG RECORD</div>
        <div class="qp-paper-id">ID: <strong>${htmlSafe(relId)}</strong></div>
      </header>
      <div class="qp-paper-page-line"><span>Page: 1 of 1</span><span>DATE: ${htmlSafe(documentDate)}</span></div>
      <table class="release-log-table qp-paper-table">
        <thead>
          <tr>
            <th rowspan="2">Product</th>
            <th rowspan="2">B&amp;S Batch No.<br>/ Exp Date</th>
            <th rowspan="2">Country of<br>Origin</th>
            <th rowspan="2">Manufacturer Batch<br>Number / Quantity / IMP</th>
            <th rowspan="2">QTY<br>Issued</th>
            <th rowspan="2">Ret.<br>Sample</th>
            <th rowspan="2">Damaged /<br>Reg. Sample</th>
            <th rowspan="2">Yield</th>
            <th rowspan="2">Room<br>No</th>
            <th rowspan="2">Boxes</th>
            <th colspan="1">Approved</th>
            <th rowspan="2">Comments</th>
          </tr>
          <tr><th><span class="qp-paper-yes-no-head">Yes&nbsp;&nbsp;&nbsp;&nbsp;No</span></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="qp-paper-signoff">
        <label><strong>QP Signature:</strong>${editable ? `<input value="${htmlSafe(firstLog.qpSignature || "")}" placeholder="Completed on QP sign off" readonly>` : "<span></span>"}</label>
        <label><strong>Release Date:</strong>${editable ? `<input value="${htmlSafe(firstLog.releaseDate || "")}" placeholder="Completed on QP sign off" readonly>` : "<span></span>"}</label>
      </div>
      <footer class="qp-paper-footer">
        <div><span>Parent SOP: SOP/PLPI/0128</span><span>Effective Date: 05/09/2025</span></div>
        <div><span>Form Number: F/PLPI/0128/001/V10</span><span>Review Date: 04/09/2027</span></div>
      </footer>
    </section>
  `;
}

function renderPreQpReleaseLogPrintPreview(products) {
  return renderQpReleaseLogPaper(products);
}

function openPreQpReleaseLogPrintPreview() {
  const selectedProducts = preQpReleaseLogSelection
    .map((batch) => bnsProducts.find((product) => product.batch === batch))
    .filter((product) => product && preQpCheckedBatchNumbers.includes(product.batch));
  if (!selectedProducts.length) {
    statusMessage.textContent = "Select at least one verified Pre QP batch to print the QP Release Log.";
    return;
  }
  printPreviewRequest = { type: "preqp-release-log", batches: selectedProducts.map((product) => product.batch) };
  document.querySelector("#print-preview-title").textContent = "QP Release Log";
  printPreviewBody.innerHTML = `
    <div class="release-log-modal-shell">
      <div class="preview-toolbar">
<div>
  <strong>QP Release Log Preview</strong>
  <span>${selectedProducts.length} product${selectedProducts.length === 1 ? "" : "s"} selected</span>
</div>
<button class="classic-button" type="button" data-close-print-preview>Close</button>
<button class="classic-button primary" type="button" id="preview-print-button">Print</button>
      </div>
      ${renderPreQpReleaseLogPrintPreview(selectedProducts)}
    </div>
  `;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = "QP Release Log preview opened.";
}
function getQpReleaseLogDamagedSample(product) {
  const postRecord = postAssemblyRecords[product.batch] || {};
  const assemblyRecord = assemblyRecords[product.batch] || {};
  return String(postRecord.damagedSample ?? postRecord.regulatorySample ?? assemblyRecord.damagedQty ?? "0");
}

function getQpReleaseLogReboxingComment(product) {
  if (product.routeType !== "Reboxing") return "";
  const packSizeRecord = changeOfPackSizeData[product.batch] || {};
  const assemblyRecord = assemblyRecords[product.batch] || {};
  const postRecord = postAssemblyRecords[product.batch] || {};
  const receivedQty = packSizeRecord.receivedAs?.qty || assemblyRecord.qtyReceived || product.onHandQuantity || product.receivedQuantity || product.quantity || "0";
  const assembledQty = packSizeRecord.assembledAs?.finishedQty || postRecord.totalQty || assemblyRecord.usedQty || product.quantity || "0";
  return `Received as Qty: ${receivedQty} | Assembled as Qty: ${assembledQty}`;
}

function getQpReleaseLogDefaults(product) {
  const postRecord = postAssemblyRecords[product.batch] || {};
  const existingLog = qpReleaseRecords[product.batch] && qpReleaseRecords[product.batch].releaseLog ? qpReleaseRecords[product.batch].releaseLog : {};
  const totalQty = postRecord.totalQty || product.quantity;
  const reboxingComment = getQpReleaseLogReboxingComment(product);
  return {
    product: existingLog.product || product.product,
    batch: existingLog.batch || product.batch,
    expiry: existingLog.expiry || product.expiry,
    country: existingLog.country || product.country,
    manufacturerDetails: existingLog.manufacturerDetails || `${product.manufLotNo || product.manufacturingLot || "25088FA"} / ${totalQty} / ${product.imp || "C13278"}`,
    qtyIssued: existingLog.qtyIssued || totalQty,
    retentionSample: existingLog.retentionSample || "01",
    damagedSample: existingLog.damagedSample || getQpReleaseLogDamagedSample(product),
    yieldQty: existingLog.yieldQty || getQpDefaultYield(product),
    roomNo: existingLog.roomNo || (productionRecords[product.batch] ? productionRecords[product.batch].roomNo : "3"),
    boxes: existingLog.boxes || (postRecord.boxCount || Math.max(1, Math.ceil(Number(product.quantity || 0) / 100))),
    approved: existingLog.approved || "",
    comments: reboxingComment || existingLog.comments || "",
    qpSignature: existingLog.qpSignature || "",
    releaseDate: existingLog.releaseDate || "",
    signedBy: existingLog.signedBy || "",
    signedDateTime: existingLog.signedDateTime || ""
  };
}

function renderPreQpWork(stage) {
  if (!preQpSelectedProduct) return renderPreQpList();
  const product = preQpSelectedProduct;
  const record = preQpRecords[product.batch] || {};
  const logGenerated = Boolean(record.logGenerated);
  return `
    <div class="preqp-layout label-printing-layout label-detail-layout label-reference-layout preqp-printing-reference-layout">
      <section class="preqp-window preqp-detail-window label-reference-window preqp-printing-reference-window">
        <header class="label-reference-header preqp-reference-header">
          <div><strong>Pre QP - ${product.batch}</strong></div>
          <button class="classic-button" type="button" data-preqp-back-queue>Back to Batch Queue</button>
        </header>
        <div class="label-reference-grid preqp-reference-grid">
          ${renderPrintingProductSidebar(product)}
          <main class="label-workflow-card preqp-workflow-card">
            <section class="label-workflow-section preqp-workflow-section">
              <div class="label-workflow-section-title"><h3>QA Checking</h3></div>
              <div class="preqp-workflow-section-body">
                <div class="preqp-sample-row preqp-sample-inline-row">
                  <label><span>Random sample taken from box number</span><input id="preqp-sample-box" data-preqp-input value="${record.sampleBox || "01"}"></label>
                </div>
                <div class="preqp-doc-list">
                  ${[
      "Supplier invoice and PCL",
      "Mock UP and Braille Verification Sheet",
      "Sample with backing-paper (if applicable)",
      "Foreign Leaflet",
      "Change of pack size form (if applicable)",
      "Foreign Carton (if applicable)"
                  ].map((item, index) => `
                    <div class="preqp-doc-card" data-preqp-doc-row>
                      <div class="preqp-doc-name">
                        <span>Document</span>
                        <strong>${item}</strong>
                      </div>
                      <button class="classic-button" type="button" data-view-preqp-document="${item}">View File</button>
                      <div class="preqp-choice-group" aria-label="${item} check result">
                        <label><input type="checkbox" data-preqp-doc-check data-preqp-doc-index="${index}" value="Yes" ${record.docs && record.docs[index] === "Yes" ? "checked" : ""}> Yes</label>
                        <label><input type="checkbox" data-preqp-doc-check data-preqp-doc-index="${index}" value="No" ${record.docs && record.docs[index] === "No" ? "checked" : ""}> No</label>
                      </div>
                      <label class="preqp-doc-comment">Comments <input data-preqp-input value="${record.docComments && record.docComments[index] ? record.docComments[index] : ""}"></label>
                    </div>
                  `).join("")}
                </div>
              </div>
            </section>

            <section class="label-workflow-section preqp-workflow-section">
              <div class="label-workflow-section-title"><h3>Confirm Correct Material Has Been Used</h3></div>
              <div class="preqp-workflow-section-body">
                <table class="recon-clean-table preqp-material-table">
                  <thead><tr><th>Type of Label</th><th>Reference Code</th><th>Checked & Confirmed</th></tr></thead>
                  <tbody>
                    ${[
["Carton / Braille Label 1", "FLU250-10/120/CZ (R4)"],
["Blister Label 1", "FLU250-10/120/CZ/B1 (R3)"],
["Blister/Carton 2", "FLU250-10/120/CZ/B2 (R3)"],
["Leaflet 1", "FLU250-10/120/CZ/LT (R5)"],
["Other", "Blank Label"]
                    ].map(([label, ref]) => `
                      <tr data-preqp-material-row>
                        <td>${label}</td>
                        <td>${ref}</td>
                        <td><label class="compact-tick"><input type="checkbox" data-preqp-material-check ${record.materialChecked ? "checked disabled" : ""}> Confirmed</label></td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
             </section>

            <section class="label-workflow-section preqp-workflow-section preqp-line-clearance-section">
              <div class="label-workflow-section-title"><h3>Line Clearance</h3></div>
              <div class="preqp-workflow-section-body">
                <label class="preqp-line-clearance-check">
                  <input type="checkbox" data-preqp-line-clearance ${record.lineClearance || record.materialChecked ? "checked" : ""}>
                  <span><strong>Line clearance completed</strong><small>Production area, printed components, samples and previous-batch materials have been cleared.</small></span>
                </label>
              </div>
            </section>

            <section class="label-workflow-section preqp-workflow-section preqp-completion-section">
              <div class="label-workflow-section-title"><h3>Comments &amp; Sign Off</h3></div>
              <div class="preqp-workflow-section-body">
                <label class="postassembly-comment">Comments <textarea id="preqp-comments" data-preqp-input>${record.comments || ""}</textarea></label>
                <div class="signature-grid">
                  <label>Pre-QP Checker <input value="${currentLogin ? currentLogin.user : stage.user}" readonly></label>
                  <label>Date / Time <input value="${record.dateTime || "Pending sign off"}" readonly></label>
                  <div class="signoff-action process-signoff-action">
                    <button class="classic-button primary" type="button" id="preqp-complete-button" disabled>${record.dateTime ? "Signed Off" : "User Sign Off"}</button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </section>
    </div>
  `;
}

function updatePreQpAvailability() {
  const submitButton = document.querySelector("#preqp-complete-button");
  if (!submitButton || !preQpSelectedProduct) return;
  const signedOff = Boolean(preQpRecords[preQpSelectedProduct.batch]?.dateTime);
  if (signedOff) {
    submitButton.disabled = true;
    submitButton.textContent = "Signed Off";
    submitButton.setAttribute("aria-disabled", "true");
    return;
  }
  const sampleBox = document.querySelector("#preqp-sample-box");
  const docRows = [...document.querySelectorAll("[data-preqp-doc-row]")];
  const docsComplete = docRows.length > 0 && docRows.every((row) => row.querySelector("[data-preqp-doc-check]:checked"));
  const materialChecks = [...document.querySelectorAll("[data-preqp-material-check]")];
  const materialsComplete = materialChecks.length > 0 && materialChecks.every((check) => check.checked);
  const lineClearanceComplete = Boolean(document.querySelector("[data-preqp-line-clearance]")?.checked);
  const readyToGenerate = Boolean(sampleBox && sampleBox.value.trim() && docsComplete && materialsComplete && lineClearanceComplete);
  submitButton.disabled = !readyToGenerate;
  submitButton.textContent = "User Sign Off";
  submitButton.removeAttribute("aria-disabled");
}

function collectPreQpFormState() {
  const docRows = [...document.querySelectorAll("[data-preqp-doc-row]")];
  return {
    sampleBox: document.querySelector("#preqp-sample-box") ? document.querySelector("#preqp-sample-box").value : "",
    docs: docRows.map((row) => {
      const checked = row.querySelector("[data-preqp-doc-check]:checked");
      return checked ? checked.value : "";
    }),
    docComments: docRows.map((row) => {
      const input = row.querySelector("input[data-preqp-input]");
      return input ? input.value : "";
    }),
    materialChecked: [...document.querySelectorAll("[data-preqp-material-check]")].every((check) => check.checked),
    lineClearance: Boolean(document.querySelector("[data-preqp-line-clearance]")?.checked),
    comments: document.querySelector("#preqp-comments") ? document.querySelector("#preqp-comments").value : ""
  };
}

function openPreQpDocumentPreview(documentName) {
  const previewProduct = currentStageId === "qp-release" ? qpSelectedProduct : preQpSelectedProduct || qpSelectedProduct;
  document.querySelector("#print-preview-title").textContent = documentName;
  printPreviewRequest = null;
  printPreviewBody.innerHTML = `
    <div class="document-preview-shell">
      <div class="preview-toolbar">
<strong>${documentName}</strong>
<button class="classic-button" type="button" data-close-print-preview>Close</button>
      </div>
      <section class="document-preview-page">
<div class="document-preview-header">
  <span>B&S Healthcare</span>
  <strong>${documentName}</strong>
  <span>Batch ${previewProduct ? previewProduct.batch : ""}</span>
</div>
<div class="document-preview-content">
  <div class="document-line wide"></div>
  <div class="document-line"></div>
  <div class="document-line short"></div>
  <table class="document-preview-table">
    <tbody>
      <tr><th>Product</th><td>${previewProduct ? previewProduct.product : ""}</td></tr>
      <tr><th>Reference</th><td>${previewProduct ? previewProduct.ecma : ""}</td></tr>
      <tr><th>Status</th><td>Available for QA checking</td></tr>
    </tbody>
  </table>
  <div class="document-stamp">FILE PREVIEW</div>
</div>
      </section>
    </div>
  `;
  printPreviewModal.classList.remove("hidden");
}

function openPreQpReleaseLogModal(product, record, stage, showProceed = true) {
  document.querySelector("#print-preview-title").textContent = "QP Release Log";
  printPreviewRequest = null;
  printPreviewBody.innerHTML = `
    <div class="release-log-modal-shell">
      <div class="preview-toolbar">
<strong>QP Release Log Preview</strong>
<button class="classic-button" type="button" data-close-print-preview>Close</button>
      </div>
      ${renderReleaseLogPreview(product, record, stage)}
      ${showProceed ? `
<div class="release-log-modal-actions">
  <button class="classic-button primary" type="button" id="preqp-proceed-log-button">Proceed to Generate</button>
</div>
      ` : ""}
    </div>
  `;
  printPreviewModal.classList.remove("hidden");
}

function previewPreQpReleaseLog() {
  if (!preQpSelectedProduct) return;
  const batchNumber = preQpSelectedProduct.batch;
  const stage = findStage("pre-qp");
  const nextRecord = {
    ...(preQpRecords[batchNumber] || {}),
    ...collectPreQpFormState()
  };
  preQpRecords[batchNumber] = {
    ...nextRecord,
    logPreviewOpen: true
  };
  openPreQpReleaseLogModal(preQpSelectedProduct, nextRecord, stage);
  statusMessage.textContent = `QP Release Log preview opened for ${batchNumber}.`;
}

function proceedGeneratePreQpReleaseLog() {
  if (!preQpSelectedProduct) return;
  const batchNumber = preQpSelectedProduct.batch;
  preQpRecords[batchNumber] = {
    ...(preQpRecords[batchNumber] || {}),
    ...collectPreQpFormState(),
    logPreviewOpen: true,
    logGenerated: true,
  };
  closePrintPreview();
  statusMessage.textContent = `QP Release Log generated and ready for ${batchNumber}.`;
  renderStage("pre-qp");
}

function completePreQp() {
  if (!preQpSelectedProduct) return;
  const batchNumber = preQpSelectedProduct.batch;
  const now = getAssemblyAuditTimestamp();
  preQpRecords[batchNumber] = {
    ...(preQpRecords[batchNumber] || {}),
    ...collectPreQpFormState(),
    user: currentLogin ? currentLogin.user : "pre.qp",
    dateTime: now,
    materialChecked: true,
    lineClearance: true,
    logGenerated: false
  };
  if (!preQpCheckedBatchNumbers.includes(batchNumber)) preQpCheckedBatchNumbers.push(batchNumber);
  statusMessage.textContent = `Batch ${batchNumber} completed in Pre-QP and is available in Release Log Sheet.`;
  window.setTimeout(() => {
    preQpSelectedProduct = null;
    renderStage("pre-qp");
  }, 900);
}

function getQpBatchDecision(product) {
  const record = qpReleaseRecords[product.batch] || {};
  if (record.approved || qpReleasedBatchNumbers.includes(product.batch)) return "Certified";
  if (record.decision === "Hold") return "Hold";
  if (record.decision === "Banding") return "Banding";
  if (record.decision === "Rejected") return "Rejected";
  if (record.decision === "Approve") return "Approved";
  return getQpReleaseLogId(product.batch) ? "QP Log Generated" : "Pending QP Review";
}

function isQpBatchDecisionComplete(product) {
  const record = qpReleaseRecords[product.batch] || {};
  return Boolean(record.approved || qpReleasedBatchNumbers.includes(product.batch) || ["Certified", "Hold", "Banding", "Rejected"].includes(record.decision));
}

function syncQpReleaseLogDecisions(products) {
  let changed = false;
  products.forEach((product) => {
    const record = qpReleaseRecords[product.batch] || {};
    const completed = isQpBatchDecisionComplete(product);
    const decision = getQpBatchDecision(product);
    const approved = completed ? (decision === "Certified" || decision === "Approved" ? "Yes" : "No") : "";
    const currentLog = getQpReleaseLogDefaults(product);
    if (currentLog.approved !== approved || Boolean(record.qpDecisionCompleted) !== completed) changed = true;
    qpReleaseRecords[product.batch] = {
      ...record,
      qpDecisionCompleted: completed,
      releaseLog: {
        ...currentLog,
        approved,
        batchDecision: decision,
        batchCompleted: completed
      }
    };
  });
  if (changed) persistQpReleaseRecords();
}

function setQpBatchDecision(decision) {
  if (!qpSelectedProduct) return;
  const batchNumber = qpSelectedProduct.batch;
  const decisionComplete = ["Hold", "Banding", "Rejected"].includes(decision);
  const existingLog = getQpReleaseLogDefaults(qpSelectedProduct);
  qpReleaseRecords[batchNumber] = {
    ...(qpReleaseRecords[batchNumber] || {}),
    decision,
    decisionBy: currentLogin ? currentLogin.user : "qp.release",
    decisionDateTime: getAssemblyAuditTimestamp(),
    qpDecisionCompleted: decisionComplete,
    releaseLog: {
      ...existingLog,
      approved: decisionComplete ? "No" : "",
      batchDecision: decision,
      batchCompleted: decisionComplete
    }
  };
  persistQpReleaseRecords();
  if (decision === "Approve") {
    qpChecklistOpen = true;
    statusMessage.textContent = `Batch ${batchNumber} is ready for Process 11 Printed BAR sign-off.`;
  } else if (decision === "Hold") {
    if (!qpCertifiedBatchNumbers.includes(batchNumber)) qpCertifiedBatchNumbers.push(batchNumber);
    qpSelectedProduct = null;
    qpChecklistOpen = false;
    statusMessage.textContent = `Batch ${batchNumber} placed on hold and recorded in QP Certified Batches.`;
  } else if (decision === "Banding") {
    qpSelectedProduct = null;
    qpChecklistOpen = false;
    statusMessage.textContent = `Batch ${batchNumber} sent for banding.`;
  } else if (decision === "Rejected") {
    if (!qpCertifiedBatchNumbers.includes(batchNumber)) qpCertifiedBatchNumbers.push(batchNumber);
    qpSelectedProduct = null;
    qpChecklistOpen = false;
    statusMessage.textContent = `Batch ${batchNumber} rejected and recorded in QP Certified Batches.`;
  }
  renderStage("qp-release");
}
function getQpReleaseProducts() {
  ensurePreQpTestData();
  const sourceProducts = bnsProducts.filter((product) => preQpCheckedBatchNumbers.includes(product.batch));
  const normalizedQpIdSearch = qpIdSearch.trim().toLowerCase();
  const normalizedBatchSearch = qpBatchSearch.trim().toLowerCase();
  const normalizedStatusSearch = qpStatusSearch.trim().toLowerCase();
  return sourceProducts.filter((product) => {
    const record = qpReleaseRecords[product.batch] || {};
    const decision = getQpBatchDecision(product);
    if (!(record.qpReady || record.qpId || record.decision || record.approved || qpReleasedBatchNumbers.includes(product.batch))) return false;
    const qpId = getQpReleaseLogId(product.batch).toLowerCase();
    const batch = String(product.batch || "").toLowerCase();
    const qpIdMatches = !normalizedQpIdSearch || qpId.includes(normalizedQpIdSearch);
    const batchMatches = !normalizedBatchSearch || batch.includes(normalizedBatchSearch);
    const statusMatches = !normalizedStatusSearch || decision.toLowerCase() === normalizedStatusSearch;
    return qpIdMatches && batchMatches && statusMatches;
  });
}
function loadQpReleaseRecords() {
  try {
    const saved = window.localStorage.getItem(QP_RELEASE_RECORDS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function persistQpReleaseRecords() {
  try {
    window.localStorage.setItem(QP_RELEASE_RECORDS_STORAGE_KEY, JSON.stringify(qpReleaseRecords));
  } catch (error) {
    return;
  }
}

function getQpDocumentPack(product) {
  const postRecord = postAssemblyRecords[product.batch] || {};
  const batch = String(product.batch || "BATCH").replace(/[^a-z0-9_-]+/gi, "_");
  return [
    { id: "po-packing-list", group: "RPi Documents", name: "PO Packing List", fileName: `${batch}_PO_Packing_List.pdf`, pages: 1, source: "PLPI", ref: product.pl || product.partNo || "Generated", version: "1.0", uploadedBy: "rp.user", uploadedDate: "22 Jun 2026" },
    { id: "supplier-declaration", group: "RPi Documents", name: "Supplier Declaration", fileName: `${batch}_Supplier_Declaration.pdf`, pages: 2, source: "Supplier", ref: product.supplierName || "Supplier declaration", version: "1.1", uploadedBy: "goods.in", uploadedDate: "22 Jun 2026" },
    { id: "supplier-packing-list", group: "RPi Documents", name: "Supplier Packing List", fileName: `${batch}_Supplier_Packing_List.pdf`, pages: 3, source: "Supplier", ref: product.partNo || "Uploaded", version: "1.0", uploadedBy: "goods.in", uploadedDate: "22 Jun 2026" },
    { id: "supplier-invoice", group: "RPi Documents", name: "Supplier Invoice", fileName: `${batch}_Supplier_Invoice.pdf`, pages: 2, source: "Supplier", ref: product.invoice || product.supplierInvoice || "Uploaded", version: "1.0", uploadedBy: "goods.in", uploadedDate: "22 Jun 2026" },
    { id: "temperature-record", group: "RPi Documents", name: "Temperature Record", fileName: `${batch}_Temperature_Record.pdf`, pages: 6, source: "VTS / Upload", ref: "Within range", version: "1.0", uploadedBy: "goods.in", uploadedDate: "23 Jun 2026" },
    { id: "pcl", group: "Batch Checking", name: "PCL", fileName: `${batch}_PCL.pdf`, pages: (pclBarRecords[product.batch]?.sourceRow || batchCheckerDb.find(row => row.batchNo === product.batch))?.coldChain === "Yes" ? 2 : 1, source: "PLPI", ref: "PCL approved", version: "2.0", uploadedBy: "batch.checker", uploadedDate: "23 Jun 2026" },
    { id: "approved-artwork", group: "Artwork", name: "Approved Artwork / Mock-Up", fileName: `${batch}_Approved_Artwork.pdf`, pages: 8, source: "Regulatory", ref: product.ecma || "Approved", version: "3.2", uploadedBy: "regulatory.user", uploadedDate: "23 Jun 2026" },
    { id: "batch-summary", group: "Batch Record", name: "Batch Record Summary", fileName: `${batch}_Batch_Record_Summary.pdf`, pages: 12, source: "Assembly Room", ref: `Yield ${Math.max(0, Number(postRecord.totalQty || product.quantity || 0) - 1)}`, version: "1.0", uploadedBy: "production.checker", uploadedDate: "24 Jun 2026" },
    { id: "release-log", group: "Pre-QP", name: "QP Release Log", fileName: `${batch}_QP_Release_Log.pdf`, pages: 1, source: "Pre-QP", ref: "Ready for QP", version: "1.0", uploadedBy: "pre.qp", uploadedDate: "24 Jun 2026" },
    { id: "ipc-photos", group: "Assembly", name: "IPC Product / Sample Photos", fileName: "IPC photo evidence", pages: 1, version: "1.0", uploadedBy: "Assembly", uploadedDate: "Batch evidence", ref: product.ecma || "" },
    { id: "reconciliation", group: "Assembly", name: "Reconciliation Sheet", fileName: `${batch}_Reconciliation.pdf`, pages: 1, version: "1.0", uploadedBy: "Assembly", uploadedDate: "Batch record", ref: product.batch },
    { id: "completed-bar", group: "Batch Record", name: "Completed BAR", fileName: `${batch}_BAR.pdf`, pages: getGeneratedBarTotalPages(product), source: "PLPI", ref: product.batch, version: "1.0", uploadedBy: "System", uploadedDate: "Live batch record" }
  ];
}

function getQpDocumentReview(product, document) {
  const record = qpReleaseRecords[product.batch] || {};
  const saved = record.documentReviews && record.documentReviews[document.id];
  if (saved) return { ...saved, version: saved.version || document.version };
  if (record.documents && record.documents[document.id]) {
    return { status: "Reviewed", version: document.version, reviewedBy: record.decisionBy || "qp.release", reviewedAt: record.decisionDateTime || "Previously verified" };
  }
  return { status: "Pending", version: document.version };
}

function getQpReviewSummary(product) {
  const documents = getQpDocumentPack(product);
  const reviews = documents.map((document) => ({ document, review: getQpDocumentReview(product, document) }));
  const reviewed = reviews.filter(({ review }) => review.status === "Reviewed").length;
  const issues = reviews.filter(({ review }) => review.status === "Issue Raised").length;
  const rereview = reviews.filter(({ review }) => review.status === "Re-review Required").length;
  return { documents, reviews, reviewed, issues, rereview, pending: documents.length - reviewed - issues - rereview };
}

function getNextPendingQpDocument(product, currentDocumentId) {
  const summary = getQpReviewSummary(product);
  const startIndex = Math.max(0, summary.documents.findIndex((document) => document.id === currentDocumentId));
  return [...summary.documents.slice(startIndex + 1), ...summary.documents.slice(0, startIndex + 1)]
    .find((document) => getQpDocumentReview(product, document).status !== "Reviewed");
}
function getQpDefaultYield(product) {
  const postRecord = postAssemblyRecords[product.batch] || {};
  return String(Math.max(0, Number(postRecord.totalQty || product.quantity || 0) - 1));
}

function getReleaseLogBaseProducts() {
  ensurePreQpTestData();
  const completedProducts = getPreQpProducts().filter((product) => preQpCheckedBatchNumbers.includes(product.batch));
  return Array.from(new Map(completedProducts.map((product) => [product.batch, product])).values());
}

function getReleaseLogSheetProducts() {
  const productFilter = releaseLogProductSearch.trim().toLowerCase();
  const batchFilter = releaseLogBatchSearch.trim().toLowerCase();
  const siteFilter = releaseLogSiteSearch.trim().toLowerCase();
  return getReleaseLogBaseProducts()
    .filter((product) => {
      const productText = `${product.product || ""} ${product.description || ""}`.toLowerCase();
      return (!productFilter || productText.includes(productFilter)) &&
        (!batchFilter || String(product.batch || "").toLowerCase().includes(batchFilter)) &&
        (!siteFilter || String(product.site || "WHO").toLowerCase() === siteFilter);
    });
}

function renderReleaseLogSheetWork() {
  const products = getReleaseLogSheetProducts();
  const productOptions = Array.from(new Set(getReleaseLogBaseProducts()
    .map((product) => product.product || product.description || "")
    .filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
  preQpReleaseLogSelection = preQpReleaseLogSelection.filter((batch) => products.some((product) => product.batch === batch));
  const selectedProducts = products.filter((product) => preQpReleaseLogSelection.includes(product.batch));
  const totalQuantity = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  return `
    <div class="release-log-sheet-layout">
      <section class="release-log-sheet-window">
        <div class="sub-window-title release-log-current-title">Release Log Sheet</div>
        <div class="release-log-filter-row">
          <label>Product :
            <select data-release-log-product-search>
              <option value="">All products</option>
              ${productOptions.map((productName) => `<option value="${htmlSafe(productName)}" ${releaseLogProductSearch === productName ? "selected" : ""}>${htmlSafe(productName)}</option>`).join("")}
            </select>
          </label>
          <label>BNS Batch No :
            <input data-release-log-batch-search value="${htmlSafe(releaseLogBatchSearch)}">
          </label>
          <label>Site :
            <select data-release-log-site-search><option selected>WHO</option><option>EU</option><option>UK</option></select>
          </label>
          <button class="classic-button" type="button" data-release-log-search>Search</button>
        </div>
        <div class="release-log-grid-shell">
          <table class="classic-table release-log-sheet-table">
            <thead><tr>
              <th>Select</th><th>SALES_PART_NO</th><th>DESCRIPTION</th><th>STRENGTH</th><th>PACK_SIZE</th>
              <th>BNS_BATCH_NO</th><th>EXPIRY_DATE</th><th>QUANTITY</th><th>Assembled Qty</th><th>ECMA</th>
              <th>CONTROL_DRUG</th><th>COLD_CHAIN</th><th>BOXES</th><th>THIRD_PARTY</th><th>ROOM_NO</th><th>PRODUCTION_CHECKED</th><th>REGULATORY</th><th>LEGAL_CATEGORY</th><th>QA REMARK</th><th>Damaged and Regulatory Sample</th>
            </tr></thead>
            <tbody>
              ${products.map((product) => {
                const postRecord = postAssemblyRecords[product.batch] || {};
                const productionRecord = productionRecords[product.batch] || {};
                const selected = preQpReleaseLogSelection.includes(product.batch);
                const relId = getQpReleaseLogId(product.batch);
                return `<tr class="${selected ? "release-log-row-selected" : ""}" data-release-log-row="${product.batch}">
                  <td><input type="checkbox" data-release-log-select="${product.batch}" ${selected ? "checked" : ""}></td>
                  <td>${htmlSafe(product.partNo || product.pl || "")}</td>
                  <td title="${htmlSafe(product.product || "")}">${htmlSafe(product.description || product.product || "")}</td>
                  <td>${htmlSafe(product.strength || "-")}</td>
                  <td>${htmlSafe(product.packSize || "-")}</td>
                  <td><strong>${htmlSafe(product.batch)}</strong>${relId ? `<small>${htmlSafe(relId)}</small>` : ""}</td>
                  <td>${htmlSafe(product.expiry || "-")}</td>
                  <td>${htmlSafe(product.quantity || "0")}</td>
                  <td>${htmlSafe(postRecord.totalQty || product.quantity || "0")}</td>
                  <td>${htmlSafe(product.ecma || "-")}</td>
                  <td>${product.controlDrug ? "Yes" : "No"}</td>
                  <td>${product.coldChain ? "Yes" : "No"}</td>
                  <td>${htmlSafe(postRecord.boxCount || Math.max(1, Math.ceil(Number(product.quantity || 0) / 100)))}</td>
                  <td>${product.thirdParty || ""}</td>
                  <td>${htmlSafe(productionRecord.roomNo || "3")}</td>
                  <td>${htmlSafe(postRecord.dateTime || "Completed")}</td>
                  <td>${htmlSafe(product.regulatory || "MHRA")}</td>
                  <td>${htmlSafe(product.legalCategory || (String(product.regulatory || "").toUpperCase() === "DIAGNOSTIC" ? "NOT APPLICABLE" : "POM"))}</td>
                  <td>${htmlSafe(product.qaRemark || "")}</td>
                  <td>${htmlSafe(product.damagedRegulatorySample || "")}</td>
                </tr>`;
              }).join("") || `<tr><td colspan="20">No completed Pre-QP batches match the current filters.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="release-log-totals"><span>Total Batches : <strong>${products.length}</strong></span><span>Total Quantity : <strong>${totalQuantity}</strong></span><span>Selected : <strong>${selectedProducts.length}</strong></span></div>
        <div class="release-log-actions">
          <button class="classic-button" type="button" data-release-log-select-all>Select All</button>
          <button class="classic-button" type="button" data-release-log-unselect-all>Unselect All</button>
          <label>Release For :
            <select data-release-log-release-for><option>UK</option><option>EU</option><option>WHO</option></select>
          </label>
          <label class="release-log-scan">Scan Barcode For Selection <input data-release-log-scan placeholder=""></label>
          <button class="classic-button primary release-log-generate-button" type="button" data-release-log-print ${selectedProducts.length ? "" : "disabled"}>Generate Release Log</button>
        </div>
      </section>
    </div>
  `;
}

function openReleaseLogSheetPreview() {
  const selectedProducts = preQpReleaseLogSelection.map((batch) => bnsProducts.find((product) => product.batch === batch)).filter(Boolean);
  if (!selectedProducts.length) {
    statusMessage.textContent = "Select at least one completed Pre-QP batch.";
    return;
  }
  printPreviewRequest = {
    type: "release-log",
    batches: selectedProducts.map((product) => product.batch)
  };
  document.querySelector("#print-preview-title").textContent = "QP Release Log";
  printPreviewBody.innerHTML = `
    <div class="release-log-modal-shell">
      <div class="preview-toolbar">
        <div><strong>QP Release Log Preview</strong><span>${selectedProducts.length} batch${selectedProducts.length === 1 ? "" : "es"} combined</span></div>
        <button class="classic-button" type="button" data-close-print-preview>Close</button>
        <button class="classic-button primary" type="button" id="preview-print-button">Confirm</button>
      </div>
      ${renderPreQpReleaseLogPrintPreview(selectedProducts)}
    </div>`;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = `${selectedProducts.length} batch${selectedProducts.length === 1 ? "" : "es"} ready on one Release Log Sheet.`;
}

function renderQpReleaseWork(stage) {
  if (stage.id === "qp-certified") return renderQpCertifiedCards();
  if (!qpSelectedProduct && stage.id === "qp-release" && qpSelectedReleaseId) return renderQpReleaseBatchList(stage, qpSelectedReleaseId);
  if (!qpSelectedProduct) return renderQpDashboard(stage);
  return qpChecklistOpen ? renderQpChecklistWindow(stage) : renderQpSelectedDashboard(stage);
}

function getQpDecisionRowClass(decision) {
  if (decision === "Certified" || decision === "Approved") return "preqp-row-approved preqp-row-verified";
  if (decision === "Hold") return "preqp-row-on-hold qp-hold-row";
  if (decision === "Rejected") return "qp-row-rejected";
  return "preqp-row-white";
}

function getQpReleaseGroups() {
  const groups = new Map();
  const normalizedQpIdSearch = qpIdSearch.trim().toLowerCase();
  const normalizedBatchSearch = qpBatchSearch.trim().toLowerCase();
  Array.from(new Map(bnsProducts.map((product) => [product.batch, product])).values())
    .filter((product) => preQpCheckedBatchNumbers.includes(product.batch))
    .filter((product) => getQpCertifiedDecisionTab(product) !== "Approved")
    .filter((product) => {
      const record = qpReleaseRecords[product.batch] || {};
      const relId = getQpReleaseLogId(product.batch);
      if (!(record.qpReady || relId || record.decision || record.approved || qpReleasedBatchNumbers.includes(product.batch))) return false;
      return (!normalizedQpIdSearch || relId.toLowerCase().includes(normalizedQpIdSearch)) &&
        (!normalizedBatchSearch || String(product.batch || "").toLowerCase().includes(normalizedBatchSearch));
    })
    .forEach((product) => {
    const relId = getQpReleaseLogId(product.batch);
    if (!relId) return;
    if (!groups.has(relId)) groups.set(relId, []);
    groups.get(relId).push(product);
  });
  return Array.from(groups, ([relId, products]) => ({ relId, products }));
}

function getQpGroupStatus(products) {
  const decisions = products.map(getQpBatchDecision);
  if (decisions.every((decision) => decision === "Certified" || decision === "Approved")) return "Approved";
  if (decisions.some((decision) => decision === "Hold")) return "Issue / Hold";
  if (decisions.some((decision) => decision === "Banding")) return "Banding";
  if (decisions.some((decision) => decision === "Rejected")) return "Rejected";
  return "Awaiting QP Review";
}

function renderQpReleaseCardsDashboard() {
  const groups = getQpReleaseGroups();
  const totalBatches = groups.reduce((total, group) => total + group.products.length, 0);
  qpDashboardSelection = qpDashboardSelection.filter((batch) => groups.some((group) => group.products.some((product) => product.batch === batch)));
  return `
    <div class="qp-rel-dashboard qp-awaiting-cards">
      <section class="qp-rel-dashboard-window">
        <div class="qp-rel-dashboard-header">
          <div><h2>QP Release Dashboard</h2><p>Release Log Sheets awaiting QP review</p></div>
          <div class="qp-rel-dashboard-summary"><span><strong>${groups.length}</strong> Release IDs</span><span><strong>${totalBatches}</strong> Batches</span></div>
        </div>
        <div class="qp-rel-filter-row">
          <label>Rel ID : <input data-qp-id-search value="${htmlSafe(qpIdSearch)}"></label>
          <label>BNS Batch No : <input data-qp-batch-search value="${htmlSafe(qpBatchSearch)}"></label>
          <button class="classic-button" type="button" data-qp-search-button>Search</button>
        </div>
        <div class="qp-rel-card-grid">
          ${groups.map(({ relId, products }) => {
            const status = getQpGroupStatus(products);
            const originValues = Array.from(new Set(products.map((product) => product.country || product.site || "Not recorded")));
            const originSummary = originValues.join(", ");
            const groupQuantity = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
            return `<article class="qp-rel-card" data-open-qp-release-id="${htmlSafe(relId)}">
              <div class="qp-rel-card-top">
                <div><span>Release ID</span><strong>${htmlSafe(relId)}</strong></div>
                <em class="${status.toLowerCase().replace(/[^a-z]+/g, "-")}">${htmlSafe(status)}</em>
              </div>
              <div class="qp-rel-card-meta">
                <div><span>Batches</span><strong>${products.length}</strong></div>
                <div><span>Country of Origin</span><strong title="${htmlSafe(originSummary)}">${htmlSafe(originSummary)}</strong></div>
                <div><span>Total Quantity</span><strong>${htmlSafe(groupQuantity)}</strong></div>
              </div>
              <footer><button class="classic-button primary qp-rel-view-button" type="button" data-open-qp-release-id="${htmlSafe(relId)}">View Batch List</button></footer>
            </article>`;
          }).join("") || `<div class="qp-rel-empty">No Release IDs match the current filters.</div>`}
        </div>
      </section>
    </div>`;
}

function renderQpReleaseBatchList(stage, relId) {
  const products = getQpReleaseGroups().find(group => group.relId === relId)?.products || [];
  const totalQuantity = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const releaseLogSigned = products.length > 0 && products.every((product) => Boolean(getQpReleaseLogDefaults(product).signedDateTime));
  return `
    <div class="qp-rel-dashboard">
      <section class="qp-rel-dashboard-window qp-rel-batch-window">
        <div class="qp-rel-batch-header">
          <button class="classic-button" type="button" data-qp-back-release-cards>Back to QP Dashboard</button>
          <div><span>Release ID</span><h2>${htmlSafe(relId)}</h2><p>${products.length} combined B&amp;S batch${products.length === 1 ? "" : "es"} on this Release Log Sheet</p></div>
          <div class="qp-rel-batch-header-actions">
            <button class="classic-button primary" type="button" data-view-qp-group-release-log="${htmlSafe(relId)}">QP Release Log${releaseLogSigned ? " - Completed" : ""}</button>
            <div class="qp-rel-dashboard-summary"><span><strong>${products.length}</strong> Batches</span><span><strong>${totalQuantity}</strong> Total Qty</span></div>
          </div>
        </div>
        <div class="qp-rel-batch-table-shell">
          <table class="classic-table qp-rel-batch-table">
            <thead><tr><th>B&amp;S Batch No.</th><th>Description</th><th>Strength</th><th>Pack Size</th><th>Mfg. Lot No.</th><th>Expiry Date</th><th>Quantity</th><th>QP Status</th></tr></thead>
            <tbody>${products.map((product) => `<tr class="clickable-row" data-open-qp="${product.batch}" title="Open ${htmlSafe(product.batch)}">
              <td><strong>${htmlSafe(product.batch)}</strong></td><td>${htmlSafe(product.description || product.product)}</td><td>${htmlSafe(product.strength || "-")}</td>
              <td>${htmlSafe(product.packSize || "-")}</td><td>${htmlSafe(getMfgLotNo(product) || "-")}</td><td>${htmlSafe(product.expiry || "-")}</td>
              <td>${htmlSafe(product.quantity || "0")}</td><td><span class="status active-status">${htmlSafe(getQpBatchDecision(product))}</span></td>
            </tr>`).join("")}</tbody>
          </table>
        </div>
      </section>
    </div>`;
}

function getQpCertifiedDecisionTab(product) {
  const record = qpReleaseRecords[product.batch] || {};
  if (record.decision === "Hold") return "Hold";
  if (record.decision === "Banding") return "Banding";
  if (record.decision === "Rejected" || record.decision === "Reject") return "Reject";
  if (record.approved || record.decision === "Certified" || qpReleasedBatchNumbers.includes(product.batch)) return "Approved";
  return "";
}

function getQpCertifiedProducts() {
  return Array.from(new Map(bnsProducts.map(product => [product.batch, product])).values())
    .filter(product => getQpCertifiedDecisionTab(product));
}

function renderQpCertifiedCards() {
  ensurePreQpTestData();
  const allProducts = getQpCertifiedProducts();
  const products = allProducts.filter(product => getQpCertifiedDecisionTab(product) === qpCertifiedTab);
  const groups = new Map();
  products.forEach(product => {
    const relId = getQpReleaseLogId(product.batch);
    if (!groups.has(relId)) groups.set(relId, []);
    groups.get(relId).push(product);
  });
  const visibleGroups = [...groups].filter(([relId, batches]) =>
    (!qpIdSearch.trim() || relId.toLowerCase().includes(qpIdSearch.trim().toLowerCase())) &&
    (!qpBatchSearch.trim() || batches.some(product => product.batch.toLowerCase().includes(qpBatchSearch.trim().toLowerCase()))));
  qpCertifiedLabelSelection = qpCertifiedLabelSelection.filter(batch => qpCertifiedTab === "Approved" &&
    visibleGroups.some(([, batches]) => batches.some(product => product.batch === batch)));
  return `<div class="qp-rel-dashboard qp-certified-cards"><section class="qp-rel-dashboard-window">
    <div class="qp-rel-dashboard-header"><div><h2>QP Certified Batches</h2></div><div class="qp-rel-dashboard-summary"><span><strong>${visibleGroups.length}</strong> Release IDs</span><span><strong>${visibleGroups.reduce((sum, [, batches]) => sum + batches.length, 0)}</strong> Batches</span></div></div>
    <div class="qp-certified-tabs" role="tablist" aria-label="QP decisions">${["Approved", "Hold", "Banding", "Reject"].map(name => `<button class="classic-button ${qpCertifiedTab === name ? "primary" : ""}" type="button" role="tab" aria-selected="${qpCertifiedTab === name}" data-qp-certified-tab="${name}">${name} (${allProducts.filter(product => getQpCertifiedDecisionTab(product) === name).length})</button>`).join("")}</div>
    <div class="qp-rel-filter-row"><label>Rel ID : <input data-qp-id-search value="${htmlSafe(qpIdSearch)}"></label><label>BNS Batch No : <input data-qp-batch-search value="${htmlSafe(qpBatchSearch)}"></label><button class="classic-button" type="button" data-qp-certified-search>Search</button></div>
    <div class="qp-rel-card-grid">${visibleGroups.map(([relId, batches]) => `<article class="qp-rel-card">
      <div class="qp-rel-card-top"><div><span>Release ID</span><strong>${htmlSafe(relId || "Not assigned")}</strong></div><em>${qpCertifiedTab}</em></div>
      <div class="qp-certified-card-summary"><strong>${batches.length} batch${batches.length === 1 ? "" : "es"}</strong><span>${htmlSafe(batches.map(product => product.batch).join(", "))}</span><span>Total Quantity: <strong>${batches.reduce((sum, product) => sum + Number(product.quantity || 0), 0)}</strong></span></div>
      <footer><button class="classic-button" type="button" data-qp-certified-log="${htmlSafe(relId)}">View QP Release Log</button><button class="classic-button primary" type="button" data-qp-certified-open="${htmlSafe(relId)}">${qpCertifiedOpenRelId === relId ? "Hide Batch List" : "View Batch List"}</button></footer>
    </article>`).join("") || `<div class="qp-rel-empty">No ${qpCertifiedTab.toLowerCase()} batches match the current filters.</div>`}</div>
    ${visibleGroups.filter(([relId]) => relId === qpCertifiedOpenRelId).map(([relId, batches]) => `<section class="qp-certified-group-detail"><h3>Release ID ${htmlSafe(relId)} — ${qpCertifiedTab}</h3><div class="qp-rel-batch-table-shell"><table class="classic-table qp-rel-batch-table"><thead><tr>${qpCertifiedTab === "Approved" ? "<th>Select</th>" : ""}<th>B&amp;S Batch No.</th><th>Description</th><th>Strength</th><th>Pack Size</th><th>Mfg. Lot No.</th><th>Expiry Date</th><th>Quantity</th><th>Decision By</th><th>Decision Date</th></tr></thead><tbody>${batches.map(product => {
      const record = qpReleaseRecords[product.batch] || {};
      return `<tr>${qpCertifiedTab === "Approved" ? `<td><input type="checkbox" aria-label="Select batch ${htmlSafe(product.batch)}" data-qp-certified-label-select="${htmlSafe(product.batch)}" ${qpCertifiedLabelSelection.includes(product.batch) ? "checked" : ""}></td>` : ""}<td><strong>${htmlSafe(product.batch)}</strong></td><td>${htmlSafe(product.product || product.description)}</td><td>${htmlSafe(product.strength || "-")}</td><td>${htmlSafe(product.packSize || "-")}</td><td>${htmlSafe(getMfgLotNo(product) || "-")}</td><td>${htmlSafe(product.expiry || "-")}</td><td>${htmlSafe(product.quantity)}</td><td>${htmlSafe(record.decisionBy || record.user || "-")}</td><td>${htmlSafe(record.decisionDateTime || record.dateTime || "-")}</td></tr>`;
    }).join("")}</tbody></table></div></section>`).join("")}
    <div class="qp-rel-footer-actions"><span>${qpCertifiedLabelSelection.length} approved batches selected</span><button class="classic-button primary" type="button" data-print-release-label ${qpCertifiedTab !== "Approved" || !qpCertifiedLabelSelection.length ? "disabled" : ""}>Print Release Label</button></div>
  </section></div>`;
}

function openCertifiedQpLog(relId) {
  const products = Array.from(new Map(bnsProducts.map(product => [product.batch, product])).values()).filter(product => getQpReleaseLogId(product.batch) === relId);
  if (!products.length) return;
  const signed = products.every(product => Boolean(getQpReleaseLogDefaults(product).signedDateTime));
  printPreviewRequest = null;
  document.querySelector("#print-preview-title").textContent = `QP Release Log ${relId}`;
  printPreviewBody.innerHTML = `<div class="release-log-modal-shell"><div class="preview-toolbar"><div><strong>QP Release Log ${htmlSafe(relId)}</strong><span>${signed ? "Signed QP record" : "QP record — final log sign-off pending"} · ${products.length} batches</span></div><button class="classic-button" data-close-print-preview>Close</button></div>${renderQpReleaseLogPaper(products, true, true, true)}</div>`;
  printPreviewModal.classList.remove("hidden");
}

function getCertifiedPrintProducts(batches) {
  return [...new Set(batches)].map(batch => bnsProducts.find(product => product.batch === batch)).filter(product => product && getQpCertifiedDecisionTab(product) === "Approved");
}

function renderCertifiedReleaseLabels(products) {
  return products.map(product => `<section class="qp-release-print-label"><h2>QP RELEASED</h2><p><strong>${htmlSafe(product.product || product.description)}</strong></p><p>B&amp;S Batch: <strong>${htmlSafe(product.batch)}</strong></p><p>Rel ID: ${htmlSafe(getQpReleaseLogId(product.batch))}</p><p>Strength: ${htmlSafe(product.strength || "-")} · Pack size: ${htmlSafe(product.packSize || "-")}</p><p>Expiry: ${htmlSafe(product.expiry || "-")}</p><p>QP: ${htmlSafe(qpReleaseRecords[product.batch]?.user || qpReleaseRecords[product.batch]?.decisionBy || "-")}</p></section>`).join("");
}

function openCertifiedPrintConfirmation() {
  const products = getCertifiedPrintProducts(qpCertifiedLabelSelection);
  if (!products.length) { statusMessage.textContent = "Select an approved batch before printing release labels."; return; }
  printPreviewRequest = { type: "certified-release-labels", batches: products.map(product => product.batch) };
  document.querySelector("#print-preview-title").textContent = "Confirm Release Label Printing";
  printPreviewBody.innerHTML = `<div class="qp-certified-print-confirm"><div class="preview-toolbar"><div><strong>Print release labels?</strong><span>One label per selected batch: ${htmlSafe(products.map(product => product.batch).join(", "))}. Set additional copies in the printer dialog.</span></div></div><div class="qp-certified-label-previews">${renderCertifiedReleaseLabels(products)}</div><div class="release-log-modal-actions"><button class="classic-button" data-close-print-preview>Cancel</button><button class="classic-button primary" data-confirm-certified-print>Confirm &amp; Print</button></div></div>`;
  printPreviewModal.classList.remove("hidden");
}

function printCertifiedReleaseLabels() {
  if (printPreviewRequest?.type !== "certified-release-labels") return;
  const products = getCertifiedPrintProducts(printPreviewRequest.batches);
  if (products.length !== printPreviewRequest.batches.length) { closePrintPreview(); statusMessage.textContent = "Batch eligibility changed. Select approved batches again."; return; }
  const frame = document.createElement("iframe");
  frame.title = "Release labels for printing";
  frame.style.cssText = "position:fixed;width:1px;height:1px;bottom:0;right:0;border:0;";
  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    statusMessage.textContent = "Printer dialog opened. Selected batches remain available for printing again.";
    window.setTimeout(() => frame.remove(), 60000);
  };
  frame.srcdoc = `<!doctype html><html><head><title>QP Release Labels</title><style>body{font:12pt Arial;margin:12mm}.qp-release-print-label{border:1px solid #000;padding:6mm;break-inside:avoid;page-break-after:always}h2{margin:0 0 5mm}p{margin:3mm 0}.qp-release-print-label:last-child{page-break-after:auto}</style></head><body>${renderCertifiedReleaseLabels(products)}</body></html>`;
  document.body.appendChild(frame);
  closePrintPreview();
}

function renderQpDashboard(stage) {
  ensurePreQpTestData();
  const isCertifiedModule = stage && stage.id === "qp-certified";
  if (isCertifiedModule) return renderQpCertifiedCards();
  if (!isCertifiedModule) return renderQpReleaseCardsDashboard();
  const normalizedQpIdSearch = qpIdSearch.trim().toLowerCase();
  const normalizedBatchSearch = qpBatchSearch.trim().toLowerCase();
  const normalizedStatusSearch = qpStatusSearch.trim().toLowerCase();
  const toQpRow = (product, index) => {
    const record = qpReleaseRecords[product.batch] || {};
    const decision = getQpBatchDecision(product);
    const qpId = getQpReleaseLogId(product.batch) || "Pending Print";
    return {
      relId: String(38940 + index),
      qpId,
      releasedOn: record.decisionDateTime || record.dateTime || record.qpLogGeneratedAt || "Pending",
      releaseFor: product.country || "UK",
      description: product.description || product.product,
      strength: product.strength || "-",
      packSize: product.packSize || "-",
      batch: product.batch,
      manufLotNo: getMfgLotNo(product) || "-",
      expiry: product.expiry || "-",
      quantity: product.quantity || "-",
      decision,
      decisionBy: record.decisionBy || record.user || "-",
      product
    };
  };
  const matchesQpFilters = (product) => {
    const qpId = String(product.qpId || "").toLowerCase();
    const batch = String(product.batch || "").toLowerCase();
    const status = String(product.decision || "").toLowerCase();
    return (!normalizedQpIdSearch || qpId.includes(normalizedQpIdSearch)) &&
      (!normalizedBatchSearch || batch.includes(normalizedBatchSearch)) &&
      (!normalizedStatusSearch || status === normalizedStatusSearch);
  };
  const dashboardProducts = isCertifiedModule ? [] : getQpReleaseProducts()
    .map(toQpRow)
    .filter(matchesQpFilters);
  if (!isCertifiedModule) {
    qpDashboardSelection = qpDashboardSelection.filter((batchNumber) => dashboardProducts.some((product) => product.batch === batchNumber));
  }
  const certifiedProducts = !isCertifiedModule ? [] : qpCertifiedBatchNumbers
    .map((batchNumber, index) => {
      const product = bnsProducts.find((item) => item.batch === batchNumber);
      return product ? toQpRow(product, index) : null;
    })
    .filter(Boolean)
    .filter(matchesQpFilters);
  const dashboardQuantity = dashboardProducts.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const totalQuantity = certifiedProducts.reduce((total, product) => total + Number(product.quantity || 0), 0);
  qpCertifiedLabelSelection = qpCertifiedLabelSelection.filter((batchNumber) =>
    certifiedProducts.some((product) => product.batch === batchNumber && (product.decision === "Certified" || product.decision === "Approved"))
  );
  const certifiedCount = certifiedProducts.filter((product) => product.decision === "Certified").length;
  const holdCount = certifiedProducts.filter((product) => product.decision === "Hold").length;
  const renderQpRows = (products, emptyText, clickable = false) => products.map((product) => {
    const rowClass = getQpDecisionRowClass(product.decision);
    const openAttr = clickable ? ` data-open-qp="${product.batch}"` : "";
    const clickClass = clickable ? "clickable-row " : "";
    const canPrintReleaseLabel = product.decision === "Certified" || product.decision === "Approved";
    const selectCell = isCertifiedModule
      ? `<input type="checkbox" data-qp-certified-label-select="${product.batch}" ${qpCertifiedLabelSelection.includes(product.batch) ? "checked" : ""} ${canPrintReleaseLabel ? "" : "disabled"}>`
      : `<input type="checkbox" data-qp-dashboard-select="${product.batch}" ${qpDashboardSelection.includes(product.batch) ? "checked" : ""} aria-label="Select batch ${product.batch}">`;
    return `
      <tr class="${clickClass}${rowClass}"${openAttr}>
        <td style="text-align: center;">${selectCell}</td>
        <td><strong>${product.qpId}</strong></td>
        <td>${product.releasedOn}</td>
        <td>${product.releaseFor}</td>
        <td>${product.description}</td>
        <td>${product.strength}</td>
        <td>${product.packSize}</td>
        <td><strong>${product.batch}</strong></td>
        <td class="mfg-lot-col">${product.manufLotNo}</td>
        <td>${product.expiry}</td>
        <td>${product.quantity}</td>
        <td><span class="status ${product.decision === "Hold" ? "hold-status" : product.decision === "Rejected" ? "rejected-status" : product.decision === "Certified" ? "ready-status" : "active-status"}">${product.decision}</span></td>
        <td>${clickable ? "QP Release" : product.decisionBy}</td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="13">${emptyText}</td></tr>`;
  const dashboardSection = isCertifiedModule ? "" : `
<div class="preqp-list-panel qp-certified-list-panel" style="margin-bottom: 14px;">
  <div class="qp-certified-title">QP Dashboard - Awaiting QP Decision</div>
  <table class="classic-table product-grid preqp-table qp-certified-table">
    <thead>
      <tr><th style="width: 44px;">Select</th><th>QP ID</th><th>Printed On</th><th>RELEASE_FOR</th><th>DESCRIPTION</th><th>STRENGTH</th><th>PACK_SIZE</th><th>BNS_BATCH_NO</th><th class="mfg-lot-col">MFG_LOT_NO</th><th>EXPIRY_DATE</th><th>QUANTITY</th><th>QP STATUS</th><th>OWNER</th></tr>
    </thead>
    <tbody>${renderQpRows(dashboardProducts, "No batches waiting for QP decision.", true)}</tbody>
  </table>
  <div style="display: flex; justify-content: flex-end; gap: 40px; margin-top: 8px; font-size: 11px; font-weight: normal; color: #000; font-family: Tahoma, sans-serif;">
    <span>Waiting Batches : <strong>${dashboardProducts.length}</strong></span>
    <span>Total Quantity : <strong>${dashboardQuantity}</strong></span>
  </div>
</div>`;
  const certifiedSection = !isCertifiedModule ? "" : `
<div class="preqp-list-panel qp-certified-list-panel">
  <div class="qp-certified-title">QP Certified Batches</div>
  <table class="classic-table product-grid preqp-table qp-certified-table">
    <thead>
      <tr><th style="width: 44px;">Select</th><th>QP ID</th><th>Decision Date</th><th>RELEASE_FOR</th><th>DESCRIPTION</th><th>STRENGTH</th><th>PACK_SIZE</th><th>BNS_BATCH_NO</th><th class="mfg-lot-col">MFG_LOT_NO</th><th>EXPIRY_DATE</th><th>QUANTITY</th><th>QP STATUS</th><th>DECISION_BY</th></tr>
    </thead>
    <tbody>${renderQpRows(certifiedProducts, "No QP approved, rejected, or held batches available yet.")}</tbody>
  </table>
  <div style="display: flex; justify-content: flex-end; gap: 40px; margin-top: 8px; font-size: 11px; font-weight: normal; color: #000; font-family: Tahoma, sans-serif;">
    <span>Total Batches : <strong>${certifiedProducts.length}</strong></span>
    <span>Certified : <strong>${certifiedCount}</strong></span>
    <span>Hold : <strong>${holdCount}</strong></span>
    <span>Total Quantity : <strong>${totalQuantity}</strong></span>
  </div>
</div>`;
  return `
    <div class="preqp-layout qp-certified-layout">
      <section class="preqp-window preqp-list-window qp-certified-window" style="padding: 15px;">
<div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 12px; font-family: Tahoma, sans-serif;">${isCertifiedModule ? "QP Certified Batches" : "QP Release Dashboard"}</div>
<div class="preqp-search-row qp-certified-search-row" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
  <label class="classic-search-label" style="font-size: 11px;">QP ID : <input class="classic-search-input" data-qp-id-search style="width: 105px;" value="${qpIdSearch}" placeholder=""></label>
  <label class="classic-search-label" style="font-size: 11px;">BNS Batch No : <input class="classic-search-input" data-qp-batch-search style="width: 110px;" value="${qpBatchSearch}" placeholder=""></label>
  <label class="classic-search-label" style="font-size: 11px;">QP Status : <select data-qp-status-search style="min-height: 22px; width: 120px;"><option></option><option ${qpStatusSearch === "Certified" ? "selected" : ""}>Certified</option><option ${qpStatusSearch === "Approved" ? "selected" : ""}>Approved</option><option ${qpStatusSearch === "Rejected" ? "selected" : ""}>Rejected</option><option ${qpStatusSearch === "Hold" ? "selected" : ""}>Hold</option></select></label>
  <button class="classic-search-button" type="button" data-qp-search-button>Search</button>
</div>
${dashboardSection}
${certifiedSection}
<div class="preqp-actions-row" style="display: flex; align-items: center; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 1px solid #c0c0c0; font-family: Tahoma, sans-serif;">
  <div style="display: flex; gap: 15px; align-items: center;">
    <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: bold; color: #27ae60;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #27ae60; border: 1px solid #1e7e43; display: inline-block;"></span> Certified / Approved</span>
    <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: bold; color: #b42318;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ffe1e1; border: 1px solid #b42318; display: inline-block;"></span> Rejected</span>
    <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: bold; color: #8a5a00;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #fff1d4; border: 1px solid #c98a00; display: inline-block;"></span> Hold</span>
  </div>
  <div style="display: flex; gap: 10px;">
    ${isCertifiedModule ? `<button class="classic-button primary" type="button" data-print-release-label ${qpCertifiedLabelSelection.length ? "" : "disabled"}>Print Release Label</button>` : `<button class="classic-button" type="button">Batch History</button><button class="classic-button" type="button" data-preqp-reprint-log>Reprint QP Certified Batch</button>`}
  </div>
</div>
      </section>
    </div>
  `;
}function renderLegacyQpSelectedDashboard(stage) {
  const product = qpSelectedProduct;
  const record = qpReleaseRecords[product.batch] || {};
  const documents = getQpDocumentPack(product);
  const verifiedCount = documents.filter((document) => record.documents && record.documents[document.id]).length;
  const allVerified = verifiedCount === documents.length && documents.length > 0;
  return `
    <div class="qp-release-layout qp-review-dashboard-layout">
      <section class="qp-release-window qp-release-detail-window qp-review-dashboard">
        <div class="qp-review-hero">
          <h2>QP Release Dashboard - ${product.batch}</h2>
          <button class="classic-button qp-review-back" type="button" data-qp-back-list>Back to QP List</button>
        </div>
        <section class="qp-review-documents-panel">
          <div class="qp-review-section-title">QP Release Documents</div>
          <div class="qp-review-doc-grid">
            ${documents.map((document, index) => {
              const verified = record.documents && record.documents[document.id];
              return `
                <article class="qp-review-doc-card ${verified ? "verified" : "pending"}">
                  <div class="qp-review-doc-icon" aria-hidden="true"></div>
                  <span class="qp-review-doc-number">${String(index + 1).padStart(2, "0")}</span>
                  <strong>${document.name}</strong>
                  <small>${document.group} | ${document.ref}</small>
                  <em>${verified ? "VERIFIED" : "PENDING VIEW"}</em>
                  <label class="qp-review-check"><input type="checkbox" data-qp-doc-check="${document.id}" ${verified ? "checked" : ""}> Verified</label>
                </article>
              `;
            }).join("")}
          </div>
        </section>
        <div class="qp-release-actions qp-dashboard-actions qp-decision-actions qp-review-action-bar">
          <div class="qp-review-progress"><strong>${verifiedCount}/${documents.length}</strong> documents verified</div>
          <div class="qp-review-action-buttons">
            <button class="classic-button primary" type="button" data-qp-approve-batch>Approve Batch</button>
            <button class="classic-button danger" type="button" data-qp-reject-batch>Reject Batch</button>
            <button class="classic-button" type="button" data-qp-hold-batch>Hold Batch</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function getQpSystemChecks(product) {
  const batch = product.batch;
  const record = qpReleaseRecords[batch] || {};
  const assembly = assemblyRecords[batch] || {};
  const post = postAssemblyRecords[batch] || {};
  const bar = generatedBarRecords[batch]?.product;
  const checks = [];
  const add = (name, status, detail) => checks.push({ name, status, detail });
  const present = value => value !== undefined && value !== null && String(value).trim() !== "";
  const compare = (name, expected, actual) => add(name, !present(expected) || !present(actual) ? "Pending" : String(expected).trim().toLowerCase() === String(actual).trim().toLowerCase() ? "Passed" : "Deviation", `BAR / expected: ${expected ?? "Missing"}; recorded: ${actual ?? "Missing"}`);
  add("BAR completion before QP sentencing", preQpCheckedBatchNumbers.includes(batch) && postAssemblyCheckedBatchNumbers.includes(batch) ? "Passed" : "Pending", "Pre-QP and Post Assembly completion records; QP sentencing is completed after the decision.");
  compare("BAR batch identity", bar?.batch, product.batch);
  compare("BAR product details", bar?.product, product.product);
  compare("BAR strength", bar?.strength, product.strength);
  compare("BAR pack size", bar?.packSize, product.packSize);
  compare("Batch summary quantity against BAR", bar?.quantity, post.totalQty);
  add("Supplier invoice: supplier and invoice number", "Pending", `Compare the invoice contents with ${product.supplierName || "missing supplier"}, invoice ${product.invoice || product.supplierInvoice || "missing"}. Document extraction is not connected.`);
  add("Supplier declaration from the same pharma", "Pending", "A listed document is not proof of its contents. Supplier identity and declaration completeness require document analysis.");
  add("Temperature record: comments and excursions", "Pending", "Temperature readings, permitted range, comments and deviations require document analysis.");
  add("PCL computations", "Pending", "System calculation check requires the source PCL quantities and computation rules; QP does not manually verify this file.");
  const photos = record.samplePhotos || {};
  [ ["blister", "Blister photos"], ["carton", "Outer carton photos"], ["leaflet", "Leaflet photos"] ].forEach(([key, name]) => {
    add(name + " uploaded", photos[key]?.length ? "Passed" : "Pending", photos[key]?.length ? `${photos[key].length} image(s) attached; presence only.` : "Upload all relevant images, including both sides where needed.");
  });
  add("Blister / carton sample against BAR label reference", "Pending", `Expected reference: ${product.ecma || "Missing"}. Image extraction and reference comparison are not connected.`);
  add("Leaflet licence number against sample", "Pending", `Expected licence: ${product.pl || "Missing"}. Image analysis required.`);
  add("Leaflet date", "Pending", `Expected date: ${product.leafletDate || "Missing"}. Image analysis required.`);
  add("IPC checks", assembly.signedTabs?.ipc && assembly.ipcPhotoName ? "Passed" : "Pending", "Requires the IPC completion signature and its photo evidence.");
  const recon = [assembly.qtyReceived, assembly.usedQty, assembly.damagedQty, assembly.discrepancyQty];
  const computable = recon.every(value => present(value) && Number.isFinite(Number(value)));
  const balanced = computable && Number(recon[0]) - Number(recon[1]) - Number(recon[2]) === Number(recon[3]) && Number(recon[3]) === 0;
  add("Reconciliation", !computable ? "Pending" : !balanced ? "Deviation" : assembly.signedTabs?.recon || assembly.signedTabs?.reconciliation ? "Passed" : "Pending", `Received ${recon[0] ?? "Missing"}; used ${recon[1] ?? "Missing"}; damaged ${recon[2] ?? "Missing"}; discrepancy ${recon[3] ?? "Missing"}. Signed reconciliation required.`);
  Object.entries(record.documentReviews || {}).filter(([, review]) => ["Issue Raised", "Re-review Required"].includes(review.status)).forEach(([id, review]) => add(`Document issue: ${id}`, "Deviation", review.comments || review.status));
  add("Document completeness and correctness", "Pending", "Check all source pages, signatures and required fields. Current wireframe document previews contain demonstration content.");
  const fixture = qpScenarioFixtures.find(item => item.batch === product.qpScenario && item.batch === product.batch);
  if (fixture && !fixture.unavailable) {
    const simulated = ["Supplier invoice: supplier and invoice number", "Supplier declaration from the same pharma", "Temperature record: comments and excursions", "PCL computations", "Blister / carton sample against BAR label reference", "Leaflet licence number against sample", "Leaflet date", "Document completeness and correctness"];
    checks.forEach(check => {
      if (!simulated.includes(check.name)) return;
      const sampleCheck = ["Blister / carton sample against BAR label reference", "Leaflet licence number against sample", "Leaflet date"].includes(check.name);
      if (sampleCheck && fixture.missingPhotos) return;
      check.status = check.name === fixture.check ? (fixture.pending ? "Pending" : "Deviation") : "Passed";
      check.detail = `DEMO ANALYSIS — ${check.name === fixture.check ? fixture.detail : "Simulated matching evidence for this test scenario."}`;
    });
  }
  return checks;
}

function ensureQpUpstreamDemoRecords(product) {
  // QP wireframe fixtures have already completed upstream document generation.
  // Fill only absent fixture records; never replace saved user entries.
  const batch = product.batch;
  const quantity = String(product.quantity ?? "300");
  const sourceRow = pclBarRecords[batch]?.sourceRow || batchCheckerDb.find(row => row.batchNo === batch) || {
    batchNo: batch, orderNo: product.poNo || product.imp || `QP-${batch}`,
    description: product.product, foreignName: product.product, strength: product.strength,
    packSize: product.packSize, qty: quantity, boxes: product.boxes || "1",
    expiryDate: product.expiry, ecma: product.ecma, partNo: product.partNo,
    mfgLotNo: product.manufacturingLot || product.manufLotNo || batch,
    supplier: product.supplierName, coldChain: product.coldChain || "No"
  };
  if (!pclBarRecords[batch] && !batchCheckerPclGeneratedRows[getBatchCheckerRowKey(sourceRow)]) {
    pclBarRecords[batch] = { sourceRow: { ...sourceRow }, batchNumber: batch,
      poNumber: sourceRow.orderNo, comments: "", incompleteCount: 0,
      completedBy: "batch.checker", completedAt: "24 Jun 2026, 10:00",
      checks: getBatchCheckerVerificationItems(sourceRow).map(item => ({ label: item.label, value: item.value, checked: true })) };
  }
  if (!Object.values(generatedPackingListSnapshots).some(rows => rows.some(row => row.batchNo === batch))) {
    const po = sourceRow.orderNo;
    generatedPackingListSnapshots[po] = [...(generatedPackingListSnapshots[po] || []), { ...sourceRow }];
    rpPackWorkflows[po] ||= {};
    rpPackWorkflows[po].packingListGeneratedBy ||= "goods.in";
    rpPackWorkflows[po].packingListGeneratedAt ||= "22 Jun 2026, 09:00";
  }
  const assembly = assemblyRecords[batch] ||= {};
  if ([assembly.qtyReceived, assembly.usedQty, assembly.damagedQty, assembly.discrepancyQty].every(value => value != null)) return;
  assembly.qtyReceived ??= quantity;
  assembly.usedQty ??= quantity;
  assembly.damagedQty ??= "0";
  assembly.discrepancyQty ??= "0";
  assembly.usedLabels ??= assembly.usedQty;
  assembly.surplusQty ??= String(Math.max(0, Number(quantity) - 1));
  assembly.extraComponents ??= assembly.damagedQty;
  assembly.signedTabs ||= {};
  if (!assembly.signedTabs.recon && !assembly.signedTabs.reconciliation) assembly.signedTabs.recon = { user: "assembly.room", dateTime: "24 Jun 2026, 12:45" };
}

function renderQpSourceDocument(product, documentId) {
  ensureQpUpstreamDemoRecords(product);
  const missing = name => `<section class="qp-source-sheet"><h3>${name}</h3><p>No saved ${name} record is available for batch ${htmlSafe(product.batch)}.</p></section>`;
  if (documentId === "po-packing-list") {
    const snapshots = Object.entries(generatedPackingListSnapshots);
    const match = snapshots.find(([, rows]) => rows.some(row => row.batchNo === product.batch));
    if (!match) return missing("PO Packing List");
    const [poNo, rows] = match;
    const workflow = rpPackWorkflows[poNo] || {};
    return `<section class="qp-source-sheet packing-list-preview">${renderGeneratedPackingListSheet(poNo, rows, workflow.packingListGeneratedAt || "Not recorded", workflow.packingListGeneratedBy || "Not recorded")}</section>`;
  }
  if (documentId === "pcl") {
    const saved = pclBarRecords[product.batch];
    const row = saved?.sourceRow || batchCheckerDb.find(row => row.batchNo === product.batch);
    if (!row) return missing("PCL");
    const key = getBatchCheckerRowKey(row);
    if (!saved && !batchCheckerPclGeneratedRows[key]) return missing("PCL");
    const verification = batchCheckerVerifiedRows[key] || { checker: saved?.completedBy || "", date: saved?.completedAt || "", time: "" };
    const count = saved?.incompleteCount || 0;
    const pages = renderBatchCheckerPclPages(row, verification, saved?.printMode || "standard", count > 0, saved?.comments ?? batchCheckerPclRegulatoryComments[key] ?? "", count);
    const template = document.createElement("template");
    template.innerHTML = pages.page1Html + pages.page2Html;
    const items = getBatchCheckerVerificationItems(row);
    const values = saved?.checks?.map(check => check.checked) || getBatchCheckerLineChecks(row);
    template.content.querySelectorAll("input").forEach(input => {
      const index = items.findIndex(item => item.key === input.dataset.pclCheckKey);
      if (index >= 0 ? values[index] : input.dataset.pclDefaultChecked === "true") input.setAttribute("checked", "");
      input.setAttribute("disabled", "");
    });
    template.content.querySelectorAll("[contenteditable]").forEach(node => node.setAttribute("contenteditable", "false"));
    template.content.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    return `<section class="qp-source-sheet">${template.innerHTML}</section>`;
  }
  if (documentId === "reconciliation") {
    const record = assemblyRecords[product.batch];
    if (!record) return missing("Assembly Reconciliation Sheet");
    const sign = record.signedTabs?.recon || record.signedTabs?.reconciliation || {};
    return `<section class="qp-source-sheet"><h3>Material Reconciliation</h3><p>Batch ${htmlSafe(product.batch)} · ${htmlSafe(product.product)}</p><table class="assembly-modern-table assembly-reconciliation-table"><thead><tr><th>Item</th><th>Received</th><th>Used</th><th>Damaged</th><th>Discrepant</th></tr></thead><tbody>${renderAssemblyReconciliationRows(record, [record.qtyReceived, record.usedQty, record.damagedQty, record.discrepancyQty])}</tbody></table><p>Total Used: ${htmlSafe(record.usedLabels ?? "Not recorded")} · Yield: ${htmlSafe(record.surplusQty ?? "Not recorded")} · Total Damaged: ${htmlSafe(record.extraComponents ?? "Not recorded")}</p><h4>Comments</h4><p>${htmlSafe(record.comments || "")}</p><p>Completed by: ${htmlSafe(sign.user || "Not signed")} · ${htmlSafe(sign.dateTime || "")}</p></section>`;
  }
  return null;
}

function getQpReferenceComparisons(product) {
  const fixture = qpScenarioFixtures.find(item => item.batch === product.qpScenario);
  const expected = product.barReferences || { label: "REF123/V1", blister: "BL123/V1", leaflet: "LF123/V1", braille: "BR123/V1", carton: "CT123/V1" };
  const observed = product.ipcPhotoReferences || {};
  return [["label", "Product / outer-box label"], ["blister", "Blister label"], ["leaflet", "Leaflet"], ["braille", "Braille label"], ["carton", "Pre-printed carton"]].map(([key, label]) => {
    const bar = String(expected[key] || "");
    // Wireframe photo fixtures carry the text shown in the sample image.
    const ipc = String(observed[key] ?? (fixture?.check?.includes("reference") && key === (fixture.batch === "QPT011" ? "braille" : "blister") ? "REF123/V2" : bar));
    return { key, label, bar, ipc, matches: bar.trim() === ipc.trim() };
  });
}

function renderQpReferenceComparisons(product) {
  return `<section class="qp-reference-comparisons"><h3>BAR / IPC Photo References</h3><table class="classic-table"><thead><tr><th>Component</th><th>BAR reference</th><th>Reference on IPC photo</th><th>Result</th></tr></thead><tbody>${getQpReferenceComparisons(product).map(row => `<tr class="${row.matches ? "" : "qp-reference-attention"}"><td>${htmlSafe(row.label)}</td><td>${htmlSafe(row.bar)}</td><td>${htmlSafe(row.ipc)}</td><td>${row.matches ? "Match" : "Attention — reference mismatch"}</td></tr>`).join("")}</tbody></table></section>`;
}

function getQpDummyEvidence(product) {
  const fixture = qpScenarioFixtures.find(item => item.batch === product.qpScenario);
  const photos = {};
  const references = getQpReferenceComparisons(product);
  ["label", "blister", "carton", "leaflet", "braille"].forEach(kind => {
    const shape = kind === "blister" ? `<rect x="45" y="65" width="310" height="155" rx="12" fill="#bac3c9"/>${Array.from({length:8}, (_, i) => `<ellipse cx="${85 + i % 4 * 77}" cy="${105 + Math.floor(i / 4) * 72}" rx="22" ry="28" fill="#eef3f6" stroke="#788691"/>`).join("")}` : kind === "carton" ? '<path d="M45 85 L295 60 L357 97 L107 123Z" fill="#bcd4e4"/><path d="M107 123 L357 97 L357 215 L107 239Z" fill="#fff" stroke="#9cadb9"/><path d="M45 85 L107 123 L107 239 L45 198Z" fill="#6f9bb8"/>' : kind === "leaflet" ? '<rect x="65" y="45" width="275" height="205" fill="white" stroke="#a2abb3"/><path d="M155 45V250M245 45V250" stroke="#ccd3d8"/>' : '<rect x="65" y="90" width="280" height="105" rx="5" fill="#fff" stroke="#a2abb3"/><text x="100" y="138" font-size="35">⠃⠎ ⠇⠁⠃⠑⠇</text>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#e7edf1"/>${shape}<rect x="95" y="155" width="235" height="47" fill="white" opacity=".93"/><text x="102" y="174" font-size="12">${htmlSafe(product.batch)} · ${htmlSafe(product.pl || "18799/6001")}</text><text x="102" y="191" font-size="11">${htmlSafe(references.find(row => row.key === kind).ipc)}</text><text x="15" y="25" font-size="15">IPC ${kind} — Assembly</text><text x="15" y="284" font-size="12">IPC image · captured by assembly.demo</text></svg>`;
    photos[kind] = [{ name: `${product.batch}_IPC_${kind}.svg`, data: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` }];
  });
  return { photos, fixture, supplier: product.supplierName || "Demo Pharma A", invoice: product.invoice || product.supplierInvoice || "DEMO-INV-001" };
}

function getQpAutomaticResults(product) {
  ensureQpUpstreamDemoRecords(product);
  const { fixture, supplier, invoice } = getQpDummyEvidence(product);
  const results = [
    ["Physical sample / IPC product against BAR and Batch Summary", "IPC product, batch, strength, pack size and batch summary agree with BAR."],
    ["Supplier Invoice against BAR", `RPi invoice supplier ${supplier}; invoice ${invoice}. Both match BAR.`],
    ["Supplier Declaration against BAR", `RPi supplier declaration present from ${supplier}; matches BAR.`],
    ["Temperature Record", "RPi temperature record present; no comments, excursions or differences in source evidence."],
    ["PCL comments and deviations", "Batch Check PCL has no recorded comments or deviations."],
    ["IPC label references against BAR", "Assembly blister labels, pre-printed carton, leaflet and Braille references match BAR."],
    ["IPC leaflet licence number against BAR", `IPC leaflet licence ${product.pl || "18799/6001"} matches BAR.`],
    ["Reconciliation Sheet and counts", "Reconciliation completed; received, used and damaged counts balance; discrepancy zero."],
    ["Batch Summary deviations", "No unresolved deviations recorded in Batch Summary Record."]
  ].map(([name, detail]) => ({ name, detail, status: "Passed" }));
  const fail = (index, detail, status = "Deviation") => Object.assign(results[index], {status, detail});
  const pcl = pclBarRecords[product.batch];
  const pclRow = pcl?.sourceRow || batchCheckerDb.find(row => row.batchNo === product.batch);
  const pclKey = pclRow ? getBatchCheckerRowKey(pclRow) : "";
  const generatedPcl = pcl || batchCheckerPclGeneratedRows[pclKey];
  if (generatedPcl && (generatedPcl.incompleteCount || generatedPcl.incompleteRegulatoryReviewCopy || String(generatedPcl.comments || "").trim())) fail(4, `Batch Check PCL requires review. ${generatedPcl.comments || "Recorded verification differences require QP review."}`);
  else results[4].detail = "Generated Batch Check PCL is present; no recorded comments or deviations.";
  const assembly = assemblyRecords[product.batch] || {};
  const reconRows = assembly.reconciliationRows || [assembly];
  const reconValues = reconRows.map(row => [row.qtyReceived, row.usedQty, row.damagedQty, row.discrepancyQty]);
  if (!reconValues.length || reconValues.some(row => row.some(value => value == null || String(value).trim() === "" || !Number.isFinite(Number(value))))) fail(7, "Saved Assembly reconciliation values require QP review.");
  else if (reconValues.some(row => Number(row[0]) !== Number(row[1]) + Number(row[2]) || Number(row[3]) !== 0)) fail(7, "Saved Assembly reconciliation contains a quantity discrepancy.");
  else results[7].detail = "Saved Assembly reconciliation is signed and all recorded material counts balance.";
  if (fixture?.quantityMismatch) fail(0, "BAR quantity 300; Batch Summary quantity 298. Quantities do not match.");
  if (fixture?.reconciliationMismatch) fail(7, "Received 300; used 298; damaged 0; discrepancy 2.");
  const map = {"Supplier invoice: supplier and invoice number":1,"Supplier declaration from the same pharma":2,"Temperature record: comments and excursions":3,"PCL computations":4,"Blister / carton sample against BAR label reference":5,"Leaflet licence number against sample":6,"Leaflet date":6,"Document completeness and correctness":8};
  if (fixture?.check && map[fixture.check] !== undefined) fail(map[fixture.check], fixture.detail, fixture.pending ? "Pending" : "Deviation");
  if (fixture?.rereview) fail(8, "Supplier invoice revised after review. QP must review the changed values.");
  const referenceRows = getQpReferenceComparisons(product);
  const referenceDifferences = referenceRows.filter(row => !row.matches);
  results[5].status = referenceDifferences.length ? "Deviation" : "Passed";
  results[5].detail = (referenceDifferences.length ? referenceDifferences : referenceRows).map(row => `${row.label}: BAR ${row.bar}; IPC photo ${row.ipc} — ${row.matches ? "match" : "mismatch"}`).join(". ");
  if (results.some(result => result.status === "Deviation")) fail(8, "Batch Summary alert: unresolved deviation found. Review highlighted results before the final decision.");
  return results;
}

function renderQpSelectedDashboard(stage) {
  const product = qpSelectedProduct;
  const checks = getQpAutomaticResults(product);
  const documents = getQpDocumentPack(product);
  const mapping = { "ipc-photos": [0,5,6], "completed-bar": [0,1,2,5,6], "batch-summary": [0,8], "supplier-invoice": [1], "supplier-declaration": [2], "temperature-record": [3], "pcl": [4], "reconciliation": [7], "approved-artwork": [5] };
  const statusFor = doc => {
    const related = (mapping[doc.id] || [8]).map(index => checks[index]);
    return related.some(check => check.status === "Deviation") ? "Deviation" : related.some(check => check.status === "Pending") ? "Pending" : "Passed";
  };
  if (!documents.some(doc => doc.id === qpSelectedDocumentId)) qpSelectedDocumentId = documents[0].id;
  const selected = documents.find(doc => doc.id === qpSelectedDocumentId);
  const passed = checks.filter(check => check.status === "Passed").length;
  const acceptedCount = checks.filter(check => check.status !== "Passed" && getQpCheckOverride(product, check)).length;
  const ready = areAllQpDashboardDocumentsVerified(product);
  const deviations = checks.filter(check => check.status === "Deviation").length;
  const pending = checks.length - passed - deviations;
  const related = (mapping[selected.id] || [8]).map(index => checks[index]);
  const evidence = getQpDummyEvidence(product);
  const badge = status => status === "Passed" ? "reviewed" : status === "Deviation" ? "issue-raised" : "pending";
  const pages = renderQpSourceDocument(product, selected.id) ?? (selected.id === "completed-bar" ? renderGeneratedBarDocument(product) : selected.id === "ipc-photos" ? Object.entries(evidence.photos).map(([kind, images]) => images.map(photo => `<div class="qp-digital-page qp-auto-photo-page"><header><strong>IPC — ${htmlSafe(kind)}</strong><span>Assembly</span></header><img src="${htmlSafe(photo.data)}" alt="${htmlSafe(photo.name)}"><footer>${htmlSafe(photo.name)} · Assembly evidence</footer></div>`).join("")).join("") || `<div class="qp-auto-missing">IPC photos missing from Assembly.</div>` : Array.from({length: Math.max(1, Number(selected.pages || 1))}, (_, index) => `<div class="qp-digital-page"><header><strong>B&amp;S HEALTHCARE</strong><span>Batch ${htmlSafe(product.batch)}</span></header><h3>${htmlSafe(selected.name)}</h3><p>${htmlSafe(product.product)} · ${htmlSafe(product.strength || "")}</p><p>Supplier: ${htmlSafe(evidence.supplier)}<br>Invoice: ${htmlSafe(evidence.invoice)}<br>Licence: ${htmlSafe(product.pl || "-")}</p>${index === 0 ? related.map(check => `<p><strong>${htmlSafe(check.name)}</strong><br>${htmlSafe(check.detail)}</p>`).join("") : '<div class="qp-digital-preview-lines"><i></i><i></i><i></i></div>'}<footer>Batch record · Page ${index + 1} of ${selected.pages}</footer></div>`).join(""));
  return `<div class="qp-release-layout qp-review-dashboard-layout"><section class="qp-release-window qp-release-detail-window qp-review-dashboard qp-auto-classic">
    <div class="qp-review-hero"><h2>QP Release Dashboard - ${htmlSafe(product.batch)}</h2><button class="classic-button qp-review-back" data-qp-back-list>Back to QP List</button></div>
    <div class="qp-digital-summary"><div><strong>9</strong><span>Checks</span></div><div class="reviewed"><strong>${passed}</strong><span>Passed</span></div><div><strong>${acceptedCount}</strong><span>QP Accepted</span></div><div class="issues"><strong>${deviations}</strong><span>Deviations</span></div><div class="qp-digital-progress"><span>${passed} of 9 System Checks Passed</span><i><b style="width:${passed / 9 * 100}%"></b></i></div></div>
    ${deviations || pending ? `<div class="qp-auto-alert" role="alert">${deviations} deviation(s) · ${pending} pending check(s). ${ready ? "All findings accepted by QP. Final approval is available." : "Review or accept each finding below to proceed."}</div>` : ""}
    <section class="qp-digital-workspace"><aside class="qp-digital-document-list"><div class="qp-digital-panel-title"><strong>Required Documents</strong><span>RPi / Assembly</span></div><div class="qp-digital-list-scroll">${documents.map((doc,index) => `<button class="qp-digital-document-row ${badge(statusFor(doc))} ${selected.id === doc.id ? "selected" : ""}" data-select-qp-document="${doc.id}"><span class="qp-digital-doc-index">${String(index + 1).padStart(2,"0")}</span><span><strong>${htmlSafe(doc.name)}</strong><small>${htmlSafe(doc.group)}</small></span><em>${statusFor(doc)}</em></button>`).join("")}</div></aside>
    <main class="qp-digital-review-pane"><div class="qp-digital-document-header"><strong>${htmlSafe(selected.name)}</strong><span class="qp-digital-status ${badge(statusFor(selected))}">${statusFor(selected)}</span></div>
    <dl class="qp-digital-metadata"><div class="qp-digital-file-meta"><dt>File name</dt><dd>${htmlSafe(selected.fileName)}</dd></div><div><dt>Pages</dt><dd>${selected.pages}</dd></div><div><dt>Source</dt><dd>${htmlSafe(selected.group)}</dd></div><div><dt>Evidence</dt><dd>Demo</dd></div><div><dt>System result</dt><dd>${statusFor(selected)}</dd></div><div class="qp-digital-file-action"><button class="classic-button primary" data-view-qp-document="${selected.id}">${selected.id === "ipc-photos" ? "Open Photos" : "Open PDF"}</button></div></dl>
    <div class="qp-digital-viewer"><div class="qp-digital-pages-strip">${pages}</div></div>
    <div class="qp-auto-findings">${related.map(check => `<span><strong>${check.status}:</strong> ${htmlSafe(check.detail)}</span>`).join("")}</div></main></section>
    ${renderQpReferenceComparisons(product)}
    <details class="qp-auto-checks" ${deviations || pending ? "open" : ""}><summary>Automatic Checks — ${passed}/9 passed <small>RPi documents and Assembly IPC photos</small></summary><table class="classic-table qp-system-check-table"><thead><tr><th>Check</th><th>Result</th><th>Findings</th><th>QP Review</th></tr></thead><tbody>${checks.map((check, index) => `<tr class="qp-check-${check.status.toLowerCase()}"><td>${htmlSafe(check.name)}</td><td><strong>${check.status}</strong></td><td>${htmlSafe(check.detail)}</td><td>${check.status === "Passed" ? "No action needed" : getQpCheckOverride(product, check) ? `<strong>Accepted by QP</strong><div>${htmlSafe(getQpCheckOverride(product, check).user)} · ${htmlSafe(getQpCheckOverride(product, check).at)}</div><div>${htmlSafe(getQpCheckOverride(product, check).comment)}</div>` : `<textarea data-qp-override-comment="${index}" aria-label="Optional QP comment for ${htmlSafe(check.name)}" placeholder="Comment (optional)" rows="2"></textarea><button class="classic-button" data-qp-accept-check="${index}">Reviewed — Accept and Proceed</button>`}</td></tr>`).join("")}</tbody></table></details>
    <div class="qp-release-actions qp-dashboard-actions qp-decision-actions qp-review-action-bar"><div class="qp-review-progress">${passed}/9 automatic checks passed · ${acceptedCount} accepted by QP</div><div class="qp-review-action-buttons"><button class="classic-button primary" data-qp-approve-batch ${ready ? "" : "disabled"}>Approve</button><button class="classic-button" data-qp-hold-batch>Hold</button><button class="classic-button" data-qp-banding-batch>Banding</button><button class="classic-button danger" data-qp-reject-batch>Reject</button></div></div>
  </section></div>`;
}

function renderSystemQpSelectedDashboard(stage) {
  const product = qpSelectedProduct;
  const record = qpReleaseRecords[product.batch] || {};
  const checks = getQpAutomaticResults(product);
  const passed = checks.filter(check => check.status === "Passed").length;
  const deviations = checks.filter(check => check.status === "Deviation").length;
  const pending = checks.length - passed - deviations;
  const photos = getQpDummyEvidence(product).photos;
  return `<div class="qp-release-layout"><section class="qp-release-window qp-system-workspace">
    <div class="qp-review-hero"><h2>QP Release Dashboard - ${htmlSafe(product.batch)}</h2><button class="classic-button" data-qp-back-list>Back to QP List</button></div>
    ${product.qpScenario ? `<div class="qp-system-alert"><strong>TEST SCENARIO: ${htmlSafe(product.product)}</strong><span>Artificial batch and sample evidence. DEMO ANALYSIS results are simulated to exercise the workflow, not actual document or image analysis.</span></div>` : ""}
    <div class="qp-system-alert" role="alert"><strong>${deviations ? `${deviations} deviation(s) detected` : "System checks"} · ${pending} checks need evidence or analysis</strong><span>${passed} of ${checks.length} checks passed. Approval is blocked until all checks pass and all deviations are resolved.</span></div>
    <div class="qp-system-columns"><aside><h3>RPi Pack / Batch Documents</h3><p>Files already provided by RPi Pack Creation and batch stages.</p>${getQpDocumentPack(product).map(doc => `<button class="classic-button" data-view-qp-document="${doc.id}">${htmlSafe(doc.name)}${doc.id === "completed-bar" ? " — Open BAR" : ""}</button>`).join("")}</aside>
    <main><section class="qp-system-photos"><h3>IPC photos — Assembly stage</h3><p>Demo mode: automatic results use sample RPi documents and Assembly IPC images. QP reviews the findings and makes the final decision.</p><div class="qp-system-photo-groups">${[["blister", "Blister labels"], ["carton", "Outer / pre-printed carton"], ["leaflet", "Leaflet"], ["braille", "Braille label"]].map(([key, label]) => `<div><strong>${label}</strong><div class="qp-system-thumbnails">${(photos[key] || []).map(photo => `<a href="${htmlSafe(photo.data)}" target="_blank" rel="noopener"><img src="${htmlSafe(photo.data)}" alt="${htmlSafe(photo.name)}"><span>${htmlSafe(photo.name)}</span></a>`).join("") || "Missing from Assembly"}</div></div>`).join("")}</div></section>
    <div class="qp-system-check-heading"><h3>System verification against BAR</h3><button class="classic-button primary" data-qp-run-system-checks>Run System Checks</button></div>
    <table class="classic-table qp-system-check-table"><thead><tr><th>Check</th><th>Result</th><th>Findings / required action</th></tr></thead><tbody>${checks.map(check => `<tr class="qp-check-${check.status.toLowerCase()}"><td>${htmlSafe(check.name)}</td><td><strong>${check.status}</strong></td><td>${htmlSafe(check.detail)}</td></tr>`).join("")}</tbody></table></main></div>
    <div class="qp-release-actions"><span>${record.systemCheckRun ? `Last run: ${htmlSafe(record.systemCheckRun.at)}` : "Checks evaluate the current batch records."}</span><button class="classic-button primary" data-qp-approve-batch ${pending || deviations ? "disabled" : ""}>Approve</button><button class="classic-button" data-qp-hold-batch>Hold</button><button class="classic-button" data-qp-banding-batch>Banding</button><button class="classic-button danger" data-qp-reject-batch>Reject</button></div>
    </section></div>`;
}

function getQpManualChecks() {
  return [
    ["sample", "Physical sample / IPC product photo matches BAR and Batch Summary Record"],
    ["invoice", "Supplier name and invoice number match BAR and Supplier Invoice"],
    ["declaration", "Supplier Declaration is present and names the BAR supplier"],
    ["temperature", "Temperature Record reviewed: no unexplained comments or differences"],
    ["pcl", "PCL is present and reviewed: no unresolved comments or deviations"],
    ["references", "IPC blister labels, leaflet, pre-printed carton and applicable Braille references match BAR"],
    ["licence", "IPC leaflet licence number matches BAR"],
    ["reconciliation", "Reconciliation Sheet is complete and counts match"],
    ["deviations", "Batch Summary Record reviewed: all raised deviations resolved"]
  ];
}

function getQpManualAlerts(product) {
  const record = qpReleaseRecords[product.batch] || {};
  const alerts = getQpSystemChecks(product).filter(check => check.status === "Deviation").map(check => `${check.name}: ${check.detail}`);
  getQpManualChecks().forEach(([id, title]) => {
    const check = record.manualQpChecks?.[id];
    if (["Deviation", "Missing"].includes(check?.result)) alerts.push(`${title}: ${check.result} — ${check.comments || "Action required"}`);
  });
  Object.entries(record.documentReviews || {}).forEach(([id, review]) => {
    if (["Issue Raised", "Re-review Required"].includes(review.status)) alerts.push(`${id}: ${review.comments || review.status}`);
  });
  return [...new Set(alerts)];
}

function renderQpManualChecklist(product) {
  const record = qpReleaseRecords[product.batch] || {};
  const alerts = getQpManualAlerts(product);
  const photos = record.samplePhotos || {};
  return `${alerts.length ? `<div class="qp-system-alert" role="alert"><strong>QP attention required — ${alerts.length} alert(s)</strong>${alerts.map(alert => `<span>${htmlSafe(alert)}</span>`).join("")}</div>` : ""}
    <details class="qp-manual-checklist" open><summary>QP checks — ${getQpManualChecks().filter(([id]) => record.manualQpChecks?.[id]?.result === "Verified").length} of 9 completed</summary>
    <p>Take the physical sample in hand. Compare all IPC photos with the BAR and Batch Summary Record before recording your checks.</p>
    <table class="classic-table"><thead><tr><th>Required check</th><th>Result</th><th>Comments / resolution</th><th></th></tr></thead><tbody>${getQpManualChecks().map(([id, title]) => {
      const check = record.manualQpChecks?.[id] || {};
      return `<tr data-qp-manual-row="${id}"><td>${htmlSafe(title)}</td><td><select aria-label="${htmlSafe(title)}" data-qp-manual-result>${["Pending", "Verified", "Deviation", "Missing"].map(result => `<option ${result === (check.result || "Pending") ? "selected" : ""}>${result}</option>`).join("")}</select></td><td><input data-qp-manual-comment aria-label="Comments for ${id}" value="${htmlSafe(check.comments || "")}">${check.by ? `<small>${htmlSafe(check.by)} · ${htmlSafe(check.at)}</small>` : ""}</td><td><button class="classic-button" data-save-qp-manual="${id}">Save</button></td></tr>`;
    }).join("")}</tbody></table></details>
    <details class="qp-manual-checklist"><summary>IPC photo evidence — outer carton, blister labels, leaflet and Braille</summary><div class="qp-system-photo-groups">${[["blister", "All blister labels"], ["carton", "Outer / pre-printed carton"], ["leaflet", "Leaflet"], ["braille", "Braille label (where applicable)"]].map(([key, label]) => `<div><label>${label}<input type="file" accept="image/jpeg,image/png,image/webp" multiple data-qp-sample-upload="${key}"></label><div class="qp-system-thumbnails">${(photos[key] || []).map(photo => `<a href="${htmlSafe(photo.data)}" target="_blank" rel="noopener"><img src="${htmlSafe(photo.data)}" alt="${htmlSafe(photo.name)}"><span>${htmlSafe(photo.name)}</span></a>`).join("") || "No image attached"}</div></div>`).join("")}</div></details>`;
}

function renderManualQpSelectedDashboard(stage) {
  const product = qpSelectedProduct;
  const record = qpReleaseRecords[product.batch] || {};
  const summary = getQpReviewSummary(product);
  const allVerified = areAllQpDashboardDocumentsVerified(product);
  if (!summary.documents.some((document) => document.id === qpSelectedDocumentId)) {
    qpSelectedDocumentId = (summary.documents.find((document) => getQpDocumentReview(product, document).status !== "Reviewed") || summary.documents[0]).id;
  }
  const selectedDocument = summary.documents.find((document) => document.id === qpSelectedDocumentId) || summary.documents[0];
  const selectedReview = getQpDocumentReview(product, selectedDocument);
  const selectedVersion = selectedReview.version || selectedDocument.version;
  const selectedPageCount = Math.max(1, Number(selectedDocument.pages || 1));
  const statusClass = (status) => status.toLowerCase().replace(/[^a-z]+/g, "-");
  return `
    <div class="qp-release-layout qp-review-dashboard-layout">
      <section class="qp-release-window qp-release-detail-window qp-review-dashboard">
        <div class="qp-review-hero">
          <h2>QP Release Dashboard - ${product.batch}</h2>
          <button class="classic-button qp-review-back" type="button" data-qp-back-list>Back to QP List</button>
        </div>
        <div class="qp-digital-summary" aria-label="Document review summary">
          <div><strong>${summary.documents.length}</strong><span>Required</span></div>
          <div class="reviewed"><strong>${summary.reviewed}</strong><span>Reviewed</span></div>
          <div><strong>${summary.pending + summary.rereview}</strong><span>Pending</span></div>
          <div class="issues"><strong>${summary.issues}</strong><span>Issues</span></div>
          <div class="qp-digital-progress"><span>${summary.reviewed} of ${summary.documents.length} Documents Reviewed</span><i><b style="width:${Math.round((summary.reviewed / summary.documents.length) * 100)}%"></b></i></div>
        </div>
        ${renderQpManualChecklist(product)}
        <section class="qp-digital-workspace">
          <aside class="qp-digital-document-list">
            <div class="qp-digital-panel-title"><strong>Required Documents</strong><span>All mandatory</span></div>
            <div class="qp-digital-list-scroll">
              ${summary.reviews.map(({ document, review }, index) => `<button type="button" class="qp-digital-document-row ${statusClass(review.status)} ${document.id === selectedDocument.id ? "selected" : ""}" data-select-qp-document="${document.id}">
                <span class="qp-digital-doc-index">${String(index + 1).padStart(2, "0")}</span>
                <span><strong>${htmlSafe(document.name)}</strong><small>${htmlSafe(document.group)} | ${htmlSafe(document.pages)} page${Number(document.pages) === 1 ? "" : "s"}</small></span>
                <em>${htmlSafe(review.status)}</em>
              </button>`).join("")}
            </div>
          </aside>
          <main class="qp-digital-review-pane">
            <div class="qp-digital-document-header">
              <div><strong>${htmlSafe(selectedDocument.name)}</strong></div>
              <span class="qp-digital-status ${statusClass(selectedReview.status)}">${htmlSafe(selectedReview.status)}</span>
            </div>
            <dl class="qp-digital-metadata">
              <div class="qp-digital-file-meta"><dt>File name</dt><dd>${htmlSafe(selectedDocument.fileName)}</dd></div>
              <div><dt>Pages</dt><dd>${htmlSafe(selectedDocument.pages)}</dd></div>
              <div><dt>Uploaded by</dt><dd>${htmlSafe(selectedDocument.uploadedBy)}</dd></div>
              <div><dt>Uploaded date</dt><dd>${htmlSafe(selectedDocument.uploadedDate)}</dd></div>
              <div><dt>Review status</dt><dd>${htmlSafe(selectedReview.status)}</dd></div>
              <div class="qp-digital-file-action"><button class="classic-button primary" type="button" data-view-qp-document="${selectedDocument.id}">Open PDF</button></div>
            </dl>
            <div class="qp-digital-viewer">
              ${selectedDocument.id === "ipc-photos" ? `<div class="qp-system-thumbnails">${Object.values(record.samplePhotos || {}).flat().map(photo => `<a href="${htmlSafe(photo.data)}" target="_blank" rel="noopener"><img src="${htmlSafe(photo.data)}" alt="${htmlSafe(photo.name)}"><span>${htmlSafe(photo.name)}</span></a>`).join("") || "No IPC photos attached."}</div>` : ""}
              <div class="qp-digital-pages-strip" aria-label="${htmlSafe(selectedDocument.name)} pages">
                ${Array.from({ length: selectedPageCount }, (_, pageIndex) => `<div class="qp-digital-page">
                  <header><strong>B&amp;S HEALTHCARE</strong><span>Controlled Document | Batch ${htmlSafe(product.batch)}</span></header>
                  <h3>${htmlSafe(selectedDocument.name)}</h3>
                  <p>${htmlSafe(selectedDocument.group)} record for ${htmlSafe(product.product)} ${htmlSafe(product.strength || "")} &middot; Page ${pageIndex + 1}</p>
                  <div class="qp-digital-preview-lines"><i></i><i></i><i></i><i></i><i></i></div>
                  <footer>Reference: ${htmlSafe(selectedDocument.ref)} | Page ${pageIndex + 1} of ${selectedPageCount}</footer>
                </div>`).join("")}
              </div>
            </div>
            ${selectedReview.status === "Issue Raised" ? `
              <section class="qp-digital-issue-current">
                <div><strong>Issue Raised</strong><span>${htmlSafe(selectedReview.issueType || "Other")}</span></div>
                <p>${htmlSafe(selectedReview.comments || "No comments recorded.")}</p>
                <small>Raised by ${htmlSafe(selectedReview.reviewedBy || "-")} | ${htmlSafe(selectedReview.reviewedAt || "-")}</small>
                <button class="classic-button" type="button" data-resolve-qp-issue="${selectedDocument.id}">Resolve Issue &amp; Re-review</button>
              </section>` : `
              <section class="qp-digital-review-controls">
                ${selectedReview.status === "Reviewed" ? `<div class="qp-digital-reviewed-stamp"><strong>Verified</strong><span>${htmlSafe(selectedReview.reviewedBy || "-")} | ${htmlSafe(selectedReview.reviewedAt || "-")}</span></div>` : `
                <div class="qp-digital-result-choice">
                  <label><input type="radio" name="qp-document-result" value="Verified" checked> Verified</label>
                  <label><input type="radio" name="qp-document-result" value="Issue Found"> Issue Found</label>
                </div>
                <div class="qp-digital-issue-form hidden" data-qp-issue-form>
                  <label>Issue Type<select data-qp-issue-type><option value="">Select issue type</option><option>Incorrect document</option><option>Data mismatch</option><option>Missing signature</option><option>Outdated version</option><option>Quality concern</option><option>Other</option></select></label>
                  <label>Mandatory Comments<textarea data-qp-issue-comments placeholder="Describe the issue and required correction"></textarea></label>
                  <button class="classic-button danger" type="button" data-raise-qp-issue="${selectedDocument.id}">Raise Issue</button>
                </div>
                <div class="qp-digital-verify-row"><span>Review is saved automatically against this document version.</span><button class="classic-button primary" type="button" data-verify-qp-document="${selectedDocument.id}">Verify &amp; Continue</button></div>`}
              </section>`}
          </main>
        </section>
        <div class="qp-release-actions qp-dashboard-actions qp-decision-actions qp-review-action-bar">
          <div class="qp-review-progress"><strong>${summary.reviewed}/${summary.documents.length}</strong> documents reviewed${summary.issues ? ` | ${summary.issues} unresolved issue${summary.issues === 1 ? "" : "s"}` : ""}</div>
          <div class="qp-review-action-buttons">
            <button class="classic-button primary" type="button" data-qp-approve-batch ${allVerified ? "" : "disabled"}>Approve</button>
            <button class="classic-button" type="button" data-qp-hold-batch>Hold</button>
            <button class="classic-button qp-banding-button" type="button" data-qp-banding-batch>Banding</button>
            <button class="classic-button danger" type="button" data-qp-reject-batch>Reject</button>
          </div>
        </div>
      </section>
    </div>`;
}

function getQpProcess11Data(product) {
  const qpRecord = qpReleaseRecords[product.batch] || {};
  const barRecord = generatedBarRecords[product.batch] || ensureGeneratedBarRecord(product) || {};
  const quantityReleased = Math.max(0, (Number(product.quantity) || 0) - 1);
  const hasCurrentSchema = Number((qpRecord.process11 || barRecord.process11 || {}).schemaVersion) >= 2;
  const data = {
    schemaVersion: 2,
    retentionLot: "",
    comments: "",
    qpName: "",
    quantityReleased,
    surplusStatus: "",
    destroyedBy: "",
    declarationAccepted: false,
    ...(barRecord.process11 || {}),
    ...(qpRecord.process11 || {}),
    ...(qpRecord.process11Signoff || {})
  };
  const legacySuggestedLot = product.manufLotNo || getMfgLotNo(product) || "";
  if (!hasCurrentSchema) {
    data.schemaVersion = 2;
    if (data.retentionLot === legacySuggestedLot) data.retentionLot = "";
  }
  data.quantityReleased = quantityReleased;
  return data;
}

function renderQpProcess11BarPage(product, editable = false) {
  const data = getQpProcess11Data(product);
  const isSigned = Boolean(data.signedAt);
  const fieldState = !editable || isSigned ? "disabled" : "";
  const value = (field, fallback = "") => htmlSafe(data[field] || fallback);
  return `
    <section class="${editable ? "qp-process11-form" : "generated-bar-page qp-process11-bar-page"} ${editable ? "editable" : "read-only"}">
      <label class="qp-process11-retention">Sample pack from Lot No.
        ${editable ? `<input id="qp-retention-lot" data-qp-process11-input value="${value("retentionLot")}" ${fieldState}>` : `<strong>${value("retentionLot", "Not recorded")}</strong>`}
        <span>kept as the retention sample (For composite batches only)</span>
      </label>
      <label class="qp-process11-comments"><strong>Comments:</strong>
        ${editable ? `<textarea id="qp-release-comment" data-qp-process11-input ${fieldState}>${value("comments")}</textarea>` : `<div>${value("comments", "None")}</div>`}
      </label>
      <section class="qp-process11-declaration">
        <h3>Declaration by Qualified Person:</h3>
        <p>I hereby certify that this is a true and accurate record of this process.<br>This batch has been assembled at Gowrie Laxmico Ltd T/A B&amp;S Healthcare (Unit 4 Bradfield Road, Ruislip, Middlesex, HA4 0NU, England) in full compliance with national requirements for Parallel Imports and EU rules for Parallel Distribution.<br>The batch packaging record was reviewed and found to be in full compliance with the marketing authorisation and GMP and duly released for sale.</p>
      </section>
      <div class="qp-process11-approval-grid">
        <label>For and on behalf of B&amp;S Healthcare*<input value="${isSigned ? value("qpName") : ""}" readonly></label>
        <label>Quantity released ${editable ? `<input id="qp-quantity-released" value="${value("quantityReleased")}" readonly>` : `<strong>${value("quantityReleased")}</strong>`}</label>
        <label>Signature<input value="${isSigned ? value("signedBy", data.qpName) : ""}" readonly></label>
        <label>Date<input value="${isSigned ? value("signedAt") : ""}" readonly></label>
      </div>
      <label class="qp-process11-declaration-check"><input type="checkbox" id="qp-declaration" data-qp-process11-input ${data.declarationAccepted ? "checked" : ""} ${fieldState}> I confirm the Qualified Person declaration above.</label>
      <p class="qp-process11-footnote">* Qualified Person in accordance with Directive 2001/83/EC &amp; Human Medicines Regulations 2012/1916</p>
      <div class="qp-process11-surplus-grid">
        <label>Surplus printed packaging material destroyed after QP Certification
          ${editable ? `<select id="qp-surplus-status" data-qp-process11-input ${fieldState}><option value=""></option><option ${data.surplusStatus === "Destroyed after QP certification" ? "selected" : ""}>Destroyed after QP certification</option><option ${data.surplusStatus === "Not applicable" ? "selected" : ""}>Not applicable</option></select>` : `<strong>${value("surplusStatus", "Pending")}</strong>`}
        </label>
        <label>Destroyed by (Sign &amp; Date)
          ${editable ? `<input id="qp-destroyed-by" data-qp-process11-input value="${value("destroyedBy")}" ${fieldState}>` : `<strong>${value("destroyedBy", "Not applicable")}</strong>`}
        </label>
      </div>
      ${editable ? "" : `<footer><span>Controlled electronic BAR | ${htmlSafe(product.batch)}</span><strong>Process 11</strong></footer>`}
    </section>`;
}

function renderQpChecklistWindow(stage) {
  const product = qpSelectedProduct;
  const data = getQpProcess11Data(product);
  const isSigned = Boolean(data.signedAt);
  return `
    <div class="qp-release-layout qp-process11-layout">
      <section class="qp-release-window qp-process11-window">
        <div class="qp-process11-header"><strong>QP Final Approval</strong><button class="classic-button" type="button" data-qp-back-dashboard>Back to Document Review</button></div>
        <div class="qp-process11-paper-wrap">${renderQpProcess11BarPage(product, true)}</div>
        <div class="qp-process11-actions">
          ${isSigned ? `<span>Process 11 signed by ${htmlSafe(data.signedBy)} on ${htmlSafe(data.signedAt)}.</span>` : `<button class="classic-button" type="button" data-qp-process11-sign>Click to Sign</button>`}
          <button class="classic-button primary" type="button" id="qp-release-complete-button" ${isSigned ? "" : "disabled"}>Confirm Approval</button>
        </div>
      </section>
    </div>`;
}

function saveQpProcess11FormState() {
  if (!qpSelectedProduct) return;
  const batchNumber = qpSelectedProduct.batch;
  const previous = qpReleaseRecords[batchNumber] || {};
  const existing = getQpProcess11Data(qpSelectedProduct);
  const process11 = {
    ...existing,
    schemaVersion: 2,
    retentionLot: document.querySelector("#qp-retention-lot")?.value || "",
    comments: document.querySelector("#qp-release-comment")?.value || "",
    qpName: existing.qpName || "",
    quantityReleased: Math.max(0, (Number(qpSelectedProduct.quantity) || 0) - 1),
    declarationAccepted: Boolean(document.querySelector("#qp-declaration")?.checked),
    surplusStatus: document.querySelector("#qp-surplus-status")?.value || "",
    destroyedBy: document.querySelector("#qp-destroyed-by")?.value || ""
  };
  qpReleaseRecords[batchNumber] = { ...previous, process11 };
  ensureGeneratedBarRecord(qpSelectedProduct).process11 = { ...process11 };
  persistQpReleaseRecords();
}

function signQpProcess11() {
  if (!qpSelectedProduct) return;
  saveQpProcess11FormState();
  const batchNumber = qpSelectedProduct.batch;
  const now = getAssemblyAuditTimestamp();
  const signedBy = currentLogin ? currentLogin.user : "qp.release";
  const process11 = { ...getQpProcess11Data(qpSelectedProduct), qpName: signedBy, signedBy, signedAt: now, declarationAccepted: true };
  qpReleaseRecords[batchNumber] = {
    ...(qpReleaseRecords[batchNumber] || {}),
    process11,
    process11Signoff: {
      process: 11,
      record: "Batch Sentencing",
      signedBy,
      signedAt: now
    }
  };
  ensureGeneratedBarRecord(qpSelectedProduct).process11 = { ...process11 };
  persistQpReleaseRecords();
  renderStage("qp-release");
  statusMessage.textContent = `Process 11 Printed BAR signed for batch ${batchNumber}.`;
}

function saveQpDocumentReview(documentId, update, auditResult, auditComments) {
  if (!qpSelectedProduct) return;
  const batchNumber = qpSelectedProduct.batch;
  const document = getQpDocumentPack(qpSelectedProduct).find((item) => item.id === documentId);
  if (!document) return;
  const previous = qpReleaseRecords[batchNumber] || {};
  const existingReview = getQpDocumentReview(qpSelectedProduct, document);
  const now = getAssemblyAuditTimestamp();
  const review = { ...existingReview, ...update };
  const documentsState = { ...(previous.documents || {}), [documentId]: review.status === "Reviewed" };
  const auditEntry = {
    document: document.name,
    version: review.version || document.version,
    reviewedBy: currentLogin ? currentLogin.user : "qp.release",
    reviewedAt: now,
    result: auditResult,
    comments: auditComments || ""
  };
  qpReleaseRecords[batchNumber] = {
    ...previous,
    documents: documentsState,
    documentReviews: { ...(previous.documentReviews || {}), [documentId]: review },
    auditTrail: [...(previous.auditTrail || []), auditEntry]
  };
  persistQpReleaseRecords();
}

function verifyQpDocument(documentId) {
  if (!qpSelectedProduct) return;
  if (documentId === "ipc-photos") {
    const photos = qpReleaseRecords[qpSelectedProduct.batch]?.samplePhotos || {};
    const required = ["blister", "carton", "leaflet", ...(qpSelectedProduct.brailleRequired ? ["braille"] : [])];
    if (required.some(kind => !photos[kind]?.length)) {
      statusMessage.textContent = "IPC evidence is incomplete. Attach blister, outer carton, leaflet and applicable Braille photos.";
      return;
    }
  }
  const document = getQpDocumentPack(qpSelectedProduct).find((item) => item.id === documentId);
  if (!document) return;
  const now = getAssemblyAuditTimestamp();
  saveQpDocumentReview(documentId, {
    status: "Reviewed",
    version: getQpDocumentReview(qpSelectedProduct, document).version || document.version,
    reviewedBy: currentLogin ? currentLogin.user : "qp.release",
    reviewedAt: now,
    issueType: "",
    comments: ""
  }, "Verified", "Document verified");
  const nextDocument = getNextPendingQpDocument(qpSelectedProduct, documentId);
  if (nextDocument) qpSelectedDocumentId = nextDocument.id;
  renderStage("qp-release");
  statusMessage.textContent = nextDocument ? `${document.name} verified. Next pending document opened.` : `${document.name} verified. All documents are ready for final review.`;
}

function raiseQpDocumentIssue(documentId) {
  if (!qpSelectedProduct) return;
  const issueType = document.querySelector("[data-qp-issue-type]");
  const comments = document.querySelector("[data-qp-issue-comments]");
  if (!issueType || !issueType.value || !comments || !comments.value.trim()) {
    statusMessage.textContent = "Select an issue type and enter mandatory comments before raising the issue.";
    return;
  }
  const qpDocument = getQpDocumentPack(qpSelectedProduct).find((item) => item.id === documentId);
  const now = getAssemblyAuditTimestamp();
  saveQpDocumentReview(documentId, {
    status: "Issue Raised",
    version: getQpDocumentReview(qpSelectedProduct, qpDocument).version || qpDocument.version,
    reviewedBy: currentLogin ? currentLogin.user : "qp.release",
    reviewedAt: now,
    issueType: issueType.value,
    comments: comments.value.trim()
  }, "Issue Found", `${issueType.value}: ${comments.value.trim()}`);
  renderStage("qp-release");
  statusMessage.textContent = `Issue raised against ${qpDocument.name}. The document remains incomplete.`;
}

function resolveQpDocumentIssue(documentId) {
  if (!qpSelectedProduct) return;
  const qpDocument = getQpDocumentPack(qpSelectedProduct).find((item) => item.id === documentId);
  const currentReview = getQpDocumentReview(qpSelectedProduct, qpDocument);
  saveQpDocumentReview(documentId, { ...currentReview, status: "Re-review Required", resolvedBy: currentLogin ? currentLogin.user : "qp.release", resolvedAt: getAssemblyAuditTimestamp() }, "Issue Resolved", currentReview.comments || "Issue resolved; re-review required");
  renderStage("qp-release");
  statusMessage.textContent = `${qpDocument.name} marked for re-review.`;
}

function replaceQpDocumentVersion(documentId) {
  if (!qpSelectedProduct) return;
  const qpDocument = getQpDocumentPack(qpSelectedProduct).find((item) => item.id === documentId);
  const currentReview = getQpDocumentReview(qpSelectedProduct, qpDocument);
  const versionNumber = Number.parseFloat(currentReview.version || qpDocument.version || "1.0") + 0.1;
  const nextVersion = versionNumber.toFixed(1);
  saveQpDocumentReview(documentId, {
    status: "Re-review Required",
    version: nextVersion,
    reviewedBy: "",
    reviewedAt: "",
    issueType: "",
    comments: "Document replaced after review"
  }, "New Version Uploaded", `Version ${nextVersion}; re-review required`);
  renderStage("qp-release");
  statusMessage.textContent = `${qpDocument.name} replaced with version ${nextVersion}. Re-review is required.`;
}

function getQpCheckOverride(product, check) {
  const saved = qpReleaseRecords[product.batch]?.checkOverrides?.[check.name];
  return saved && saved.status === check.status && saved.finding === check.detail ? saved : null;
}

function acceptQpCheckOverride(index, comment = "") {
  if (!qpSelectedProduct) return;
  const check = getQpAutomaticResults(qpSelectedProduct)[index];
  if (!check || check.status === "Passed") return;
  const batch = qpSelectedProduct.batch;
  const previous = qpReleaseRecords[batch] || {};
  const accepted = { status: check.status, finding: check.detail, comment: String(comment).trim(), user: currentLogin?.user || "qp.release", at: getAssemblyAuditTimestamp() };
  qpReleaseRecords[batch] = { ...previous,
    checkOverrides: { ...(previous.checkOverrides || {}), [check.name]: accepted },
    auditTrail: [...(previous.auditTrail || []), { document: check.name, result: "QP override — accepted to proceed", reviewedBy: accepted.user, reviewedAt: accepted.at, comments: accepted.comment, originalFinding: check.detail }]
  };
  persistQpReleaseRecords();
}

function areAllQpDashboardDocumentsVerified(product) {
  return getQpAutomaticResults(product).every(check => check.status === "Passed" || getQpCheckOverride(product, check));
}

function updateQpReleaseAvailability() {
  const submitButton = document.querySelector("#qp-release-complete-button");
  if (!qpSelectedProduct) return;
  const documents = getQpDocumentPack(qpSelectedProduct);
  const checkedDocs = [...document.querySelectorAll("[data-qp-doc-check]")];
  if (checkedDocs.length) {
    const batchNumber = qpSelectedProduct.batch;
    const previous = qpReleaseRecords[batchNumber] || {};
    const documentsState = { ...(previous.documents || {}) };
    checkedDocs.forEach((check) => { documentsState[check.dataset.qpDocCheck] = check.checked; });
    qpReleaseRecords[batchNumber] = { ...previous, documents: documentsState };
    const openChecklist = document.querySelector("[data-qp-open-checklist]");
    if (openChecklist) openChecklist.disabled = !documents.every((document) => documentsState[document.id]);
  }
  if (!submitButton) return;
  const record = qpReleaseRecords[qpSelectedProduct.batch] || {};
  if (document.querySelector(".qp-process11-window")) {
    submitButton.disabled = !Boolean(record.process11Signoff && record.process11Signoff.signedAt);
    return;
  }
  const declarationAccepted = document.querySelector("#qp-declaration");
  const quantityReleased = document.querySelector("#qp-quantity-released");
  const surplusStatus = document.querySelector("#qp-surplus-status");
  submitButton.disabled = !(areAllQpDashboardDocumentsVerified(qpSelectedProduct) && declarationAccepted && declarationAccepted.checked && quantityReleased && quantityReleased.value.trim() && surplusStatus && surplusStatus.value);
}
function collectQpReleaseState() {
  const existingRecord = qpSelectedProduct ? qpReleaseRecords[qpSelectedProduct.batch] || {} : {};
  const documents = { ...(existingRecord.documents || {}) };
  document.querySelectorAll("[data-qp-doc-check]").forEach((check) => {
    documents[check.dataset.qpDocCheck] = check.checked;
  });
  return {
    documents,
    retentionLot: document.querySelector("#qp-retention-lot") ? document.querySelector("#qp-retention-lot").value : "",
    quantityReleased: document.querySelector("#qp-quantity-released") ? document.querySelector("#qp-quantity-released").value : "",
    declarationAccepted: document.querySelector("#qp-declaration") ? document.querySelector("#qp-declaration").checked : false,
    surplusStatus: document.querySelector("#qp-surplus-status") ? document.querySelector("#qp-surplus-status").value : "",
    destroyedBy: document.querySelector("#qp-destroyed-by") ? document.querySelector("#qp-destroyed-by").value : "",
    comments: document.querySelector("#qp-release-comment") ? document.querySelector("#qp-release-comment").value : ""
  };
}

function collectQpReleaseLogState() {
  const values = {};
  document.querySelectorAll("[data-qp-log-field]").forEach((field) => {
    values[field.dataset.qpLogField] = field.value;
  });
  const batchExpiry = (values.batch || "").split("\n");
  return {
    ...values,
    batch: batchExpiry[0] || (qpSelectedProduct ? qpSelectedProduct.batch : ""),
    expiry: batchExpiry[1] || (qpSelectedProduct ? qpSelectedProduct.expiry : "")
  };
}

function collectQpReleaseLogRows() {
  return [...document.querySelectorAll("[data-qp-log-row]")].map((row) => {
    const batchNumber = row.dataset.qpLogRow;
    return {
      batchNumber,
      approved: row.querySelector(`[data-qp-log-approved="${batchNumber}"]:checked`)?.value || "",
      damagedSample: row.querySelector(`[data-qp-log-damaged="${batchNumber}"]`)?.value || "",
      comments: row.querySelector(`[data-qp-log-comments="${batchNumber}"]`)?.value || ""
    };
  });
}

function saveQpReleaseLog() {
  const rows = collectQpReleaseLogRows();
  if (!rows.length) return;
  rows.forEach(({ batchNumber, approved, damagedSample, comments }) => {
    const product = bnsProducts.find((item) => item.batch === batchNumber);
    if (!product) return;
    qpReleaseRecords[batchNumber] = {
      ...(qpReleaseRecords[batchNumber] || {}),
      releaseLog: {
        ...getQpReleaseLogDefaults(product),
        approved,
        damagedSample,
        comments
      }
    };
  });
  persistQpReleaseRecords();
  statusMessage.textContent = `QP Release Log changes saved for ${rows.length} batch${rows.length === 1 ? "" : "es"}.`;
  updateQpReleaseAvailability();
}

function signQpReleaseLog() {
  const rows = collectQpReleaseLogRows();
  const products = rows.map((row) => bnsProducts.find((product) => product.batch === row.batchNumber)).filter(Boolean);
  if (!rows.length || products.length !== rows.length || products.some((product) => !isQpBatchDecisionComplete(product))) {
    statusMessage.textContent = "Complete the QP decision for every batch before signing and approving the Release Log.";
    return;
  }
  const now = getAssemblyAuditTimestamp();
  const releaseDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  rows.forEach(({ batchNumber, approved, damagedSample, comments }) => {
    const product = bnsProducts.find((item) => item.batch === batchNumber);
    qpReleaseRecords[batchNumber] = {
      ...(qpReleaseRecords[batchNumber] || {}),
      releaseLog: {
        ...getQpReleaseLogDefaults(product),
        approved,
        damagedSample,
        comments,
        qpSignature: currentLogin ? currentLogin.user : "qp.release",
        releaseDate,
        signedBy: currentLogin ? currentLogin.user : "qp.release",
        signedDateTime: now,
        status: "Completed"
      },
      releaseLogApproved: true,
      releaseLogApprovedBy: currentLogin ? currentLogin.user : "qp.release",
      releaseLogApprovedAt: now
    };
  });
  persistQpReleaseRecords();
  statusMessage.textContent = `QP Release Log ${qpSelectedReleaseId || ""} signed and approved for ${rows.length} batch${rows.length === 1 ? "" : "es"}.`;
  printPreviewModal.classList.add("hidden");
  qpSelectedProduct = null;
  qpSelectedReleaseId = "";
  renderStage("qp-release");
}

/*
 * Legacy single-row state collector is retained for compatibility with
 * previously saved prototype records.
 */
function saveQpReleaseLogLegacy() {
  if (!qpSelectedProduct) return;
  const batchNumber = qpSelectedProduct.batch;
  qpReleaseRecords[batchNumber] = {
    ...(qpReleaseRecords[batchNumber] || {}),
    releaseLog: {
      ...(qpReleaseRecords[batchNumber] && qpReleaseRecords[batchNumber].releaseLog ? qpReleaseRecords[batchNumber].releaseLog : {}),
      ...collectQpReleaseLogState()
    }
  };
  persistQpReleaseRecords();
  statusMessage.textContent = `QP Release Log changes saved for ${batchNumber}.`;
  updateQpReleaseAvailability();
}

function openQpDocumentPreview(documentId) {
  if (!qpSelectedProduct) return;
  const sourceDocument = renderQpSourceDocument(qpSelectedProduct, documentId);
  if (sourceDocument !== null) {
    document.querySelector("#print-preview-title").textContent = getQpDocumentPack(qpSelectedProduct).find(doc => doc.id === documentId).name;
    printPreviewRequest = null;
    printPreviewBody.innerHTML = `<div class="preview-toolbar"><strong>Batch ${htmlSafe(qpSelectedProduct.batch)}</strong><button class="classic-button" data-close-print-preview>Close</button></div>${sourceDocument}`;
    printPreviewModal.classList.remove("hidden");
    return;
  }
  if (documentId !== "completed-bar") {
    const product = qpSelectedProduct;
    const doc = getQpDocumentPack(product).find(item => item.id === documentId);
    if (!doc) return;
    const evidence = getQpDummyEvidence(product);
    const results = getQpAutomaticResults(product);
    const related = {"supplier-invoice":1,"supplier-declaration":2,"temperature-record":3,"pcl":4,"reconciliation":7,"batch-summary":8,"approved-artwork":5};
    document.querySelector("#print-preview-title").textContent = doc.name;
    printPreviewRequest = null;
    const body = documentId === "ipc-photos" ? Object.entries(evidence.photos).map(([kind, images]) => `<h3>${htmlSafe(kind)}</h3>${images.map(photo => `<img src="${htmlSafe(photo.data)}" alt="${htmlSafe(photo.name)}" style="max-width:400px;width:100%">`).join("")}`).join("") || "Missing from Assembly" : `<h2>${htmlSafe(doc.name)}</h2><p>Document — ${htmlSafe(doc.group === "RPi Documents" ? "RPi Pack Creation" : doc.group)}</p><table class="classic-table">${[["Batch", product.batch], ["Product", product.product], ["Supplier", evidence.supplier], ["Invoice", evidence.invoice], ["Licence", product.pl], ["Quantity", product.quantity]].map(([label,value]) => `<tr><th>${label}</th><td>${htmlSafe(value || "-")}</td></tr>`).join("")}</table><h3>Recorded findings</h3>${(documentId === "batch-summary" ? results : [results[related[documentId] ?? 0]]).map(result => `<p><strong>${htmlSafe(result.name)} — ${result.status}</strong><br>${htmlSafe(result.detail)}</p>`).join("")}`;
    printPreviewBody.innerHTML = `<div class="release-log-modal-shell"><div class="preview-toolbar"><strong>Demo evidence · ${htmlSafe(product.batch)}</strong><button class="classic-button" data-close-print-preview>Close</button></div>${body}</div>`;
    printPreviewModal.classList.remove("hidden");
    return;
  }
  if (["ipc-photos", "reconciliation", "batch-summary"].includes(documentId)) {
    const product = qpSelectedProduct;
    const record = qpReleaseRecords[product.batch] || {};
    const assembly = assemblyRecords[product.batch] || {};
    const alerts = getQpManualAlerts(product);
    document.querySelector("#print-preview-title").textContent = getQpDocumentPack(product).find(doc => doc.id === documentId).name;
    printPreviewRequest = null;
    const body = documentId === "ipc-photos" ? Object.entries(record.samplePhotos || {}).map(([kind, images]) => `<h3>${htmlSafe(kind)}</h3>${images.map(photo => `<figure><img style="max-width:100%;max-height:65vh" src="${htmlSafe(photo.data)}" alt="${htmlSafe(photo.name)}"><figcaption>${htmlSafe(photo.name)}</figcaption></figure>`).join("")}`).join("") || "IPC photos are missing. Attach the sample evidence before verification." : documentId === "reconciliation" ? `<h3>Reconciliation Sheet — ${htmlSafe(product.batch)}</h3><table class="classic-table">${[["Received", assembly.qtyReceived], ["Used", assembly.usedQty], ["Damaged", assembly.damagedQty], ["Discrepancy", assembly.discrepancyQty]].map(([name, value]) => `<tr><th>${name}</th><td>${htmlSafe(value ?? "Not recorded")}</td></tr>`).join("")}</table>` : `<h3>Batch Summary Record — ${htmlSafe(product.batch)}</h3><p>${htmlSafe(product.product)} · ${htmlSafe(product.strength)} · ${htmlSafe(product.packSize)}</p><p>BAR Quantity: ${htmlSafe(product.quantity)} | Post Assembly: ${htmlSafe(postAssemblyRecords[product.batch]?.totalQty ?? "Not recorded")}</p><h3>Deviations / QP alerts</h3>${alerts.map(alert => `<p>${htmlSafe(alert)}</p>`).join("") || "No deviations recorded."}`;
    printPreviewBody.innerHTML = `<div class="release-log-modal-shell"><div class="preview-toolbar"><strong>Batch ${htmlSafe(product.batch)}</strong><button class="classic-button" data-close-print-preview>Close</button></div>${body}</div>`;
    printPreviewModal.classList.remove("hidden");
    return;
  }
  if (documentId === "completed-bar") {
    openGeneratedBarPreview(qpSelectedProduct.batch);
    return;
  }
  const fileRecord = getQpDocumentPack(qpSelectedProduct).find((item) => item.id === documentId);
  if (!fileRecord) return;
  const pageCount = Number(fileRecord.pages || 1);
  const product = qpSelectedProduct;
  document.querySelector("#print-preview-title").textContent = fileRecord.fileName;
  printPreviewRequest = null;
  printPreviewBody.innerHTML = `
    <div class="qp-pdf-preview-shell">
      <div class="preview-toolbar qp-pdf-preview-toolbar">
        <div><strong>${htmlSafe(fileRecord.fileName)}</strong><span>PDF document &middot; ${pageCount} page${pageCount === 1 ? "" : "s"}</span></div>
        <button class="classic-button" type="button" data-close-print-preview>Close PDF</button>
      </div>
      <div class="qp-pdf-pages">
        ${Array.from({ length: pageCount }, (_, pageIndex) => `
          <section class="qp-pdf-page">
            <header><strong>B&amp;S HEALTHCARE</strong><span>CONTROLLED PDF</span></header>
            <div class="qp-pdf-title"><span>${htmlSafe(fileRecord.group)}</span><h2>${htmlSafe(fileRecord.name)}</h2><p>${htmlSafe(fileRecord.fileName)}</p></div>
            <table>
              <tbody>
                <tr><th>B&amp;S Batch No.</th><td>${htmlSafe(product.batch)}</td><th>Page</th><td>${pageIndex + 1} of ${pageCount}</td></tr>
                <tr><th>Product</th><td>${htmlSafe(product.product)}</td><th>Strength</th><td>${htmlSafe(product.strength || "-")}</td></tr>
                <tr><th>Reference</th><td>${htmlSafe(fileRecord.ref)}</td><th>Uploaded By</th><td>${htmlSafe(fileRecord.uploadedBy)}</td></tr>
              </tbody>
            </table>
            <div class="qp-pdf-content"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
            <footer><span>${htmlSafe(fileRecord.fileName)}</span><strong>Page ${pageIndex + 1} of ${pageCount}</strong></footer>
          </section>
        `).join("")}
      </div>
    </div>`;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = `${fileRecord.fileName} opened (${pageCount} page${pageCount === 1 ? "" : "s"}).`;
}

function openQpReleaseLogPreview(relId = "") {
  if (qpSelectedProduct) {
    const batchNumber = qpSelectedProduct.batch;
    qpReleaseRecords[batchNumber] = {
      ...(qpReleaseRecords[batchNumber] || {}),
      ...collectQpReleaseState()
    };
  }
  const targetRelId = relId || qpSelectedReleaseId || (qpSelectedProduct ? getQpReleaseLogId(qpSelectedProduct.batch) : "");
  const groupProducts = targetRelId
    ? getQpReleaseProducts().filter((product) => getQpReleaseLogId(product.batch) === targetRelId)
    : (qpSelectedProduct ? getQpReleaseLogGroupProducts(qpSelectedProduct) : []);
  if (!groupProducts.length) return;
  syncQpReleaseLogDecisions(groupProducts);
  const signed = groupProducts.every((product) => Boolean(getQpReleaseLogDefaults(product).signedDateTime));
  const completedCount = groupProducts.filter(isQpBatchDecisionComplete).length;
  const allDecisionsComplete = completedCount === groupProducts.length;
  document.querySelector("#print-preview-title").textContent = "QP Release Log";
  printPreviewRequest = null;
  printPreviewBody.innerHTML = `
    <div class="release-log-modal-shell">
      <div class="preview-toolbar">
<div><strong>QP Release Log ${htmlSafe(targetRelId)}</strong><span>${completedCount} of ${groupProducts.length} batch decisions completed</span></div>
<button class="classic-button" type="button" data-close-print-preview>Close</button>
      </div>
      <section class="qp-release-log-editor">
${renderQpReleaseLogPaper(groupProducts, true, true)}
<div class="release-log-modal-actions">
  <span class="qp-release-log-decision-progress ${allDecisionsComplete ? "complete" : "pending"}">${allDecisionsComplete ? "All batch decisions completed" : `${groupProducts.length - completedCount} batch decision${groupProducts.length - completedCount === 1 ? "" : "s"} remaining`}</span>
  <button class="classic-button" type="button" data-save-qp-release-log ${signed ? "disabled" : ""}>Save Comments</button>
  <button class="classic-button primary" type="button" data-sign-qp-release-log ${signed || !allDecisionsComplete ? "disabled" : ""}>${signed ? "Release Log Approved" : "Sign &amp; Approve"}</button>
</div>
      </section>
    </div>
  `;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = `QP Release Log ${targetRelId} opened with the latest batch decisions.`;
}

function completeQpRelease() {
  if (!qpSelectedProduct) return;
  if (!areAllQpDashboardDocumentsVerified(qpSelectedProduct)) {
    statusMessage.textContent = "Approval blocked: resolve all system-check alerts first.";
    return;
  }
  const batchNumber = qpSelectedProduct.batch;
  const now = getAssemblyAuditTimestamp();
  const previous = qpReleaseRecords[batchNumber] || {};
  const releaseLog = getQpReleaseLogDefaults(qpSelectedProduct);
  qpReleaseRecords[batchNumber] = {
    ...previous,
    ...collectQpReleaseState(),
    user: currentLogin ? currentLogin.user : "qp.release",
    dateTime: now,
    approved: true,
    decision: "Certified",
    qpDecisionCompleted: true,
    qpDecisionCompletedAt: now,
    releaseLog: {
      ...releaseLog,
      approved: "Yes",
      batchDecision: "Certified",
      batchCompleted: true,
      batchCompletedAt: now
    },
    auditTrail: [...(previous.auditTrail || []), {
      document: "Final Batch Approval",
      version: "-",
      reviewedBy: "-",
      reviewedAt: "-",
      result: "Certified",
      comments: document.querySelector("#qp-release-comment") ? document.querySelector("#qp-release-comment").value : "",
      finalApprovedBy: currentLogin ? currentLogin.user : "qp.release",
      approvalDateTime: now
    }]
  };
  persistQpReleaseRecords();
  if (!qpReleasedBatchNumbers.includes(batchNumber)) qpReleasedBatchNumbers.push(batchNumber);
  if (!qpCertifiedBatchNumbers.includes(batchNumber)) qpCertifiedBatchNumbers.push(batchNumber);
  statusMessage.textContent = `Batch ${batchNumber} QP released, signed off, and moved to the next stage.`;
  archiveApprovedBatch(qpSelectedProduct);
  window.setTimeout(() => {
    qpSelectedProduct = null;
    qpChecklistOpen = false;
    renderStage("qp-release");
  }, 900);
}

function getBatchRecordStore() {
  if (!window.plpiBatchRecords) {
    try { window.plpiBatchRecords = JSON.parse(localStorage.getItem("plpi-batch-records-v1") || "{}"); }
    catch { window.plpiBatchRecords = {}; }
  }
  return window.plpiBatchRecords;
}

function archiveApprovedBatch(product) {
  if (getQpCertifiedDecisionTab(product) !== "Approved") return null;
  const store = getBatchRecordStore();
  if (store[product.batch]) return store[product.batch];
  const decision = qpReleaseRecords[product.batch] || {};
  ensureQpUpstreamDemoRecords(product);
  const evidence = getQpDummyEvidence(product);
  const documents = getQpDocumentPack(product).map(doc => {
    let html = renderQpSourceDocument(product, doc.id);
    if (html === null && doc.id === "completed-bar") html = renderGeneratedBarDocument(product);
    if (html === null && doc.id === "release-log") html = renderQpReleaseLogPaper([product], true, true, true);
    if (html === null && doc.id === "ipc-photos") html = Object.entries(evidence.photos).map(([kind, photos]) => `<h3>${htmlSafe(kind)}</h3>${photos.map(photo => `<figure><img style="max-width:100%" src="${htmlSafe(photo.data)}" alt="${htmlSafe(photo.name)}"><figcaption>${htmlSafe(photo.name)}</figcaption></figure>`).join("")}`).join("");
    if (html === null) html = Array.from({ length: doc.pages || 1 }, (_, index) => `<section class="qp-source-sheet"><h2>${htmlSafe(doc.name)}</h2><p>Batch ${htmlSafe(product.batch)} · ${htmlSafe(product.product)}</p><table>${[["Source",doc.group],["File",doc.fileName],["Supplier",evidence.supplier],["Invoice",evidence.invoice],["Licence",product.pl],["Quantity",product.quantity],["Reference",doc.ref]].map(([label,value]) => `<tr><th>${label}</th><td>${htmlSafe(value ?? "")}</td></tr>`).join("")}</table><p>Page ${index + 1} of ${doc.pages}</p></section>`).join("");
    // Freeze form values for read-only archival display and printing.
    const template = document.createElement("template");
    template.innerHTML = html;
    template.content.querySelectorAll("input, textarea, select").forEach(input => {
      const span = document.createElement("span");
      span.textContent = input.type === "checkbox" ? (input.checked ? "✓" : "□") : input.value;
      input.replaceWith(span);
    });
    template.content.querySelectorAll("button, [contenteditable], script").forEach(node => {
      if (node.tagName === "BUTTON" || node.tagName === "SCRIPT") node.remove();
      else node.removeAttribute("contenteditable");
    });
    template.content.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    return { id: doc.id, name: doc.name, fileName: doc.fileName, source: doc.group, html: template.innerHTML };
  });
  documents.push({ id: "qp-decision", name: "QP Decision & Review History", fileName: `${product.batch}_QP_Decision.html`, source: "QP", html: `<section class="qp-source-sheet"><h2>QP Decision & Review History</h2><p>Batch ${htmlSafe(product.batch)} · Approved</p><p>${htmlSafe(decision.user || decision.decisionBy || "")} · ${htmlSafe(decision.dateTime || decision.decisionDateTime || "")}</p>${(decision.auditTrail || []).map(entry => `<p><strong>${htmlSafe(entry.document || "")} — ${htmlSafe(entry.result || "")}</strong><br>${htmlSafe(entry.reviewedBy || entry.finalApprovedBy || "")} · ${htmlSafe(entry.reviewedAt || entry.approvalDateTime || "")}<br>${htmlSafe(entry.originalFinding || "")}<br>${htmlSafe(entry.comments || "")}</p>`).join("")}</section>` });
  store[product.batch] = { batch: product.batch, product: product.product, relId: getQpReleaseLogId(product.batch), approvedBy: decision.user || decision.decisionBy || "qp.release", approvedAt: decision.dateTime || decision.decisionDateTime || "", archivedAt: getAssemblyAuditTimestamp(), documents };
  try { localStorage.setItem("plpi-batch-records-v1", JSON.stringify(store)); }
  catch { statusMessage.textContent = "Batch approved. Batch Record is available in this session, but browser storage is full; archive persistence failed."; }
  return store[product.batch];
}

function renderBatchRecordModule() {
  ensurePreQpTestData();
  getQpCertifiedProducts().filter(product => getQpCertifiedDecisionTab(product) === "Approved").forEach(archiveApprovedBatch);
  const records = Object.values(getBatchRecordStore());
  const selected = getBatchRecordStore()[window.batchRecordSelected];
  if (selected) return `<section class="batch-record-module"><div class="qp-review-hero"><h2>Batch Record — ${htmlSafe(selected.batch)}</h2><button class="classic-button" data-batch-record-back>Back to Batch Records</button></div><p>${htmlSafe(selected.product)} · Release ID ${htmlSafe(selected.relId)} · Approved by ${htmlSafe(selected.approvedBy)} · ${htmlSafe(selected.approvedAt)}</p><button class="classic-button" data-batch-record-preview="all">View / Print Complete Record</button><table class="classic-table"><thead><tr><th>Document</th><th>File</th><th>Action</th></tr></thead><tbody>${selected.documents.map(doc => `<tr><td>${htmlSafe(doc.name)}</td><td>${htmlSafe(doc.fileName)}</td><td><button class="classic-button" data-batch-record-preview="${doc.id}">View / Print</button></td></tr>`).join("")}</tbody></table></section>`;
  return `<section class="batch-record-module"><div class="qp-review-hero"><h2>Batch Record</h2><span>${records.length} approved batches</span></div><div class="batch-record-search-row"><input id="batch-record-search" aria-label="Search batch, product or Release ID" placeholder="Batch, product or Release ID" value="${htmlSafe(window.batchRecordSearch || "")}"><button class="classic-button" data-batch-record-search>Search</button></div><div class="qp-rel-cards">${records.filter(record => `${record.batch} ${record.product} ${record.relId}`.toLowerCase().includes((window.batchRecordSearch || "").toLowerCase())).map(record => `<article class="qp-rel-card"><h3>${htmlSafe(record.batch)}</h3><p class="batch-record-product-name">${htmlSafe(record.product)}</p><div class="batch-record-card-footer"><span>Approved ${htmlSafe(record.approvedAt || "—")}</span><button class="classic-button" aria-label="Open batch record ${htmlSafe(record.batch)}" data-batch-record-open="${htmlSafe(record.batch)}">Open</button></div></article>`).join("") || "<p>No approved batch records found.</p>"}</div></section>`;
}

function openBatchRecordPreview(id) {
  const record = getBatchRecordStore()[window.batchRecordSelected];
  if (!record) return;
  const docs = id === "all" ? record.documents : record.documents.filter(doc => doc.id === id);
  if (!docs.length) return;
  printPreviewRequest = null;
  document.querySelector("#print-preview-title").textContent = `Batch Record — ${record.batch}`;
  printPreviewBody.innerHTML = `<div class="preview-toolbar"><strong>${htmlSafe(record.batch)} · ${docs.length} document(s)</strong><button class="classic-button primary" data-batch-record-print>Print</button><button class="classic-button" data-close-print-preview>Close</button></div><div class="batch-record-print-content">${docs.map(doc => `<article class="batch-record-document"><h2>${htmlSafe(doc.name)}</h2>${doc.html}</article>`).join("")}</div>`;
  printPreviewModal.classList.remove("hidden");
}

function renderBatchDetails(product) {
  return `
    <div class="created-bar-summary bar-detail-grid">
      <div>
<span>B&S Batch Number</span>
<strong>${product.batch}</strong>
      </div>
      <div class="wide-detail">
<span>Product Name</span>
<strong>${product.product}</strong>
      </div>
      <div class="wide-detail">
<span>Foreign Name</span>
<strong>${product.foreignName || "-"}</strong>
      </div>
      <div>
<span>Pack Size</span>
<strong>${product.packSize}</strong>
      </div>
      <div>
<span>PL No.</span>
<strong>${product.pl}</strong>
      </div>
      <div>
<span>Quantity</span>
<strong>${product.quantity}</strong>
      </div>
      <div>
<span>Units per pack</span>
<strong>${product.unitsPerPack || "1"}</strong>
      </div>
      <div>
<span>Product Introduced</span>
<strong>${product.productIntroduced || "-"}</strong>
      </div>
      <div>
<span>Strength</span>
<strong>${product.strength}</strong>
      </div>
      <div>
<span>ECMA</span>
<strong>${product.ecma}</strong>
      </div>
      <div>
<span>Expiry Date</span>
<strong>${product.expiry}</strong>
      </div>
      <div>
<span>Mfg. Lot No.</span>
<strong>${product.manufLotNo || product.manufacturingLot || "-"}</strong>
      </div>
      <div class="wide-detail">
<span>Country of origin</span>
<strong>${product.country}</strong>
      </div>
      <div class="wide-detail">
<span>Leaflet Date</span>
<strong>${product.leafletDate || "-"}</strong>
      </div>
      <div class="wide-detail">
<span>Date Revised</span>
<strong>${product.dateRevised || "-"}</strong>
      </div>
    </div>
  `;
}

function auditPrinterAction(type, product, detail) {
  printerAuditTrail.unshift({
    type,
    batch: product.batch,
    user: currentLogin ? currentLogin.user : "printer.user",
    dateTime: new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    detail
  });
}

function getApprovedArtworkMetadata(type, product) {
  const metadata = {
    carton: { title: "Approved Carton Artwork", buttonLabel: "View Carton", version: "CART-APP-v3.2", reference: product.ecma || product.partNo, description: "Approved carton layout for issuing", previewLabel: "CARTON LAYOUT APPROVED" },
    peel: { title: "Approved Peel-Out Artwork", buttonLabel: "View Peel Out", version: "PEEL-APP-v2.1", reference: product.pl || product.partNo, description: "Approved peel-out label layout", previewLabel: "PEEL-OUT ARTWORK APPROVED" },
    braille: { title: "Approved Braille Artwork", buttonLabel: "View Braille", version: "BRL-APP-v1.8", reference: product.ecma || product.pl, description: "Approved braille artwork and declaration", previewLabel: "BRAILLE ARTWORK APPROVED" },
    mockup: { title: "Product Mockup", buttonLabel: "View Mockup", version: "MOCKUP-v2.0", reference: product.partNo, description: "Approved product mockup for label-printing review", previewLabel: "PRODUCT MOCKUP" },
    bar: { title: "Batch Assembly Record (BAR)", buttonLabel: "View BAR", version: `BAR-${product.batch}`, reference: product.batch, description: "Batch Assembly Record for the selected batch", previewLabel: "BATCH ASSEMBLY RECORD" },
    "generated-bar-print": { title: "Generated Batch Assembly Record", buttonLabel: "Print Generated BAR", version: `BAR-${product.batch}`, reference: product.batch, description: "Complete generated Batch Assembly Record", previewLabel: "GENERATED BAR" },
    "cold-chain-tracker": { title: "Cold Chain Tracker", buttonLabel: "View Cold Chain Tracker", version: `CCT-${product.batch}`, reference: product.batch, description: "Cold-chain handling and temperature tracking record", previewLabel: "COLD CHAIN TRACKER" },
    "label-attachment": { title: "Label Attachment Continuation Page", buttonLabel: "Print Label Attachment", version: "CONT-LA-v1.0", reference: product.partNo, description: "Label attachment continuation-page review", previewLabel: "LABEL ATTACHMENT" },
    "bar-continuation": { title: "BAR Continuation Page", buttonLabel: "Print BAR", version: "CONT-BAR-v1.0", reference: product.batch, description: "BAR continuation-page review", previewLabel: "BAR CONTINUATION" },
    "cold-chain": { title: "Cold Chain Continuation Page", buttonLabel: "Print Cold Chain", version: "CONT-CC-v1.0", reference: product.batch, description: "Cold-chain continuation-page review", previewLabel: "COLD CHAIN CONTINUATION" },
    "reboxing-form": { title: "Change of Pack Size", buttonLabel: "Print Change of Pack Size", version: "F/PLPI/0044/001/v7", reference: product.batch, description: "Completed Reboxing form continuation document", previewLabel: "CHANGE OF PACK SIZE" },
    "pack-check": { title: "Pack Check Continuation Page", buttonLabel: "View Pack Check", version: "CONT-PC-v1.0", reference: product.partNo, description: "Pack-check continuation-page review", previewLabel: "PACK CHECK" }
  };
  return metadata[type] || metadata.peel;
}

function renderApprovedArtworkPreviewSection(product, documentTypes = []) {
  if (!product || !documentTypes.length) return "";
  return `
    <div class="approved-artwork-actions approved-artwork-actions-only">
      ${documentTypes.map((type) => {
        const artwork = getApprovedArtworkMetadata(type, product);
        return `<button class="classic-button approved-artwork-button" type="button" data-view-approved-artwork="${type}" data-approved-artwork-batch="${product.batch}">${artwork.buttonLabel}</button>`;
      }).join("")}
    </div>`;
}

function renderLabelPrintingReviewActions(product) {
  const continuationTypes = ["generated-bar-print", "label-attachment", "bar-continuation", "cold-chain"];
  if (product.routeType === "Reboxing") continuationTypes.push("reboxing-form");
  const groups = [
    { title: "Approved", types: ["carton", "peel", "braille", "mockup"] },
    { title: "Batch Records", types: ["bar"] },
    { title: "Continuation Pages", types: continuationTypes }
  ];
  return `
    <div class="label-review-groups">
      ${groups.map((group) => `
        <section class="label-review-group">
          <strong class="label-review-group-title">${group.title}</strong>
          <div class="label-review-button-grid">
            ${group.types.map((type) => {
              const review = getApprovedArtworkMetadata(type, product);
              const actionAttributes = type === "generated-bar-print"
                ? `data-print-generated-bar="${product.batch}"`
                : group.title === "Continuation Pages"
                  ? `data-print-continuation-page="${type}" data-continuation-batch="${product.batch}"`
                  : `data-view-approved-artwork="${type}" data-approved-artwork-batch="${product.batch}"`;
              return `<button class="classic-button label-review-button" type="button" ${actionAttributes}>${review.buttonLabel}</button>`;
            }).join("")}
          </div>
        </section>
      `).join("")}
    </div>`;
}

function getGeneratedBarProduct(batchNumber) {
  return combinedBarProducts[batchNumber] || bnsProducts.find((item) => item.batch === batchNumber);
}

function renderBarProductHeader(product) {
  const fields = [
    ["Product Name", product.product],
    ["Foreign Name", product.foreignName || "-"],
    ["Strength", product.strength],
    ["Pack Size", product.packSize],
    ["ECMA", product.ecma],
    ["PL No.", product.pl],
    ["B&S Batch Number", product.batch],
    ["Expiry Date", product.expiry],
    ["Quantity", product.quantity],
    ["Units per pack", product.unitsPerPack || "1"]
  ];
  return `<dl class="generated-bar-product-header">${fields.map(([label, value]) => `<div><dt>${htmlSafe(label)}</dt><dd>${htmlSafe(value || "-")}</dd></div>`).join("")}</dl>`;
}

function syncWorkflowClearanceForBar(batchNumber) {
  const user = getAssemblyAuditUser();
  const dateTime = getAssemblyAuditTimestamp();
  const createSnapshot = (stage, sections) => ({ stage, user, dateTime, sections });

  if (currentStageId === "pre-assembly-qc" && preAssemblySelectedProduct && preAssemblySelectedProduct.batch === batchNumber) {
    const existingRecord = preAssemblyRecords[batchNumber] || {};
    const materialChecks = [...document.querySelectorAll("[data-preassembly-material]")].map((check, index) => {
      const row = check.closest("tr");
      const label = row && row.cells && row.cells[0] ? row.cells[0].textContent.trim() : `Printed material ${index + 1}`;
      return { label, checked: check.checked, detail: row && row.cells && row.cells[1] ? row.cells[1].textContent.trim() : "" };
    });
    const specimenCount = document.querySelector("#preassembly-specimen-count")?.value || "";
    const leafletFolds = document.querySelector("#preassembly-leaflet-folds")?.value || "";
    const tamperSeal = document.querySelector("#preassembly-tamper-seal")?.value || "";
    preAssemblyRecords[batchNumber] = {
      ...existingRecord,
      specimenCount,
      leafletFolds,
      tamperSeal,
      comments: document.querySelector("#preassembly-comments")?.value || existingRecord.comments || "",
      clearanceSnapshot: createSnapshot("Pre-Assembly", [
        { title: "Printed Material Clearance", items: materialChecks },
        {
          title: "Pre-Assembly Counts",
          items: [{
            label: "Specimen, leaflet folds and tamper seal counts recorded",
            checked: [specimenCount, leafletFolds, tamperSeal].every((value) => value !== ""),
            detail: `Specimen: ${specimenCount || "-"}; Leaflet folds: ${leafletFolds || "-"}; Tamper seal: ${tamperSeal || "-"}`
          }]
        }
      ])
    };
    return;
  }

  if (currentStageId === "assembly-room" && assemblySelectedProduct && assemblySelectedProduct.batch === batchNumber) {
    const existingRecord = assemblyRecords[batchNumber] || {};
    const signedTabs = existingRecord.signedTabs || {};
    const initialItems = [...document.querySelectorAll('[data-assembly-tab-check="materials"]')].map((check, index) => ({
      label: check.closest(".assembly-check-row")?.querySelector("strong")?.textContent.trim() || `Initial check ${index + 1}`,
      checked: check.checked || Boolean(signedTabs.materials)
    }));
    const sampleItems = [...document.querySelectorAll('[data-assembly-tab-check="samples"]')].map((check, index) => ({
      label: check.closest("tr")?.querySelector("td:nth-child(2)")?.textContent.trim() || `Random sample ${index + 1}`,
      checked: check.checked || Boolean(signedTabs.samples),
      detail: check.closest("tr")?.querySelector(".mfg-lot-col")?.textContent.trim() || ""
    }));
    const ipcInput = document.querySelector("[data-assembly-ipc-evidence]");
    const ipcAttached = Boolean(signedTabs.ipc || existingRecord.ipcPhotoName || (ipcInput && ipcInput.files && ipcInput.files.length));
    const clearanceItems = [...document.querySelectorAll('[data-assembly-tab-check="recon"]')].map((check, index) => ({
      label: check.closest(".assembly-clearance-row")?.querySelector("strong")?.textContent.trim() || `End-of-batch clearance ${index + 1}`,
      checked: check.checked || Boolean(signedTabs.recon)
    }));
    assemblyRecords[batchNumber] = {
      ...existingRecord,
      comments: document.querySelector("#assembly-comments")?.value || existingRecord.comments || "",
      clearanceSnapshot: createSnapshot("Assembly", [
        { title: "Initial Checks", items: initialItems },
        { title: "Random Sample Checks", items: sampleItems },
        { title: "IPC Photo Check", items: [{ label: "IPC photo evidence captured", checked: ipcAttached, detail: existingRecord.ipcPhotoName || (ipcAttached ? "Photo attached" : "") }] },
        { title: "Reconciliation and End-of-Batch Clearance", items: clearanceItems }
      ])
    };
    return;
  }

  if (currentStageId === "post-assembly-qc" && postAssemblySelectedProduct && postAssemblySelectedProduct.batch === batchNumber) {
    const existingRecord = postAssemblyRecords[batchNumber] || {};
    const packChecks = [...document.querySelectorAll("[data-postassembly-pack-check]")].map((check, index) => {
      const row = check.closest("tr");
      return {
        label: row && row.cells && row.cells[0] ? row.cells[0].textContent.trim() : `Pack detail ${index + 1}`,
        checked: check.checked || Boolean(existingRecord.packChecksConfirmed),
        detail: row && row.cells && row.cells[2] ? row.cells[2].textContent.trim() : ""
      };
    });
    postAssemblyRecords[batchNumber] = {
      ...existingRecord,
      boxCount: document.querySelector("#postassembly-box-count")?.value || existingRecord.boxCount || "",
      totalQty: document.querySelector("#postassembly-total-qty")?.value || existingRecord.totalQty || "",
      packsChecked: document.querySelector("#postassembly-packs-checked")?.value || existingRecord.packsChecked || "",
      comments: document.querySelector("#postassembly-comments")?.value || existingRecord.comments || "",
      clearanceSnapshot: createSnapshot("Post Assembly", [
        { title: "Pack Details Against BAR", items: packChecks },
        {
          title: "Quarantine Label",
          items: [{
            label: "Quarantine label printed",
            checked: Boolean(existingRecord.quarantinePrinted),
            detail: existingRecord.quarantinePrinted ? "Printed" : "Available to print"
          }]
        }
      ])
    };
  }
}
function renderBarAuditRows(record, emptyMessage = "No activity recorded at this stage.") {
  if (!record) return `<p class="generated-bar-empty">${htmlSafe(emptyMessage)}</p>`;
  const rows = [];
  const clearanceSnapshot = record.clearanceSnapshot;
  (clearanceSnapshot?.sections || []).forEach((section) => {
    (section.items || []).forEach((item) => {
      rows.push([
        `${section.title}: ${item.label}`,
        item.checked ? "Completed" : "Pending",
        item.user || clearanceSnapshot.user || "-",
        item.dateTime || clearanceSnapshot.dateTime || "-",
        item.detail || "Line-clearance status captured from the live workflow"
      ]);
    });
  });
  (record.runtime?.history || []).forEach((entry) => {
    rows.push([
      "Batch Runtime",
      entry.action || "Activity",
      entry.user || "-",
      entry.dateTime || "-",
      entry.quantity != null
        ? `Completed quantity ${entry.quantity}`
        : entry.remainingQuantity != null
          ? `Remaining quantity ${entry.remainingQuantity}`
          : "Batch timing activity"
    ]);
  });
  Object.entries(record.signedTabs || {}).forEach(([page, completion]) => {
    const pageNames = { materials: "Initial Checks", samples: "Random Sample Check", ipc: "IPC Photo Check", recon: "Reconciliation & Closure" };
    rows.push([
      pageNames[page] || page,
      "Signed",
      completion.user || "-",
      completion.dateTime || "-",
      "Assembly page sign-off"
    ]);
  });
  Object.entries(record.itemCompletions || {}).forEach(([item, completion]) => {
    rows.push([item, completion.status || "Completed", completion.user || "-", completion.dateTime || "-", "Line completion"]);
  });
  (record.batchSummaryPrintEntries || []).filter((entry) => entry.category !== "Test Print").forEach((entry) => {
    rows.push([entry.item || "-", entry.category || "Print", entry.user || "-", entry.dateTime || "-", `Qty ${entry.quantityToPrint || 0}; ${entry.reason || "Not required"}`]);
  });
  Object.entries(record.extraPrintRuns || {}).forEach(([item, runs]) => {
    (runs || []).forEach((run) => rows.push([
      item,
      "Extra Print",
      run.user || "-",
      run.dateTime || "-",
      `Qty ${run.quantity || run.quantityToPrint || 0}; ${run.reason || "Reason recorded"}`
    ]));
  });
  if (record.finalizedBy || record.finalizedAt) {
    rows.push(["Batch", "Print Done", record.finalizedBy || "-", record.finalizedAt || "-", "Printing workflow completed"]);
  }
  if (clearanceSnapshot && (record.signoffRecord || record.user || record.dateTime)) {
    const signoff = record.signoffRecord || {};
    rows.push([
      clearanceSnapshot.stage || "Department",
      "Signed Off",
      signoff.user || record.user || "-",
      signoff.dateTime || record.dateTime || "-",
      record.comments || "Department clearance completed"
    ]);
  }
  if (!rows.length && (record.user || record.dateTime || record.comments || record.quantity)) {
    rows.push([
      "Department record",
      record.status || (record.dateTime ? "Completed" : "Active"),
      record.user || record.completedBy || "-",
      record.dateTime || record.completedAt || "-",
      record.comments || (record.quantity ? `Quantity ${record.quantity}` : "Recorded")
    ]);
  }
  if (!rows.length) return `<p class="generated-bar-empty">${htmlSafe(emptyMessage)}</p>`;
  return `
    <table class="generated-bar-audit-table">
      <thead><tr><th>Item</th><th>Action / Status</th><th>User</th><th>Date / Time</th><th>Details / Comments</th></tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${htmlSafe(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
}

function getGeneratedBarTotalPages(product) {
  return 14;
}

function renderGeneratedBarPage(product, pageNumber, title, body, options = {}) {
  const totalPages = getGeneratedBarTotalPages(product);
  return `
    <section class="generated-bar-page ${options.evidence ? "generated-bar-evidence-page" : ""}">
      <header class="generated-bar-page-title">
        <div class="generated-bar-running-title"><strong>Batch Assembly Record</strong><span>${htmlSafe(title)}</span></div>
        <div class="generated-bar-running-codes">
          <strong>${htmlSafe(product.batch)}</strong>
          <strong>${htmlSafe(product.expiry)}</strong>
        </div>
      </header>
      ${options.hideProductHeader ? "" : renderBarProductHeader(product)}
      <div class="generated-bar-page-content">${body}</div>
      <footer><span>Controlled electronic BAR | ${htmlSafe(product.batch)}</span><strong>Page ${pageNumber} of ${totalPages}</strong></footer>
    </section>`;
}

function renderGeneratedBarCoverPage(product, barRecord) {
  const totalPages = getGeneratedBarTotalPages(product);
  return `
    <section class="generated-bar-page generated-bar-cover-page">
      <h1>Batch Assembly Record</h1>
      <div class="bar-standard-cover-layout">
        <div class="bar-standard-cover-main">
          <div class="bar-standard-field bar-standard-product"><span>Product<br>Name</span><strong>${htmlSafe(product.product || "-")}</strong></div>
          <div class="bar-standard-field"><span>Foreign<br>Name</span><strong>${htmlSafe(product.foreignName || "-")}</strong></div>
          <div class="bar-standard-field"><span>Strength</span><strong>${htmlSafe(product.strength || "-")}</strong></div>
          <div class="bar-standard-field"><span>Pack Size</span><strong>${htmlSafe(product.packSize || "-")}</strong></div>
          <div class="bar-standard-field"><span>ECMA</span><strong>${htmlSafe(product.ecma || "-")}</strong></div>
          <div class="bar-standard-split">
            <div class="bar-standard-field"><span>PL No</span><strong>${htmlSafe(product.pl || "-")}</strong></div>
            <div class="bar-standard-field bar-standard-units"><span>Units per pack</span><strong>${htmlSafe(product.unitsPerPack || "1")}</strong></div>
          </div>
          <div class="bar-standard-field"><span>Country of<br>origin</span><strong>${htmlSafe(product.country || "-")}</strong></div>
          <div class="bar-standard-date-row">
            <div class="bar-standard-field"><span>Product<br>Introduced</span><strong>${htmlSafe(product.productIntroduced || "-")}</strong></div>
            <div class="bar-standard-field bar-standard-leaflet-date"><span>Leaflet Date</span><strong>${htmlSafe(product.leafletDate || "-")}</strong></div>
          </div>
          <div class="bar-standard-field bar-standard-revised"><span>Date Revised</span><strong>${htmlSafe(product.dateRevised || "-")}</strong></div>
        </div>
        <aside class="bar-standard-cover-codes">
          <div class="bar-standard-code"><span>B&amp;S Batch Number</span><strong>${htmlSafe(product.batch || "-")}</strong><i aria-hidden="true"></i></div>
          <div class="bar-standard-code"><span>Expiry Date</span><strong>${htmlSafe(product.expiry || "-")}</strong><i aria-hidden="true"></i></div>
        </aside>
      </div>
      <div class="bar-standard-variation"><span>Variation<br>Information<br>(If Applicable)</span><strong>${htmlSafe(product.variationInfo || "")}</strong></div>
      <div class="bar-standard-generation-record"><span>Generated By</span><strong>${htmlSafe(barRecord.generatedBy || "-")}</strong><span>Date / Time</span><strong>${htmlSafe(barRecord.generatedAt || "-")}</strong></div>
      <footer><span>Controlled electronic BAR | ${htmlSafe(product.batch)}</span><strong>Page 1 of ${totalPages}</strong></footer>
    </section>`;
}

function renderReboxingContinuationPage(product) {
  const completedForm = renderChangeOfPackSizeForm(product.batch, true, null, false);
  return `
    <section class="generated-bar-page generated-bar-reboxing-page continuation-print-page">
      <div class="generated-bar-reboxing-attachment">${completedForm}</div>
    </section>`;
}

function renderGeneratedBarDocument(product) {
  const barRecord = generatedBarRecords[product.batch] || ensureGeneratedBarRecord(product);
  const bnsClearance = getSavedBnsLineClearance(product.batch) || barRecord.bnsLineClearance || {};
  barRecord.bnsLineClearance = bnsClearance;
  const bnsBody = `
    <table class="generated-bar-check-table">
      <thead><tr><th>Line Clearance Check</th><th>Result</th></tr></thead>
      <tbody>${(bnsClearance.checks || []).map((check) => `<tr><td>${htmlSafe(check.label)}</td><td><span class="bar-form-checkbox ${check.checked ? "checked" : ""}">${check.checked ? "&#10003;" : ""}</span></td></tr>`).join("")}</tbody>
    </table>
    <div class="generated-bar-signoff"><div><span>Comments</span><strong>${htmlSafe(bnsClearance.comments || "No comments entered.")}</strong></div><div><span>Completed By</span><strong>${htmlSafe(bnsClearance.completedBy || "Pending")}</strong></div><div><span>Date / Time</span><strong>${htmlSafe(bnsClearance.completedAt || "Pending")}</strong></div></div>`;
  const productBody = `
    <div class="generated-bar-cover-grid">
      <div><span>Country of origin</span><strong>${htmlSafe(product.country || "-")}</strong></div>
      <div><span>Product Introduced</span><strong>${htmlSafe(product.productIntroduced || "-")}</strong></div>
      <div><span>Leaflet Date</span><strong>${htmlSafe(product.leafletDate || "-")}</strong></div>
      <div><span>Date Revised</span><strong>${htmlSafe(product.dateRevised || "-")}</strong></div>
      <div><span>Mfg. Lot No.</span><strong>${htmlSafe(getMfgLotNo(product) || "-")}</strong></div>
      <div><span>Generated By / Date</span><strong>${htmlSafe(barRecord.generatedBy)} | ${htmlSafe(barRecord.generatedAt)}</strong></div>
      <div class="wide"><span>Variation Information (If Applicable)</span><strong>${htmlSafe(product.variationInfo || "")}</strong></div>
    </div>`;
  const evidenceBody = `
    <p class="generated-bar-evidence-instruction">Attach the approved test print and the required label evidence for this batch in the spaces below.</p>
    <div class="generated-bar-evidence-grid">
      <div><strong>Test Print / Approved Label Evidence</strong><span>Attach evidence here</span></div>
      <div><strong>First Production Label</strong><span>Attach evidence here</span></div>
      <div><strong>Last Production Label</strong><span>Attach evidence here</span></div>
      <div><strong>Additional / Extra Print Evidence</strong><span>Attach evidence here</span></div>
    </div>
    <div class="generated-bar-evidence-signoff"><span>Checked By</span><span>Date / Time</span><span>Comments</span></div>`;
  const auditRows = printerAuditTrail
    .filter((entry) => entry.batch === product.batch)
    .map((entry) => `<tr><td>${htmlSafe(entry.type)}</td><td>${htmlSafe(entry.user)}</td><td>${htmlSafe(entry.dateTime)}</td><td>${htmlSafe(entry.detail)}</td></tr>`)
    .join("");
  const auditBody = auditRows
    ? `<table class="generated-bar-audit-table"><thead><tr><th>Action</th><th>User</th><th>Date / Time</th><th>Details</th></tr></thead><tbody>${auditRows}</tbody></table>`
    : '<p class="generated-bar-empty">No downstream audit entries have been recorded yet.</p>';
  const pages = [
    renderGeneratedBarCoverPage(product, barRecord),
    renderGeneratedBarPage(product, 2, "B&S Batch Add - Line Clearance", bnsBody),
    renderGeneratedBarPage(product, 3, "Label Printing", renderBarAuditRows(labelPrintRecords[product.batch], "Label Printing has not started.")),
    renderGeneratedBarPage(product, 4, "Leaflet Printing", renderBarAuditRows(leafletPrintRecords[product.batch], "Leaflet Printing has not started.")),
    renderGeneratedBarPage(product, 5, "Label Evidence Attachment", evidenceBody, { evidence: true }),
    renderGeneratedBarPage(product, 6, "Braille Printing", renderBarAuditRows(braillePrintRecords[product.batch], "Braille Printing has not started or is not required.")),
    renderGeneratedBarPage(product, 7, "Leaflet Folding", renderBarAuditRows(leafletFoldingRecords[product.batch], "Leaflet Folding has not been completed.")),
    renderGeneratedBarPage(product, 8, "Carton Issuing", renderBarAuditRows(cartonPrintRecords[product.batch], "Carton Issuing has not started or is not required.")),
    renderGeneratedBarPage(product, 9, "Pre-Assembly", renderBarAuditRows(preAssemblyRecords[product.batch], "Pre-Assembly has not started.")),
    renderGeneratedBarPage(product, 10, "Production Control", renderBarAuditRows(productionRecords[product.batch], "Production Control has not started.")),
    renderGeneratedBarPage(product, 11, "Assembly", renderBarAuditRows(assemblyRecords[product.batch], "Assembly has not started.")),
    renderGeneratedBarPage(product, 12, "Post-Assembly QC", renderBarAuditRows(postAssemblyRecords[product.batch], "Post-Assembly QC has not started.")),
    renderQpProcess11BarPage(product, false),
    renderGeneratedBarPage(product, 14, "BAR Audit Trail", auditBody)
  ];
  if (product.routeType === "Reboxing" && changeOfPackSizeData[product.batch]) {
    pages.push(renderReboxingContinuationPage(product));
  }
  return pages.join("");
}

function openGeneratedBarPreview(batchNumber, allowPrint = false) {
  const product = getGeneratedBarProduct(batchNumber);
  if (product && !generatedBarRecords[batchNumber]) {
    ensureGeneratedBarRecord(product);
  }
  if (!product || !generatedBarRecords[batchNumber]) {
    showSystemMessage("Batch Assembly Record", "BAR has not been generated", "Generate the BAR in B&S Batch Add before viewing or printing it.");
    return;
  }
  printPreviewRequest = { type: "generated-bar", batchNumber, product, workflowMode: allowPrint ? "generated-bar-print" : "generated-bar-view" };
  document.querySelector("#print-preview-title").textContent = allowPrint ? "Print Generated BAR" : "Batch Assembly Record";
  printPreviewModal.classList.add("bar-record-preview-mode");
  const barRecord = generatedBarRecords[batchNumber];
  const savedClearance = getSavedBnsLineClearance(batchNumber) || barRecord.bnsLineClearance || {};
  barRecord.bnsLineClearance = savedClearance;
  const completedChecks = (savedClearance.checks || []).filter((check) => check.checked).length;
  const totalChecks = (savedClearance.checks || []).length;
  printPreviewBody.innerHTML = `
    <div class="generated-bar-preview-toolbar">
      <div><strong>Controlled Batch Assembly Record</strong><span>B&S Batch Number ${htmlSafe(batchNumber)} | B&S checks captured: ${completedChecks}/${totalChecks} | ${allowPrint ? "Ready to print" : "View only"}</span></div>
      ${allowPrint ? '<button class="classic-button primary" type="button" id="generated-bar-print-button">Print Generated BAR</button>' : ""}
    </div>
    <div class="generated-bar-pages">${renderGeneratedBarDocument(product)}</div>`;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = allowPrint
    ? `Populated BAR opened for batch ${batchNumber}. Review it before printing.`
    : `Generated BAR opened in view-only mode for batch ${batchNumber}.`;
}

function printGeneratedBarRecord() {
  if (printPreviewRequest?.workflowMode !== "generated-bar-print") return;
  const product = printPreviewRequest.product;
  const user = currentLogin ? currentLogin.user : "printer.user";
  const dateTime = getAssemblyAuditTimestamp();
  const hasChangeOfPackSizeAttachment = product.routeType === "Reboxing" && Boolean(changeOfPackSizeData[product.batch]);
  const attachmentNote = hasChangeOfPackSizeAttachment ? " with the unnumbered Change of Pack Size attachment" : "";
  auditPrinterAction("Batch Assembly Record Printed", product, `Populated 13-page BAR${attachmentNote} printed by ${user} at ${dateTime}.`);
  statusMessage.textContent = `Populated BAR${attachmentNote} sent to print for batch ${product.batch} by ${user} at ${dateTime}.`;
  window.print();
}

function renderContinuationPageDocument(type, product) {
  if (type === "reboxing-form") return renderReboxingContinuationPage(product);
  const document = getApprovedArtworkMetadata(type, product);
  let content = "";
  if (type === "label-attachment") {
    content = `
      <p class="continuation-page-instruction">Attach the additional approved label evidence for this batch below.</p>
      <div class="generated-bar-evidence-grid continuation-evidence-grid">
        <div><strong>Label Evidence</strong><span>Attach evidence here</span></div>
        <div><strong>Additional Label Evidence</strong><span>Attach evidence here</span></div>
      </div>`;
  } else if (type === "cold-chain") {
    content = `
      <table class="generated-bar-audit-table continuation-entry-table">
        <thead><tr><th>Date / Time</th><th>Temperature</th><th>Location / Stage</th><th>Checked By</th><th>Comments</th></tr></thead>
        <tbody>${Array.from({ length: 8 }, () => "<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>").join("")}</tbody>
      </table>`;
  } else {
    content = `
      <table class="generated-bar-audit-table continuation-entry-table">
        <thead><tr><th>Process / Department</th><th>Continuation Entry</th><th>Completed By</th><th>Date / Time</th></tr></thead>
        <tbody>${Array.from({ length: 10 }, () => "<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>").join("")}</tbody>
      </table>`;
  }
  return `
    <section class="generated-bar-page continuation-print-page">
      <header class="generated-bar-page-title">
        <div class="generated-bar-running-title"><strong>Batch Assembly Record</strong><span>${htmlSafe(document.title)}</span></div>
        <div class="generated-bar-running-codes"><strong>${htmlSafe(product.batch)}</strong><strong>${htmlSafe(product.expiry)}</strong></div>
      </header>
      ${renderBarProductHeader(product)}
      <div class="generated-bar-page-content">${content}</div>
      <footer><span>${htmlSafe(document.version)} | Controlled continuation document</span><strong>Additional Page</strong></footer>
    </section>`;
}

function printContinuationPage(type, batchNumber) {
  const product = getGeneratedBarProduct(batchNumber);
  if (!product) return;
  const continuationDocument = getApprovedArtworkMetadata(type, product);
  printPreviewRequest = { workflowMode: "continuation-page", type, batchNumber, product };
  document.querySelector("#print-preview-title").textContent = continuationDocument.title;
  printPreviewModal.classList.add("bar-record-preview-mode", "continuation-page-preview-mode");
  printPreviewBody.innerHTML = `
    <div class="generated-bar-preview-toolbar">
      <div><strong>${htmlSafe(continuationDocument.title)}</strong><span>B&amp;S Batch Number ${htmlSafe(batchNumber)} | Additional page</span></div>
      <button class="classic-button primary" type="button" id="continuation-page-print-button">Print Continuation Page</button>
    </div>
    <div class="generated-bar-pages">${renderContinuationPageDocument(type, product)}</div>`;
  printPreviewModal.classList.remove("hidden");
  statusMessage.textContent = `${continuationDocument.title} opened for batch ${batchNumber}.`;
}

function confirmContinuationPagePrint() {
  if (printPreviewRequest?.workflowMode !== "continuation-page") return;
  const { type, product } = printPreviewRequest;
  const continuationDocument = getApprovedArtworkMetadata(type, product);
  const user = currentLogin ? currentLogin.user : "printer.user";
  const dateTime = getAssemblyAuditTimestamp();
  auditPrinterAction(`${continuationDocument.title} Printed`, product, `Continuation page printed by ${user} at ${dateTime}.`);
  statusMessage.textContent = `${continuationDocument.title} printed for batch ${product.batch} by ${user} at ${dateTime}.`;
  window.print();
}

function openApprovedArtworkPreview(type, batchNumber) {
  if (type === "bar") {
    openGeneratedBarPreview(batchNumber, false);
    return;
  }
  const product = getGeneratedBarProduct(batchNumber);
  if (!product) return;
  const artwork = getApprovedArtworkMetadata(type, product);
  const viewedAt = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const user = currentLogin ? currentLogin.user : "printer.user";
  let modal = document.querySelector("#approved-artwork-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "approved-artwork-modal";
    modal.className = "modal-backdrop hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal);
  }
  modal.dataset.artworkType = type;
  modal.dataset.artworkBatch = batchNumber;
  modal.dataset.zoom = "100";
  modal.innerHTML = `
    <div class="approved-artwork-modal-window">
      <div class="internal-title approved-artwork-modal-title"><span>${artwork.title}</span><button type="button" class="close-button" data-close-approved-artwork>X</button></div>
      <div class="approved-artwork-toolbar">
        <div class="approved-artwork-metadata"><span><b>Batch:</b> ${product.batch}</span><span><b>Reference:</b> ${artwork.reference || "-"}</span><span><b>Version:</b> ${artwork.version}</span><span><b>Viewed by:</b> ${user}</span><span><b>Timestamp:</b> ${viewedAt}</span></div>
        <div class="approved-artwork-tools"><button class="classic-button" type="button" data-approved-artwork-zoom="out" title="Zoom out">-</button><span id="approved-artwork-zoom-value">100%</span><button class="classic-button" type="button" data-approved-artwork-zoom="in" title="Zoom in">+</button><button class="classic-button" type="button" data-download-approved-artwork>Download</button><button class="classic-button primary" type="button" data-close-approved-artwork>Close</button></div>
      </div>
      <div class="approved-artwork-canvas-wrap">
        <article class="approved-artwork-canvas" id="approved-artwork-canvas">
          <header><span>PLPI DOCUMENT REVIEW</span><strong>${artwork.title}</strong></header>
          <div class="approved-artwork-product"><strong>${product.product}</strong><span>${product.strength} | ${product.packSize}</span></div>
          <dl><div><dt>B&S Batch Number</dt><dd>${product.batch}</dd></div><div><dt>Mfg. Lot No.</dt><dd>${getMfgLotNo(product) || "-"}</dd></div><div><dt>Expiry Date</dt><dd>${product.expiry}</dd></div><div><dt>Artwork Reference</dt><dd>${artwork.reference || "-"}</dd></div><div><dt>Document Version</dt><dd>${artwork.version}</dd></div><div><dt>Status</dt><dd>Approved</dd></div></dl>
          <div class="approved-artwork-visual preview-${type}"><span>${artwork.previewLabel || artwork.title}</span><i></i></div>
          <footer>${artwork.description} | Controlled copy | View-only review</footer>
        </article>
      </div>
    </div>`;
  modal.classList.remove("hidden");
  auditPrinterAction(`${artwork.title} Viewed`, product, `${artwork.version} opened in view-only preview.`);
  statusMessage.textContent = `${artwork.title} opened for batch ${batchNumber}.`;
}

function closeApprovedArtworkPreview() {
  const modal = document.querySelector("#approved-artwork-modal");
  if (modal) modal.classList.add("hidden");
}

function changeApprovedArtworkZoom(direction) {
  const modal = document.querySelector("#approved-artwork-modal");
  if (!modal) return;
  const current = Number(modal.dataset.zoom || 100);
  const next = Math.max(60, Math.min(160, current + (direction === "in" ? 10 : -10)));
  modal.dataset.zoom = String(next);
  const canvas = modal.querySelector("#approved-artwork-canvas");
  const value = modal.querySelector("#approved-artwork-zoom-value");
  if (canvas) canvas.style.transform = `scale(${next / 100})`;
  if (value) value.textContent = `${next}%`;
}

function downloadApprovedArtwork() {
  const modal = document.querySelector("#approved-artwork-modal");
  if (!modal) return;
  const type = modal.dataset.artworkType;
  const batchNumber = modal.dataset.artworkBatch;
  const product = bnsProducts.find((item) => item.batch === batchNumber);
  if (!product) return;
  const artwork = getApprovedArtworkMetadata(type, product);
  const content = ["PLPI APPROVED ARTWORK", artwork.title, `Batch: ${product.batch}`, `Product: ${product.product}`, `Strength / Pack: ${product.strength} / ${product.packSize}`, `Mfg. Lot No.: ${getMfgLotNo(product) || "-"}`, `Expiry: ${product.expiry}`, `Reference: ${artwork.reference || "-"}`, `Version: ${artwork.version}`, "Status: Approved"].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  link.download = `${product.batch}_${type}_approved_artwork_${artwork.version}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  auditPrinterAction(`${artwork.title} Downloaded`, product, `${artwork.version} downloaded from view-only preview.`);
  statusMessage.textContent = `${artwork.title} downloaded for batch ${batchNumber}.`;
}
function getPrintingModuleStatus(type, product) {
  if (type === "label") return labelPrintedBatchNumbers.includes(product.batch) ? "Completed" : "Active";
  const completionLists = {
    label: labelPrintedBatchNumbers,
    leaflet: leafletPrintedBatchNumbers,
    carton: cartonPrintedBatchNumbers,
    braille: braillePrintedBatchNumbers
  };
  if ((completionLists[type] || []).includes(product.batch)) return "Completed";
  const record = getPrintRecord(type, product.batch);
  const hasPrintedItems = Array.isArray(record.itemsPrinted) && record.itemsPrinted.length > 0;
  if (record.savedAt || record.printed || hasPrintedItems) return "In Progress";
  return "Active";
}

function getLabelQueueWorkflowStatus(product) {
  const batchNumber = product.batch;
  const record = labelPrintRecords[batchNumber] || {};
  if (!labelPrintedBatchNumbers.includes(batchNumber)) {
    const hasProgress = record.savedAt || record.printed || (record.itemsPrinted || []).length || Object.keys(record.testPrints || {}).length;
    return hasProgress ? "In Progress" : "Active";
  }
  if (qpCertifiedBatchNumbers.includes(batchNumber)) return "QP Certified";
  if (qpReleasedBatchNumbers.includes(batchNumber)) return "QP Released";
  if (preQpCheckedBatchNumbers.includes(batchNumber)) return "QP Release";
  if (postAssemblyCheckedBatchNumbers.includes(batchNumber)) return "Pre QP";
  if (assembledBatchNumbers.includes(batchNumber)) return "Post Assembly";
  if (productionAllocatedBatchNumbers.includes(batchNumber)) return "Assembly";
  if (preAssemblyCheckedBatchNumbers.includes(batchNumber)) return "Production Controller";
  if (leafletFoldedBatchNumbers.includes(batchNumber)) return "Pre Assembly";
  if (product.leafletRequired && !leafletPrintedBatchNumbers.includes(batchNumber)) return "Leaflet Printing";
  if (product.routeType === "Reboxing" && !cartonPrintedBatchNumbers.includes(batchNumber)) return "Carton Issuing";
  if (product.routeType === "Relabelling" && product.brailleRequired && !braillePrintedBatchNumbers.includes(batchNumber)) return "Braille Printing";
  if (product.leafletRequired) return "Leaflet Folding";
  return "Pre Assembly";
}

function getPrinterStatusClass(status) {
  return String(status || "Active").toLowerCase().replace(/\s+/g, "-");
}

function getPrintingStatusFromListTitle(title, product) {
  if (title === "Leaflet Printing List") return getPrintingModuleStatus("leaflet", product);
  if (title === "Carton Issuing List") return getPrintingModuleStatus("carton", product);
  if (title === "Braille Printing List") return getPrintingModuleStatus("braille", product);
  return getPrintingModuleStatus("label", product);
}

function getPrintingMenuCounts(type, products) {
  return products.reduce((counts, product) => {
    const status = getPrintingModuleStatus(type, product);
    if (status === "Active") counts.active += 1;
    if (status === "In Progress") counts.inProgress += 1;
    return counts;
  }, { active: 0, inProgress: 0 });
}

function renderPrinterMenu() {
  const modules = [
    { title: "Label Printing", type: "label", section: "label-list", products: getLabelPrintingProducts() },
    { title: "Leaflet Printing", type: "leaflet", section: "leaflet-list", products: getLeafletPrintingProducts() },
    { title: "Carton Issuing", type: "carton", section: "carton-list", products: getCartonPrintingProducts() },
    { title: "Braille Printing", type: "braille", section: "braille-list", products: getBraillePrintingProducts() }
  ];
  return `
    <div class="printer-menu-layout">
      <section class="printer-menu-window">
        <div class="printer-menu-title">Printer</div>
        <div class="printer-option-grid">
          ${modules.map((module) => {
            const counts = getPrintingMenuCounts(module.type, module.products);
            return `
              <button class="printer-option classic-button" type="button" data-printer-section="${module.section}">
                <div class="printer-option-header">
                  <strong>${module.title}</strong>
                </div>
                <div class="printer-option-counts">
                  <span class="printer-option-count printer-option-active"><b>${counts.active}</b><em>Active</em></span>
                  <span class="printer-option-count printer-option-progress"><b>${counts.inProgress}</b><em>In Progress</em></span>
                </div>
              </button>`;
          }).join("")}
        </div>
      </section>
    </div>`;
}

function renderPrinterBatchList(title, products, emptyText, rowAction) {
  const filteredProducts = products.filter(
    (product) =>
      matchesBatchOrMfgLot(product, printerSearch)
  );
  return `
    <div class="label-printing-layout">
      <section class="bns-window">
<div class="sub-window-title">${title}</div>
<div class="printer-list-search">
  <label class="classic-search-label">B&S Batch Number : <input class="classic-search-input" data-printer-search value="${printerSearch}" placeholder="Search batch number"></label>
  <label class="classic-search-label">MFG Lot No : <input class="classic-search-input" data-printer-search value="${printerSearch}" placeholder="Search MFG lot"></label>
  <button class="classic-search-button" type="button" data-printer-search-button>Search</button>
</div>
<div class="grid-scroll label-grid-scroll">
  <table class="classic-table product-grid label-product-grid">
    <thead>
      <tr>
<th>B&S Batch Number</th>
<th class="mfg-lot-col">MFG Lot No</th>
<th>Product Name</th>
<th>Strength</th>
<th>Pack Size</th>
<th>ECMA</th>
<th>Expiry Date</th>
<th>Required Qty</th>
<th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${
filteredProducts.length
  ? filteredProducts
      .map(
(product, index) => `
  <tr class="clickable-row printer-queue-${getPrinterStatusClass(getPrintingStatusFromListTitle(title, product))}" ${rowAction}="${product.batch}">
    <td>${product.batch}</td>
    <td class="mfg-lot-col">${getMfgLotNo(product) || "-"}</td>
    <td>${product.product}</td>
    <td>${product.strength}</td>
    <td>${product.packSize}</td>
    <td>${product.ecma}</td>
    <td>${product.expiry}</td>
    <td>${
      title === "Leaflet Printing List"
? product.leafletQuantity
: title === "Carton Issuing List"
  ? product.cartonQuantity || product.quantity
  : title === "Braille Printing List"
    ? product.brailleQuantity || product.quantity
    : product.quantity
    }</td>
    <td><span class="printer-list-status printer-list-status-${getPrinterStatusClass(getPrintingStatusFromListTitle(title, product))}">${getPrintingStatusFromListTitle(title, product)}</span></td>
  </tr>
`
      )
      .join("")
  : `<tr><td colspan="9">${emptyText}</td></tr>`
      }
    </tbody>
  </table>
</div>
      </section>
    </div>
  `;
}

function renderLabelPrintingWork(stage) {
  if (printerSection === "menu") return renderPrinterMenu();
  if (printerSection === "label-list") {
    labelSelectedProduct = null;
    return renderPrinterBatchList("Label Printing List", getLabelPrintingProducts(), "No batches available for Label Printing.", "data-open-label-print");
  }
  if (printerSection === "leaflet-list") {
    leafletSelectedProduct = null;
    return renderPrinterBatchList("Leaflet Printing List", getLeafletPrintingProducts(), "No batches available for Leaflet Printing.", "data-open-leaflet-print");
  }
  if (printerSection === "carton-list") {
    cartonSelectedProduct = null;
    return renderPrinterBatchList("Carton Issuing List", getCartonPrintingProducts(), "No reboxing batches available for Carton Issuing.", "data-open-carton-print");
  }
  if (printerSection === "braille-list") {
    brailleSelectedProduct = null;
    return renderPrinterBatchList("Braille Printing List", getBraillePrintingProducts(), "No relabelling batches available for Braille Printing.", "data-open-braille-print");
  }
  if (printerSection === "leaflet-detail") return renderLeafletPrintingTask(stage);
  if (printerSection === "carton-detail") return renderCartonPrintingTask(stage);
  if (printerSection === "braille-detail") return renderBraillePrintingTask(stage);
  if (!labelSelectedProduct) return renderPrinterMenu();

  const product = labelSelectedProduct;
  const labelRequirements = getLabelRequirements(product);
  let labelRecord = labelPrintRecords[product.batch] || {};
  if (labelPrintedBatchNumbers.includes(product.batch) && !Array.isArray(labelRecord.itemsPrinted)) {
    const historicUser = labelRecord.printedBy || "printer.user";
    const historicTime = labelRecord.printedAt || labelRecord.dateTime || "24 Jun 2026, 10:30:00";
    const historicItems = getLabelRequirements(product).map((item) => item.label);
    labelRecord = {
      ...labelRecord,
      printed: true,
      itemsPrinted: historicItems,
      itemCompletions: Object.fromEntries(historicItems.map((label) => [label, { user: historicUser, dateTime: historicTime, status: "Printed" }]))
    };
    labelPrintRecords[product.batch] = labelRecord;
    persistLabelPrintRecords();
  }
  const savedQuantities = labelRecord.quantities || [];
  const labelRowExtras = labelRecord.rowExtras || {};
  const getPrintQuantity = (item) => {
    const saved = savedQuantities.find((quantity) => quantity.label === item.label);
    return saved ? saved.quantity : item.quantity;
  };

  const hasLabelPrintingStarted = Boolean(
    Object.keys(labelRecord.itemCompletions || {}).length
    || Object.values(labelRecord.itemPrintTotals || {}).some((quantity) => Number(quantity || 0) > 0)
    || (labelRecord.printRuns && Object.keys(labelRecord.printRuns).length)
  );
  const reboxingFormHtml = product.routeType === "Reboxing"
    ? renderChangeOfPackSizeForm(product.batch, hasLabelPrintingStarted || labelRecord.finalized, stage)
    : "";
  const formValidForPrint = isChangeOfPackSizeComplete(product);
  const allLabelsPrinted = labelRequirements.every((item) => isPrintItemDone(labelRecord, item.label));

  return `
    <div class="label-printing-layout label-detail-layout label-reference-layout">
      <section class="label-reference-window">
        <header class="label-reference-header">
          <div><strong>Label Printing - ${product.batch}</strong></div>
          <button class="classic-button" type="button" data-label-back-queue>Back to Batch Queue</button>
        </header>

        <div class="label-reference-grid">
          ${renderPrintingProductSidebar(product)}

          <main class="label-workflow-card">
            ${reboxingFormHtml}
            ${product.routeType === "Reboxing" && !formValidForPrint
              ? '<div class="reboxing-print-gate-message">Complete and sign the Received As and Assembled As sections before printing any labels.</div>'
              : ""}
            <section class="label-workflow-section label-table-section">
              <div class="label-workflow-section-title"><h3>Labels to Print</h3><span>${labelRequirements.filter((item) => isPrintItemDone(labelRecord, item.label)).length}/${labelRequirements.length} completed</span></div>
              <div class="label-reference-table-wrap">
                <table class="classic-table label-requirements-table label-wise-print-table label-reference-table unified-printing-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Reference</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Location</th>
                      <th>In Hand Quantity</th>
                      <th>Print</th>
                      <th>Line Completion</th>
                      <th>Completed By / Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${labelRequirements.map((item) => {
                      const done = isPrintItemDone(labelRecord, item.label);
                      const completion = (labelRecord.itemCompletions || {})[item.label] || {};
                      const remainingQuantity = getPrintItemRemaining(labelRecord, item);
                      return `
                        <tr class="label-print-row ${done ? "label-print-row-complete" : "label-print-row-pending"}">
                          <td><strong>${item.label}</strong></td>
                          <td>${item.reference}</td>
                          <td>${item.size}</td>
                          <td><strong class="required-quantity-text">${getPrintQuantity(item)}</strong></td>
                          <td>${product.location || product.warehouse || "-"}</td>
                          <td>${product.onHandQuantity ?? product.stock ?? product.quantity ?? "0"}</td>
                          <td><button class="classic-button row-print-button primary" type="button" data-unified-print data-preview-type="label" data-preview-batch="${product.batch}" data-preview-item="${item.label}" ${!formValidForPrint ? "disabled" : ""}>Print</button></td>
                          <td><button class="classic-button row-print-button ${done ? "line-done-button" : ""}" type="button" data-mark-print-line-done data-print-line-type="label" data-print-line-batch="${product.batch}" data-print-line-item="${item.label}" ${done || remainingQuantity > 0 ? "disabled" : ""}>${done ? "Done" : "Mark as Done"}</button></td>
                          <td>${completion.user
                            ? `<span class="label-print-audit-cell"><b>${completion.user}</b><small>${completion.dateTime || "-"}</small></span>`
                            : '<span class="label-print-audit-empty">-</span>'}</td>
                        </tr>`;
                    }).join("")}
                  </tbody>
                </table>
              </div>
            </section>

            <footer class="label-workflow-footer">
              <span>Complete all label rows before Print Done.</span>
              <div>
                <button class="classic-button primary" type="button" data-label-batch-print-done="${product.batch}" ${!labelRecord.finalized && allLabelsPrinted ? "" : "disabled"}>${labelRecord.finalized ? "Completed" : "Print Done"}</button>
              </div>
            </footer>
          </main>
        </div>
      </section>
    </div>
  `;
}

function renderLeafletPrintingTask(stage) {
  if (!leafletSelectedProduct) return renderPrinterBatchList("Leaflet Printing List", getLeafletPrintingProducts(), "No batches available for Leaflet Printing.", "data-open-leaflet-print");
  const product = leafletSelectedProduct;
  const leafletRecord = leafletPrintRecords[product.batch] || {};
  const leafletRequirements = getLeafletRequirements(product);
  const savedQuantities = leafletRecord.quantities || [];
  const leafletRowExtras = leafletRecord.rowExtras || {};
  const getLeafletQuantity = (item) => {
    const saved = savedQuantities.find((quantity) => quantity.label === item.label);
    return saved ? saved.quantity : item.quantity;
  };

  const completedCount = leafletRequirements.filter((item) => isPrintItemDone(leafletRecord, item.label)).length;
  return `
    <div class="label-printing-layout label-detail-layout label-reference-layout">
      <section class="label-reference-window">
        <header class="label-reference-header">
          <div><strong>Leaflet Printing - ${product.batch}</strong></div>
          <button class="classic-button" type="button" data-printing-back-queue="leaflet">Back to Batch Queue</button>
        </header>
        <div class="label-reference-grid">
          ${renderPrintingProductSidebar(product)}
          <main class="label-workflow-card">
            <section class="label-workflow-section label-table-section">
              <div class="label-workflow-section-title"><h3>Leaflets to Print</h3><span>${completedCount}/${leafletRequirements.length} completed</span></div>
              <div class="label-reference-table-wrap">
<table class="classic-table label-requirements-table label-wise-print-table label-reference-table leaflet-printing-table unified-leaflet-printing-table">
  <thead>
    <tr>
      <th>Leaflet</th>
      <th>Reference</th>
      <th>Size</th>
      <th>Quantity</th>
      <th>Location</th>
      <th>In Hand Qty</th>
      <th>Print</th>
      <th>Line Completion</th>
      <th>Completed By / Date</th>
    </tr>
  </thead>
  <tbody>
    ${leafletRequirements
      .map(
(item) => `
  <tr class="${isPrintItemDone(leafletRecord, item.label) ? "label-print-row-complete" : "label-print-row-pending"}">
    <td>${item.label}</td>
    <td>${item.reference}</td>
    <td>${item.size}</td>
    <td><span class="leaflet-quantity-text">${getLeafletQuantity(item)}</span></td>
    <td>${product.location || product.warehouse || "-"}</td>
    <td>${getLeafletInHandQuantity(product, leafletRecord, item.label)}</td>
    <td><button class="classic-button row-print-button primary" type="button" data-unified-print data-preview-type="leaflet" data-preview-batch="${product.batch}" data-preview-item="${item.label}">Print</button></td>
    <td><button class="classic-button row-print-button ${isPrintItemDone(leafletRecord, item.label) ? "line-done-button" : ""}" type="button" data-mark-print-line-done data-print-line-type="leaflet" data-print-line-batch="${product.batch}" data-print-line-item="${item.label}" ${isPrintItemDone(leafletRecord, item.label) || !(leafletRecord.actualPrintItems || []).includes(item.label) ? "disabled" : ""}>${isPrintItemDone(leafletRecord, item.label) ? "Done" : "Mark as Done"}</button></td>
    <td>${((leafletRecord.itemCompletions || {})[item.label] || {}).user
      ? `<span class="label-print-audit-cell"><b>${(leafletRecord.itemCompletions || {})[item.label].user}</b><small>${(leafletRecord.itemCompletions || {})[item.label].dateTime || "-"}</small></span>`
      : '<span class="label-print-audit-empty">-</span>'}</td>
  </tr>
`
      )
      .join("")}
  </tbody>
</table>
              </div>
            </section>
            <footer class="label-workflow-footer">
              <span>Complete all leaflet rows before Print Done.</span>
              <div><button class="classic-button primary" type="button" id="leaflet-complete-button" disabled>Print Done</button></div>
            </footer>
          </main>
        </div>
      </section>
    </div>
  `;
}

function renderCartonPrintingTask(stage) {
  const product = cartonSelectedProduct;
  if (!product) return renderPrinterBatchList("Carton Issuing List", getCartonPrintingProducts(), "No reboxing batches available for Carton Issuing.", "data-open-carton-print");
  const record = cartonPrintRecords[product.batch] || {};
  const completion = record.itemCompletions && record.itemCompletions["Issued Carton"] ? record.itemCompletions["Issued Carton"] : null;
  const rowExtra = record.rowExtras && record.rowExtras["Issued Carton"] ? record.rowExtras["Issued Carton"] : {};
  const requiredQty = record.printedQuantity || product.cartonQuantity || product.quantity;
  const confirmedBy = completion ? `${completion.user} - ${completion.dateTime}` : "Pending confirmation";
  const isConfirmed = Boolean(record.printed || completion);

  return `
    <div class="label-printing-layout label-detail-layout label-reference-layout carton-issuing-detail">
      <section class="label-reference-window">
        <header class="label-reference-header">
          <div><strong>Carton Issuing - ${product.batch}</strong></div>
          <button class="classic-button" type="button" data-printing-back-queue="carton">Back to Batch Queue</button>
        </header>
        <div class="label-reference-grid">
          ${renderPrintingProductSidebar(product)}
          <main class="label-workflow-card">
            <section class="label-workflow-section label-table-section">
              <div class="label-workflow-section-title"><h3>Carton to Issue</h3><span>${isConfirmed ? "1/1 completed" : "0/1 completed"}</span></div>
              <div class="label-reference-table-wrap">
<table class="classic-table label-requirements-table carton-issue-table label-reference-table">
  <thead>
    <tr>
      <th>Carton Reference</th>
      <th>Required Qty</th>
      <th>On Hand Quantity</th>
      <th>Extra</th>
      <th>Location Number</th>
      <th>Confirmed By</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr class="${isConfirmed ? "label-print-row-complete" : ""}">
      <td>${product.ecma || product.partNo || "Approved Carton"}</td>
      <td><strong class="required-quantity-text">${requiredQty}</strong></td>
      <td>${product.onHandQuantity ?? product.stock ?? product.quantity ?? "0"}</td>
      <td><button class="classic-button row-print-button" type="button" data-issue-extra-cartons="${product.batch}" ${isConfirmed ? "" : "disabled"}>Issue Extra</button></td>
      <td><span class="carton-readonly-value" data-carton-location>${record.locationNumber || product.warehouse || "-"}</span></td>
      <td><span class="carton-confirmed-by ${isConfirmed ? "confirmed" : "pending"}">${confirmedBy}</span></td>
      <td><button class="classic-button row-print-button primary" type="button" data-print-cartons="${product.batch}" ${isConfirmed ? "disabled" : ""}>Done</button></td>
    </tr>
  </tbody>
</table>
              </div>
            </section>
          </main>
        </div>
      </section>
    </div>
  `;
}

function renderBraillePrintingTask(stage) {
  if (!brailleSelectedProduct) return renderPrinterBatchList("Braille Printing List", getBraillePrintingProducts(), "No relabelling batches available for Braille Printing.", "data-open-braille-print");
  const product = brailleSelectedProduct;
  const brailleRecord = braillePrintRecords[product.batch] || {};
  const brailleRequirements = getBrailleRequirements(product);
  const savedQuantities = brailleRecord.quantities || [];
  const brailleRowExtras = brailleRecord.rowExtras || {};
  const getBrailleQuantity = (item) => {
    const saved = savedQuantities.find((quantity) => quantity.label === item.label);
    return saved ? saved.quantity : item.quantity;
  };

  const completedCount = brailleRequirements.filter((item) => isPrintItemDone(brailleRecord, item.label)).length;
  return `
    <div class="label-printing-layout label-detail-layout label-reference-layout">
      <section class="label-reference-window">
        <header class="label-reference-header">
          <div><strong>Braille Printing - ${product.batch}</strong></div>
          <button class="classic-button" type="button" data-printing-back-queue="braille">Back to Batch Queue</button>
        </header>
        <div class="label-reference-grid">
          ${renderPrintingProductSidebar(product)}
          <main class="label-workflow-card">
            <section class="label-workflow-section label-table-section">
              <div class="label-workflow-section-title"><h3>Braille Labels to Print</h3><span>${completedCount}/${brailleRequirements.length} completed</span></div>
              <div class="label-reference-table-wrap">
<table class="classic-table label-requirements-table label-wise-print-table label-reference-table unified-printing-table">
  <thead>
    <tr>
      <th>Braille Label</th>
      <th>Reference</th>
      <th>Size</th>
      <th>Quantity</th>
      <th>Location</th>
      <th>In Hand Quantity</th>
      <th>Print</th>
      <th>Line Completion</th>
      <th>Completed By / Date</th>
    </tr>
  </thead>
  <tbody>
    ${brailleRequirements
      .map(
(item) => `
  <tr class="${isPrintItemDone(brailleRecord, item.label) ? "label-print-row-complete" : "label-print-row-pending"}">
    <td>${item.label}</td>
    <td>${item.reference}</td>
    <td>${item.size}</td>
    <td><strong class="required-quantity-text">${getBrailleQuantity(item)}</strong></td>
    <td>${product.location || product.warehouse || "-"}</td>
    <td>${product.onHandQuantity ?? product.stock ?? product.quantity ?? "0"}</td>
    <td><button class="classic-button row-print-button primary" type="button" data-unified-print data-preview-type="braille" data-preview-batch="${product.batch}" data-preview-item="${item.label}">Print</button></td>
    <td><button class="classic-button row-print-button ${isPrintItemDone(brailleRecord, item.label) ? "line-done-button" : ""}" type="button" data-mark-print-line-done data-print-line-type="braille" data-print-line-batch="${product.batch}" data-print-line-item="${item.label}" ${isPrintItemDone(brailleRecord, item.label) || getPrintItemRemaining(brailleRecord, item) > 0 ? "disabled" : ""}>${isPrintItemDone(brailleRecord, item.label) ? "Done" : "Mark as Done"}</button></td>
    <td>${((brailleRecord.itemCompletions || {})[item.label] || {}).user
      ? `<span class="label-print-audit-cell"><b>${(brailleRecord.itemCompletions || {})[item.label].user}</b><small>${(brailleRecord.itemCompletions || {})[item.label].dateTime || "-"}</small></span>`
      : '<span class="label-print-audit-empty">-</span>'}</td>
  </tr>
`
      )
      .join("")}
  </tbody>
</table>
              </div>
            </section>
            <footer class="label-workflow-footer">
              <span>Complete all braille rows before Print Done.</span>
              <div><button class="classic-button primary" type="button" id="braille-complete-button" disabled>Print Done</button></div>
            </footer>
          </main>
        </div>
      </section>
    </div>
  `;
}

function renderStage(stageId) {
  const stage = findStage(stageId);
  currentStageId = stage.id;
  welcomeWindow.classList.add("hidden");
  dashboardWindow.classList.add("hidden");
  moduleWindow.classList.remove("hidden");
  moduleWindow.classList.toggle("packing-list-mode", stage.id === "packing-list");
  moduleWindow.classList.toggle("rp-pack-mode", stage.id === "rp-pack");
  moduleWindow.classList.toggle("goods-summary-mode", stage.id === "goods-in-summary");
  moduleWindow.classList.toggle("batch-checker-mode", stage.id === "batch-checker");
  moduleWindow.classList.toggle("bar-creation-mode", stage.id === "bar-creation");
  moduleWindow.classList.toggle("label-printing-mode", stage.id === "label-printing");
  moduleWindow.classList.toggle("leaflet-folding-mode", stage.id === "leaflet-folding");
  moduleWindow.classList.toggle("double-check-mode", stage.id === "pre-assembly-qc");
  moduleWindow.classList.toggle("production-mode", stage.id === "room-allocation");
  moduleWindow.classList.toggle("assembly-mode", stage.id === "assembly-room");
  moduleWindow.classList.toggle("postassembly-mode", stage.id === "post-assembly-qc");
  moduleWindow.classList.toggle("preqp-mode", stage.id === "pre-qp");
  moduleWindow.classList.toggle("release-log-sheet-mode", stage.id === "release-log");
  moduleWindow.classList.toggle("qp-release-mode", ["qp-release", "qp-certified", "batch-record"].includes(stage.id));
  statusMessage.textContent =
    stage.id === "batch-record"
      ? "Batch Record opened — approved electronic batch records"
      : stage.id === "packing-list"
      ? `Packing List opened as ${currentLogin ? currentLogin.user : stage.user}`
      : stage.id === "rp-pack"
      ? `${rpiModuleView === "pack-creation" ? "RPi Pack Creation" : "RPi Approval"} opened as ${currentLogin ? currentLogin.user : stage.user}`
      : stage.id === "goods-in-summary"
      ? `Goods-in Summary opened as ${currentLogin ? currentLogin.user : stage.user}`
      : stage.id === "batch-checker"
      ? `Batch Checker opened as ${currentLogin ? currentLogin.user : stage.user}`
      : stage.id === "bar-creation"
      ? `BNS Batch Add opened as ${currentLogin ? currentLogin.user : stage.user}`
      : stage.id === "pre-assembly-qc"
? `Pre Assembly opened as ${currentLogin ? currentLogin.user : stage.user}`
: stage.id === "room-allocation"
  ? `Production Controller opened as ${currentLogin ? currentLogin.user : stage.user}`
: stage.id === "assembly-room"
  ? `Assembly Room opened as ${currentLogin ? currentLogin.user : stage.user}`
: stage.id === "post-assembly-qc"
  ? `Post Assembly opened as ${currentLogin ? currentLogin.user : stage.user}`
: stage.id === "pre-qp"
  ? `Pre QP opened as ${currentLogin ? currentLogin.user : stage.user}`
: stage.id === "release-log"
  ? `Release Log Sheet opened as ${currentLogin ? currentLogin.user : stage.user}`
: stage.id === "qp-release"
  ? `QP Release opened as ${currentLogin ? currentLogin.user : stage.user}`
: stage.id === "qp-certified"
  ? `QP Certified Batches opened as ${currentLogin ? currentLogin.user : stage.user}`
: `Printer opened as ${currentLogin ? currentLogin.user : stage.user}`;

  document.querySelector("#module-window-title").textContent =
    stage.id === "label-printing" || stage.id === "leaflet-folding"
      ? ""
    : stage.id === "packing-list"
      ? "Packing List"
      : stage.id === "rp-pack"
      ? (rpiModuleView === "pack-creation" ? "RPi Pack Creation" : "RPi Approval")
      : stage.id === "goods-in-summary"
      ? "Goods-in Summary"
      : stage.id === "batch-checker"
      ? "Batch Check"
      : stage.id === "bar-creation"
      ? "BNS Batch Add"
      : stage.id === "pre-assembly-qc"
  ? "Pre Assembly"
: stage.id === "room-allocation"
  ? "Production Controller"
: stage.id === "assembly-room"
  ? "Assembly Room"
: stage.id === "post-assembly-qc"
  ? "Post Assembly"
: stage.id === "pre-qp"
  ? "Pre QP"
: stage.id === "release-log"
  ? "Release Log Sheet"
: stage.id === "qp-release"
  ? "QP Release"
: stage.id === "qp-certified"
  ? "QP Certified Batches"
: stage.id === "batch-record"
  ? "Batch Record"
: `${stage.loginTitle} - ${stage.title}`;
  document.querySelector("#stage-code").textContent = `${stage.code} | ${stage.owner}`;
  document.querySelector("#stage-title").textContent = stage.title;
  document.querySelector("#login-context").textContent = `Logged in: ${currentLogin ? currentLogin.user : stage.user} | Role: ${currentLogin ? currentLogin.role : stage.role}`;
  const batchValues = document.querySelectorAll(".batch-strip strong");
  if (batchValues.length >= 4) {
    batchValues[0].textContent = stage.id === "bar-creation" ? "Pending creation" : "03A1582";
    batchValues[1].textContent = "Flutiform 250/10mcg";
    batchValues[2].textContent = "03A1582";
    batchValues[3].textContent = "650";
  }
  document.querySelector("#checks-progress").textContent = `${stage.progress[0]}%`;
  document.querySelector("#evidence-progress").textContent = `${stage.progress[1]}%`;
  document.querySelector("#checks-bar").style.width = `${stage.progress[0]}%`;
  document.querySelector("#evidence-bar").style.width = `${stage.progress[1]}%`;
  document.querySelector("#exception-title").textContent = stage.status === "hold" ? "Active hold requires resolution" : "No active exception";
  document.querySelector("#exception-copy").textContent =
    stage.status === "hold"
      ? "The batch cannot move forward until the recorded mismatch or missing evidence is closed."
      : "Mismatches, missing evidence, or failed checks are held here until resolved.";

  document.querySelector("#stage-work-content").innerHTML =
    stage.id === "batch-record"
      ? renderBatchRecordModule()
      : stage.id === "packing-list"
      ? renderPackingListWork(stage)
      : stage.id === "rp-pack"
      ? renderRpiModule(stage)
      : stage.id === "goods-in-summary"
      ? renderGoodsInSummaryWork(stage)
      : stage.id === "batch-checker"
      ? renderBatchCheckerWork(stage)
      : stage.id === "bar-creation"
      ? renderBarCreationWork(stage)
      : stage.id === "label-printing"
? renderLabelPrintingWork(stage)
: stage.id === "leaflet-folding"
  ? renderLeafletFoldingWork(stage)
  : stage.id === "pre-assembly-qc"
    ? renderPreAssemblyWork(stage)
  : stage.id === "room-allocation"
    ? renderProductionControlWork(stage)
  : stage.id === "assembly-room"
    ? renderAssemblyRoomWork(stage)
  : stage.id === "post-assembly-qc"
    ? renderPostAssemblyWork(stage)
  : stage.id === "pre-qp"
    ? renderPreQpWork(stage)
  : stage.id === "release-log"
    ? renderReleaseLogSheetWork(stage)
  : stage.id === "qp-release" || stage.id === "qp-certified"
    ? renderQpReleaseWork(stage)
  : renderGenericStageWork(stage);
  updateSignoffAvailability();
  updatePackingListAvailability();
  updateRpApprovalAvailability();
  updateBatchCheckerAvailability();
  updateLabelCompletionAvailability();
  updateLeafletCompletionAvailability();
  updateCartonCompletionAvailability();
  updateBrailleCompletionAvailability();
  updateLeafletFoldingAvailability();
  updatePreAssemblyAvailability();
  updateProductionAvailability();
  updateAssemblyAvailability();
  updatePostAssemblyAvailability();
  updatePreQpAvailability();
  updateQpReleaseAvailability();

  document.querySelector("#stage-evidence").innerHTML = stage.evidence
    .map(
      (item) => `
<div class="evidence-tile">
  <strong>${item}</strong>
  <span>Required for ${stage.title}</span>
  <div class="upload-box">Upload / Attach Evidence</div>
</div>
      `
    )
    .join("");

  document.querySelector("#phase-controls").innerHTML = stage.controls.map((control) => `<li>${control}</li>`).join("");

  const queueRows =
    stage.id === "bar-creation"
      ? [
  ["Ready to create", "Flutiform 250/10mcg", "Selected row"],
  ["Not Printed BAR", "ADARTEL 0.25mg", "Search result"],
  ["Not Printed BAR", "ADARTREL 2mg", "Search result"]
]
      : [
  ["03A1582", "Flutiform 250/10mcg", "Created in BAR Creation"],
  ["BAR-240621", "Omeprazole 10mg", "Hold"],
  ["BAR-240627", "Metformin 500mg", "Routine"]
];

  document.querySelector("#module-queue").innerHTML = queueRows
    .map(
      ([bar, product, due]) => `
<div class="queue-card">
  <strong>${bar}</strong>
  <span>${product}</span>
  <span>${stage.title} | ${due}</span>
</div>
      `
    )
    .join("");

  document.querySelector("#audit-list").innerHTML = [
    ["Module login", `${currentLogin ? currentLogin.user : stage.user} authenticated for ${stage.title}`, "Today 09:08"],
    ["Batch opened", `${stage.owner} opened 03A1582`, "Today 09:12"],
    ["Checklist updated", "Line clearance and product checks saved", "Today 09:28"],
    ["Evidence attached", `${stage.evidence[0]} added to batch pack`, "Today 09:41"],
    ["Draft saved", "Electronic record version 3 saved", "Today 10:05"]
  ]
    .map(
      ([title, body, time]) => `
<li>
  <strong>${title}</strong>
  ${body}
  <span>${time}</span>
</li>
      `
    )
    .join("");

  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === "checks");
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === "checks-panel");
  });
}

document.addEventListener("keydown", (event) => {
  if (!event.target.matches("[data-release-log-scan]") || event.key !== "Enter") return;
  event.preventDefault();
  const scanValue = event.target.value.trim().toLowerCase();
  const product = getReleaseLogSheetProducts().find((item) =>
    [item.batch, item.partNo, item.pl, item.barcode].some((value) => String(value || "").trim().toLowerCase() === scanValue)
  );
  if (!product) {
    statusMessage.textContent = `No completed Pre-QP batch found for barcode ${event.target.value.trim()}.`;
    return;
  }
  if (!preQpReleaseLogSelection.includes(product.batch)) preQpReleaseLogSelection.push(product.batch);
  renderStage("release-log");
  statusMessage.textContent = `Batch ${product.batch} selected by barcode scan.`;
});

document.addEventListener("click", (event) => {
  const preQpMaterialRow = event.target.closest("[data-preqp-material-row]");
  if (preQpMaterialRow && !event.target.closest(".compact-tick")) {
    const checkbox = preQpMaterialRow.querySelector("[data-preqp-material-check]");
    if (checkbox && !checkbox.disabled) {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return;
  }
  const preAssemblyConfirmRow = event.target.closest(".preassembly-material-table tbody tr");
  if (preAssemblyConfirmRow && !event.target.matches("[data-preassembly-material]")) {
    const checkbox = preAssemblyConfirmRow.querySelector("[data-preassembly-material]");
    if (checkbox && !checkbox.disabled) {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return;
  }
  const psSignBtn = event.target.closest("[data-ps-sign]");
  if (psSignBtn) {
    const batch = psSignBtn.dataset.psBatch;
    const section = psSignBtn.dataset.psSign;
    const user = currentLogin ? currentLogin.user : (currentStageId === "pre-assembly-qc" ? "preassembly.qc" : "printer.user");
    const now = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    
    if (changeOfPackSizeData[batch]) {
      if (section === "receivedAs" || section === "assembledAs") {
changeOfPackSizeData[batch][section].initials = `Signed by ${user} on ${now}`;
      } else {
changeOfPackSizeData[batch][section + "Initials"] = `Signed by ${user} on ${now}`;
      }
      persistChangeOfPackSizeData();
      
      renderStage(currentStageId);
      updateLabelCompletionAvailability();
      updatePreAssemblyAvailability();
    }
    return;
  }

  const psClearSigBtn = event.target.closest("[data-ps-clear-sig]");
  if (psClearSigBtn) {
    const batch = psClearSigBtn.dataset.psBatch;
    const section = psClearSigBtn.dataset.psClearSig;
    
    if (changeOfPackSizeData[batch]) {
      if (section === "receivedAs" || section === "assembledAs") {
changeOfPackSizeData[batch][section].initials = "";
      } else {
changeOfPackSizeData[batch][section + "Initials"] = "";
      }
      persistChangeOfPackSizeData();
      
      renderStage(currentStageId);
      updateLabelCompletionAvailability();
      updatePreAssemblyAvailability();
    }
    return;
  }

  const loginTrigger = event.target.closest("[data-login-stage]");
  if (loginTrigger) {
    const targetStage = loginTrigger.dataset.loginStage;
    if (targetStage === "rp-pack") {
      rpiModuleView = loginTrigger.dataset.rpiEntry === "pack-creation" ? "pack-creation" : "tasks";
      selectedRpPackPo = null;
      selectedRpApprovalPo = null;
    }
    if (isAuthenticated) {
      if (targetStage === "label-printing") {
        printerSection = "menu";
        labelSelectedProduct = null;
        leafletSelectedProduct = null;
        cartonSelectedProduct = null;
        brailleSelectedProduct = null;
      }
      renderStage(targetStage);
      if (targetStage === "rp-pack" && rpiModuleView === "pack-creation") setTimeout(updateRpDocumentsAvailability, 0);
      return;
    }
    openInitialLogin();
    return;
  }

  if (event.target.closest("[data-goods-summary-search-button]")) {
    const input = document.querySelector("[data-goods-summary-search]");
    goodsInSummarySearch = input ? input.value.trim() : "";
    selectedGoodsInSummaryPo = null;
    renderStage("goods-in-summary");
    statusMessage.textContent = goodsInSummarySearch ? `Goods-in Summary filtered by ${goodsInSummarySearch}.` : "Goods-in Summary search cleared.";
    return;
  }

  if (event.target.closest("[data-goods-summary-clear]")) {
    goodsInSummarySearch = "";
    selectedGoodsInSummaryPo = null;
    renderStage("goods-in-summary");
    statusMessage.textContent = "Goods-in Summary search cleared.";
    return;
  }

  const goodsSummaryOpen = event.target.closest("[data-goods-summary-open]");
  if (goodsSummaryOpen) {
    selectedGoodsInSummaryPo = goodsSummaryOpen.dataset.goodsSummaryOpen;
    renderStage("goods-in-summary");
    statusMessage.textContent = `Goods-in Summary opened for ${selectedGoodsInSummaryPo}.`;
    return;
  }

  if (event.target.closest("[data-goods-summary-back]")) {
    selectedGoodsInSummaryPo = null;
    renderStage("goods-in-summary");
    statusMessage.textContent = "Goods-in Summary PO list opened.";
    return;
  }

  const goodsSummaryPdf = event.target.closest("[data-goods-summary-pdf]");
  if (goodsSummaryPdf) {
    if (openGoodsInSummaryPdf(goodsSummaryPdf.dataset.goodsSummaryPdf)) statusMessage.textContent = "Goods-in Summary PDF preview opened.";
    return;
  }

  if (event.target.closest("[data-close-goods-summary-pdf]") || event.target.id === "goods-summary-pdf-modal") {
    document.querySelector("#goods-summary-pdf-modal")?.remove();
    statusMessage.textContent = "Goods-in Summary PDF preview closed.";
    return;
  }

  if (event.target.closest("[data-open-dashboard]")) {
    openDashboard();
    return;
  }

  if (event.target.closest("[data-close-login]")) {
    closeLogin();
    return;
  }

  if (event.target.closest("[data-close-dashboard]")) {
    dashboardWindow.classList.add("hidden");
    welcomeWindow.classList.remove("hidden");
    statusMessage.textContent = "BAR Dashboard closed";
    return;
  }

  if (event.target.closest("#user-signoff-button")) {
    requestUserSignoff(confirmSignoff, "BNS Batch Add");
    return;
  }

  if (event.target.closest("[data-signoff-no]")) {
    closeSignoffDialog();
    return;
  }

  if (event.target.closest("[data-app-confirm-no]")) {
    closeAppConfirm();
    return;
  }

  if (event.target.closest("[data-bns-create-selected]")) {
    openSelectedBnsBarDialog();
    return;
  }

  if (event.target.closest("[data-bns-print-batch-details]")) {
    openBnsBatchDetailsPreview();
    return;
  }

  const createBarTrigger = event.target.closest("[data-create-bar]");
  if (createBarTrigger) {
    openCreateBarDialog(createBarTrigger.dataset.createBar);
    return;
  }
  const unifiedPrintTrigger = event.target.closest("[data-unified-print]");
  if (unifiedPrintTrigger) {
    const printType = unifiedPrintTrigger.dataset.previewType;
    const printBatch = unifiedPrintTrigger.dataset.previewBatch;
    const printProduct = getPrintProduct(printType, printBatch);
    if (printType === "label" && printProduct?.routeType === "Reboxing" && !isChangeOfPackSizeComplete(printProduct)) {
      statusMessage.textContent = "Complete and sign the Received As and Assembled As sections before printing any labels.";
      return;
    }
    openUnifiedPrintDialog(unifiedPrintTrigger.dataset.previewType, unifiedPrintTrigger.dataset.previewBatch, unifiedPrintTrigger.dataset.previewItem);
    return;
  }

  const testPreviewTrigger = event.target.closest("[data-test-preview-print]");
  if (testPreviewTrigger) {
    openPrintPreview(testPreviewTrigger.dataset.previewType, testPreviewTrigger.dataset.previewBatch, testPreviewTrigger.dataset.previewItem, true);
    return;
  }

  const printRunTrigger = event.target.closest("[data-print-run]");
  if (printRunTrigger) {
    openQuantityPrintDialog(printRunTrigger.dataset.previewType, printRunTrigger.dataset.previewBatch, printRunTrigger.dataset.previewItem, false);
    return;
  }

  const printExtraTrigger = event.target.closest("[data-print-extra]");
  if (printExtraTrigger) {
    openQuantityPrintDialog(printExtraTrigger.dataset.previewType, printExtraTrigger.dataset.previewBatch, printExtraTrigger.dataset.previewItem, true);
    return;
  }

  const markPrintLineDoneTrigger = event.target.closest("[data-mark-print-line-done]");
  if (markPrintLineDoneTrigger) {
    markPrintLineDone(
      markPrintLineDoneTrigger.dataset.printLineType,
      markPrintLineDoneTrigger.dataset.printLineBatch,
      markPrintLineDoneTrigger.dataset.printLineItem
    );
    return;
  }

  if (event.target.closest("[data-close-print-preview]")) {
    closePrintPreview();
    return;
  }

  if (event.target.id === "preview-print-button" || event.target.closest("#preview-print-button")) {
    if (printPreviewRequest?.workflowMode === "unified-print") confirmUnifiedPrint();
    else if (printPreviewRequest && printPreviewRequest.workflowMode) confirmQuantityPrint();
    else confirmPreviewPrint();
    return;
  }

  if (event.target.id === "batch-details-print-button" || event.target.closest("#batch-details-print-button")) {
    printBnsBatchDetails();
    return;
  }

  if (event.target.id === "generated-bar-print-button" || event.target.closest("#generated-bar-print-button")) {
    printGeneratedBarRecord();
    return;
  }

  if (event.target.id === "continuation-page-print-button" || event.target.closest("#continuation-page-print-button")) {
    confirmContinuationPagePrint();
    return;
  }

  const generatedBarPrintTrigger = event.target.closest("[data-print-generated-bar]");
  if (generatedBarPrintTrigger) {
    const batchNumber = generatedBarPrintTrigger.dataset.printGeneratedBar;
    syncWorkflowClearanceForBar(batchNumber);
    openGeneratedBarPreview(batchNumber, true);
    return;
  }

  const generatedBarViewTrigger = event.target.closest("[data-view-generated-bar]");
  if (generatedBarViewTrigger) {
    captureBnsLineClearance(false);
    openGeneratedBarPreview(generatedBarViewTrigger.dataset.viewGeneratedBar, false);
    return;
  }

  if (event.target.id === "confirm-carton-extra-button" || event.target.closest("#confirm-carton-extra-button")) {
    confirmCartonExtraIssue();
    return;
  }

  // Batch Checker Row selection
  const batchOpenPo = event.target.closest("[data-batchchecker-open-po]");
  if (batchOpenPo) {
    batchCheckerSelectedPo = batchOpenPo.dataset.batchcheckerOpenPo;
    batchCheckerSearch = batchCheckerSelectedPo;
    batchCheckerDashboardOpen = false;
    selectedBatchCheckerRowKey = null;
    renderStage("batch-checker");
    statusMessage.textContent = `Batch Checker dashboard opened for PO ${batchCheckerSelectedPo}.`;
    return;
  }

  if (event.target.closest("[data-batchchecker-back-list]")) {
    batchCheckerDashboardOpen = true;
    batchCheckerSelectedPo = "";
    batchCheckerSearch = "";
    selectedBatchCheckerRowKey = null;
    renderStage("batch-checker");
    return;
  }

  if (event.target.closest("[data-batchchecker-back-dashboard]")) {
    selectedBatchCheckerRowKey = null;
    renderStage("batch-checker");
    return;
  }

  const batchOpenLine = event.target.closest("[data-batchchecker-open-line]");
  if (batchOpenLine) {
    selectedBatchCheckerRowKey = Number(batchOpenLine.dataset.batchcheckerOpenLine);
    renderStage("batch-checker");
    return;
  }

  if (event.target.closest("#batchchecker-detail-print-label")) {
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    const rowKey = row ? getBatchCheckerRowKey(row) : "";
    if (row && batchCheckerVerifiedRows[rowKey]) {
      if (openBatchCheckerReprintReason("label", row)) return;
      const record = markBatchCheckerLabelPrinted(row, "Goods In Label");
      renderStage("batch-checker");
      statusMessage.textContent = `Goods In Label printed for ${row.batchNo} by ${record.user} at ${record.dateTime}.`;
    } else {
      statusMessage.textContent = "Verify the selected line before printing its label.";
    }
    return;
  }
  const checkerRow = event.target.closest("[data-batchchecker-row-index]");
  if (checkerRow && !event.target.closest("button") && !event.target.closest("input") && !event.target.closest(".manufacturer-cell")) {
    const idx = Number(checkerRow.dataset.batchcheckerRowIndex);
    selectedBatchCheckerRowKey = idx;
    
    // Auto-check the checkbox of the clicked row
    const rows = getBatchCheckerRows();
    const row = rows[idx];
    const rowKey = `${row.orderNo}_${row.batchNo}`;
    batchCheckerCheckedRows[rowKey] = true;
    
    const chkInput = checkerRow.querySelector("input[type='checkbox']");
    if (chkInput) chkInput.checked = true;
    
    const currentPoRowKeys = rows.map(r => `${r.orderNo}_${r.batchNo}`);
    const totalChecked = Object.keys(batchCheckerCheckedRows).filter(k => batchCheckerCheckedRows[k] && currentPoRowKeys.includes(k)).length;
    const totalScanEl = document.querySelector("#batchchecker-total-scan");
    if (totalScanEl) totalScanEl.textContent = totalChecked;
    
    document.querySelectorAll(".batchchecker-table tbody tr").forEach((tr, trIdx) => {
      tr.classList.toggle("selected-row", trIdx === selectedBatchCheckerRowKey);
    });
    updateBatchCheckerAvailability();
    return;
  }

  // Batch Checker Checkbox selection
  const checkerSelect = event.target.closest("[data-batchchecker-row-select]");
  if (checkerSelect) {
    const idx = Number(checkerSelect.dataset.batchcheckerRowSelect);
    const rows = getBatchCheckerRows();
    const row = rows[idx];
    const rowKey = `${row.orderNo}_${row.batchNo}`;
    batchCheckerCheckedRows[rowKey] = checkerSelect.checked;
    const currentPoRowKeys = rows.map(r => `${r.orderNo}_${r.batchNo}`);
    const totalChecked = Object.keys(batchCheckerCheckedRows).filter(k => batchCheckerCheckedRows[k] && currentPoRowKeys.includes(k)).length;
    document.querySelector("#batchchecker-total-scan").textContent = totalChecked;
    selectedBatchCheckerRowKey = idx;
    document.querySelectorAll(".batchchecker-table tbody tr").forEach((tr, wIdx) => {
      tr.classList.toggle("selected-row", wIdx === selectedBatchCheckerRowKey);
    });
    updateBatchCheckerAvailability();
    return;
  }

  // Batch Checker Search
  if (event.target.closest("[data-batchchecker-search-btn]")) {
    const scanInput = document.querySelector("[data-batchchecker-scan-input]");
    if (scanInput) {
      batchCheckerSearch = scanInput.value;
    }
    selectedBatchCheckerRowKey = null; // Reset selection on new search to avoid out-of-bounds
    renderStage("batch-checker");
    statusMessage.textContent = "Batch Checker search results loaded.";
    return;
  }
  // Batch Checker Clear Scan
  if (event.target.closest("[data-batchchecker-clear-scan]")) {
    batchCheckerCheckedRows = {};
    batchCheckerSearch = "";
    batchCheckerFilters = { supplier: "", contract: "", product: "", invoice: "", po: "", site: "", status: "", mfgLot: "", country: "" };
    renderStage("batch-checker");
    statusMessage.textContent = "Scans cleared.";
    return;
  }
  // Batch Checker Manufacturer select popup open
  const mfgClick = event.target.closest("[data-batchchecker-mfg-click]");
  if (mfgClick) {
    selectedBatchCheckerRowIndexForPopup = Number(mfgClick.dataset.batchcheckerMfgClick);
    openMfgPopup();
    return;
  }

  // Manufacturer select confirm
  if (event.target.closest("#mfg-popup-select-btn")) {
    const selectedRadio = document.querySelector("input[name='mfg-select-radio']:checked");
    if (selectedRadio && selectedBatchCheckerRowIndexForPopup !== null) {
      const mfgIdx = Number(selectedRadio.value);
      const mfg = batchCheckerMfgList[mfgIdx];
      const rows = getBatchCheckerRows();
      const row = rows[selectedBatchCheckerRowIndexForPopup];
      row.manufacturer = mfg.name;
      row.mfgId = "30" + (mfgIdx + 1);
      document.querySelector("#mfg-popup-modal").classList.add("hidden");
      renderStage("batch-checker");
      statusMessage.textContent = `Manufacturer set to ${mfg.name} for row. Product Verification and PCL status were preserved.`;
    }
    return;
  }

  // Manufacturer popup close
  if (event.target.closest("[data-close-mfg-popup]")) {
    document.querySelector("#mfg-popup-modal").classList.add("hidden");
    return;
  }

  // Split Batch popup open
  const splitClick = event.target.closest("[data-batchchecker-split]");
  if (splitClick) {
    const idx = Number(splitClick.dataset.batchcheckerSplit);
    openSplitBatchPopup(idx);
    return;
  }

  // Split Batch save
  if (event.target.closest("#split-batch-save-btn")) {
    const batchNo = document.querySelector("#split-batch-no").value.trim();
    const qtyValue = document.querySelector("#split-qty").value;
    const expiryDate = document.querySelector("#split-exp").value.trim();

    if (batchNo && qtyValue && expiryDate && selectedBatchCheckerRowIndexForSplit !== null) {
      const rows = getBatchCheckerRows();
      const originalRow = rows[selectedBatchCheckerRowIndexForSplit];
      const originalQty = Number(originalRow?.qty || 0);
      const splitQty = Number(qtyValue);
      if (!originalRow || splitQty <= 0 || splitQty >= originalQty) {
        alert(`Split quantity must be greater than 0 and less than the original quantity (${originalQty}).`);
        return;
      }
      if (rows.some((row) => row !== originalRow && row.batchNo === batchNo)) {
        alert("Enter a new Batch No for the split line.");
        return;
      }

      const originalBoxes = Number(originalRow.boxes || 0);
      const splitBoxes = originalBoxes > 1 ? Math.max(1, Math.round(originalBoxes * (splitQty / originalQty))) : originalBoxes;
      const remainingBoxes = Math.max(0, originalBoxes - splitBoxes);
      const resetFromPrintedPcl = resetBatchCheckerPclAfterEdit(originalRow);
      const splitRow = {
        ...originalRow,
        batchNo,
        mfgLotNo: batchNo,
        manufLotNo: batchNo,
        qty: String(splitQty),
        boxes: String(splitBoxes),
        expiryDate,
        printType: "",
        status: "Awaiting Batch Check",
        batchChecker: "",
        checker: "",
        batchCheckDate: "",
        labelPrinted: false,
        labelPrintedAt: "",
        comments: `Split from batch ${originalRow.batchNo}`
      };

      originalRow.qty = String(originalQty - splitQty);
      originalRow.boxes = String(remainingBoxes);
      const sourceIndex = batchCheckerDb.indexOf(originalRow);
      if (sourceIndex >= 0) batchCheckerDb.splice(sourceIndex + 1, 0, splitRow);
      else batchCheckerDb.push(splitRow);

      selectedBatchCheckerRowKey = null;
      document.querySelector("#split-batch-modal").classList.add("hidden");
      renderStage("batch-checker");
      statusMessage.textContent = `Batch ${originalRow.batchNo} split successfully. New batch ${batchNo} created with quantity ${splitQty}; remaining quantity is ${originalRow.qty}.${resetFromPrintedPcl ? " Product Verification and PCL status were reset for both affected lines." : " Both affected lines require Product Verification before PCL printing."}`;
    } else {
      alert("Enter the new Batch No, split Quantity, and Expiry Date.");
    }
    return;
  }
  // Split Batch close
  if (event.target.closest("[data-close-split-batch]")) {
    document.querySelector("#split-batch-modal").classList.add("hidden");
    return;
  }

  // Batch Check popup open
  if (event.target.closest("#batchchecker-btn-check")) {
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    if (row) {
      if (!row.manufacturer || row.mfgId === "0") {
        showSystemMessage("Batch Check", "Please select manufacturer.", "Select a manufacturer before opening Batch Check.");
        return;
      }
      batchCheckerCheckedRows[getBatchCheckerRowKey(row)] = true;
      openBatchCheckVerifyPopup();
    } else {
      statusMessage.textContent = "Select a product line from the table before starting Batch Check.";
    }
    return;
  }

  // Batch Check confirm
  if (event.target.closest("#batch-check-confirm-btn")) {
    const nowDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const nowTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const user = currentLogin ? currentLogin.user : "checker.user";
    
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    if (!row) {
      statusMessage.textContent = "Select a product line before saving Batch Check.";
      return;
    }
    const rowKey = getBatchCheckerRowKey(row);
    batchCheckerCheckedRows[rowKey] = true;
    batchCheckerVerifiedRows[rowKey] = { checker: user, date: nowDate, time: nowTime };
    row.status = "BatchCheck";
    
    document.querySelector("#batch-check-verify-modal").classList.add("hidden");
    renderStage("batch-checker");
    const completedChecks = getBatchCheckerLineChecks(row).filter(Boolean).length;
    statusMessage.textContent = `Batch Check saved by ${user}: ${completedChecks}/${getBatchCheckerLineChecks(row).length} items checked. The PCL preview will preserve the unchecked items.`;
    return;
  }

  // Batch Check verify close
  if (event.target.closest("[data-close-batch-check-verify]")) {
    document.querySelector("#batch-check-verify-modal").classList.add("hidden");
    return;
  }

  // Generate or reprint the standard PCL / cold-chain continuation.
  if (event.target.closest("#batchchecker-generate-pcl") || event.target.closest("#batchchecker-generate-pcl-cold")) {
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    const isColdContinuation = Boolean(event.target.closest("#batchchecker-generate-pcl-cold"));
    const printMode = isColdContinuation ? "cold-continuation" : "standard";
    const action = isColdContinuation ? "pcl-cold" : "pcl";
    if (!row) {
      statusMessage.textContent = "Select a product line before opening the PCL preview.";
      return;
    }
    const rowKey = getBatchCheckerRowKey(row);
    if (!hasBatchCheckerSavedVerification(row)) {
      statusMessage.textContent = "Save Product Verification through Save Batch Check before opening the PCL preview.";
      updateBatchCheckerAvailability();
      return;
    }
    if (openBatchCheckerReprintReason(action, row, printMode)) return;
    batchCheckerActivePclReprintReason = "";
    openGeneratePclPopup(printMode);
    return;
  }

  // Submit Line Clearance
  if (event.target.closest("#pcl-clearance-submit-btn")) {
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    if (!row) return;
    const rowKey = getBatchCheckerRowKey(row);
    if (!hasBatchCheckerSavedVerification(row)) {
      statusMessage.textContent = "Save Product Verification through Save Batch Check before printing the PCL.";
      updatePclSubmissionAvailability();
      return;
    }
    const incompleteCount = getBatchCheckerLineChecks(row).filter((checked) => !checked).length;
    const pclComment = batchCheckerPclRegulatoryComments[rowKey] !== undefined
      ? batchCheckerPclRegulatoryComments[rowKey]
      : (incompleteCount > 0 ? "" : (row.comments || ""));
    if (incompleteCount > 0 && !String(pclComment || "").trim()) {
      statusMessage.textContent = "Enter a regulatory comment explaining the incomplete Batch Check before printing the PCL.";
      const commentEditor = document.querySelector("#batchchecker-pcl-comments");
      if (commentEditor) commentEditor.focus();
      updatePclSubmissionAvailability();
      return;
    }
    const pclBarRecord = capturePclBarRecord(row, rowKey, pclComment, batchCheckerPclPrintMode, incompleteCount);
    document.querySelector("#generate-pcl-modal").classList.add("hidden");
    if (batchCheckerPclPrintMode === "cold-continuation") {
      const existingColdRecord = batchCheckerColdPclPrintedRows[rowKey];
      const reprints = [...(existingColdRecord?.reprints || [])];
      if (batchCheckerActivePclReprintReason) reprints.push({ reason: batchCheckerActivePclReprintReason, user: currentLogin ? currentLogin.user : "batch.checker", dateTime: getAssemblyAuditTimestamp() });
      batchCheckerColdPclPrintedRows[rowKey] = { user: currentLogin ? currentLogin.user : "batch.checker", dateTime: pclBarRecord.completedAt, regulatoryReviewComplete: incompleteCount === 0, incompleteRegulatoryReviewCopy: incompleteCount > 0, reprints, comments: pclComment || "", checks: pclBarRecord.checks };
      batchCheckerActivePclReprintReason = "";
      renderStage("batch-checker");
      statusMessage.textContent = `PCL cold chain continuation printed for ${row.batchNo}.`;
      return;
    }
    const existingPclRecord = batchCheckerPclGeneratedRows[rowKey];
    const pclReprints = [...(existingPclRecord?.reprints || [])];
    if (batchCheckerActivePclReprintReason) pclReprints.push({ reason: batchCheckerActivePclReprintReason, user: currentLogin ? currentLogin.user : "batch.checker", dateTime: getAssemblyAuditTimestamp() });

    if (incompleteCount > 0) {
      if (existingPclRecord?.addedToBns) {
        const generatedIndex = bnsProducts.findIndex((product) => product.batch === row.batchNo && product.imp === row.orderNo);
        if (generatedIndex >= 0) bnsProducts.splice(generatedIndex, 1);
      }
      batchCheckerPclGeneratedRows[rowKey] = {
        user: currentLogin ? currentLogin.user : "batch.checker",
        dateTime: pclBarRecord.completedAt,
        addedToBns: false,
        regulatoryReviewComplete: false,
        incompleteRegulatoryReviewCopy: true,
        reprints: pclReprints,
        comments: pclComment || "",
        checks: pclBarRecord.checks
      };
      row.printType = "";
      row.status = "Incomplete Regulatory Review";
      batchCheckerActivePclReprintReason = "";
      renderStage("batch-checker");
      statusMessage.textContent = `Incomplete Regulatory Review Copy printed for ${row.batchNo}. The line remains pending and was not released downstream.`;
      return;
    }

    row.printType = "Printed - PCL";
    row.status = "Printer";

    // Add to bnsProducts only after a complete Product Verification PCL is printed.
    const exists = bnsProducts.some(p => p.batch === row.batchNo);
    batchCheckerPclGeneratedRows[rowKey] = {
      user: currentLogin ? currentLogin.user : "batch.checker",
      dateTime: pclBarRecord.completedAt,
      addedToBns: Boolean(existingPclRecord?.addedToBns || !exists),
      regulatoryReviewComplete: true,
      incompleteRegulatoryReviewCopy: false,
      reprints: pclReprints,
      comments: pclComment || "",
      checks: pclBarRecord.checks
    };
    batchCheckerActivePclReprintReason = "";
    if (!exists) {
      bnsProducts.push({
status: "Active",
site: "WHO",
country: row.country,
partNo: row.partNo,
product: row.product || row.description,
ecma: row.ecma,
strength: row.strength,
packSize: row.packSize,
batch: row.batchNo,
expiry: row.expiryDate,
quantity: row.qty,
imp: row.orderNo,
invoice: row.invoice || "2904",
description: row.description || row.product,
warehouse: "Q-25-A",
pl: "18799/3264",
productId: row.productId,
foreignName: row.foreignName,
unitsPerPack: "1",
productIntroduced: "11 Sep 2020",
leafletDate: "04 Feb 2025",
dateRevised: "09 Apr 2025",
variationInfo: "",
supplierName: row.supplier,
reviewDate: row.reviewDate,
supplierInvoice: row.invoice || "2904",
manufLotNo: row.batchNo + "-" + row.country.substring(0, 2),
category: "Relabelling",
batchType: "Composite",
routeInstruction: "Relabel only",
routeType: "Relabelling",
leafletRequired: true,
leafletQuantity: row.qty,
blisterRequired: "Yes",
cartonQuantity: "0",
brailleRequired: true,
brailleQuantity: row.qty
      });
    }
    
    selectedBatchCheckerRowKey = null;
    batchCheckerDashboardOpen = true;
    renderStage("batch-checker");
    statusMessage.textContent = `User sign off completed and PCL generated for ${row.batchNo}. Batch moved to BNS Batch Add queue.`;
    return;
  }

  // Generate PCL close
  if (event.target.closest("[data-close-generate-pcl]")) {
    document.querySelector("#generate-pcl-modal").classList.add("hidden");
    batchCheckerActivePclReprintReason = "";
    return;
  }

  // View the supplier invoice uploaded for this PO in RPi Pack Creation.
  const supplierInvoiceClick = event.target.closest("[data-batchchecker-view-invoice]");
  if (supplierInvoiceClick) {
    const idx = Number(supplierInvoiceClick.dataset.batchcheckerViewInvoice);
    const row = getBatchCheckerRows()[idx];
    const invoiceDocument = row ? getRpPackCreationDocument(row.orderNo, "supplier-invoice") : null;
    if (!row || !invoiceDocument) {
      statusMessage.textContent = "No uploaded supplier invoice is available in RPi Pack Creation for this PO.";
      return;
    }
    openDocumentPreview(row.orderNo, "supplier-invoice");
    statusMessage.textContent = `Opened ${invoiceDocument.fileName} from RPi Pack Creation for PO ${row.orderNo}.`;
    return;
  }

  // View Supplier Declaration
  const supplierDeclarationClick = event.target.closest("[data-batchchecker-view-supplier-declaration]");
  if (supplierDeclarationClick) {
    const idx = Number(supplierDeclarationClick.dataset.batchcheckerViewSupplierDeclaration);
    const row = getBatchCheckerRows()[idx];
    if (row) openBatchCheckerDocumentViewer(row, "supplier");
    return;
  }

  // View Temperature Record
  const temperatureRecordClick = event.target.closest("[data-batchchecker-view-temperature-record]");
  if (temperatureRecordClick) {
    const idx = Number(temperatureRecordClick.dataset.batchcheckerViewTemperatureRecord);
    const row = getBatchCheckerRows()[idx];
    if (row) openBatchCheckerDocumentViewer(row, "temperature");
    return;
  }
  // View Product Mockup
  const mockupClick = event.target.closest("[data-batchchecker-view-mockup]");
  if (mockupClick) {
    const prodId = mockupClick.dataset.batchcheckerViewMockup;
    const imgEl = document.querySelector("#image-viewer-img");
    imgEl.src = "carton_mockup.png";
    document.querySelector("#image-viewer-title").textContent = `Product Mockup - Carton (ID: ${prodId})`;
    document.querySelector("#image-viewer-modal").classList.remove("hidden");
    return;
  }

  // View Raw Pack Scans
  const scanClick = event.target.closest("[data-batchchecker-view-scan]");
  if (scanClick) {
    const prodId = scanClick.dataset.batchcheckerViewScan;
    const imgEl = document.querySelector("#image-viewer-img");
    imgEl.src = "drug_capsule_mockup.png";
    document.querySelector("#image-viewer-title").textContent = `Raw Pack Scan - Drug (ID: ${prodId})`;
    document.querySelector("#image-viewer-modal").classList.remove("hidden");
    return;
  }

  // Close image viewer modal
  if (event.target.closest("#close-image-viewer") || event.target.closest("#close-image-viewer-btn")) {
    document.querySelector("#image-viewer-modal").classList.add("hidden");
    return;
  }

  // Reprint Goods In Label
  if (event.target.closest("#batchchecker-reprint-label")) {
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    const record = markBatchCheckerLabelPrinted(row, "Goods In Label");
    if (record) {
      renderStage("batch-checker");
      statusMessage.textContent = `Goods In Label printed for selected line ${row.batchNo} by ${record.user} at ${record.dateTime}. Print PCL and Print Label is now available for this line after selection.`;
    }
    return;
  }

  if (event.target.closest("#batchchecker-save-mfg")) {
    const row = getBatchCheckerRows()[selectedBatchCheckerRowKey];
    if (!row) {
      statusMessage.textContent = "Select a product line before saving the manufacturer.";
    } else if (!row.manufacturer) {
      statusMessage.textContent = "Select a manufacturer before saving.";
    } else {
      statusMessage.textContent = `Manufacturer saved for batch ${row.batchNo}.`;
    }
    return;
  }

  // Print or reprint Box Label
  if (event.target.closest("#batchchecker-print-box")) {
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    const rowKey = row ? getBatchCheckerRowKey(row) : "";
    if (!row || !batchCheckerVerifiedRows[rowKey]) {
      statusMessage.textContent = "Verify the selected line before printing its box label.";
      return;
    }
    if (openBatchCheckerReprintReason("label", row)) return;
    const record = markBatchCheckerLabelPrinted(row, "Box Label");
    renderStage("batch-checker");
    statusMessage.textContent = `Box label printed for ${row.batchNo} by ${record.user} at ${record.dateTime}.`;
    return;
  }

  // Confirm a reason before any completed line is reprinted.
  if (event.target.closest("#batchchecker-reprint-confirm")) {
    const reason = document.querySelector("#batchchecker-reprint-reason").value.trim();
    if (!reason || !batchCheckerPendingReprint) return;
    const pending = batchCheckerPendingReprint;
    batchCheckerPendingReprint = null;
    document.querySelector("#batchchecker-reprint-modal").classList.add("hidden");
    if (pending.action === "label") {
      const existingType = batchCheckerPrintedLabelRows[getBatchCheckerRowKey(pending.row)]?.type || "Box Label";
      const record = markBatchCheckerLabelPrinted(pending.row, existingType, reason);
      renderStage("batch-checker");
      statusMessage.textContent = `${existingType} reprinted for ${pending.row.batchNo}. Reason recorded: ${reason}`;
    } else {
      batchCheckerActivePclReprintReason = reason;
      openGeneratePclPopup(pending.printMode);
    }
    return;
  }

  if (event.target.closest("[data-close-batchchecker-reprint]")) {
    batchCheckerPendingReprint = null;
    document.querySelector("#batchchecker-reprint-modal").classList.add("hidden");
    return;
  }
  if (event.target.matches("[data-rp-doc-merge-select]")) {
    const poNo = event.target.dataset.rpDocMergeSelect;
    if (event.target.checked) rpMergeSelections.add(poNo);
    else rpMergeSelections.delete(poNo);
    renderStage("rp-pack");
    statusMessage.textContent = `${rpMergeSelections.size} PO(s) selected for merge in RPi Documents.`;
    return;
  }

  if (event.target.closest("[data-rp-documents-po-search-button]")) {
    const input = document.querySelector("[data-rp-documents-po-search]");
    rpDocumentsPoSearch = input ? input.value.trim() : "";
    renderStage("rp-pack");
    statusMessage.textContent = rpDocumentsPoSearch ? `RPi Documents filtered by PO ${rpDocumentsPoSearch}.` : "RPi Documents PO filter cleared.";
    return;
  }

  if (event.target.closest("[data-rp-doc-merge-selected]")) {
    const result = mergeSelectedRpPos();
    renderStage("rp-pack");
    statusMessage.textContent = result.message;
    return;
  }


  if (event.target.closest("[data-rp-unmerge-selected]")) {
    const select = document.querySelector("[data-rp-unmerge-po-select]");
    const reasonInput = document.querySelector("[data-rp-unmerge-reason]");
    const poNo = select ? select.value : "";
    const reason = reasonInput ? reasonInput.value.trim() : "";
    if (!poNo) {
      statusMessage.textContent = "Select a PO number to remove from the merged set.";
      return;
    }
    if (!reason) {
      reasonInput?.focus();
      statusMessage.textContent = "Enter a reason before unmerging the PO.";
      return;
    }
    const result = removePoFromRpMergeGroup(poNo, reason);
    renderStage("rp-pack");
    statusMessage.textContent = result.message;
    return;
  }

  const qaViewChecklist = event.target.closest("[data-qa-view-checklist]");
  if (qaViewChecklist) {
    const poNo = qaViewChecklist.dataset.qaViewChecklist;
    openQaChecklistReview(poNo);
    statusMessage.textContent = `Filled Goods Receiving Checklist opened for QA review: ${poNo}.`;
    return;
  }

  if (event.target.closest("[data-close-qa-checklist-review]")) {
    document.querySelector("#qa-checklist-review-modal")?.remove();
    renderStage(currentStageId === "packing-list" ? "packing-list" : "rp-pack");
    statusMessage.textContent = "Goods Receiving checklist closed.";
    return;
  }

  if (event.target.matches("[data-qa-decision]")) {
    const poNo = event.target.dataset.qaDecisionPo;
    const item = checklistDecisionQueue.find((entry) => entry.poNo === poNo);
    if (item) {
      const choice = event.target.dataset.qaDecision;
      document.querySelectorAll(`[data-qa-decision][data-qa-decision-po="${poNo}"]`).forEach((control) => {
        if (control !== event.target) control.checked = false;
      });
      item.qaDecisionChoice = event.target.checked ? choice : "";
      refreshQaChecklistReviewState(item);
    }
    return;
  }

  const qaModalApprove = event.target.closest("[data-qa-modal-approve]");
  if (qaModalApprove) {
    const poNo = qaModalApprove.dataset.qaModalApprove;
    if (approveChecklistException(poNo)) {
      document.querySelector("#qa-checklist-review-modal")?.remove();
      renderStage("rp-pack");
      statusMessage.textContent = `QA approved PO ${poNo} for unpacking. The decision is now available in Packing List > Checklist decision.`;
    }
    return;
  }
  if (event.target.closest("[data-checklist-decision-search-button]")) {
    const input = document.querySelector("[data-checklist-decision-search]");
    checklistDecisionSearch = input ? input.value.trim() : "";
    renderStage("packing-list");
    statusMessage.textContent = checklistDecisionSearch ? `Checklist decisions filtered by PO ${checklistDecisionSearch}.` : "Checklist decision PO filter cleared.";
    return;
  }

  const checklistDecisionView = event.target.closest("[data-view-checklist-decision]");
  if (checklistDecisionView) {
    const poNo = checklistDecisionView.dataset.viewChecklistDecision;
    selectedChecklistDecisionPo = poNo;
    openQaChecklistReview(poNo);
    statusMessage.textContent = `QA-approved Goods Receiving checklist opened for ${poNo}.`;
    return;
  }

  const checklistDecisionAccept = event.target.closest("[data-accept-checklist-decision]");
  if (checklistDecisionAccept) {
    const poNo = checklistDecisionAccept.dataset.acceptChecklistDecision;
    const result = acceptChecklistDecision(poNo);
    renderStage("packing-list");
    statusMessage.textContent = result.message;
    return;
  }

  const packingTab = event.target.closest("[data-packing-tab]");
  if (packingTab) {
    packingListMode = packingTab.dataset.packingTab;
    renderStage("packing-list");
    return;
  }

  if (event.target.closest("[data-rp-docs-back]")) {
    selectedRpPackPo = null;
    renderStage("rp-pack");
    return;
  }

  const poSelectTrigger = event.target.closest("[data-rp-select-po]");
  if (poSelectTrigger) {
    selectedRpPackPo = poSelectTrigger.dataset.rpSelectPo;
    renderStage("rp-pack");
    setTimeout(updateRpDocumentsAvailability, 0);
    return;
  }

  if (event.target.id === "pl-add-clear-btn") {
    packingListSelectedPo = "";
    packingListSearch = "";
    renderStage("packing-list");
    statusMessage.textContent = "Add Packing List search cleared.";
    return;
  }

  if (event.target.id === "pl-add-search-btn") {
    const input = document.querySelector("#pl-add-po-input");
    const poNo = input ? input.value.trim() : "";
    if (poNo) {
      packingListSelectedPo = poNo;
      packingListSearch = poNo;
      
      const existingRows = getPackingListRows().filter(row => row.orderNo === poNo);
      const hasRealData = existingRows.some(row => row.partNo && row.description);
      
      if (!hasRealData) {
        packingListRowsState = getPackingListRows().filter(row => row.orderNo !== poNo);
        const newRows = [];
        for (let i = 0; i < 5; i++) {
          newRows.push({
            orderNo: poNo,
            lineNo: String(i + 1),
            partNo: "",
            description: "",
            batchNo: "",
            expiryDate: "",
            qty: "",
            boxes: "",
            suppName: "",
            suppCode: "",
            country: "",
            ecma: "",
            mfgLotNo: "",
            rowId: `pl-new-${poNo}-${i + 1}`
          });
        }
        packingListRowsState = getPackingListRows().concat(newRows);
      }
      
      if (!rpPackWorkflows[poNo]) rpPackWorkflows[poNo] = createPackingWorkflow(poNo);
      
      renderStage("packing-list");
      statusMessage.textContent = `PO ${poNo} is ready to be saved. Saving creates its RPi Pack Creation queue.`;
    }
    return;
  }

  if (event.target.id === "pl-add-line-btn") {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Add line is disabled.";
      return;
    }
    const poNo = packingListSelectedPo;
    if (poNo) {
      const rows = getPackingListRows().filter(r => r.orderNo === poNo);
      const nextIndex = rows.length + 1;
      const newRow = {
        orderNo: poNo,
        lineNo: String(nextIndex),
        partNo: "",
        description: "",
        batchNo: "",
        expiryDate: "",
        qty: "",
        boxes: "",
        suppName: "",
        suppCode: "",
        country: "",
        ecma: "",
        mfgLotNo: "",
        rowId: `pl-new-${poNo}-${nextIndex}`
      };
      packingListRowsState = getPackingListRows().concat(newRow);
      renderStage("packing-list");
      statusMessage.textContent = "New line added to packing list.";
    }
    return;
  }

  if (event.target.id === "pl-add-save-btn" || event.target.closest("[data-packing-save]")) {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Save is disabled.";
      return;
    }
    const savedPoNo = String(packingListSelectedPo || "").trim();
    if (!savedPoNo) {
      statusMessage.textContent = "Enter a PO number before saving.";
      return;
    }
    const savedWorkflow = rpPackWorkflows[savedPoNo] || (rpPackWorkflows[savedPoNo] = createPackingWorkflow(savedPoNo));
    const savedRows = getPackingListRows().filter((row) => row.orderNo === savedPoNo);
    savedWorkflow.supplier = savedRows.find((row) => row.suppName)?.suppName || savedWorkflow.supplier || "Supplier pending";
    savedWorkflow.rpDocumentsQueueCreated = true;
    savedWorkflow.rpDocumentsQueueSource = "Add Packing List";
    if (!savedWorkflow.status || savedWorkflow.status === "Pending Uploads") savedWorkflow.status = "Documents Pending";
    statusMessage.textContent = `PO ${savedPoNo} saved. Its RPi Pack Creation queue is now available.`;
    return;
  }

  if (event.target.id === "pl-add-remove-btn") {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Remove line is disabled.";
      return;
    }
    const rows = getPackingListRows().filter(r => r.orderNo === packingListSelectedPo);
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      packingListRowsState = getPackingListRows().filter(r => r.rowId !== lastRow.rowId);
      renderStage("packing-list");
      statusMessage.textContent = `Removed last line: ${lastRow.lineNo}`;
    }
    return;
  }

  if (event.target.closest("[data-remove-packing-lines]")) {
    removeSelectedSplitPackingLine();
    return;
  }

  if (event.target.id === "pl-add-generate-btn" || event.target.closest("[data-generate-packing-list]") || event.target.closest("[data-view-generated-packing-list]")) {
    const visibleRows = currentStageId === "packing-list" ? getVisiblePackingListRowsSnapshot() : null;
    const visiblePoNo = visibleRows && visibleRows.length && visibleRows.every((row) => row.orderNo === visibleRows[0].orderNo) ? visibleRows[0].orderNo : "";
    const poNo = visiblePoNo || packingListSelectedPo || packingListSearch || "C13719";
    packingListSelectedPo = poNo;
    packingListSearch = poNo;
    if (canGeneratePackingList(poNo) || packingListGenerated) {
      if (!rpPackWorkflows[poNo]) {
        rpPackWorkflows[poNo] = createPackingWorkflow(poNo);
      }
      openPackingListPreview(poNo, visibleRows);
    } else {
      statusMessage.textContent = "Error: All lines must be verified and printed before generating the packing list.";
    }
    return;
  }

  const splitPackingTrigger = event.target.closest("[data-split-packing-line]");
  if (splitPackingTrigger) {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Split line is disabled.";
      return;
    }
    splitPackingLine(splitPackingTrigger.dataset.splitPackingLine);
    return;
  }

  const plVerifyTrigger = event.target.closest("[data-pl-verify-print]");
  if (plVerifyTrigger) {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Verify and print is disabled.";
      return;
    }
    const key = plVerifyTrigger.dataset.plVerifyPrint;
    const row = getPackingListRows().find(r => getPackingLineKey(r) === key);
    if (row) {
      const boxes = parseInt(row.boxes) || 1;
      const qty = parseInt(row.qty) || 0;
      
      const printAction = () => {
        const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const user = currentLogin ? currentLogin.user : "goods.in";
        packingLabelPrintRecords[key] = { user, dateTime: now, printedCount: boxes };
        recordPackingListAudit(row.orderNo, `Verified line ${row.lineNo} and printed ${boxes} packing label${boxes === 1 ? "" : "s"} for ${row.description}.`, user, now, key);
        statusMessage.textContent = `Verified and printed ${boxes} labels for ${row.description}. Line clearance recorded.`;
        renderStage("packing-list");
      };
      
      requestUserSignoff(printAction, "Print PCL and Print Label");
      
      // Override default text inside the modal for custom style
      document.querySelector("#app-confirm-title").textContent = "Print PCL and Print Label";
      document.querySelector("#app-confirm-header").textContent = "Verify Line Clearance?";
      document.querySelector("#app-confirm-copy").textContent = `Confirm verification and printing of ${boxes} packing labels for ${row.description} (Qty: ${qty})?`;
      const yesButton = document.querySelector("#app-confirm-yes");
      if (yesButton) {
        yesButton.textContent = "Yes, Verify & Print";
      }
    }
    return;
  }

  const plPreviewTrigger = event.target.closest("[data-pl-preview-doc]");
  if (plPreviewTrigger) {
    const poNo = plPreviewTrigger.dataset.plPreviewPo;
    const docId = plPreviewTrigger.dataset.plPreviewDoc;
    openDocumentPreview(poNo, docId);
    return;
  }

  const rpReuploadTrigger = event.target.closest("[data-rp-reupload-doc]");
  if (rpReuploadTrigger) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.hidden = true;
    fileInput.dataset.plAddFile = rpReuploadTrigger.dataset.rpReuploadDoc;
    fileInput.dataset.plAddPo = rpReuploadTrigger.dataset.rpReuploadPo;
    fileInput.addEventListener("change", () => window.setTimeout(() => fileInput.remove(), 0), { once: true });
    document.body.appendChild(fileInput);
    fileInput.click();
    return;
  }

  const rpApproveFileTrigger = event.target.closest("[data-rp-approve-file]");
  if (rpApproveFileTrigger) {
    const docId = rpApproveFileTrigger.dataset.rpApproveFile;
    const poNo = rpApproveFileTrigger.dataset.rpPo;
    if (approveRpTaskDocument(poNo, docId)) {
      const doc = rpPackWorkflows[poNo]?.documents.find((item) => item.id === docId);
      statusMessage.textContent = `${doc?.name || "Document"} approved for PO ${poNo}. Related approval-form answers have been marked YES.`;
      renderStage("rp-pack");
      setTimeout(updateRpApprovalAvailability, 0);
    }
    return;
  }

  const rpRejectFileTrigger = event.target.closest("[data-rp-reject-file]");
  if (rpRejectFileTrigger) {
    const docId = rpRejectFileTrigger.dataset.rpRejectFile;
    const poNo = rpRejectFileTrigger.dataset.rpPo;
    if (rejectRpTaskDocument(poNo, docId)) {
      const doc = rpPackWorkflows[poNo]?.documents.find((item) => item.id === docId);
      statusMessage.textContent = `${doc?.name || "Document"} marked Rejected for PO ${poNo}. Click the final Reject button to enter a reason.`;
      renderStage("rp-pack");
    }
    return;
  }

const rpApprovePackingListTrigger = event.target.closest("[data-rp-approve-generated-packing-list]");
  if (rpApprovePackingListTrigger) {
    const poNo = rpApprovePackingListTrigger.dataset.rpApproveGeneratedPackingList;
    if (approveRpTaskPackingList(poNo)) {
      statusMessage.textContent = `Generated PO Packing List approved for PO ${poNo}.`;
      renderStage("rp-pack");
      setTimeout(updateRpApprovalAvailability, 0);
    }
    return;
  }

  const rpRejectPackingListTrigger = event.target.closest("[data-rp-reject-generated-packing-list]");
  if (rpRejectPackingListTrigger) {
    const poNo = rpRejectPackingListTrigger.dataset.rpRejectGeneratedPackingList;
    if (rejectRpTaskPackingList(poNo)) {
      statusMessage.textContent = `Generated PO Packing List marked Rejected for PO ${poNo}. Click the final Reject button to enter a reason.`;
      renderStage("rp-pack");
    }
    return;
  }

const rpViewTrigger = event.target.closest("[data-rp-view-file]");
  if (rpViewTrigger) {
    const docId = rpViewTrigger.dataset.rpViewFile;
    const poNo = rpViewTrigger.dataset.rpPo;
    openDocumentPreview(poNo, docId);
    return;
  }

  if (event.target.closest("[data-pl-preview-generated-packing-list]")) {
    const trigger = event.target.closest("[data-pl-preview-generated-packing-list]");
    const poNo = trigger.dataset.plPreviewPo || selectedRpPackPo || selectedRpApprovalPo || packingListSelectedPo;
    markGeneratedPackingListViewedForCurrentContext(poNo);
    openPackingListPreview(poNo);
    if (currentStageId === "rp-pack" && rpiModuleView === "tasks") setTimeout(updateRpApprovalAvailability, 0);
    if (currentStageId === "rp-pack" && rpiModuleView === "pack-creation") setTimeout(updateRpDocumentsAvailability, 0);
    return;
  }

  if (event.target.closest("[data-rp-view-generated-packing-list]")) {
    const poNo = selectedRpApprovalPo || selectedRpPackPo || packingListSelectedPo;
    markGeneratedPackingListViewedForCurrentContext(poNo);
    openPackingListPreview(poNo);
    if (currentStageId === "rp-pack" && rpiModuleView === "tasks") setTimeout(updateRpApprovalAvailability, 0);
    if (currentStageId === "rp-pack" && rpiModuleView === "pack-creation") setTimeout(updateRpDocumentsAvailability, 0);
    return;
  }

  if (event.target.id === "pl-preview-verify-btn") {
    const poNo = activePreviewPo || (currentStageId === "packing-list" && packingListMode === "documents"
      ? (selectedRpPackPo || packingListSelectedPo)
      : currentStageId === "rp-pack"
        ? (selectedRpApprovalPo || selectedRpPackPo || packingListSelectedPo)
        : (packingListSelectedPo || selectedRpPackPo || selectedRpApprovalPo));
    if (rpPackWorkflows[poNo]) {
      if (!rpPackWorkflows[poNo].viewedDocs) {
        rpPackWorkflows[poNo].viewedDocs = {};
      }
      rpPackWorkflows[poNo].viewedDocs["generated-packing-list"] = true;

      statusMessage.textContent = "Generated PO Packing List viewed.";
      closePrintPreview();
      renderStage(currentStageId);
      if (currentStageId === "rp-pack" && rpiModuleView === "tasks") {
        setTimeout(updateRpApprovalAvailability, 0);
      } else if (currentStageId === "rp-pack" && rpiModuleView === "pack-creation") {
        setTimeout(updateRpDocumentsAvailability, 0);
      }
    }
    return;
  }

  if (event.target.closest("[data-packing-search-button]")) {
    const searchInput = document.querySelector("[data-packing-search]");
    if (searchInput) {
      packingListSearch = searchInput.value;
      packingListSelectedPo = searchInput.value || packingListSelectedPo;
    }
    packingListMode = "view";
    renderStage("packing-list");
    statusMessage.textContent = `Search results for PO ${packingListSelectedPo} loaded.`;
    return;
  }

  const printPackingLabelTrigger = event.target.closest("[data-print-packing-label]");
  if (printPackingLabelTrigger) {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Print Packing Label is disabled.";
      return;
    }
    requestUserSignoff(() => printPackingLabel(printPackingLabelTrigger.dataset.printPackingLabel), "Packing Label");
    return;
  }

  if (event.target.closest("[data-print-selected-po-labels]")) {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Print PO Packing Label is disabled.";
      return;
    }
    requestUserSignoff(printSelectedPoPackingLabels, "selected PO Packing Label lines");
    return;
  }

  if (event.target.closest("[data-delete-packing-lines]")) {
    openPackingDeleteLoginDialog();
    return;
  }

  if (event.target.closest("[data-packing-delete-cancel]")) {
    closePackingDeleteLoginDialog();
    statusMessage.textContent = "Packing list delete cancelled.";
    return;
  }

  if (event.target.closest("[data-packing-delete-confirm]")) {
    confirmPackingDeleteWithLogin();
    return;
  }


  if (event.target.closest("[data-sign-po-packing-list]")) {
    openPoPackingListInlineSignoffConfirm();
    return;
  }

  if (event.target.closest("[data-po-inline-signoff-no]")) {
    closePoPackingListInlineSignoffConfirm();
    statusMessage.textContent = "Packing List sign off cancelled";
    return;
  }

  if (event.target.closest("[data-po-inline-signoff-yes]")) {
    closePoPackingListInlineSignoffConfirm();
    signPoPackingList();
    return;
  }

  if (event.target.closest("#rp-documents-signoff-button")) {
    updateRpDocumentsAvailability();
    const button = document.querySelector("#rp-documents-signoff-button");
    if (button && button.disabled) {
      statusMessage.textContent = button.title || "Upload and verify all RPi Pack documents before sign off.";
      return;
    }
    const primaryPoNo = getRpMergePrimaryPo(selectedRpPackPo);
    const poNos = getRpMergePoNos(primaryPoNo);
    const noRpiApprovalNeeded = isRpApprovalBypassed(poNos);
    requestAppConfirmation(
      completeRpDocumentsSignoff,
      noRpiApprovalNeeded ? "Send Document Pack to Stock Control India" : "RPi Pack Sign Off",
      noRpiApprovalNeeded ? "Combine all uploaded files and send the PDF?" : "Confirm RPi Pack document sign off?",
      noRpiApprovalNeeded
        ? `This will create one combined PDF for ${poNos.join(", ")}, email it to Stock Control India, and bypass RPi Approval.`
        : `This will capture ${currentLogin ? currentLogin.user : "goods.in"} with the current date and time.`,
      noRpiApprovalNeeded ? "Send to Stock Control" : "Send to RPi Approval"
    );
    return;
  }

  const rpTaskQueueTabButton = event.target.closest("[data-rp-task-queue-tab]");
  if (rpTaskQueueTabButton) {
    rpTaskQueueTab = rpTaskQueueTabButton.dataset.rpTaskQueueTab === "qa" ? "qa" : "po";
    selectedRpApprovalPo = null;
    renderStage("rp-pack");
    statusMessage.textContent = rpTaskQueueTab === "qa" ? "QA Decision queue opened." : "PO Work Queue opened.";
    return;
  }

  if (event.target.closest("[data-rp-task-back]")) {
    selectedRpApprovalPo = null;
    rpApprovalSearch = "";
    renderStage("rp-pack");
    statusMessage.textContent = "Returned to the RPi Task queue.";
    return;
  }

  if (event.target.closest("[data-rp-approval-search-button]")) {
    renderStage("rp-pack");
    statusMessage.textContent = "RPi Task search applied.";
    return;
  }

  const rpApprovalPoTrigger = event.target.closest("[data-rp-approval-select-po]");
  if (rpApprovalPoTrigger) {
    selectedRpApprovalPo = rpApprovalPoTrigger.dataset.rpApprovalSelectPo;
    renderStage("rp-pack");
    return;
  }

  if (event.target.id === "rp-verify-signoff-btn") {
    updateRpApprovalAvailability();
    if (event.target.disabled) {
      statusMessage.textContent = "Complete all checklist answers and record a decision for every document before sign off.";
      return;
    }
    const poNo = selectedRpApprovalPo;
    const overlay = document.createElement("div");
    overlay.id = "rp-pdf-modal-container";
    overlay.innerHTML = renderRpApprovalExactPdfModal(poNo, rpApprovalAnswers[poNo], null);
    document.body.appendChild(overlay);
    const editablePoInput = overlay.querySelector("#rp-pdf-po-number");
    if (editablePoInput) {
      editablePoInput.addEventListener("input", () => {
        if (!rpApprovalAnswers[poNo]) rpApprovalAnswers[poNo] = {};
        rpApprovalAnswers[poNo]["po-number"] = editablePoInput.value;
      });
    }
    
    const closeSignedPreview = () => {
      overlay.remove();
      renderStage("rp-pack");
    };
    document.querySelector("#rp-pdf-close").addEventListener("click", closeSignedPreview);
    document.querySelector("#rp-pdf-cancel").addEventListener("click", closeSignedPreview);
    
    document.querySelector("#rp-pdf-sign-btn").addEventListener("click", () => {
      const rpStage = stages.find((stage) => stage.id === "rp-pack");
      const rpUser = currentLogin && currentLogin.user && currentLogin.user !== "goods.in" ? currentLogin.user : (rpStage ? rpStage.user : "rp.user");
      const sigObj = {
        user: rpUser,
        dateTime: getAssemblyAuditTimestamp()
      };
      const approvedPoNos = getRpMergePoNos(poNo);
      approvedPoNos.forEach((approvedPoNo) => {
        rpApprovalSignoffs[approvedPoNo] = sigObj;
        const po = rpPackWorkflows[approvedPoNo];
        if (po) po.status = "RPi Approved";
      });
      overlay.innerHTML = renderRpApprovalExactPdfModal(poNo, rpApprovalAnswers[poNo], sigObj);
      document.querySelector("#rp-pdf-close").addEventListener("click", closeSignedPreview);
      document.querySelector("#rp-pdf-cancel").addEventListener("click", closeSignedPreview);
      statusMessage.textContent = `RPi Task digitally signed by ${sigObj.user} at ${sigObj.dateTime} for ${approvedPoNos.join(", ")}. Moved to Batch Checker queue.`;
      setTimeout(() => {
        selectedRpApprovalPo = null;
        overlay.remove();
        renderStage("rp-pack");
      }, 900);
    });
    return;
  }

  const rpApproveOpen = event.target.closest("[data-rp-approve-open-checklist]");
  if (rpApproveOpen) {
    const poNo = rpApproveOpen.dataset.rpApproveOpenChecklist;
    if (rpPackWorkflows[poNo]) {
      const approvedPoNos = getRpMergePoNos(poNo);
      approvedPoNos.forEach((approvedPoNo) => {
        rpPackWorkflows[approvedPoNo].rpChecklistOpen = true;
        rpPackWorkflows[approvedPoNo].status = "RPi Checklist Open";
      });
      selectedRpApprovalPo = poNo;
      statusMessage.textContent = `RPi Task approved document pack for PO ${approvedPoNos.join(", ")}. Checklist opened.`;
      renderStage("rp-pack");
    }
    return;
  }

  const rpRejectPo = event.target.closest("[data-rp-reject-po]");
  if (rpRejectPo) {
    openRpRejectPopup(rpRejectPo.dataset.rpRejectPo);
    return;
  }

  if (event.target.id === "pl-preview-download-btn") {
    statusMessage.textContent = "Generated PO Packing List download started.";
    closePrintPreview();
    renderStage(currentStageId);
    return;
  }
  const modernPillBtn = event.target.closest(".modern-pill-btn");
  if (modernPillBtn) {
    const field = modernPillBtn.dataset.rpField;
    const val = modernPillBtn.dataset.val;
    const poNo = selectedRpApprovalPo;
    
    if (!rpApprovalAnswers[poNo]) {
      rpApprovalAnswers[poNo] = {};
    }
    
    if (rpApprovalAnswers[poNo][field] === val) {
      delete rpApprovalAnswers[poNo][field];
    } else {
      rpApprovalAnswers[poNo][field] = val;
    }
    
    const group = modernPillBtn.closest(".modern-check-options");
    if (group) {
      group.querySelectorAll(".modern-pill-btn").forEach((button) => {
        button.classList.remove("active-yes", "active-no", "active-na");
      });
      if (rpApprovalAnswers[poNo][field] === val) {
        const activeClass = val === "Y" ? "active-yes" : val === "N" ? "active-no" : "active-na";
        modernPillBtn.classList.add(activeClass);
      }
    }
    if (field === "fe-status") {
      const reasonInput = document.querySelector("#rp-form-inactive-reason");
      if (reasonInput) reasonInput.disabled = false;
    }
    updateRpApprovalAvailability();
    return;
  }

  if (event.target.closest("[data-close-rp-approval-form]")) {
    document.querySelector("#rp-approval-form-modal").classList.add("hidden");
    return;
  }

  const labelPrintTrigger = event.target.closest("[data-open-label-print]");
  if (labelPrintTrigger) {
    labelSelectedProduct = bnsProducts.find((product) => product.batch === labelPrintTrigger.dataset.openLabelPrint) || null;
    printerSection = "label-detail";
    renderStage("label-printing");
    return;
  }

  if (event.target.closest("[data-label-back-queue]")) {
    labelSelectedProduct = null;
    printerSection = "label-list";
    renderStage("label-printing");
    statusMessage.textContent = "Returned to the Label Printing batch queue.";
    return;
  }

  const printingBackQueue = event.target.closest("[data-printing-back-queue]");
  if (printingBackQueue) {
    const type = printingBackQueue.dataset.printingBackQueue;
    if (type === "leaflet") leafletSelectedProduct = null;
    if (type === "carton") cartonSelectedProduct = null;
    if (type === "braille") brailleSelectedProduct = null;
    printerSection = `${type}-list`;
    renderStage("label-printing");
    statusMessage.textContent = `Returned to the ${type.charAt(0).toUpperCase() + type.slice(1)} batch queue.`;
    return;
  }

  if (event.target.closest("[data-folding-back-queue]")) {
    leafletFoldingSelectedProduct = null;
    renderStage("leaflet-folding");
    statusMessage.textContent = "Returned to the Leaflet Folding batch queue.";
    return;
  }

  const leafletPrintTrigger = event.target.closest("[data-open-leaflet-print]");
  if (leafletPrintTrigger) {
    leafletSelectedProduct = bnsProducts.find((product) => product.batch === leafletPrintTrigger.dataset.openLeafletPrint) || null;
    printerSection = "leaflet-detail";
    renderStage("label-printing");
    return;
  }

  const cartonPrintTrigger = event.target.closest("[data-open-carton-print]");
  if (cartonPrintTrigger) {
    cartonSelectedProduct = bnsProducts.find((product) => product.batch === cartonPrintTrigger.dataset.openCartonPrint) || null;
    printerSection = "carton-detail";
    renderStage("label-printing");
    return;
  }

  const braillePrintTrigger = event.target.closest("[data-open-braille-print]");
  if (braillePrintTrigger) {
    brailleSelectedProduct = bnsProducts.find((product) => product.batch === braillePrintTrigger.dataset.openBraillePrint) || null;
    printerSection = "braille-detail";
    renderStage("label-printing");
    return;
  }

  const leafletFoldingTrigger = event.target.closest("[data-open-leaflet-folding]");
  if (leafletFoldingTrigger) {
    leafletFoldingSelectedProduct = bnsProducts.find((product) => product.batch === leafletFoldingTrigger.dataset.openLeafletFolding) || null;
    renderStage("leaflet-folding");
    return;
  }

  const preAssemblyTrigger = event.target.closest("[data-open-preassembly]");
  if (preAssemblyTrigger) {
    preAssemblySelectedProduct = bnsProducts.find((product) => product.batch === preAssemblyTrigger.dataset.openPreassembly) || null;
    renderStage("pre-assembly-qc");
    return;
  }

  const productionTrigger = event.target.closest("[data-open-production]");
  if (productionTrigger) {
    const product = bnsProducts.find((item) => item.batch === productionTrigger.dataset.openProduction) || null;
    if (!product) return;
    if (window.confirm("This checklist will be done in hand held device.")) {
      const batchNumber = product.batch;
      const boxCount = String(Math.max(1, Math.ceil(Number(product.quantity || 0) / 100)));
      productionRecords[batchNumber] = {
        ...(productionRecords[batchNumber] || {}),
        user: currentLogin ? currentLogin.user : "production.control",
        dateTime: getAssemblyAuditTimestamp(),
        boxCount,
        roomNo: productionRecords[batchNumber] ? productionRecords[batchNumber].roomNo || "Room 2" : "Room 2",
        handheldChecklist: true
      };
      if (!productionAllocatedBatchNumbers.includes(batchNumber)) productionAllocatedBatchNumbers.push(batchNumber);
      productionSelectedProduct = null;
      renderStage("room-allocation");
      statusMessage.textContent = `Batch ${batchNumber} checklist assigned to handheld device and removed from Production Controller queue.`;
    }
    return;
  }

  const assemblyAttendanceAction = event.target.closest("[data-assembly-attendance]");
  if (assemblyAttendanceAction) {
    const action = assemblyAttendanceAction.dataset.assemblyAttendance;
    const room = document.querySelector("#assembly-attendance-room")?.value || "Room 2";
    requestAssemblyIdScan(
      (scannedId) => recordAssemblyAttendanceAction(action, scannedId, room),
      action
    );
    return;
  }

  const assemblyBatchAction = event.target.closest("[data-assembly-batch-action]");
  if (assemblyBatchAction && assemblySelectedProduct) {
    const action = assemblyBatchAction.dataset.assemblyBatchAction;
    if (action === "partial-finish") {
      const quantity = Number(document.querySelector("#assembly-partial-quantity")?.value || 0);
      const maximum = Number(assemblySelectedProduct.quantity || 0);
      if (!quantity || quantity < 1 || quantity > maximum) {
        statusMessage.textContent = `Enter a completed quantity between 1 and ${maximum.toLocaleString("en-GB")} before Partial Finish.`;
        return;
      }
    }
    const actionLabels = {
      break: "Start Room Break",
      "resume-break": "Resume Batch After Break",
      "partial-finish": "Partial Finish",
      "resume-partial": "Partial Start"
    };
    requestAssemblyIdScan(
      (scannedId) => recordAssemblyBatchRuntimeAction(action, scannedId),
      actionLabels[action] || "Assembly Batch Action"
    );
    return;
  }
  const assemblyQueueViewTrigger = event.target.closest("[data-assembly-queue-view]");
  if (assemblyQueueViewTrigger) {
    assemblyQueueView = assemblyQueueViewTrigger.dataset.assemblyQueueView;
    renderStage("assembly-room");
    return;
  }

  if (event.target.closest("[data-assembly-search-button]")) {
    const searchInput = document.querySelector("[data-assembly-search]");
    assemblySearch = searchInput ? searchInput.value.trim() : assemblySearch;
    renderStage("assembly-room");
    statusMessage.textContent = assemblySearch ? `Assembly queue filtered by ${assemblySearch}.` : "Assembly queue search applied.";
    return;
  }
  if (event.target.closest("[data-assembly-refresh]")) {
    assemblySearch = "";
    renderStage("assembly-room");
    statusMessage.textContent = "Assembly batch queue refreshed.";
    return;
  }

  const assemblyBackTrigger = event.target.closest("[data-assembly-back]");
  if (assemblyBackTrigger) {
    const pageOrder = ["materials", "samples", "ipc", "recon"];
    const currentPageIndex = pageOrder.indexOf(assemblyActiveTab);
    if (assemblyBackTrigger.dataset.assemblyBack === "queue" || currentPageIndex <= 0) {
      assemblySelectedProduct = null;
      assemblyActiveTab = "materials";
    } else {
      assemblyActiveTab = pageOrder[currentPageIndex - 1];
    }
    renderStage("assembly-room");
    return;
  }
  const assemblyTrigger = event.target.closest("[data-open-assembly]");
  if (assemblyTrigger) {
    const selectedAssemblyProduct = bnsProducts.find((product) => product.batch === assemblyTrigger.dataset.openAssembly) || null;
    if (!selectedAssemblyProduct) return;
    const selectedAssemblyRecord = assemblyRecords[selectedAssemblyProduct.batch] || {};
    const startRecord = getAssemblyLifecycleRecord(selectedAssemblyRecord, "start");
    if (!startRecord.dateTime) {
      requestAssemblyBatchStart(selectedAssemblyProduct);
      return;
    }
    assemblySelectedProduct = selectedAssemblyProduct;
    assemblyExtraIpcRows = 0;
    assemblyActiveTab = "materials";
    renderStage("assembly-room");
    return;
  }

  const assemblyTab = event.target.closest("[data-assembly-tab]");
  if (assemblyTab) {
    assemblyActiveTab = assemblyTab.dataset.assemblyTab;
    const pageMeta = {
      materials: ["Assembly Room - Initial Checks", "", "1"],
      samples: ["Random Sample Check", "", "2"],
      ipc: ["IPC Photo Check", "", "3"],
      recon: ["Reconciliation & Closure", "", "4"]
    }[assemblyActiveTab];
    document.querySelectorAll("[data-assembly-tab]").forEach((tab) => tab.classList.toggle("active", tab === assemblyTab));
    document.querySelectorAll("[data-assembly-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.assemblyPanel === assemblyActiveTab));
    const title = document.querySelector("#assembly-page-title");
    const description = document.querySelector("#assembly-page-description");
    const pageCount = document.querySelector("#assembly-page-count");
    const pageStatus = document.querySelector("#assembly-page-status");
    const activeRecord = assemblyRecords[assemblySelectedProduct ? assemblySelectedProduct.batch : ""] || {};
    const isPageComplete = Boolean((activeRecord.signedTabs || {})[assemblyActiveTab]);
    if (title) title.textContent = pageMeta[0];
    if (description) {
      description.textContent = pageMeta[1];
      description.hidden = !pageMeta[1];
    }
    if (pageCount) pageCount.textContent = `Page ${pageMeta[2]} of 4`;
    if (pageStatus) pageStatus.textContent = isPageComplete ? "Done" : "In progress";
    updateAssemblyAvailability();
    return;
  }


  const briefingConfirmation = event.target.closest("[data-confirm-assembly-briefing]");
  if (briefingConfirmation && assemblySelectedProduct) {
    const batchNumber = assemblySelectedProduct.batch;
    const user = getAssemblyAuditUser();
    const dateTime = getAssemblyAuditTimestamp();
    const existingRecord = assemblyRecords[batchNumber] || {};
    assemblyRecords[batchNumber] = {
      ...existingRecord,
      briefingConfirmation: { user, dateTime }
    };
    const userField = document.querySelector("#assembly-briefing-user");
    const timeField = document.querySelector("#assembly-briefing-at");
    const briefingPanel = briefingConfirmation.closest(".assembly-briefing-confirmation");
    if (userField) userField.textContent = user;
    if (timeField) timeField.textContent = dateTime;
    if (briefingPanel) briefingPanel.classList.add("is-confirmed");
    briefingConfirmation.textContent = "Briefing Confirmed";
    briefingConfirmation.disabled = true;
    statusMessage.textContent = `Briefing confirmed by ${user} at ${dateTime}.`;
    updateAssemblyAvailability();
    return;
  }

  const assemblyPageSignoff = event.target.closest("[data-assembly-page-signoff]");
  if (assemblyPageSignoff) {
    const tabName = assemblyPageSignoff.dataset.assemblyPageSignoff;
    signOffAssemblyPage(tabName);
    return;
  }

  const postAssemblyTrigger = event.target.closest("[data-open-postassembly]");
  if (postAssemblyTrigger) {
    postAssemblySelectedProduct = bnsProducts.find((product) => product.batch === postAssemblyTrigger.dataset.openPostassembly) || null;
    renderStage("post-assembly-qc");
    return;
  }

  if (event.target.closest("[data-postassembly-back-queue]")) {
    postAssemblySelectedProduct = null;
    document.querySelector("#postassembly-box-quantity-modal")?.remove();
    renderStage("post-assembly-qc");
    statusMessage.textContent = "Returned to the Post Assembly batch queue.";
    return;
  }

  if (event.target.closest("[data-edit-postassembly-boxes]")) {
    openPostAssemblyBoxQuantityPopup();
    return;
  }

  if (event.target.closest("[data-close-postassembly-box-modal]")) {
    document.querySelector("#postassembly-box-quantity-modal")?.remove();
    updatePostAssemblyAvailability();
    return;
  }

  if (event.target.closest("#postassembly-box-quantity-save")) {
    const modal = document.querySelector("#postassembly-box-quantity-modal");
    if (!modal || !postAssemblySelectedProduct) return;
    const boxQuantities = [...modal.querySelectorAll("[data-postassembly-box-qty]")].map((input) => String(Number(input.value || 0)));
    const boxCount = boxQuantities.length;
    const totalQty = Number(modal.dataset.totalQty || 0);
    const enteredTotal = boxQuantities.map(Number).reduce((sum, value) => sum + value, 0);
    if (!boxQuantities.every((value) => Number(value) > 0) || enteredTotal !== totalQty) {
      updatePostAssemblyBoxQuantityPopup();
      return;
    }
    const batchNumber = postAssemblySelectedProduct.batch;
    postAssemblyRecords[batchNumber] = {
      ...(postAssemblyRecords[batchNumber] || {}),
      boxCount: String(boxCount),
      totalQty: String(totalQty),
      boxQuantities
    };
    modal.remove();
    renderStage("post-assembly-qc");
    statusMessage.textContent = "Box quantities confirmed for " + batchNumber + ": " + boxQuantities.map((value, index) => "Box " + (index + 1) + " = " + value).join(", ") + ".";
    return;
  }

  if (event.target.closest("[data-postassembly-search-button]")) {
    renderStage("post-assembly-qc");
    statusMessage.textContent = "Post Assembly search applied.";
    return;
  }

  if (event.target.closest("#postassembly-print-button")) {
    printQuarantineLabel();
    return;
  }

  if (event.target.closest("[data-test-quarantine-print]")) {
    statusMessage.textContent = "Test quarantine label sent to printer.";
    return;
  }

  const preQpLogSelect = event.target.closest("[data-preqp-log-select]");
  if (preQpLogSelect) {
    const batchNumber = preQpLogSelect.dataset.preqpLogSelect;
    if (preQpLogSelect.checked && !preQpReleaseLogSelection.includes(batchNumber)) preQpReleaseLogSelection.push(batchNumber);
    if (!preQpLogSelect.checked) preQpReleaseLogSelection = preQpReleaseLogSelection.filter((batch) => batch !== batchNumber);
    renderStage("pre-qp");
    statusMessage.textContent = preQpReleaseLogSelection.length ? `${preQpReleaseLogSelection.length} verified Pre QP batch selected for QP Release Log.` : "No Pre QP batches selected for QP Release Log.";
    return;
  }

  if (event.target.closest("[data-preqp-select-verified]")) {
    preQpReleaseLogSelection = getPreQpProducts()
      .filter((product) => preQpCheckedBatchNumbers.includes(product.batch))
      .map((product) => product.batch);
    renderStage("pre-qp");
    statusMessage.textContent = `${preQpReleaseLogSelection.length} verified Pre QP batch selected for QP Release Log.`;
    return;
  }

  if (event.target.closest("#preqp-print-release-log-button")) {
    openPreQpReleaseLogPrintPreview();
    return;
  }
  const preQpTrigger = event.target.closest("[data-open-preqp]");
  if (preQpTrigger) {
    preQpSelectedProduct = bnsProducts.find((product) => product.batch === preQpTrigger.dataset.openPreqp) || null;
    renderStage("pre-qp");
    return;
  }

  const certifiedTab = event.target.closest("[data-qp-certified-tab]");
  if (certifiedTab) {
    qpCertifiedTab = certifiedTab.dataset.qpCertifiedTab;
    qpCertifiedOpenRelId = "";
    qpCertifiedLabelSelection = [];
    renderStage("qp-certified");
    return;
  }
  const certifiedGroup = event.target.closest("[data-qp-certified-open]");
  if (certifiedGroup) {
    qpCertifiedOpenRelId = qpCertifiedOpenRelId === certifiedGroup.dataset.qpCertifiedOpen ? "" : certifiedGroup.dataset.qpCertifiedOpen;
    renderStage("qp-certified");
    return;
  }
  if (event.target.closest("[data-qp-certified-search]")) {
    renderStage("qp-certified");
    return;
  }
  const qpCertifiedLabelSelect = event.target.closest("[data-qp-certified-label-select]");
  if (qpCertifiedLabelSelect) {
    const batchNumber = qpCertifiedLabelSelect.dataset.qpCertifiedLabelSelect;
    if (qpCertifiedLabelSelect.checked && !qpCertifiedLabelSelection.includes(batchNumber)) qpCertifiedLabelSelection.push(batchNumber);
    if (!qpCertifiedLabelSelect.checked) qpCertifiedLabelSelection = qpCertifiedLabelSelection.filter((batch) => batch !== batchNumber);
    renderStage("qp-certified");
    statusMessage.textContent = qpCertifiedLabelSelection.length ? `${qpCertifiedLabelSelection.length} approved batch selected for release label printing.` : "No approved batch selected for release label printing.";
    return;
  }

  const releaseLogSelect = event.target.closest("[data-release-log-select]");
  if (releaseLogSelect) {
    const batchNumber = releaseLogSelect.dataset.releaseLogSelect;
    if (releaseLogSelect.checked && !preQpReleaseLogSelection.includes(batchNumber)) preQpReleaseLogSelection.push(batchNumber);
    if (!releaseLogSelect.checked) preQpReleaseLogSelection = preQpReleaseLogSelection.filter((batch) => batch !== batchNumber);
    renderStage("release-log");
    statusMessage.textContent = `${preQpReleaseLogSelection.length} batch${preQpReleaseLogSelection.length === 1 ? "" : "es"} selected for one Release Log Sheet.`;
    return;
  }

  const releaseLogRow = event.target.closest("[data-release-log-row]");
  if (releaseLogRow) {
    const batchNumber = releaseLogRow.dataset.releaseLogRow;
    if (preQpReleaseLogSelection.includes(batchNumber)) {
      preQpReleaseLogSelection = preQpReleaseLogSelection.filter((batch) => batch !== batchNumber);
    } else {
      preQpReleaseLogSelection.push(batchNumber);
    }
    renderStage("release-log");
    statusMessage.textContent = `${preQpReleaseLogSelection.length} batch${preQpReleaseLogSelection.length === 1 ? "" : "es"} selected for one Release Log Sheet.`;
    return;
  }

  if (event.target.closest("[data-release-log-select-all]")) {
    preQpReleaseLogSelection = getReleaseLogSheetProducts().map((product) => product.batch);
    renderStage("release-log");
    statusMessage.textContent = `${preQpReleaseLogSelection.length} Pre-QP batch${preQpReleaseLogSelection.length === 1 ? "" : "es"} selected for a new Release Log Sheet.`;
    return;
  }

  if (event.target.closest("[data-release-log-unselect-all]")) {
    preQpReleaseLogSelection = [];
    renderStage("release-log");
    statusMessage.textContent = "All Release Log Sheet selections cleared.";
    return;
  }

  if (event.target.closest("[data-release-log-search]")) {
    releaseLogProductSearch = document.querySelector("[data-release-log-product-search]")?.value || "";
    releaseLogBatchSearch = document.querySelector("[data-release-log-batch-search]")?.value || "";
    releaseLogSiteSearch = document.querySelector("[data-release-log-site-search]")?.value || "WHO";
    renderStage("release-log");
    statusMessage.textContent = "Release Log Sheet filters applied.";
    return;
  }

  if (event.target.closest("[data-release-log-print]")) {
    openReleaseLogSheetPreview();
    return;
  }

  const qpDashboardSelect = event.target.closest("[data-qp-dashboard-select]");
  if (qpDashboardSelect) {
    const batchNumber = qpDashboardSelect.dataset.qpDashboardSelect;
    if (qpDashboardSelect.checked && !qpDashboardSelection.includes(batchNumber)) qpDashboardSelection.push(batchNumber);
    if (!qpDashboardSelect.checked) qpDashboardSelection = qpDashboardSelection.filter((batch) => batch !== batchNumber);
    statusMessage.textContent = qpDashboardSelection.length
      ? `${qpDashboardSelection.length} QP dashboard batch${qpDashboardSelection.length === 1 ? "" : "es"} selected.`
      : "No QP dashboard batches selected.";
    return;
  }

  const qpReleaseCardSelect = event.target.closest("[data-qp-release-card-select]");
  if (qpReleaseCardSelect) {
    const relId = qpReleaseCardSelect.dataset.qpReleaseCardSelect;
    const batches = getQpReleaseProducts().filter((product) => getQpReleaseLogId(product.batch) === relId).map((product) => product.batch);
    if (qpReleaseCardSelect.checked) {
      batches.forEach((batch) => {
        if (!qpDashboardSelection.includes(batch)) qpDashboardSelection.push(batch);
      });
    } else {
      qpDashboardSelection = qpDashboardSelection.filter((batch) => !batches.includes(batch));
    }
    renderStage("qp-release");
    statusMessage.textContent = qpReleaseCardSelect.checked ? `${relId} selected.` : `${relId} unselected.`;
    return;
  }

  const qpReleaseCard = event.target.closest("[data-open-qp-release-id]");
  if (qpReleaseCard) {
    qpSelectedReleaseId = qpReleaseCard.dataset.openQpReleaseId;
    qpSelectedProduct = null;
    qpSelectedDocumentId = "";
    qpChecklistOpen = false;
    renderStage("qp-release");
    statusMessage.textContent = `${qpSelectedReleaseId} batch list opened.`;
    return;
  }

  if (event.target.closest("[data-qp-back-release-cards]")) {
    qpSelectedReleaseId = "";
    qpSelectedProduct = null;
    qpSelectedDocumentId = "";
    qpChecklistOpen = false;
    renderStage("qp-release");
    statusMessage.textContent = "Returned to Release ID cards.";
    return;
  }

  const qpTrigger = event.target.closest("[data-open-qp]");
  if (qpTrigger) {
    if (currentStageId === "qp-certified") return;
    qpSelectedProduct = bnsProducts.find((product) => product.batch === qpTrigger.dataset.openQp) || null;
    qpSelectedDocumentId = "";
    qpChecklistOpen = false;
    renderStage("qp-release");
    return;
  }

  if (event.target.closest("[data-qp-back-list]")) {
    qpSelectedProduct = null;
    qpSelectedDocumentId = "";
    qpChecklistOpen = false;
    renderStage("qp-release");
    return;
  }

  if (event.target.closest("[data-qp-back-dashboard]")) {
    qpChecklistOpen = false;
    renderStage("qp-release");
    return;
  }

  const qpDocumentSelect = event.target.closest("[data-select-qp-document]");
  if (qpDocumentSelect) {
    qpSelectedDocumentId = qpDocumentSelect.dataset.selectQpDocument;
    renderStage("qp-release");
    return;
  }

  const qpDocumentVerify = event.target.closest("[data-verify-qp-document]");
  if (qpDocumentVerify) {
    verifyQpDocument(qpDocumentVerify.dataset.verifyQpDocument);
    return;
  }

  const qpIssueRaise = event.target.closest("[data-raise-qp-issue]");
  if (qpIssueRaise) {
    raiseQpDocumentIssue(qpIssueRaise.dataset.raiseQpIssue);
    return;
  }

  const qpIssueResolve = event.target.closest("[data-resolve-qp-issue]");
  if (qpIssueResolve) {
    resolveQpDocumentIssue(qpIssueResolve.dataset.resolveQpIssue);
    return;
  }

  const qpDocumentReplace = event.target.closest("[data-replace-qp-document]");
  if (qpDocumentReplace) {
    replaceQpDocumentVersion(qpDocumentReplace.dataset.replaceQpDocument);
    return;
  }

  const manualCheckButton = event.target.closest("[data-save-qp-manual]");
  if (manualCheckButton && qpSelectedProduct) {
    const id = manualCheckButton.dataset.saveQpManual;
    const row = manualCheckButton.closest("[data-qp-manual-row]");
    const result = row.querySelector("[data-qp-manual-result]").value;
    const comments = row.querySelector("[data-qp-manual-comment]").value.trim();
    const batch = qpSelectedProduct.batch;
    const previous = qpReleaseRecords[batch] || {};
    const old = previous.manualQpChecks?.[id];
    if ((["Deviation", "Missing"].includes(result) || (["Deviation", "Missing"].includes(old?.result) && result === "Verified")) && !comments) {
      statusMessage.textContent = "Enter the issue details or resolution before saving this check.";
      return;
    }
    const entry = { result, comments, by: currentLogin?.user || "qp.release", at: getAssemblyAuditTimestamp() };
    qpReleaseRecords[batch] = { ...previous, manualQpChecks: { ...(previous.manualQpChecks || {}), [id]: entry }, manualQpCheckHistory: [...(previous.manualQpCheckHistory || []), { id, ...entry }] };
    persistQpReleaseRecords();
    renderStage("qp-release");
    statusMessage.textContent = ["Deviation", "Missing"].includes(result) ? "QP alert raised and included in the Batch Summary Record. Approval blocked." : "QP check saved.";
    return;
  }
  if (event.target.closest("[data-qp-run-system-checks]")) {
    if (!qpSelectedProduct) return;
    const batch = qpSelectedProduct.batch;
    const checks = getQpAutomaticResults(qpSelectedProduct);
    qpReleaseRecords[batch] = { ...(qpReleaseRecords[batch] || {}), systemCheckRun: { at: getAssemblyAuditTimestamp(), checks } };
    persistQpReleaseRecords();
    renderStage("qp-release");
    statusMessage.textContent = `${checks.filter(check => check.status === "Deviation").length} deviations; ${checks.filter(check => check.status === "Pending").length} checks awaiting QP review.`;
    return;
  }
  const overrideButton = event.target.closest("[data-qp-accept-check]");
  const batchRecordOpen = event.target.closest("[data-batch-record-open]");
  if (batchRecordOpen) { window.batchRecordSelected = batchRecordOpen.dataset.batchRecordOpen; renderStage("batch-record"); return; }
  if (event.target.closest("[data-batch-record-back]")) { window.batchRecordSelected = null; renderStage("batch-record"); return; }
  if (event.target.closest("[data-batch-record-search]")) { window.batchRecordSearch = document.querySelector("#batch-record-search")?.value || ""; renderStage("batch-record"); return; }
  const batchRecordPreview = event.target.closest("[data-batch-record-preview]");
  if (batchRecordPreview) { openBatchRecordPreview(batchRecordPreview.dataset.batchRecordPreview); return; }
  if (event.target.closest("[data-batch-record-print]")) { window.print(); return; }
  if (overrideButton) {
    const index = Number(overrideButton.dataset.qpAcceptCheck);
    acceptQpCheckOverride(index, document.querySelector(`[data-qp-override-comment="${index}"]`)?.value || "");
    renderStage("qp-release");
    statusMessage.textContent = "QP override recorded. The original finding has been retained.";
    return;
  }
  if (event.target.closest("[data-qp-approve-batch]")) {
    if (!qpSelectedProduct || !areAllQpDashboardDocumentsVerified(qpSelectedProduct)) {
      statusMessage.textContent = "Review or accept the outstanding findings before approving.";
      return;
    }
    setQpBatchDecision("Approve");
    return;
  }

  if (event.target.closest("[data-qp-reject-batch]")) {
    setQpBatchDecision("Rejected");
    return;
  }

  if (event.target.closest("[data-qp-hold-batch]")) {
    setQpBatchDecision("Hold");
    return;
  }

  if (event.target.closest("[data-qp-banding-batch]")) {
    setQpBatchDecision("Banding");
    return;
  }
  if (event.target.closest("[data-qp-open-checklist]")) {
    if (!qpSelectedProduct || !areAllQpDashboardDocumentsVerified(qpSelectedProduct)) {
      statusMessage.textContent = "Verify every QP document before opening the checklist.";
      return;
    }
    qpChecklistOpen = true;
    renderStage("qp-release");
    return;
  }
  if (event.target.closest("[data-preqp-search-button]")) {
    renderStage("pre-qp");
    statusMessage.textContent = "Pre QP search applied.";
    return;
  }

  if (event.target.closest("[data-qp-search-button]")) {
    renderStage(currentStageId === "qp-certified" ? "qp-certified" : "qp-release");
    statusMessage.textContent = currentStageId === "qp-certified" ? "QP Certified Batches search applied." : "QP Release search applied.";
    return;
  }

  if (event.target.closest("[data-printer-search-button]")) {
    renderStage("label-printing");
    statusMessage.textContent = "Printer batch search applied.";
    return;
  }

  if (event.target.closest("[data-leaflet-folding-search-button]")) {
    renderStage("leaflet-folding");
    statusMessage.textContent = "Leaflet Folding batch search applied.";
    return;
  }

  if (event.target.closest("[data-preqp-back-queue]")) {
    preQpSelectedProduct = null;
    renderStage("pre-qp");
    statusMessage.textContent = "Returned to the Pre QP queue.";
    return;
  }

  const preQpDocTrigger = event.target.closest("[data-view-preqp-document]");
  if (preQpDocTrigger) {
    openPreQpDocumentPreview(preQpDocTrigger.dataset.viewPreqpDocument);
    return;
  }

  const qpDocTrigger = event.target.closest("[data-view-qp-document]");
  if (qpDocTrigger) {
    openQpDocumentPreview(qpDocTrigger.dataset.viewQpDocument);
    return;
  }

  const groupReleaseLogTrigger = event.target.closest("[data-view-qp-group-release-log]");
  if (groupReleaseLogTrigger) {
    openQpReleaseLogPreview(groupReleaseLogTrigger.dataset.viewQpGroupReleaseLog);
    return;
  }

  if (event.target.closest("[data-view-qp-release-log]")) {
    openQpReleaseLogPreview();
    return;
  }

  if (event.target.closest("[data-save-qp-release-log]")) {
    saveQpReleaseLog();
    return;
  }

  if (event.target.closest("[data-sign-qp-release-log]")) {
    requestUserSignoff(signQpReleaseLog, "QP Release Log");
    return;
  }

  if (event.target.closest("#preqp-preview-log-button")) {
    previewPreQpReleaseLog();
    return;
  }

  if (event.target.closest("#preqp-proceed-log-button")) {
    proceedGeneratePreQpReleaseLog();
    return;
  }

  const certifiedLogButton = event.target.closest("[data-qp-certified-log]");
  if (certifiedLogButton) { openCertifiedQpLog(certifiedLogButton.dataset.qpCertifiedLog); return; }
  if (event.target.closest("[data-confirm-certified-print]")) { printCertifiedReleaseLabels(); return; }
  if (event.target.closest("[data-print-release-label]")) {
    openCertifiedPrintConfirmation();
    return;
  }

  if (event.target.closest("[data-preqp-reprint-log]")) {
    statusMessage.textContent = "QP Certified Batches reprint requested.";
    return;
  }

  if (event.target.closest("[data-preassembly-search-button]")) {
    renderStage("pre-assembly-qc");
    statusMessage.textContent = "Pre Assembly search applied.";
    return;
  }

  if (event.target.closest("[data-production-search-button]")) {
    renderStage("room-allocation");
    statusMessage.textContent = "Production Controller search applied.";
    return;
  }

  const continuationPrintTrigger = event.target.closest("[data-print-continuation-page]");
  if (continuationPrintTrigger) {
    printContinuationPage(continuationPrintTrigger.dataset.printContinuationPage, continuationPrintTrigger.dataset.continuationBatch);
    return;
  }

  const approvedArtworkTrigger = event.target.closest("[data-view-approved-artwork]");
  if (approvedArtworkTrigger) {
    openApprovedArtworkPreview(approvedArtworkTrigger.dataset.viewApprovedArtwork, approvedArtworkTrigger.dataset.approvedArtworkBatch);
    return;
  }

  if (event.target.closest("[data-close-approved-artwork]")) {
    closeApprovedArtworkPreview();
    return;
  }

  const approvedArtworkZoom = event.target.closest("[data-approved-artwork-zoom]");
  if (approvedArtworkZoom) {
    changeApprovedArtworkZoom(approvedArtworkZoom.dataset.approvedArtworkZoom);
    return;
  }

  if (event.target.closest("[data-download-approved-artwork]")) {
    downloadApprovedArtwork();
    return;
  }
  const mockupTrigger = event.target.closest("[data-view-mockup]");
  if (mockupTrigger) {
    openMockupPreview(mockupTrigger.dataset.viewMockup);
    return;
  }

  const printerSectionTrigger = event.target.closest("[data-printer-section]");
  if (printerSectionTrigger) {
    printerSection = printerSectionTrigger.dataset.printerSection;
    labelSelectedProduct = null;
    leafletSelectedProduct = null;
    cartonSelectedProduct = null;
    brailleSelectedProduct = null;
    renderStage("label-printing");
    return;
  }

  const labelPrintDoneButton = event.target.closest("[data-label-print-done]");
  if (labelPrintDoneButton) {
    completeLabelPrintItem(labelPrintDoneButton.dataset.labelPrintBatch, labelPrintDoneButton.dataset.labelPrintItem);
    return;
  }

  const saveLabelProgressButton = event.target.closest("[data-save-label-progress]");
  if (saveLabelProgressButton) {
    saveLabelPrintingProgress(saveLabelProgressButton.dataset.saveLabelProgress);
    return;
  }
  const labelBatchPrintDoneButton = event.target.closest("[data-label-batch-print-done]");
  if (labelBatchPrintDoneButton) {
    finalizeLabelPrintingBatch(labelBatchPrintDoneButton.dataset.labelBatchPrintDone);
    return;
  }
  if (event.target.closest("#label-complete-button")) {
    requestUserSignoff(completeLabelPrinting, "Label Printing");
    return;
  }

  const savePrintingProgressButton = event.target.closest("[data-save-printing-progress]");
  if (savePrintingProgressButton) {
    savePrintingModuleProgress(savePrintingProgressButton.dataset.savePrintingProgress, savePrintingProgressButton.dataset.savePrintingBatch);
    return;
  }
  if (event.target.closest("#leaflet-complete-button")) {
    requestUserSignoff(completeLeafletPrinting, "Leaflet Printing");
    return;
  }

  if (event.target.closest("#carton-complete-button")) {
    completeCartonPrinting();
    return;
  }

  if (event.target.closest("#braille-complete-button")) {
    requestUserSignoff(completeBraillePrinting, "Braille Printing");
    return;
  }

  if (event.target.closest("#leaflet-folding-complete-button")) {
    completeLeafletFolding();
    return;
  }

  if (event.target.closest("[data-leaflet-folding-done]")) {
    completeLeafletFolding();
    return;
  }

  if (event.target.closest("#preassembly-complete-button")) {
    requestUserSignoff(completePreAssemblyCheck, "Pre Assembly");
    return;
  }

  if (event.target.closest("#production-complete-button")) {
    requestUserSignoff(completeProductionControl, "Production Controller");
    return;
  }

  if (event.target.closest("#postassembly-complete-button")) {
    requestUserSignoff(completePostAssembly, "Post Assembly");
    return;
  }

  if (event.target.closest("#preqp-complete-button")) {
    requestUserSignoff(completePreQp, "Pre QP");
    return;
  }

  if (event.target.closest("#qp-release-complete-button")) {
    completeQpRelease();
    return;
  }

  if (event.target.closest("[data-qp-process11-sign]")) {
    saveQpProcess11FormState();
    requestUserSignoff(signQpProcess11, "Process 11 - Printed BAR");
    return;
  }

  const printTrigger = event.target.closest("[data-print-labels]");
  if (printTrigger) {
    printLabels(printTrigger.dataset.printLabels);
    return;
  }

  const leafletPrintButton = event.target.closest("[data-print-leaflets]");
  if (leafletPrintButton) {
    printLeaflets(leafletPrintButton.dataset.printLeaflets);
    return;
  }

  const cartonPrintButton = event.target.closest("[data-print-cartons]");
  if (cartonPrintButton) {
    printCartons(cartonPrintButton.dataset.printCartons);
    return;
  }

  const cartonExtraIssueButton = event.target.closest("[data-issue-extra-cartons]");
  if (cartonExtraIssueButton) {
    openCartonExtraIssueDialog(cartonExtraIssueButton.dataset.issueExtraCartons);
    return;
  }

  const braillePrintButton = event.target.closest("[data-print-braille]");
  if (braillePrintButton) {
    printBraille(braillePrintButton.dataset.printBraille);
    return;
  }

  if (event.target.closest("[data-create-bar-no]")) {
    closeCreateBarDialog();
  }
});

document.addEventListener("dblclick", (event) => {
  const splitTrigger = event.target.closest("[data-split-packing-line]");
  if (splitTrigger) {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Split line is disabled.";
      return;
    }
    splitPackingLine(splitTrigger.dataset.splitPackingLine);
  }
});











document.querySelector("#login-submit").addEventListener("click", submitLogin);
document.querySelector("#signoff-yes").addEventListener("click", confirmSignoff);
document.querySelector("#app-confirm-yes").addEventListener("click", confirmAppSignoff);
document.querySelector("#create-bar-yes").addEventListener("click", confirmCreateBar);

document.addEventListener("change", async (event) => {
  if (event.target.matches("[data-qp-sample-upload]")) {
    if (!qpSelectedProduct) return;
    const batch = qpSelectedProduct.batch;
    const kind = event.target.dataset.qpSampleUpload;
    const files = [...event.target.files];
    if (!files.length) return;
    if (files.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      statusMessage.textContent = "Choose JPEG, PNG or WebP sample photos.";
      return;
    }
    statusMessage.textContent = "Saving sample photos…";
    try {
      const images = await Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          const img = new Image();
          img.onerror = reject;
          img.onload = () => {
            const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve({ name: file.name, data: canvas.toDataURL("image/jpeg", 0.85), uploadedAt: getAssemblyAuditTimestamp() });
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      })));
      const previous = qpReleaseRecords[batch] || {};
      const next = { ...previous, samplePhotos: { ...(previous.samplePhotos || {}), [kind]: [...(previous.samplePhotos?.[kind] || []), ...images] }, systemCheckRun: null };
      const updatedRecords = { ...qpReleaseRecords, [batch]: next };
      localStorage.setItem(QP_RELEASE_RECORDS_STORAGE_KEY, JSON.stringify(updatedRecords));
      qpReleaseRecords[batch] = next;
      if (qpSelectedProduct?.batch === batch) renderStage("qp-release");
      statusMessage.textContent = "Sample photos saved as preview images. Content analysis remains pending.";
    } catch (error) {
      statusMessage.textContent = "Photos could not be saved. Browser storage may be full; try fewer or smaller images.";
    }
    return;
  }
  if (event.target.matches("#postassembly-box-count, #postassembly-total-qty")) {
    const boxCount = Number(document.querySelector("#postassembly-box-count")?.value || 0);
    const totalQty = Number(document.querySelector("#postassembly-total-qty")?.value || 0);
    if (postAssemblySelectedProduct && boxCount <= 1) {
      const batchNumber = postAssemblySelectedProduct.batch;
      postAssemblyRecords[batchNumber] = {
        ...(postAssemblyRecords[batchNumber] || {}),
        boxCount: "1",
        totalQty: String(totalQty),
        boxQuantities: [String(totalQty)]
      };
      renderStage("post-assembly-qc");
    } else if (postAssemblySelectedProduct && boxCount > 1) {
      window.setTimeout(openPostAssemblyBoxQuantityPopup, 0);
    }
    return;
  }

  if (event.target.matches("#unified-print-category")) {
    const reasonSelect = document.querySelector("#unified-print-reason");
    const printButton = document.querySelector("#preview-print-button");
    const category = event.target.value;
    const extraSelected = category === "Extra Print";
    if (reasonSelect) {
      reasonSelect.disabled = !extraSelected;
      reasonSelect.value = "";
      if (reasonSelect.options[0]) {
        reasonSelect.options[0].textContent = extraSelected ? "Select reason" : "Not required";
      }
    }
    if (printButton) printButton.disabled = !category || extraSelected;
    statusMessage.textContent = extraSelected
      ? "Select a reason before printing extra copies."
      : `${category} selected. A reason is not required.`;
    return;
  }

  if (event.target.matches("#unified-print-reason")) {
    const category = document.querySelector("#unified-print-category")?.value || "";
    const printButton = document.querySelector("#preview-print-button");
    if (printButton) printButton.disabled = category !== "Extra Print" || !event.target.value;
    statusMessage.textContent = event.target.value
      ? "Extra Print reason selected."
      : "Select a reason before printing extra copies.";
    return;
  }

  if (event.target.matches("[data-bns-select]")) {
    updateBnsBatchSelection(event.target);
    return;
  }

  if (event.target.matches("[data-rp-diagnostic-batch]")) {
    const primaryPoNo = getRpMergePrimaryPo(selectedRpPackPo);
    const poNos = getRpMergePoNos(primaryPoNo);
    poNos.forEach((poNo) => {
      const workflow = rpPackWorkflows[poNo];
      if (!workflow) return;
      workflow.diagnosticBatch = event.target.checked;
      if (!rpApprovalAnswers[poNo]) rpApprovalAnswers[poNo] = {};
      ["art51-decl", "fmd-compliance", "fmd-decom"].forEach((field) => {
        if (event.target.checked) rpApprovalAnswers[poNo][field] = "NA";
        else if (rpApprovalAnswers[poNo][field] === "NA") delete rpApprovalAnswers[poNo][field];
      });
    });
    renderStage("rp-pack");
    setTimeout(updateRpDocumentsAvailability, 0);
    statusMessage.textContent = event.target.checked
      ? "Diagnostic batch selected. Supplier Declaration is no longer required."
      : "Diagnostic batch removed. Supplier Declaration is required again.";
    return;
  }
  if (event.target.matches("[data-packing-row-checkbox]")) {
    if (isPackingListLocked()) {
      event.target.checked = !event.target.checked;
      statusMessage.textContent = "Packing List is generated and locked. Editing is disabled.";
      return;
    }
    const key = event.target.dataset.packingRowKey;
    const prop = event.target.dataset.packingRowCheckbox;
    const val = event.target.checked;
    updatePackingRowValue(key, prop, val);
    return;
  }
  if (event.target.matches("[data-bns-filter]")) {
    bnsFilters[event.target.dataset.bnsFilter] = event.target.value;
    renderStage("bar-creation");
    statusMessage.textContent = "BNS Batch Add filter updated.";
    return;
  }
  if (event.target.matches("[data-rp-file-upload]")) {
    const poNo = event.target.dataset.rpPo;
    const docId = event.target.dataset.rpFileUpload;
    const file = event.target.files[0];
    if (file && rpPackWorkflows[poNo]) {
      const doc = rpPackWorkflows[poNo].documents.find((d) => d.id === docId);
      if (doc) {
        doc.uploaded = true;
        doc.fileName = file.name;
        doc.verified = false;
        if (rpPackWorkflows[poNo].status === "Rejected by RPi") {
          rpPackWorkflows[poNo].viewedDocs = {};
          rpPackWorkflows[poNo].rpTaskViewedDocs = {};
          rpPackWorkflows[poNo].status = "Signed Off";
        }
      }
    }
    updateRpDocumentsAvailability();
    renderStage("rp-pack");
    return;
  }
  if (event.target.matches("[data-pl-add-file]")) {
    const poNo = event.target.dataset.plAddPo;
    const docId = event.target.dataset.plAddFile;
    const file = event.target.files[0];
    if (file && poNo) {
      if (!rpPackWorkflows[poNo]) rpPackWorkflows[poNo] = createPackingWorkflow(poNo);
      const workflowPoNos = [poNo];
      const mergeGroup = getRpMergeGroup(poNo);
      if (mergeGroup && rpSharedDocumentIds.includes(docId)) {
        const primaryPoNo = getRpMergePrimaryPo(poNo);
        if (!workflowPoNos.includes(primaryPoNo)) workflowPoNos.push(primaryPoNo);
      }
      workflowPoNos.forEach((workflowPoNo) => {
        const workflow = rpPackWorkflows[workflowPoNo] || (rpPackWorkflows[workflowPoNo] = createPackingWorkflow(workflowPoNo));
let doc = workflow.documents.find((item) => item.id === docId);
        if (!doc) {
          const definition = getPackingRequiredDocuments().find((item) => item.id === docId);
          if (!definition) return;
          doc = { ...definition, uploaded: false, fileName: "", verified: false };
          workflow.documents.push(doc);
        }
        doc.uploaded = true;
        doc.fileName = file.name;
        doc.verified = false;
        doc.uploadedFrom = currentStageId === "rp-pack" ? "RPi Pack Creation re-upload" : "Add Packing List";
        doc.uploadedForPo = poNo;
        if (workflow.status === "Rejected by RPi") {
          workflow.viewedDocs = {};
          workflow.rpTaskViewedDocs = {};
          workflow.status = "Signed Off";
        }
      });
    }
    if (currentStageId === "rp-pack" && rpiModuleView === "pack-creation") {
      renderStage("rp-pack");
      setTimeout(updateRpDocumentsAvailability, 0);
      statusMessage.textContent = `${file ? file.name : "Document"} re-uploaded for PO ${poNo}.`;
    } else {
      renderStage("packing-list");
      statusMessage.textContent = `${file ? file.name : "Document"} saved for PO ${poNo}. Save the packing list to create its RPi Pack Creation queue.`;
    }
    return;
  }
  if (event.target.matches("[data-process-check], [data-process-comment]")) {
    captureBnsLineClearance(false);
    updateSignoffAvailability();
  }
  if (event.target.matches("[data-packing-check], [data-packing-input], [data-packing-evidence]")) {
    updatePackingListAvailability();
  }
  if (event.target.matches("[data-packing-row-select]")) {
    updatePackingRemoveLineAvailability();
  }
  if (event.target.matches("[data-rp-document]")) {
    updateRpDocumentsAvailability();
  }
  if (event.target.matches("[data-rp-check]")) {
    updateRpApprovalAvailability();
  }
  if (event.target.matches("[data-label-evidence], [data-label-extra]")) {
    updateLabelCompletionAvailability();
    updateLabelRowPrintAvailability();
    syncTestPrintButtons("label");
  }
  if (event.target.matches("[data-leaflet-evidence], [data-leaflet-extra]")) {
    updateLeafletCompletionAvailability();
    syncTestPrintButtons("leaflet");
  }
  if (event.target.matches("[data-carton-evidence], [data-carton-extra]")) {
    updateCartonCompletionAvailability();
  }
  if (event.target.matches("[data-braille-evidence], [data-braille-extra]")) {
    updateBrailleCompletionAvailability();
    syncTestPrintButtons("braille");
  }
  if (event.target.matches("[data-folding-line-clearance], [data-folding-quantity]")) {
    updateLeafletFoldingAvailability();
  }
  if (event.target.matches("[data-preassembly-material], [data-preassembly-input]")) {
    updatePreAssemblyAvailability();
  }
  if (event.target.matches("[data-production-check], [data-production-input]")) {
    updateProductionAvailability();
  }
  if (event.target.matches("[data-assembly-check], [data-assembly-input]")) {
    updateAssemblyAvailability();
  }
  if (event.target.matches("[data-postassembly-input], [data-postassembly-pack-check]")) {
    updatePostAssemblyAvailability();
  }
  if (event.target.matches("[data-preqp-doc-check]") && event.target.checked) {
    const row = event.target.closest("[data-preqp-doc-row]");
    if (row) {
      row.querySelectorAll("[data-preqp-doc-check]").forEach((check) => {
if (check !== event.target) check.checked = false;
      });
    }
  }
  if (event.target.matches("[data-preqp-input], [data-preqp-doc-check], [data-preqp-material-check], [data-preqp-line-clearance]")) {
    updatePreQpAvailability();
  }
  if (event.target.matches('input[name="qp-document-result"]')) {
    const issueSelected = event.target.value === "Issue Found";
    const issueForm = document.querySelector("[data-qp-issue-form]");
    const verifyRow = document.querySelector(".qp-digital-verify-row");
    if (issueForm) issueForm.classList.toggle("hidden", !issueSelected);
    if (verifyRow) verifyRow.classList.toggle("hidden", issueSelected);
  }
  if (event.target.matches("[data-qp-doc-check], [data-qp-input]")) {
    updateQpReleaseAvailability();
  }
  if (event.target.matches("[data-qp-process11-input]")) {
    saveQpProcess11FormState();
    updateQpReleaseAvailability();
  }
  if (event.target.matches("[data-batchcheck-field-check]")) {
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    if (row) {
      const checks = getBatchCheckerLineChecks(row);
      checks[Number(event.target.dataset.batchcheckFieldCheck)] = event.target.checked;
      const confirmBtn = document.querySelector("#batch-check-confirm-btn");
      if (confirmBtn) confirmBtn.disabled = false;
    }
    return;
  }
  if (event.target.matches("[data-batchchecker-row-select]")) {
    selectedBatchCheckerRowKey = event.target.checked ? Number(event.target.dataset.batchcheckerRowSelect) : null;
    renderStage("batch-checker");
    return;
  }
  if (event.target.id === "chk-line-clearance" || event.target.classList.contains("pcl-checkbox")) {
    updatePclSubmissionAvailability();
  }
  
  if (event.target.classList.contains("rp-form-chk")) {
    const field = event.target.dataset.rpField;
    const value = event.target.dataset.val;
    
    if (!rpApprovalAnswers[selectedRpApprovalPo]) {
      rpApprovalAnswers[selectedRpApprovalPo] = {};
    }
    
    if (event.target.checked) {
      rpApprovalAnswers[selectedRpApprovalPo][field] = value;
    } else {
      delete rpApprovalAnswers[selectedRpApprovalPo][field];
    }
    
    // Uncheck other checkboxes for the same field
    document.querySelectorAll(`.rp-form-chk[data-rp-field='${field}']`).forEach(chk => {
      if (chk !== event.target) chk.checked = false;
    });
    
    // Enable/disable inactive reason input based on supplier status
    if (field === "fe-status") {
      const reasonInput = document.querySelector("#rp-form-inactive-reason");
      if (reasonInput) reasonInput.disabled = false;
    }
    
    updateRpApprovalAvailability();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-qp-process11-input]")) {
    saveQpProcess11FormState();
    updateQpReleaseAvailability();
    return;
  }

  if (event.target.matches("#postassembly-box-count, #postassembly-total-qty")) {
    const boxCount = Number(document.querySelector("#postassembly-box-count")?.value || 0);
    const editButton = document.querySelector("[data-edit-postassembly-boxes]");
    if (editButton) {
      editButton.disabled = boxCount <= 1;
      editButton.textContent = boxCount > 1 ? "Enter Quantities" : "Edit Quantities";
    }
    if (postAssemblyBoxPopupTimer) window.clearTimeout(postAssemblyBoxPopupTimer);
    if (postAssemblySelectedProduct && boxCount > 1) {
      postAssemblyBoxPopupTimer = window.setTimeout(() => {
        postAssemblyBoxPopupTimer = null;
        openPostAssemblyBoxQuantityPopup();
      }, 450);
    }
    updatePostAssemblyAvailability();
    return;
  }

  if (event.target.matches("[data-postassembly-box-qty]")) {
    updatePostAssemblyBoxQuantityPopup();
    return;
  }

  if (event.target.id === "batchchecker-reprint-reason") {
    const confirmButton = document.querySelector("#batchchecker-reprint-confirm");
    if (confirmButton) confirmButton.disabled = !event.target.value.trim();
    return;
  }
  if (event.target.id === "batchchecker-pcl-comments") {
    const rows = getBatchCheckerRows();
    const row = rows[selectedBatchCheckerRowKey];
    if (row) batchCheckerPclRegulatoryComments[getBatchCheckerRowKey(row)] = event.target.textContent.trim();
    updatePclSubmissionAvailability();
    return;
  }
  if (event.target.matches("[data-rp-documents-po-search]")) {
    rpDocumentsPoSearch = event.target.value;
    return;
  }
  if (event.target.matches("[data-checklist-decision-search]")) {
    checklistDecisionSearch = event.target.value;
    return;
  }
  if (event.target.matches("[data-qa-decision-comment]")) {
    const poNo = event.target.dataset.qaDecisionComment;
    const item = checklistDecisionQueue.find((entry) => entry.poNo === poNo);
    if (item) item.qaDecisionComment = event.target.value;
    return;
  }  const psField = event.target.closest("[data-ps-field]");
  if (psField) {
    const batch = psField.dataset.psBatch;
    const section = psField.dataset.psSection;
    const field = psField.dataset.psField;
    const value = event.target.value;
    
    if (!changeOfPackSizeData[batch]) {
      changeOfPackSizeData[batch] = {
receivedAs: { ecma: "", packSize: "", blisterPerPack: "", qty: "", totalBlisters: "", initials: "" },
assembledAs: { ecma: "", packSize: "", blisterPerPack: "", finishedQty: "", surplus: "", initials: "" },
printerAmendmentsInitials: "",
qcAmendmentsInitials: ""
      };
    }
    
    changeOfPackSizeData[batch][section][field] = value;
    
    // Automatically calculate total blisters: totalBlisters = qty * blisterPerPack
    if (section === "receivedAs" && (field === "qty" || field === "blisterPerPack")) {
      const qtyVal = parseInt(changeOfPackSizeData[batch].receivedAs.qty) || 0;
      const bppVal = parseInt(changeOfPackSizeData[batch].receivedAs.blisterPerPack) || 0;
      const total = qtyVal * bppVal;
      changeOfPackSizeData[batch].receivedAs.totalBlisters = total;
      
      const totalBlistersInput = document.querySelector(`[data-ps-batch="${batch}"][data-ps-section="receivedAs"][data-ps-field="totalBlisters"]`);
      if (totalBlistersInput) {
totalBlistersInput.value = total;
      }
    }
    persistChangeOfPackSizeData();
    
    updateLabelCompletionAvailability();
    updatePreAssemblyAvailability();
  }
  if (event.target.id === "rp-form-inactive-reason") {
    if (!rpApprovalAnswers[selectedRpApprovalPo]) rpApprovalAnswers[selectedRpApprovalPo] = {};
    rpApprovalAnswers[selectedRpApprovalPo]["inactive-reason"] = event.target.value;
    updateRpApprovalAvailability();
    return;
  }
  if (event.target.id === "rp-form-comments") {
    rpApprovalComments[selectedRpApprovalPo] = event.target.value;
    return;
  }
  if (event.target.matches("[data-batchchecker-filter]")) {
    batchCheckerFilters[event.target.dataset.batchcheckerFilter] = event.target.value;
    selectedBatchCheckerRowKey = null;
    renderStage("batch-checker");
    return;
  }
  if (event.target.matches("[data-batchchecker-row-edit]")) {
    const rows = getBatchCheckerRows();
    const row = rows[Number(event.target.dataset.batchcheckerRowIndex)];
    if (row) {
      const field = event.target.dataset.batchcheckerRowEdit;
      if (!["mfgLotNo", "expiryDate", "qty"].includes(field)) return;
      row[field] = event.target.value;
      if (field === "mfgLotNo") row.manufLotNo = event.target.value;
      resetBatchCheckerPclAfterEdit(row);
      statusMessage.textContent = "Batch Checker row updated.";
    }
    return;
  }
  if (event.target.matches("[data-rp-approval-search]")) {
    rpApprovalSearch = event.target.value;
    selectedRpApprovalPo = null;
    statusMessage.textContent = "Enter a PO number and click Search.";
    return;
  }
  if (event.target.matches("[data-packing-search]")) {
    packingListSearch = event.target.value;
    packingListSelectedPo = event.target.value || packingListSelectedPo;
    statusMessage.textContent = "Enter a PO number and click Search.";
    return;
  }
  if (event.target.matches("[data-bns-filter]")) {
    bnsFilters[event.target.dataset.bnsFilter] = event.target.value;
    renderStage("bar-creation");
    statusMessage.textContent = "BNS Batch Add filter updated.";
    return;
  }
  if (event.target.matches("[data-process-comment]")) {
    captureBnsLineClearance(false);
    updateSignoffAvailability();
  }
  if (event.target.matches("[data-packing-row-input]")) {
    if (isPackingListLocked()) {
      statusMessage.textContent = "Packing List is generated and locked. Editing is disabled.";
      renderStage("packing-list");
      return;
    }
    updatePackingRowValue(event.target.dataset.packingRowKey, event.target.dataset.packingRowInput, event.target.value);
    return;
  }
  if (event.target.matches("[data-packing-input]")) {
    updatePackingListAvailability();
  }
  if (event.target.matches("[data-label-extra]")) {
    updateLabelCompletionAvailability();
    updateLabelRowPrintAvailability();
    syncTestPrintButtons("label");
  }
  if (event.target.matches("[data-leaflet-extra]")) {
    updateLeafletCompletionAvailability();
    syncTestPrintButtons("leaflet");
  }
  if (event.target.matches("[data-carton-extra]")) {
    updateCartonCompletionAvailability();
  }
  if (event.target.matches("[data-braille-extra]")) {
    updateBrailleCompletionAvailability();
    syncTestPrintButtons("braille");
  }
  if (event.target.matches("[data-folding-quantity]")) {
    updateLeafletFoldingAvailability();
  }
  if (event.target.matches("[data-preassembly-search]")) {
    preAssemblySearch = event.target.value;
    renderStage("pre-assembly-qc");
    statusMessage.textContent = "Pre Assembly filter updated.";
    return;
  }
  if (event.target.matches("[data-preassembly-input]")) {
    updatePreAssemblyAvailability();
  }
  if (event.target.matches("[data-production-search]")) {
    productionSearch = event.target.value;
    renderStage("room-allocation");
    statusMessage.textContent = "Production Controller filter updated.";
    return;
  }
  if (event.target.matches("[data-production-input]")) {
    updateProductionAvailability();
  }
  if (event.target.matches("[data-assembly-search]")) {
    assemblySearch = event.target.value;
    const match = getAssemblyProducts().find((product) => exactBatchOrMfgLotMatch(product, assemblySearch));
    if (match) {
      assemblySelectedProduct = match;
      renderStage("assembly-room");
      statusMessage.textContent = `Assembly Room opened for ${match.batch}.`;
      return;
    }
    renderStage("assembly-room");
    statusMessage.textContent = "Assembly Room filter updated.";
    return;
  }
  if (event.target.matches("[data-assembly-ipc-evidence]")) {
    const evidenceLabel = event.target.closest(".assembly-evidence-button");
    const evidenceText = evidenceLabel ? evidenceLabel.querySelector("span") : null;
    if (evidenceLabel) evidenceLabel.classList.toggle("is-uploaded", Boolean(event.target.files && event.target.files.length));
    if (evidenceText) evidenceText.textContent = event.target.files && event.target.files.length ? "Photo attached" : "Add photo";
    statusMessage.textContent = event.target.files && event.target.files.length ? "IPC photo evidence attached." : "IPC photo evidence cleared.";
    updateAssemblyAvailability();
    return;
  }  if (event.target.matches("[data-assembly-input]")) {
    updateAssemblyAvailability();
  }
  if (event.target.matches("[data-postassembly-search]")) {
    postAssemblySearch = event.target.value;
    const match = getPostAssemblyProducts().find((product) => exactBatchOrMfgLotMatch(product, postAssemblySearch));
    if (match) {
      postAssemblySelectedProduct = match;
      renderStage("post-assembly-qc");
      statusMessage.textContent = `Post Assembly opened for ${match.batch}.`;
      return;
    }
    renderStage("post-assembly-qc");
    statusMessage.textContent = "Post Assembly filter updated.";
    return;
  }
  if (event.target.matches("[data-postassembly-input], [data-postassembly-pack-check]")) {
    updatePostAssemblyAvailability();
  }
  if (event.target.matches("[data-preqp-search]")) {
    preQpSearch = event.target.value;
    const normalizedPreQpSearch = preQpSearch.trim().toLowerCase();
    const match = getPreQpProducts().find((product) => String(product.batch || product.batchNo || "").trim().toLowerCase() === normalizedPreQpSearch);
    if (match) {
      preQpSelectedProduct = match;
      renderStage("pre-qp");
      statusMessage.textContent = `Pre QP opened for ${match.batch}.`;
      return;
    }
    renderStage("pre-qp");
    statusMessage.textContent = "Pre QP filter updated.";
    return;
  }
  if (event.target.matches("[data-preqp-input], [data-preqp-material-check], [data-preqp-line-clearance]")) {
    updatePreQpAvailability();
  }
  if (event.target.matches("[data-printer-search]")) {
    printerSearch = event.target.value;
    statusMessage.textContent = "Enter a B&S batch number and click Search.";
    return;
  }
  if (event.target.matches("[data-leaflet-folding-batch-search]")) {
    leafletFoldingBatchSearch = event.target.value;
    return;
  }
  if (event.target.matches("[data-leaflet-folding-mfg-search]")) {
    leafletFoldingMfgSearch = event.target.value;
    return;
  }
  if (event.target.matches("[data-qp-id-search]")) {
    qpIdSearch = event.target.value;
    statusMessage.textContent = "Enter the complete Rel ID, then click Search.";
    return;
  }
  if (event.target.matches("[data-qp-status-search]")) {
    qpStatusSearch = event.target.value;
    renderStage(currentStageId === "qp-certified" ? "qp-certified" : "qp-release");
    statusMessage.textContent = currentStageId === "qp-certified" ? "QP Certified Batches status filter updated." : "QP Release status filter updated.";
    return;
  }
  if (event.target.matches("[data-qp-batch-search]")) {
    qpBatchSearch = event.target.value;
    statusMessage.textContent = "Enter the complete B&S batch number, then click Search.";
    return;
  }
  if (event.target.matches("[data-qp-search]")) {
    qpBatchSearch = event.target.value;
    renderStage(currentStageId === "qp-certified" ? "qp-certified" : "qp-release");
    statusMessage.textContent = currentStageId === "qp-certified" ? "QP Certified Batches filter updated." : "QP Release filter updated.";
    return;
  }
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `${button.dataset.tab}-panel`);
    });
  });
});

startWireframe();






















































