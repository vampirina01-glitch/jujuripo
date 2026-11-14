#!/usr/bin/env python3
"""Generate original, silent motion-design teasers for the public landing page.
No third-party platform name, URL, screenshot or paid-guide page is shown.
Run: .venv/bin/python scripts/generate_videos.py
"""
from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
VIDEOS = ROOT / 'public' / 'videos'
IMAGES = ROOT / 'public' / 'images'
VIDEOS.mkdir(parents=True, exist_ok=True)
IMAGES.mkdir(parents=True, exist_ok=True)
FONTS = Path('/usr/share/fonts/truetype/dejavu')
W, H, FPS = 1280, 720, 24
PAPER = (248, 247, 243)
INK = (35, 56, 47)
GREEN = (40, 87, 68)
SAGE = (233, 237, 229)
LINE = (216, 221, 211)
MUTED = (115, 123, 115)
GOLD = (165, 129, 72)


def font(size, family='sans'):
    names = {'sans': 'DejaVuSans.ttf', 'bold': 'DejaVuSans-Bold.ttf', 'serif': 'DejaVuSerif.ttf', 'serif-bold': 'DejaVuSerif-Bold.ttf'}
    return ImageFont.truetype(str(FONTS / names[family]), size)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def mix(c1, c2, t):
    t = clamp(t)
    return tuple(round(a + (b - a) * t) for a, b in zip(c1, c2))


def fade_color(color, alpha, bg=PAPER):
    return mix(bg, color, alpha)


def base_frame(scene_index, scene_count, progress):
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 5), fill=SAGE)
    d.rectangle((0, 0, round(W * clamp(progress)), 5), fill=GREEN)
    d.rounded_rectangle((64, 54, 106, 96), radius=6, fill=GREEN)
    d.text((85, 75), 'm', font=font(30, 'serif'), fill=PAPER, anchor='mm')
    d.text((122, 63), 'madgic.', font=font(28, 'serif'), fill=INK)
    d.text((W - 64, 66), f'{scene_index + 1:02d} / {scene_count:02d}', font=font(18), fill=MUTED, anchor='ra')
    d.line((64, H - 62, W - 64, H - 62), fill=LINE, width=1)
    d.text((64, H - 48), 'INFORMATION PRATIQUE · INTELLIGENCE ARTIFICIELLE', font=font(15, 'bold'), fill=MUTED)
    return im, d


def text_lines(d, lines, x, y, face, color, alpha=1, dy=0, line_gap=10):
    for i, line in enumerate(lines):
        d.text((x, y + i * (face.size + line_gap) + dy), line, font=face, fill=fade_color(color, alpha))


def pill(d, xy, label, alpha, offset=0):
    x, y = xy
    face = font(22, 'bold')
    w = round(d.textlength(label, font=face)) + 44
    d.rounded_rectangle((x + offset, y, x + w + offset, y + 48), radius=24, fill=fade_color(SAGE, alpha), outline=fade_color(LINE, alpha))
    d.text((x + 22 + offset, y + 12), label, font=face, fill=fade_color(GREEN, alpha))
    return w


def lock(d, cx, cy, scale, alpha, open_lock=False):
    c = fade_color(GREEN, alpha)
    w, h = 70 * scale, 54 * scale
    d.rounded_rectangle((cx - w / 2, cy - h / 2 + 12 * scale, cx + w / 2, cy + h / 2 + 12 * scale), radius=10 * scale, fill=c)
    arc_box = (cx - 24 * scale, cy - 40 * scale, cx + 24 * scale, cy + 16 * scale)
    if open_lock:
        d.arc(arc_box, 180, 360, fill=c, width=round(9 * scale))
    else:
        d.arc(arc_box, 180, 360, fill=c, width=round(9 * scale))
        d.line((cx - 24 * scale, cy - 12 * scale, cx - 24 * scale, cy + 4 * scale), fill=c, width=round(9 * scale))
        d.line((cx + 24 * scale, cy - 12 * scale, cx + 24 * scale, cy + 4 * scale), fill=c, width=round(9 * scale))
    d.ellipse((cx - 5 * scale, cy + 8 * scale, cx + 5 * scale, cy + 18 * scale), fill=fade_color(PAPER, alpha))


