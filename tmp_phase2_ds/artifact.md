# DS template execution contract

- Reference: `C:\Users\vimalyog\Desktop\PLPI Batch Automation\Reference Doc (Templates)\DS - PLPI System  29 Oct 2024 DRAFT FINAL.docx`
- SHA-256: `187AA4BCD809C397D8D2D201650FB23C3C92AED1E7F2B4E7860667796B2FDEA8`
- Reference pages: 30; sections: 1.
- Evidence: `tmp_phase2_ds/official-reference.pdf`, `tmp_phase2_ds/official-reference-page-*.png`, and the template section/style audit evidence.

## Page system

- A4 portrait, 8.27 x 11.69 inches.
- Margins: 1.00 inch on all sides.
- One section, new-page start; header and footer are not linked; no distinct first/odd/even page variants.
- Header and footer distance are inherited from the retained template. Preserve its logo, blue running title, document identifier, horizontal rule, footer identifier, PAGE and NUMPAGES fields.

## Typography and colour

- Verdana throughout. Body text is dark blue (`002060`) at 10 pt with compact business-document paragraph rhythm.
- Heading 1 is bold Verdana, approximately 14 pt, dark blue, with keep-with-next and increased spacing before/after.
- Heading 2 is bold Verdana, approximately 12 pt, dark blue, with keep-with-next and restrained spacing.
- Cover title uses bold centred Verdana, 16 pt; project subtitle uses bold centred Verdana, 14 pt.
- Table body text is Verdana 9 pt; header text is Verdana 9 pt bold white on dark-blue (`002060`) fill. Existing/New classification uses the same font size as all other cells.
- Body and table text must not be reduced selectively to represent classification or importance.

## Tables and components

- Tables are fixed-width, aligned to the body text, with explicit column grids, black single borders, white body cells and dark-blue header rows.
- Table cells have consistent internal margins, vertical centring and expanding row heights; header rows repeat when a table spans pages.
- Cover contains the retained approval-table pattern. The contents page uses a real Word TOC field covering heading levels 1-2.
- Detailed design uses the retained pattern of short narrative paragraphs, labelled design statements, step paragraphs and dense but readable design matrices.
- Long matrices may span pages and must repeat their header row. Do not split a record row across pages.

## Content flow and slots

1. Cover: document type, project name, phase/scope subtitle, approval table.
2. Table of contents.
3. Introduction: purpose, scope, references and abbreviations.
4. Overall design: application boundary, end-to-end flow, routing, roles and design principles.
5. Detailed design: B&S Batch Add/BAR; common Printer design; Label; Leaflet; Carton; Braille; Leaflet Folding; status/routing; data/audit.
6. Non-functional requirements.
7. URS/FS/DS traceability.
8. Design verification and acceptance considerations.

All Phase 1 source body text is a rewrite slot and must be replaced. Header/footer artwork, styles, numbering, theme, page geometry and package relationships are preserve-only except for the running title/document identifier text.

## Fidelity gates

- Retained reference must remain byte-for-byte unchanged.
- Final output must visibly use the same logo/header/footer, blue/white palette, Verdana hierarchy, table treatment and page geometry.
- All final pages must be inspected after Word rendering. No clipping, overflow, header/footer collisions, narrow table columns, orphan headings or blank pages.
- TOC and page fields must be refreshed in Word before final render.
