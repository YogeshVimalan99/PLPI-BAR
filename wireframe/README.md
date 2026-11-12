# PLPI Batch Record Automation Wireframe

## Purpose

This clickable wireframe models the BAR Creation workflow for the PLPI Batch Record Automation project. The current focus is the **BNS Batch Add / BAR Creation** module and the common **Printer** module.

The wireframe is intentionally built as a static HTML/CSS/JavaScript prototype so it can be opened directly in a browser and reviewed without installing dependencies.

## Files

- `index.html`  
  Main HTML structure. Contains the PLPI-style desktop shell, toolbar, module window, login dialog, create-BAR confirmation dialog, and user sign-off dialog.

- `styles.css`  
  Visual styling. Recreates the PLPI desktop look: grey workspace, classic toolbar, dense BNS table, PLPI-style modal windows, and created BAR popup layout.

- `app.js`  
  Wireframe behavior. Handles login, product list rendering, create-BAR confirmation, Process 1 checklist validation, user sign-off, Printer module menu routing, Label Printing, Leaflet Printing, evidence capture, and stage handoff.

## How To Open

Open this file in a browser:

- [Click here to open the wireframe: wireframe/index.html](index.html) (if your editor/viewer supports clickable links)
- Or launch the root shortcuts: [Launch_Wireframe.html](../Launch_Wireframe.html) or [Open_Wireframe.url](../Open_Wireframe.url)
- Or drag the `wireframe/index.html` file into any web browser.

No build step is required.

## Current Flow

1. The page opens with a simple login dialog.
2. The user enters username and password.
3. After login, the BNS Batch Add product list appears.
4. The user clicks a product row.
5. A confirmation dialog asks whether to create the BAR.
6. If the user clicks **Yes**, a created BAR / Process 1 popup opens.
7. The created BAR popup shows:
   - Batch No.
   - Product Name
   - Strength
   - Pack Size
   - ECMA
   - Expiry Date
8. The user must tick all Process 1 checklist items and enter a comment.
9. Only then is **User Sign Off** enabled.
10. After sign-off, the username, date, and time are captured.
11. The batch is shown as moved to Printer - Label Printing.
12. The screen returns to the BNS Batch Add product list.
13. The generated batch is removed from the product list.
14. Printing users open the common **Printer** module.
15. The Printer module displays four options:
   - Label Printing
   - Leaflet Printing
   - Carton Printing
   - Braille Printing
16. Label Printing shows only batches ready for label printing.
17. After label printing is submitted, batches requiring leaflets move to the Leaflet Printing List.
18. Leaflet Printing follows the same simplified print/evidence/sign-off layout as Label Printing.
19. After Leaflet Printing, reboxing batches move to Carton Printing.
20. After Leaflet Printing, relabelling batches move to Braille Printing only when braille is required.

## Main Design Decisions

- The screen follows the existing PLPI desktop application style shown in the reference screenshot.
- Nothing useful is shown before login.
- BNS Batch Add opens directly after login.
- The first screen after login is the product list, not the Process 1 form.
- The Process 1 screen appears only after the user confirms BAR creation.
- BAR Creation User Sign Off is blocked until required checks and comments are complete.
- Printer users enter through one shared Printer module, then select Label, Leaflet, Carton, or Braille Printing.
- Label Printing submission is blocked until labels are printed, line clearance is complete, first/last label photo evidence is uploaded, and any extra label quantity has a reason.
- Leaflet Printing submission is blocked until leaflets are printed, line clearance is complete, foreign leaflet photo evidence and master printed leaflet copy are uploaded, and any extra leaflet quantity has a reason.
- Label Printing details remain visible but read-only during Leaflet Printing.
- Once signed off, the batch moves to the next workflow stage and disappears from the current list.

## Current Scope

Implemented in detail:

- BAR Creation / BNS Batch Add
- Product list
- Create BAR confirmation
- Created BAR / Process 1 popup
- Checklist gating
- Comment requirement
- User sign-off capture
- Move to Printer - Label Printing behavior
- Common Printer module menu
- Label Printing list view
- Label Printing task view showing batch details, required quantity, quantity already printed, remaining quantity, blister printing requirement, extra label quantity, extra label reason, line clearance, and evidence upload
- Print Labels action
- First and last printed label photo evidence upload
- Label Printing user sign-off gating
- Leaflet Printing list view for label-complete batches only
- Leaflet Printing task view with editable leaflet print quantities, extra leaflet quantity/reason, leaflet evidence, and submit gating
- Carton Printing list and task view for reboxing batches
- Braille Printing list and task view for relabelling batches where braille is required
- Printer audit trail capturing user, date, time, quantity printed, extra quantity, reason, and uploaded evidence references

Future wireframe stages still to be expanded:

- Carton / Braille Preparation
- Leaflet Folding
- Pre-Assembly QC
- Production Control / Room Allocation
- Assembly Room Operations
- Post-Assembly QC
- Pre-QP
- QP Approval / Release

## Key JavaScript Functions

- `openLogin(stageId)`  
  Opens the login dialog.

- `submitLogin()`  
  Authenticates the mock user and opens the BNS Batch Add workflow.

- `renderBarCreationWork(stage)`  
  Renders either the product list or the created BAR Process 1 popup depending on current state.

- `openCreateBarDialog(batchNumber)`  
  Opens the confirmation dialog for the selected product batch.

- `confirmCreateBar()`  
  Creates the mock BAR and opens the Process 1 popup.

- `updateSignoffAvailability()`  
  Enables User Sign Off only when all checklist items are ticked and comments are entered.

- `confirmSignoff()`  
  Captures username/date/time and moves the batch to Printer - Label Printing.

- `renderPrinterMenu()`  
  Shows the four common Printer options: Label Printing, Leaflet Printing, Carton Printing, and Braille Printing.

- `printLabels(batchNumber)`  
  Marks the required label quantities as printed and enables evidence upload.

- `updateLabelCompletionAvailability()`  
  Enables Label Printing submit only after labels are printed, line clearance is complete, first and last label evidence are uploaded, and extra label reasons are captured when required.

- `printLeaflets(batchNumber)`  
  Marks the required leaflet quantities as printed and enables leaflet evidence upload.

- `updateLeafletCompletionAvailability()`  
  Enables Leaflet Printing submit only after leaflets are printed, line clearance is complete, foreign leaflet and master printed leaflet evidence are uploaded, and extra leaflet reasons are captured when required.

- `auditPrinterAction(type, product, detail)`  
  Captures the audit trail for print actions with user, date, time, quantity, extra quantity, reason, and evidence summary.

## Notes

This is a clickable wireframe, not a production implementation. Data is mock data stored in `app.js`.

The route logic follows the process documentation: reboxing batches move to Carton Printing, and relabelling batches move to Braille Printing when braille is required.

The next step is to continue designing each workflow stage in the same clickable style before converting the agreed design into an exact prototype.
