#!/usr/bin/env python3
"""Vérifie la surface publique (textes, build, extrait PDF).

Une liste de termes à ne pas publier peut rester privée dans
``private-products/redactions.txt``. Elle est utilisée si elle est présente,
sans être versionnée ni exposée dans le dépôt public.

Usage :
    .venv/bin/python scripts/check_public_surface.py
"""
from pathlib import Path
import re
from urllib.parse import urlparse

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {'.html', '.js', '.css', '.json', '.svg', '.txt', '.webmanifest'}
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
        if path.is_file() and path.suffix in TEXT_SUFFIXES:
            check_text(path, check_urls=(directory == 'public'))
check_text(ROOT / 'index.html', check_urls=True)

pdf = PdfReader(ROOT / 'public' / 'extrait-madgic.pdf')
text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
if IDENTITY:
    assert not IDENTITY.search(text), 'Private term disclosed in excerpt text'
    assert not IDENTITY.search(str(pdf.metadata)), 'Private term disclosed in PDF metadata'
for page in pdf.pages:
    for annotation in page.get('/Annots', []):
        obj = annotation.get_object()
        action = obj.get('/A')
        if action:
            uri = str(action.get('/URI', ''))
            host = urlparse(uri).hostname or ''
            assert host in ALLOWED_PUBLIC_HOSTS, f'Unexpected external link in excerpt: {uri}'
            if IDENTITY:
                assert not IDENTITY.search(uri), 'Private term disclosed in excerpt link'
assert len(pdf.pages) == 4, f'Expected a 4-page excerpt, got {len(pdf.pages)}'
print(f'Public surface clean: text assets, build output, {len(pdf.pages)} PDF pages, metadata and links.')
