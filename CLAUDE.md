# jackyedid.com

Jack Yedid's personal website. Jack is 7. He and his dad describe changes
out loud; Claude makes them.

## How this site works

Plain static HTML/CSS/JS. No framework, no build step, no dependencies.
Files are served exactly as they sit in the repo root, by GitHub Pages,
from the `main` branch.

- `index.html` — the page content
- `style.css` — colors and layout; the palette lives in `:root` at the top
- `script.js` — small bits of interactivity
- `CNAME` — the custom domain. Never delete or rename this.

## Working rules

**Commit and push straight to `main`.** That is what makes the change go
live. Don't open PRs or feature branches for ordinary content changes —
Jack expects to hear "it's live, go look."

**Keep it readable by a 7-year-old.** He is learning to read the code, so:

- No build tooling, bundlers, package.json, or npm dependencies. Ever.
- No frameworks. Hand-written HTML.
- Plain, obvious markup and class names. `.joke`, not `.c-joke__body--v2`.
- Leave short HTML comments where he might want to change something.
- New colors go in the `:root` block in `style.css`, not scattered inline.

**Adding a page:** new `.html` file in the repo root, link it from
`index.html`. Keep the same `<head>` block so it picks up the stylesheet.

**Images:** put them in `images/`, keep them small, always write real
`alt` text.

**Check your work before pushing.** Open the page in a headless browser
and look at it — a broken layout is invisible in a diff.
