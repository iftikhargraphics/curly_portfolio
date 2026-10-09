# Iftikhar Uddin — Portfolio Book

Open `index.html` in a browser (or upload the whole folder to any static host:
Netlify, Vercel, GitHub Pages, cPanel).

## Things to replace
| What | Where |
|---|---|
| Your photo | save as `images/portrait.jpg` (4:5 portrait works best) |
| Email / WhatsApp / LinkedIn / GitHub / website | `profile` block in `projects/projects.js` |
| Projects (graphic, web, AI) | `projects` list in `projects/projects.js` — instructions are at the top of that file |
| Project images | put them in `projects/` and reference them in the data file |
| Social preview image | replace `assets/og-image.png` (1200×630) |

Adding a project = copy one object in `projects/projects.js`, edit it, delete `placeholder: true`.
No HTML changes are needed.

## Files
- `index.html` — the 12 pages (semantic HTML)
- `style.css` — design system, book + page-turn styling
- `script.js` — page-turn engine, navigation, viewers, case study, modal
- `projects/projects.js` — **your content**
- `images/`, `projects/`, `assets/` — media
