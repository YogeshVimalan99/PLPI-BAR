from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp_ds_wireframe_update" / "screenshots"
OUTPUT = ROOT / "tmp_ds_wireframe_update" / "contact_sheets"
OUTPUT.mkdir(parents=True, exist_ok=True)


def make_sheet(name, files, thumb_width=760):
    prepared = []
    for filename in files:
        image = Image.open(SOURCE / filename).convert("RGB")
        ratio = thumb_width / image.width
        resized = image.resize((thumb_width, max(1, int(image.height * ratio))))
        prepared.append((filename, resized))

    label_height = 34
    gap = 18
    width = thumb_width + 2 * gap
    height = gap + sum(label_height + image.height + gap for _, image in prepared)
    sheet = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=18)
    y = gap
    for filename, image in prepared:
        draw.text((gap, y), filename, fill="black", font=font)
        y += label_height
        sheet.paste(image, (gap, y))
        y += image.height + gap
    sheet.save(OUTPUT / name, quality=90)


make_sheet("01-preassembly.jpg", ["image1.png", "image2.png"])
make_sheet("02-handheld.jpg", ["image3.png", "image4.png", "image5.png", "image6.png"], 600)
make_sheet("03-assembly.jpg", ["image7.png", "image8.png", "image9.png", "image10.png", "image11.png", "image12.png"])
make_sheet("04-postassembly.jpg", ["image13.png", "image14.png"])
