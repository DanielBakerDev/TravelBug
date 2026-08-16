# TravelBug

Marketing site for Amanda's bespoke travel-planning business.

**Live:** https://danielbakerdev.github.io/TravelBug/

Plain HTML, CSS and JavaScript — no build step, no dependencies. Every push to
`main` is live within about a minute.

## Files

| Path | What's in it |
|---|---|
| `index.html` | All page content and copy |
| `assets/css/styles.css` | All styling (tokens at the top) |
| `assets/js/main.js` | Sticky header, mobile menu, scroll reveals, contact form |
| `assets/img/` | Photos go here |

## Working on it

Open `index.html` in a browser — that's it. To avoid cache surprises, serve it:

```bash
npx serve .
```

Then push:

```bash
git add -A && git commit -m "Describe the change" && git push
```

## Before this goes public

Everything below is placeholder and should be replaced with Amanda's real details.

- [ ] **Contact email** — `CONTACT_EMAIL` at the top of `assets/js/main.js` is
      `hello@travelbug.example`. The form composes a `mailto:` link, so nothing
      is delivered until this is a real address.
- [ ] **Testimonials** — the three quotes in the `#testimonials` section are
      invented. Replace with real client quotes or delete the section.
- [ ] **FAQ answers** — pricing, lead times and what's included are guesses.
- [ ] **About copy** — rewrite in Amanda's own voice.
- [ ] **Destinations** — six regions are placeholders; swap for the ones she
      actually specialises in.
- [ ] **Photos** — see below.

## Adding real photos

The destination tiles and the About portrait currently use generated SVG
scenery, so the site has no external image dependencies. To use a real photo:

**Destination tile** — replace the `<svg class="dest-art">…</svg>` line inside a
`.dest` link with:

```html
<img class="dest-art" src="assets/img/greece.jpg" alt="Whitewashed houses above the sea in Santorini">
```

**About portrait** — replace the `<svg>` block inside `.about-photo` with an
`<img>`, and delete the `<span class="photo-hint">` line.

Resize images to roughly 1600px wide and save as JPEG before committing — the
repo shouldn't carry 8MB camera files.

## Contact form

There's no backend. Submitting opens the visitor's email client with the fields
pre-filled. That works, but it loses anyone without a configured mail app.

When the real address is live, swap it for a form service — [Formspree](https://formspree.io)
has a free tier and needs only a changed `action` attribute on the `<form>`.

## Deployment

GitHub Pages, serving `main` from the repository root.
Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
