from pathlib import Path

import pypdfium2 as pdfium


pdf_path = Path(r"C:\Users\vimalyog\Desktop\PLPI Batch Automation\tmp_phase2_ds\final-clean6.pdf")
output_dir = Path(r"C:\Users\vimalyog\Desktop\PLPI Batch Automation\tmp_phase2_ds\final-render-6")
output_dir.mkdir(parents=True, exist_ok=True)

pdf = pdfium.PdfDocument(pdf_path)
for page_number, page in enumerate(pdf, start=1):
    image = page.render(scale=1.667).to_pil()
    image.save(output_dir / f"page-{page_number:02d}.png")

print(len(pdf))
