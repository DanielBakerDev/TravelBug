# TravelBug

Website for Amanda's small-group adventure trips.

**Live:** https://danielbakerdev.github.io/TravelBug/

Plain HTML, CSS and JavaScript — no build step, no dependencies. Every push to
`main` is live within about a minute.

## Files

| Path | What's in it |
|---|---|
| `index.html` | Homepage — hero, trip grid, how it works, numbers, about, quotes, newsletter |
| `trips.html` | All open departures |
| `trip-<name>.html` | One page per trip: itinerary, gallery, what's included, price card |
| `past-journeys.html` | Grid of trips already run |
| `about.html` | Amanda's story |
| `contact.html` | Enquiry form + FAQ |
| `assets/css/styles.css` | All styling. Colour tokens and the contrast rule are at the top |
| `assets/js/main.js` | Sticky header, mobile menu, scroll reveals, both forms |
| `assets/img/` | Photos, plus `CREDITS.md` listing every source |

Pages are flat files at the repo root rather than in folders, so every page
references `assets/…` by the same relative path. Keep it that way — it's the
main reason nothing breaks without a build step.

## Working on it

```bash
npx serve . -l 4321
```

**One gotcha when testing locally:** `serve` redirects `/contact.html?trip=…`
to `/contact` and throws the query string away, so the "Request a spot"
pre-fill looks broken on localhost. GitHub Pages serves `.html` directly and
keeps the query, so it works in production — test that flow on the live URL,
not locally. (Setting `cleanUrls: false` in a `serve.json` fixes it locally but
then every `.html` link needs the extension typed out.)

Then push:

```bash
git add -A && git commit -m "Describe the change" && git push
```

**Header and footer are duplicated in every page.** That's the trade-off for
having no build tool. Changing the nav means editing all 10 files. If the trip
count goes much past ten, or a blog gets added, it's worth moving to Eleventy
or Astro instead.

## Before this goes public

Everything below is invented. It exists so the site can be judged as a design;
none of it is Amanda's real information.

- [ ] **Contact email** — `CONTACT_EMAIL` at the top of `assets/js/main.js` is
      `hello@travelbug.example`. Both forms compose a `mailto:` link, so
      **nothing reaches anyone** until this is a real address.
- [ ] **The five trips** — names, dates, prices, deposits, spot counts and
      every itinerary are made up. Replace with real departures.
- [ ] **Testimonials** — the three quotes on the homepage are fiction.
- [ ] **The numbers** — "19 trips run, 28 countries, 112 travellers, 68% come
      back" on the homepage are invented.
- [ ] **FAQ answers** — the refund policy, minimum group size, single
      supplement and insurance requirements are all plausible guesses, not
      Amanda's actual terms. These are the ones that matter legally.
- [ ] **Past journeys** — six trips with dates that never happened.
- [ ] **Photos** — see below.
- [ ] **Remove `<meta name="robots" content="noindex">`** from all 10 pages.
      It's there so invented prices don't get indexed by search engines while
      the site is a draft.
- [ ] **Remove the footer line** "Draft site — trips, prices and reviews are
      placeholders." from all 10 pages.

## Photos

All 24 images are placeholders from [Pexels](https://www.pexels.com/license/),
free for commercial use with no attribution required. `assets/img/CREDITS.md`
lists every one with its source and dimensions.

To swap one in, keep the same filename and update the `width`/`height`
attributes wherever it appears — they're set explicitly to stop the page
jumping as images load.

`amanda.jpg` is deliberately a figure photographed from behind. It's a
stand-in: putting a recognisable stranger next to "Hi — I'm Amanda" would
imply that person *is* Amanda. Replace it with her own photo and delete the
"Photo placeholder" sticker in `index.html` and `about.html`.

Resize to roughly 1400px wide and save as JPEG before committing — the repo
shouldn't carry 8MB camera files. Current total is about 4MB.

## Forms

There's no backend. Both the enquiry form and the newsletter signup open the
visitor's email client with the fields filled in. That works, but it loses
anyone without a configured mail app.

When the real address is live, swap for a form service —
[Formspree](https://formspree.io) has a free tier and needs only an `action`
attribute on the `<form>`.

"Request a spot" on a trip page links to `contact.html?trip=<trip name>`, and
`main.js` uses that to pre-select the dropdown and pre-fill the message. If you
add a trip, add a matching `<option>` in `contact.html` so the names line up.

Taking actual deposits needs a payment provider. Stripe Payment Links are the
cheapest route and need no backend.

## Colours

The palette is bright, which makes contrast the easy thing to get wrong. The
rule is at the top of `styles.css`: **bright fills always carry dark ink text**,
and `--deep-teal` is the only coloured surface that takes white text. Turquoise
with white text is 2.3:1 and fails badly; with ink it's 5.9:1 and passes.

## Deployment

GitHub Pages, serving `main` from the repository root.
Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
