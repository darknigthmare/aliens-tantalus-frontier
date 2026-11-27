#!/usr/bin/env python3
"""Rebuild the recovered v0.7 portable from the modular sources.

This recovery builder is new. The historical builder and complete original
400-file package are preserved in the original release archive on Drive.
"""
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
css_tag = '<link rel="stylesheet" href="styles.css">'
assert html.count(css_tag) == 1, "One stylesheet link expected"
html = html.replace(css_tag, "<style>\n" + (root / "styles.css").read_text(encoding="utf-8") + "\n</style>")
pattern = re.compile(r'<script src="(src/[a-z0-9-]+\.js)"></script>')
assert len(pattern.findall(html)) == 26, "Expected the 26 recovered modules"
def embed(match):
    source = (root / match.group(1)).read_text(encoding="utf-8")
    return "<script>\n" + source + "\n</script>"
html = pattern.sub(embed, html)
target = root / "JOUER_ALIEN_BLACKOUT_v0.7.0.html"
target.write_text(html, encoding="utf-8", newline="\n")
print(target.name, target.stat().st_size, "bytes")
