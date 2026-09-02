# Travel Bug Tours

Website for Amanda's small-group adventure trips.

**Live:** https://danielbakerdev.github.io/TravelBug/

Enquiries open the visitor's mail app addressed to
`exploretravelbugtours@gmail.com` (set at the top of `assets/js/main.js`).

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
| `assets/video/` | The five hero montage clips |

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

Amanda's copy from the "Website text" document is now in for the site-wide
furniture, the whole Home page, the About page and Past journeys. What is left
is listed here.

**Blocking — the trips are still invented.**
The document says: *"IM NOT SURE WHAT YOU WANT FOR TRIPS OR IF WE SHOULD JUST
HAVE THE ONE FOR MADAGASCAR FOR NOW."* — so no replacement trips were supplied.
The five departures on the site (Vietnam, Jordan, Iceland, Morocco, Peru) are
still the ones I made up, including every date, price, deposit and itinerary,
and they contradict the destinations Amanda now lists (Madagascar, Antarctica,
Uganda, Rwanda, Burundi). These need real data before anyone sees the Trips
page:

- [ ] Which trips are actually on sale, and their dates
- [ ] Prices and deposits per trip (the deposit is €500 site-wide per HOME-23)
- [ ] Itineraries, inclusions and difficulty levels
- [ ] The dropdown on `contact.html`, which lists the same five invented trips
- [ ] `trip-*.html` — five pages of invented itinerary
- [ ] The trip card photos, still stock

**Still placeholder elsewhere:**

- [ ] **Three of the four figures** on the Home page — "19 trips run",
      "28 countries", "112 travellers". Only "68% have come back again" was
      confirmed. (The document had "(not kevin)" against that one; I read that
      as a joke and left it off the page — say if it was meant seriously.)
- [ ] **Contact page** — the FAQ answers on refunds, minimum group size, the
      single supplement and insurance are still my guesses, not Amanda's terms.
      These are the ones that matter legally. The document left them blank.
- [ ] **Trips page** hero and sign-up copy — left blank in the document.
- [ ] **Remove `<meta name="robots" content="noindex">`** from all 10 pages.
      It is still there deliberately: the footer notice now says
      "2027 Tours: Sign-up Open" instead of warning that the site is a draft,
      so noindex is the only thing keeping invented prices out of Google.
      **Take it off only once the trips are real.**

**Judgement calls I made — worth a look:**

- The mission and "our concept" copy sat in the document next to the *About*
  nav row rather than against a numbered reference, so I put it on the About
  page as "Our concept" and "Where the money goes".
- HOME-36 and HOME-37 overlapped (both said "each year since… friends of
  friends"). I used "Hey there, I'm Amanda" as the heading and merged the rest
  into one paragraph so it isn't said twice.
- The paragraph about video calls was written against HOME-09, which is the
  "How it works" button. It reads as a paragraph, not a button, so it is the
  intro to that section.
- Group size went from twelve to fifteen everywhere, including the About
  section that used to be "Why twelve people". The reasoning in that section is
  still my prose, not Amanda's.
- HOME-54 asks for the mailing-list field to show
  `exploretravelbugtours@gmail.com` as its placeholder. I have done that, but
  it is the box a *visitor* types their own address into, so it now suggests
  they should type Amanda's. Worth changing back to `you@example.com`.

## Photos

Two sets, and the difference matters.

**Amanda's own photographs** — `amanda.jpg` and the 23 `past-*.jpg` cards on
Past journeys. These came out of the "Website text" document. They show real,
identifiable people, so get everyone's agreement before the site goes public.
`assets/img/CREDITS.md` lists which photo is used where, and flags that the
photo-to-destination matching is my best guess from the order they appeared in
the document.

**Stock placeholders** — the five trip cards and the big page-heading
backgrounds, still from [Pexels](https://www.pexels.com/license/) (free for
commercial use, no attribution required). These go when the real trips land.

To swap any image, keep the same filename and update the `width`/`height`
attributes wherever it appears — they're set explicitly to stop the page
jumping as images load.

Resize to roughly 1400px wide and save as JPEG before committing — the repo
shouldn't carry 8MB camera files. Images are about 6MB in total.

## Hero video

The homepage hero cycles five clips, 7 seconds each, with the destination
named in the corner. The list lives at the top of the hero block in
`assets/js/main.js` — add, remove or reorder entries there and drop the file
in `assets/video/`. A clip with no `caption` shows no label.

It's built to not cost anyone much:

- The poster photo (`hero-group.jpg`) paints first and is the only thing
  guaranteed to load. Clips fade in over it, so a slow connection, a blocked
  autoplay or a missing file just leaves the photograph.
- Clips load one at a time, so someone who scrolls straight past fetches about
  2.6MB rather than all 10.8MB.
- **Phones get the first clip on a loop**, not the montage — five files is not
  a reasonable thing to spend someone's mobile data on.
- Nothing is fetched at all if the visitor has "reduce motion" turned on or
  data-saver enabled. They see the poster photo.
- Playback pauses when the hero scrolls off screen or the tab is hidden.

Video is the heaviest thing on the site by far — 10.8MB against 4MB of
photographs. If that ever feels like too much, cutting the list to three clips
is a one-line change and takes it under 7MB.

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
