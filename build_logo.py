from PIL import Image, ImageDraw, ImageFont
import os

out_dir = os.path.join(os.getcwd(), 'assets')
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'logo-watermark.png')

img = Image.new('RGBA', (800, 220), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

font = None
for p in [
    'C:/Windows/Fonts/arialbd.ttf',
    'C:/Windows/Fonts/segoeuisb.ttf',
    'C:/Windows/Fonts/calibrib.ttf',
    'C:/Windows/Fonts/verdana.ttf',
]:
    try:
        font = ImageFont.truetype(p, 120)
        break
    except Exception:
        pass

if font is None:
    font = ImageFont.load_default()

text = 'SANGKIDAL'
bbox = draw.textbbox((0, 0), text, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]
cx = (800 - text_w) / 2
cy = (220 - text_h) / 2

for dx, dy, alpha in [(2, 2, 40), (4, 4, 18), (6, 6, 10)]:
    draw.text((cx + dx, cy + dy), text, font=font, fill=(0, 0, 0, alpha))

draw.text((cx, cy), text, font=font, fill=(255, 255, 255, 220))

mask = Image.new('L', (800, 220), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle((18, 18, 782, 202), radius=28, fill=255)
img.putalpha(mask)
img.save(out_path)
print(f'created {out_path} ({os.path.getsize(out_path)} bytes)')
