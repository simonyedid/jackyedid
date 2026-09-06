#!/usr/bin/env python3
"""Build a single-file copy of the site for publishing as a preview Artifact.

The live site loads style.css and script.js as separate files. An Artifact is
one HTML file, so this inlines them. The site itself is untouched and still
has no build step -- this is a viewing aid only.

    python3 tools/preview.py /path/to/output.html [source.html]

The source page defaults to index.html; pass pong.html for the game.
"""
import re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
source = sys.argv[2] if len(sys.argv) > 2 else "index.html"
html = (root / source).read_text()
css = (root / "style.css").read_text()

# Inline whichever script the page actually loads.
script_name = re.search(r'<script src="([^"?]+)', html)
js = (root / script_name.group(1)).read_text() if script_name else ""

title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
# The Artifact host supplies <head>/<body>, so drop the script tag that
# pointed at the external file and inline the real thing instead.
body = re.sub(r'\s*<script src="[^"]*"></script>', "", body)

# Relative links between pages do not work inside a single-file preview.
body = re.sub(r'<p class="back-link">.*?</p>', "", body, flags=re.S)
body = re.sub(r'href="[\w-]+\.html"', 'href="#" onclick="return false"', body)

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "preview.html")
out.write_text(
    f"<title>{title}</title>\n<style>\n{css}</style>\n{body}\n<script>\n{js}</script>\n"
)
print(f"wrote {out} ({out.stat().st_size} bytes)")
