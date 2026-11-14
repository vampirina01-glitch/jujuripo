#!/usr/bin/env python3
"""Vérifie la surface publique (textes, build, vidéos, absence du produit payé).

Une liste de termes à ne pas publier peut rester privée dans
``private-products/redactions.txt``. Elle est utilisée si elle est présente,
sans être versionnée ni exposée dans le dépôt public.

Usage :
    .venv/bin/python scripts/check_public_surface.py
"""
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {'.html', '.js', '.css', '.json', '.svg', '.txt', '.webmanifest', '.vtt'}
URL_RE = re.compile(r'https?://[^\s"\'<>)]+', re.I)
ALLOWED_PUBLIC_HOSTS = {'schema.org', 'www.w3.org'}


def load_private_identity():
    path = ROOT / 'private-products' / 'redactions.txt'
    if not path.is_file():
        return None
    terms = [line.strip() for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]
    if not terms:
        return None
    return re.compile('|'.join(re.escape(term) for term in terms), re.I)


IDENTITY = load_private_identity()


def check_text(path, *, check_urls=False):
    text = path.read_text(encoding='utf-8')
    if IDENTITY:
        assert not IDENTITY.search(text), f'Private term disclosed in {path.relative_to(ROOT)}'
    if check_urls:
        for url in URL_RE.findall(text):
            host = urlparse(url).hostname or ''
            assert host in ALLOWED_PUBLIC_HOSTS, f'Unexpected external URL in {path.relative_to(ROOT)}: {url}'


for directory in ['public', 'dist']:
    base = ROOT / directory
    assert base.is_dir(), f'Missing {directory}; build the site first.'
    for path in base.rglob('*'):
        if not path.is_file():
            continue
        assert path.suffix.lower() != '.pdf', f'No guide PDF should be served publicly: {path.relative_to(ROOT)}'
        if path.suffix in TEXT_SUFFIXES:
            check_text(path, check_urls=(directory == 'public'))
check_text(ROOT / 'index.html', check_urls=True)

for video in ['presentation-madgic.mp4', 'commande-madgic.mp4']:
    path = ROOT / 'public' / 'videos' / video
    assert path.is_file() and path.stat().st_size > 50_000, f'Missing public teaser video: {video}'
for poster in ['video-presentation.jpg', 'video-commande.jpg']:
    assert (ROOT / 'public' / 'images' / poster).is_file(), f'Missing video poster: {poster}'

print('Public surface clean: text assets, build output, teaser videos; no paid or excerpt PDF is public.')
