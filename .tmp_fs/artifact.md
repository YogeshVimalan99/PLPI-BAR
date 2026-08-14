# FS template execution contract

## Reference

- Retained reference: `C:\Users\vimalyog\Desktop\PLPI Batch Automation\docz\FS-PLPI BAR.docx`
- SHA-256: `CAF71EF9EB8B5C0A39FEA1D7B85F268E462D72A9DF095AF69566DE45B52F7AA3`
- Source facts: 28 pages, one section, 13 body tables, 57 fields, one branded header image.
- Render evidence: `C:\Users\vimalyog\Desktop\PLPI Batch Automation\.tmp_fs\reference-render` (28 page PNGs inspected).
- Content authority: final URS at `C:\Users\vimalyog\Desktop\PLPI Batch Automation\Project Doc\URS-PLPI BAR - B&S Batch Add Printing and Leaflet Folding.docx`, SHA-256 `BE36929CF650AF706B480DD0F132BDA9A0D8FF57D9CF0F003EED0FBA23867F85`.

## Page system

- A4 portrait: 595.3 x 841.9 pt.
- Margins: 72 pt on all sides; header/footer distance 35.4 pt.
- One section; same header/footer throughout; no different-first-page or odd/even split.
- Header: B&S Healthcare logo at upper left, then document title, identifier and thin blue rule.
- Footer: identifier at left and `Page X of Y` at right.

## Typography and colour

- Primary typeface: Verdana.
- Normal: 11 pt, dark blue `6299648`, 13 pt line spacing, 8 pt after.
- Heading 1: Verdana 11 pt bold, dark blue, 12 pt before, keep with next.
- Heading 2: Verdana 11 pt bold, dark blue, 2 pt before, keep with next.
- TOC 1/2: Verdana 11 pt, 13 pt line spacing, 5 pt after; TOC 2 has 11 pt left indent.
- Table title/header bands: dark navy fill with bold white text; table body text follows the compact blue Verdana system.

## Tables and recurring components

- Approval page: three linked signature tables; preserve their borders, names/roles layout and spacing, but use the current URS approval names/roles.
- Revision table: 4 columns, 484.3 pt overall, 57.7 / 105.3 / 209.3 / 112.1 pt pattern.
- Abbreviation table: 2 columns, approximately 450.8 pt overall, 91.9 / 358.9 pt.
- Functional module table: 11 rows x 2 columns, approximately 481.7 pt overall, 91.9 / 389.8 pt. Row order is fixed: module title, Priority, Purpose, Role, Input, Operations, Use case, Output, DS ID, URS ID, Business Rule. The Input cell contains a nested 3-column table (`Field Name`, `Field type`, `Comments`).
- Traceability/non-functional table: 3 columns, approximately 481.7 pt overall, 80.9 / 112.8 / 288.1 pt, 2.2 pt cell padding.
- Table rows expand automatically and split across pages as required; header/title rows repeat where the source pattern does so.

## Content flow

1. Approval/signature page.
2. Revision History.
3. Automatic Table of Contents.
4. Introduction: project summary, purpose, scope/out-of-scope and abbreviations.
5. Overall Description: status and routing summary.
6. Functional Specification introduction.
7. Seven module tables in workflow order.
8. Non-Functional Specification: URS-to-FS/DS traceability table.
9. Audit Trail, Availability, Capacity Limits, Performance, Recoverability, Security, Error Handling, Usability, Accuracy & Validity, User Access and Responsibilities, Testing, Controlled Documents and Training, Support and Administration.

## Slot map

- Header/footer title and identifier: rewrite for Phase 2 FS; preserve logo, line, page fields and placement.
- Approval tables: rewrite names/roles from final URS; preserve table construction.
- Revision history: rewrite only the revision row.
- TOC: preserve automatic field; update after all edits.
- Introduction/overall-description prose: rewrite for final URS scope.
- Abbreviations: replace with terms actually used in the current FS.
- Functional module headings and seven 11-row tables: rewrite fully for B&S Batch Add and BAR Creation, shared Printing Module, Label Printing, Leaflet Printing, Carton Issuing, Braille Printing and Leaflet Folding. Preserve table structure and styling.
- Traceability table: rebuild rows to cover every current URS requirement and point to the relevant FS module/DS reference.
- Non-functional prose: rewrite for the current scope while retaining the same heading sequence and tone.

## Package preservation

- Preserve-only: theme, styles, numbering, logo media part, header/footer drawing relationships, footnotes/endnotes shells, custom XML, core table styles and section geometry.
- Editable: `word/document.xml` body content, header/footer text nodes, TOC cached results/fields, and page-count field results.
- Do not modify the retained reference. Build from a working copy at a different path.

## Fidelity gates

- Final title block, header/footer, typography, blue colour system, heading rhythm, table bands, widths and nested Input tables must remain recognisably identical to the reference.
- Inspect every final rendered page for clipping, table overflow, orphaned headings, broken nested tables and stale TOC/page fields.
- Confirm every final URS requirement appears in traceability and no Phase 1-only content remains.
- Confirm the retained reference hash remains unchanged.
