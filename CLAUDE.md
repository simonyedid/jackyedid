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

## Privacy

The repo and the site are both public, and the site is written by a
7-year-old. Keep to first name, general interests, and his own drawings
or writing.

Never publish: home address, street or neighborhood, school name,
phone number, email, full birthdate, or his parents' full details.
Photographs of Jack only if his dad has explicitly asked for that
specific photo.

If a request would put any of that on the page, say so and suggest a
safer version instead of just doing it.

## Cache busting

`index.html` links the stylesheet as `style.css?v=N`. Browsers cache CSS
hard, so a color change can be live but invisible on an ordinary refresh.

**Whenever you change `style.css`, bump that number** (`?v=2` → `?v=3`).
Same for `script.js?v=N` when you change the JavaScript. It costs one
character and saves Jack from wondering why nothing happened.

`style.css` is shared by every page, so bump it in **all** the HTML files
at once and keep them on the same number — otherwise a page left on an
old number serves a stale stylesheet:

    sed -i -E 's|href="style\.css\?v=[0-9]+"|href="style.css?v=N"|' *.html

Per-page scripts (`draw.js`, `movie.js`, ...) are bumped only in their own
page.

## Preview artifact

There is a published Artifact that mirrors the site, for viewing changes
without waiting on DNS or browser caches:

  https://claude.ai/code/artifact/412650c8-bc28-4eda-b3d6-2b0d2c8fdf43

Regenerate and republish it whenever the site changes, so it never drifts
from what is deployed:

    python3 tools/preview.py <scratchpad>/preview.html

then publish that file to the URL above. `tools/preview.py` inlines
`style.css` and `script.js` into one file because an Artifact is a single
page. The site itself still has no build step — this script is a viewing
aid and is never part of what gets deployed.

## Jack's own photos, videos and music

The Movie Maker lets Jack add photos and videos as scenes, and `music.js`
(on every page) lets him play his own songs. They are read
straight from the device with `URL.createObjectURL` and never leave the
browser — nothing is uploaded, nothing is committed to the repo, nothing
appears on the public site. Keep it that way: do not add any feature that
sends, saves or publishes what he picks.

Spotify is also on the pages, because Jack asked for it twice after the
trade-offs were explained. It comes in two parts, and the difference
matters:

- **Open Spotify** is a plain link that opens Spotify in a new tab. No
  Spotify code runs on Jack's site at all. This is the one he asked for
  and the one to point people at.
- **Paste a playlist link** builds a Spotify embed iframe on the page.
  That does load Spotify's player, so Spotify sees visitors who use it,
  and it only plays 30 second previews without a Premium login.

Don't quietly widen that: no analytics, no other third-party embeds.
