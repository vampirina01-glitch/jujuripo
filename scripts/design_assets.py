#!/usr/bin/env python3
"""Create the restrained editorial cover and social card for Madgic.
No generative artwork, product screenshots, or third-party platform branding.
Run: .venv/bin/python scripts/design_assets.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'images'
OUT.mkdir(parents=True, exist_ok=True)
FONTS = Path('/usr/share/fonts/truetype/dejavu')
PAPER = '#f3f0e8'
INK = '#20382f'
GREEN = '#285746'
MUTED = '#68736b'
RULE = '#c9cec3'


def font(size, family='sans'):
    names = {
        'sans': 'DejaVuSans.ttf',
        'bold': 'DejaVuSans-Bold.ttf',
        'serif': 'DejaVuSerif.ttf',
        'serif-bold': 'DejaVuSerif-Bold.ttf',
    }
    return ImageFont.truetype(str(FONTS / names[family]), size)


def spaced(draw, xy, text, face, fill, spacing=5):
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=face, fill=fill)
        x += draw.textlength(char, font=face) + spacing


cover = Image.new('RGB', (1200, 1600), PAPER)
d = ImageDraw.Draw(cover)
d.rectangle((0, 0, 28, 1599), fill=GREEN)
d.line((76, 64, 1124, 64), fill=RULE, width=2)
spaced(d, (96, 106), 'MADGIC', font(30, 'bold'), INK, 7)
d.text((1100, 110), 'GUIDE PRATIQUE', font=font(21), fill=MUTED, anchor='ra')
d.line((96, 184, 1104, 184), fill=RULE, width=2)
d.text((90, 260), 'Le guide', font=font(106, 'serif'), fill=INK)
d.text((90, 390), 'de l’IA', font=font(132, 'serif'), fill=INK)
d.text((90, 550), 'gratuite.', font=font(132, 'serif'), fill=GREEN)
d.text((96, 770), 'Plusieurs intelligences artificielles.', font=font(32), fill=INK)
d.text((96, 822), 'Un agent. Un accès officiel.', font=font(32), fill=INK)

for y, number, title in [
    (970, '01', 'Trouver le bon accès'),
    (1070, '02', 'Utiliser plusieurs IA'),
    (1170, '03', 'Confier une mission à l’agent'),
]:
    d.line((96, y - 20, 1104, y - 20), fill=RULE, width=2)
    d.text((96, y), number, font=font(25), fill=GREEN)
    d.text((172, y - 3), title, font=font(30), fill=INK)

d.line((96, 1302, 1104, 1302), fill=GREEN, width=3)
spaced(d, (96, 1350), '25 PAGES · 25 PROMPTS', font(24, 'bold'), INK, 2)
d.text((96, 1405), 'Un plan d’action sur 7 jours', font=font(27), fill=MUTED)
d.text((96, 1490), 'ÉDITION NOVEMBRE 2026', font=font(19), fill=MUTED)
cover.save(OUT / 'guide-cover.jpg', quality=93, optimize=True)
cover.save(OUT / 'guide-cover.webp', quality=91, method=6)

og = Image.new('RGB', (1200, 630), PAPER)
d = ImageDraw.Draw(og)
d.rectangle((0, 0, 15, 629), fill=GREEN)
spaced(d, (65, 50), 'MADGIC', font(23, 'bold'), INK, 5)
d.text((62, 132), 'L’IA gratuite,', font=font(70, 'serif'), fill=INK)
d.text((62, 222), 'en pratique.', font=font(70, 'serif'), fill=GREEN)
d.text((65, 350), 'Plusieurs IA et un agent.', font=font(27), fill=INK)
d.text((65, 394), 'Le guide pas à pas.', font=font(27), fill=INK)
d.line((65, 478, 690, 478), fill=RULE, width=2)
d.text((65, 510), 'GUIDE PDF  /  3 000 FCFA', font=font(23, 'bold'), fill=GREEN)
thumb = cover.resize((285, 380), Image.Resampling.LANCZOS)
og.paste('#dce0d5', (858, 134, 1151, 522))
og.paste(thumb, (846, 122))
og.save(OUT / 'og-madgic.jpg', quality=92, optimize=True)

icon = Image.new('RGB', (180, 180), GREEN)
d = ImageDraw.Draw(icon)
d.text((90, 83), 'm', font=font(124, 'serif'), fill=PAPER, anchor='mm')
icon.save(ROOT / 'public' / 'apple-touch-icon.png', optimize=True)
print('Created editorial cover, WebP/JPEG exports, social card, and app icon.')
