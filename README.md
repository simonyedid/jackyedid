# jackyedid.com

Jack's website. Plain HTML, CSS and JavaScript — no build step, no
dependencies, nothing to install.

## The files

| File | What it is |
| --- | --- |
| `index.html` | The words and pictures on the page. Jack edits this most. |
| `style.css` | The colors, fonts and shapes. |
| `script.js` | The one button that tells the joke. |
| `CNAME` | Tells GitHub Pages the site lives at `jackyedid.com`. Don't delete it. |

## How Jack edits the site

1. Open `index.html` in any text editor.
2. Change the words that sit between `>` and `<`.
3. Save, then double-click `index.html` to see it in the browser.
4. When it looks good, commit and push — the live site updates in about a minute.

To change all the colors at once, edit the five lines at the top of `style.css`.

## Setup (one time, for a grown-up)

### 1. Turn on GitHub Pages

Repo → **Settings** → **Pages** → Source: **Deploy from a branch** →
Branch: `main`, folder: `/ (root)` → **Save**.

### 2. Point the domain at GitHub

In Squarespace: **Domains** → `jackyedid.com` → **DNS Settings**, and add:

Four **A** records, host `@`:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

One **CNAME** record, host `www`, value:

```
simonyedid.github.io
```

Delete any A / CNAME records Squarespace added for `@` and `www` that point at
Squarespace's own parking page, or they will fight with these.

### 3. Finish in GitHub

Back in **Settings → Pages**, set Custom domain to `jackyedid.com` and save.
Once the check goes green, tick **Enforce HTTPS**.

DNS can take anywhere from 10 minutes to a few hours to spread.