def presentation_scene(t, index, count):
    im, d = base_frame(index, count, t)
    local = t * count - index
    a = ease(local / 0.18) * (1 - ease((local - 0.86) / 0.14) if index == count - 1 else 1)
    dy = round((1 - ease(local / 0.22)) * 28)
    if index == 0:
        d.text((84, 165 + dy), 'LE PROBLÈME', font=font(19, 'bold'), fill=fade_color(GREEN, a))
        text_lines(d, ['L’IA ne devrait pas', 'vous coûter plus de temps.'], 84, 215, font(58, 'serif'), INK, a, dy)
        d.line((84, 383 + dy, 84 + round(360 * ease(local / 0.3)), 383 + dy), fill=fade_color(GOLD, a), width=4)
        x = 84
        for i, label in enumerate(['Abonnements', 'Outils dispersés', 'Manque de méthode']):
            aa = a * ease((local - 0.18 - i * 0.08) / 0.2)
            x += pill(d, (x, 440), label, aa, round((1 - aa) * 24)) + 18
    elif index == 1:
        d.text((84, 165 + dy), 'LE VRAI OBSTACLE', font=font(19, 'bold'), fill=fade_color(GREEN, a))
        text_lines(d, ['Le manque d’informations.'], 84, 215, font(58, 'serif'), INK, a, dy)
        rows = [('01', 'Les abonnements s’additionnent.'), ('02', 'Les outils se multiplient.'), ('03', 'Utiliser l’IA demande une méthode.')]
        for i, (num, label) in enumerate(rows):
            aa = a * ease((local - 0.12 - i * 0.1) / 0.2)
            y = 330 + i * 72
            d.text((84, y), num, font=font(22, 'bold'), fill=fade_color(GREEN, aa))
            d.text((150, y), label, font=font(29), fill=fade_color(INK, aa))
            d.line((84, y + 50, 1040, y + 50), fill=fade_color(LINE, aa), width=1)
    elif index == 2:
        d.text((84, 155 + dy), 'LA POSSIBILITÉ', font=font(19, 'bold'), fill=fade_color(GREEN, a))
        text_lines(d, ['Plusieurs IA. Un agent.', 'Un accès officiel gratuit.'], 84, 200, font(50, 'serif'), INK, a, dy, line_gap=8)
        p = ease((local - 0.15) / 0.45)
        box_top = 400 + round((1 - p) * 20)
        for i, label in enumerate(['IA', 'IA', 'IA']):
            cx = 150 + i * 120
            cy = 500
            d.ellipse((cx - 34, cy - 34, cx + 34, cy + 34), fill=fade_color(SAGE, a), outline=fade_color(GREEN, a), width=2)
            d.text((cx, cy), label, font=font(22, 'bold'), fill=fade_color(GREEN, a), anchor='mm')
            d.line((cx + 34, cy, cx + 34 + (660 - cx - 34) * p, cy + (470 - cy) * p), fill=fade_color(GREEN, a * p), width=2)
        d.rounded_rectangle((660, box_top, 1120, box_top + 140), radius=16, fill=fade_color(GREEN, a * p))
        d.text((890, box_top + 50), 'Un point d’entrée', font=font(30, 'bold'), fill=fade_color(PAPER, a * p), anchor='mm')
        d.text((890, box_top + 93), 'Selon conditions et quotas', font=font(20), fill=fade_color(SAGE, a * p), anchor='mm')
        d.ellipse((546, 466, 614, 534), fill=fade_color(GOLD, a))
        d.text((580, 500), '+', font=font(34, 'bold'), fill=fade_color(PAPER, a), anchor='mm')
        d.text((580, 562), 'agent', font=font(20, 'bold'), fill=fade_color(GREEN, a), anchor='mm')
    elif index == 3:
        d.text((84, 165 + dy), 'CE QUI RESTE PRIVÉ', font=font(19, 'bold'), fill=fade_color(GREEN, a))
        text_lines(d, ['L’outil est révélé', 'dans le guide.'], 84, 215, font(58, 'serif'), INK, a, dy)
        text_lines(d, ['Nom, adresse officielle et prise en main détaillée :', 'transmis après vérification du paiement.'], 84, 405, font(28), MUTED, a, dy)
        lock(d, 1030, 340, 1.5, a)
    else:
        d.text((84, 165 + dy), 'LE GUIDE', font=font(19, 'bold'), fill=fade_color(GREEN, a))
        text_lines(d, ['25 pages. 25 prompts.', 'Un plan sur 7 jours.'], 84, 215, font(56, 'serif'), INK, a, dy)
        d.text((84, 405 + dy), '3 000 FCFA', font=font(52, 'serif'), fill=fade_color(GREEN, a))
        d.rounded_rectangle((84, 492, 392, 556), radius=8, fill=fade_color(GREEN, a))
        d.text((238, 524), 'Obtenir le guide', font=font(24, 'bold'), fill=fade_color(PAPER, a), anchor='mm')
        d.text((430, 512), 'Paiement unique · livraison après vérification', font=font(22), fill=fade_color(MUTED, a))
    return im


