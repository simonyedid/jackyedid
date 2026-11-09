#!/usr/bin/env python3
"""Makes the two QR pictures in images/, and checks they really scan.

    pip install segno opencv-python-headless
    python3 tools/make-qr.py

This is a tool, like tools/preview.py. The website itself has no build
step - it just uses the pictures this writes.
"""
import sys

import segno
import cv2

CODES = [
    # (what it says, where the picture goes)
    ("https://jackyedid.com", "images/qr-code.svg"),
    ("https://jackyedid.com/?hello=Jack&age=7", "images/qr-login.svg"),
]

INK = "#1f2933"          # the same dark color as the rest of the website


def make_one(says, picture_file):
    qr = segno.make(says, error="h")       # H: still scans if it gets scuffed
    qr.save(picture_file, scale=10, border=4, dark=INK, light="#ffffff",
            svgclass=None, lineclass=None)

    # Read it back the way a phone camera would, to be sure.
    checking = picture_file.replace(".svg", "-check.png")
    qr.save(checking, scale=10, border=4, dark=INK, light="#ffffff")
    found, _, _ = cv2.QRCodeDetector().detectAndDecode(cv2.imread(checking))

    print(picture_file, "version", qr.version, "->", repr(found),
          "MATCHES" if found == says else "DOES NOT MATCH")
    return found == says


ok = True
for says, picture_file in CODES:
    ok = make_one(says, picture_file) and ok

sys.exit(0 if ok else 1)
