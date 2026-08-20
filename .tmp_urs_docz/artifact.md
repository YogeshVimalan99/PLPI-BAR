# DOCZ URS template contract

## Reference

- Source: `C:\Users\vimalyog\Desktop\PLPI Batch Automation\docz\URS-PLPI BAR.docx`
- SHA-256: `8502702378F90CF3199970170FDF51DB74DC4E26CAF845A466B91B6865485CB7`
- Baseline: 8 pages, 3 sections, 9 tables, 0 comments, 0 revisions.
- Render evidence: `.tmp_urs_docz\reference-render\page-01.png` through `page-08.png`.

## Page system

- US Letter portrait: 612 x 792 pt.
- Margins: top 107 pt, bottom 55 pt, left 39 pt, right 52 pt.
- Header distance 9.1 pt; footer distance 45.6 pt.
- Three next-page sections: approval cover, revision history, then contents plus controlled body.
- Header/footer package parts and their linked section behavior are preserve-only.
- Branded page furniture uses the existing B&S logo, navy rule, left title/version block, company-address footer and right `Page x of y` field.
- Visible pattern: full branded furniture on the cover and alternating content pages; even pages retain the restrained top rule/footer behavior shown by the reference.

## Typography and colour

- Primary family: Verdana throughout.
- Body: 11 pt, regular, dark navy, justified, approximately 12.4 pt line spacing, 63.6 pt left indent.
- Main and subsection headings: 10 pt, bold, dark navy; compact spacing; main headings use the reference's outdented numbering pattern.
- Contents title: 13 pt bold; TOC entries 10 pt bold with dotted leaders and the reference indents.
- Revision heading: 12 pt bold.
- Cover approval text: 11 pt regular, dark navy.
- Requirement table headers: 10 pt bold white on dark navy.
- Requirement IDs: 11 pt bold dark navy; requirement text: 11 pt regular dark navy.

## Tables

- Revision table: four columns, dark navy header, white 10 pt bold text, 10 pt body, black single-line grid.
- Abbreviation table: two columns, 10 pt, bold term column, black single-line grid, no coloured header row.
- Requirement tables: two columns (`URS ID`, `Requirements`), dark navy header, black single-line grid, 11 pt body, repeated header when split across pages.
- Preserve the source table widths, indentation, cell margins, line spacing and row expansion behavior; no fixed row heights.

## Components and content flow

1. Approval cover with logo/title/version and five role-based signature blocks.
2. Revision History and revision table.
3. Contents page.
4. Introduction, Scope, Out of Scope, Abbreviations.
5. User Requirement and Specification introduction.
6. Numbered 4.x requirement subsections, each followed by a two-column URS table.
7. User Access, Testing, Documents and Support.

## Slot map

- Header title/version text box: rewrite for the Stage 4-8 PLPI BAR project; preserve logo, geometry and rule.
- Cover approval names/roles: rewrite as project-role placeholders; preserve positions and signature/date lines.
- Revision row: rewrite completely for this project.
- TOC: regenerate from the final headings.
- Section 3 narrative, abbreviations, requirements and closing sections: replace completely with original Stage 4-8 content.
- Company branding/address and page fields: preserve as presentation furniture.

## Fidelity gates

- Reference must remain byte-for-byte unchanged at the recorded hash.
- Final page geometry, fonts, colours, paragraph rhythm, tables, header/footer placements and cover layout must be recognizably identical to the source template.
- No reference project wording, Phase 1 requirements, personnel names or document identifier may remain.
- Render and inspect every final page; no clipping, overlaps, broken rows or unexpected font substitution.