def commande_scene(t, index, count):
    im, d = base_frame(index, count, t)
    local = t * count - index
    a = ease(local / 0.2) * (1 - ease((local - 0.86) / 0.14) if index == count - 1 else 1)
    dy = round((1 - ease(local / 0.24)) * 26)
    scenes = [
        ('COMMANDER', ['Commander simplement.'], ['Le guide reste privé jusqu’à la vérification du paiement.']),
        ('ÉTAPE 1', ['MTN MoMo', 'ou Airtel Money.'], ['Choisissez le moyen de paiement indiqué par le vendeur.']),
        ('ÉTAPE 2', ['Votre preuve', 'sur WhatsApp.'], ['Conservez la référence et la preuve de votre règlement.']),
        ('ÉTAPE 3', ['Le vendeur vérifie', 'la réception des fonds.'], ['Aucun fichier payé n’est débloqué automatiquement par le site.']),
        ('APRÈS VÉRIFICATION', ['Le guide et les bonus', 'vous sont envoyés.'], ['Livraison manuelle par WhatsApp.']),
    ]
    kicker, title, body = scenes[index]
    d.text((84, 165 + dy), kicker, font=font(19, 'bold'), fill=fade_color(GREEN, a))
    text_lines(d, title, 84, 215, font(58, 'serif'), INK, a, dy)
    body_y = 510 if index in (2, 3) else 430
    text_lines(d, body, 84, body_y, font(27), MUTED, a, dy)
    if index == 0:
        lock(d, 1030, 340, 1.5, a)
    elif index == 1:
        for i, (label, color) in enumerate([('MTN MoMo', (212, 173, 36)), ('Airtel Money', (188, 66, 59))]):
            aa = a * ease((local - 0.15 - i * 0.12) / 0.2)
            x = 760 + i * 220
            d.rounded_rectangle((x, 300, x + 190, 420), radius=16, fill=fade_color(SAGE, aa), outline=fade_color(LINE, aa))
            d.ellipse((x + 24, 330, x + 44, 350), fill=fade_color(color, aa))
            d.text((x + 95, 386), label, font=font(20, 'bold'), fill=fade_color(GREEN, aa), anchor='mm')
    elif index == 2:
        p = ease((local - 0.15) / 0.35)
        d.rounded_rectangle((760, 290, 1120, 450), radius=18, fill=fade_color(SAGE, a * p))
        d.text((790, 325), 'Preuve de paiement', font=font(24, 'bold'), fill=fade_color(GREEN, a * p))
        d.text((790, 372), 'Référence de commande', font=font(21), fill=fade_color(MUTED, a * p))
        d.line((790, 414, 790 + round(280 * p), 414), fill=fade_color(GREEN, a * p), width=3)
    elif index == 3:
        p = ease((local - 0.15) / 0.4)
        d.ellipse((850, 290, 1050, 490), fill=fade_color(SAGE, a), outline=fade_color(GREEN, a), width=3)
        d.line((900, 390, 935, 425), fill=fade_color(GREEN, a * p), width=10)
        d.line((935, 425, 935 + round(70 * p), 425 - round(60 * p)), fill=fade_color(GREEN, a * p), width=10)
    else:
        lock(d, 1030, 340, 1.5, a, open_lock=True)
    return im


def encode(name, scene_fn, durations, poster_scene, poster_time):
    total = sum(durations)
    frames = round(total * FPS)
    out = VIDEOS / name
    cmd = [
        imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
        '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', str(out),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    poster = None
    try:
        for f in range(frames):
            sec = f / FPS
            idx = 0
            acc = 0
            for i, dur in enumerate(durations):
                if sec < acc + dur or i == len(durations) - 1:
                    idx = i
                    break
                acc += dur
            im = scene_fn(sec / total, idx, len(durations))
            if idx == poster_scene and abs(sec - poster_time) < 1 / FPS / 2:
                poster = im.copy()
            proc.stdin.write(im.tobytes())
    finally:
        proc.stdin.close()
        code = proc.wait()
    if code != 0:
        raise RuntimeError(f'ffmpeg failed for {name}: {code}')
    if poster is None:
        poster = scene_fn(poster_time / total, poster_scene, len(durations))
    poster_path = IMAGES / f'video-{name.split("-")[0]}.jpg'
    poster.save(poster_path, quality=88, optimize=True)
    print(f'{out.relative_to(ROOT)} · {total}s · {out.stat().st_size // 1024} KB')
    print(f'{poster_path.relative_to(ROOT)}')


encode('presentation-madgic.mp4', presentation_scene, [4, 4, 5, 4, 3], 2, 10.5)
encode('commande-madgic.mp4', commande_scene, [2.5, 3, 3, 3, 2.5], 1, 4.0)
