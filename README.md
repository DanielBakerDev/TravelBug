# Travel Bug Tours

Website for Amanda's small-group adventure trips.

**Live:** https://exploretravelbugtours.com/

Enquiries open the visitor's mail app addressed to
`exploretravelbugtours@gmail.com` (set at the top of `assets/js/main.js`).

Plain HTML, CSS and JavaScript — no frontend build step or dependencies. The
site is hosted in a private Amazon S3 bucket behind CloudFront; deployment
resources and instructions live in `infrastructure/`.

## Files

| Path | What's in it |
|---|---|
| `index.html` | Homepage — hero, trip grid, how it works, numbers, about, quotes, newsletter |
| `trips.html` | All open departures, plus the Egypt coming-soon card |
| `trip-madagascar-<month>2027.html` | Part One, one page per departure — three of them |
| `trip-madagascar-p2-<date>2027.html` | Part Two, one page per departure — three of them |
| `trip-madagascar-grand.html` | The Grand Tour — one page covering all three windows |
| `trip-madagascar.html` | Redirect to `trips.html`, so the old link doesn't 404 |
| `past-journeys.html` | Grid of trips already run |
| `about.html` | Amanda's story |
| `contact.html` | Enquiry form + FAQ |
| `assets/css/styles.css` | All styling. Colour tokens and the contrast rule are at the top |
| `assets/js/main.js` | Sticky header, mobile menu, scroll reveals, both forms |
| `assets/img/` | Photos and the logo files, plus `CREDITS.md` listing every source |
| `assets/video/` | The three hero montage clips |

Pages are flat files at the repo root rather than in folders, so every page
references `assets/…` by the same relative path. Keep it that way — it's the
main reason nothing breaks without a build step.

**Filenames are inconsistent between the two halves** and it is deliberate.
Part One is named by start month (`jun2027`), which broke down for Part Two
because two of its departures start in July. Part Two is therefore named by
start *date* (`p2-09jul2027`). Renaming Part One to match would change three
URLs that are already pushed, for no gain.

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
having no build tool. Changing the nav means editing all six files. If the trip
count goes much past ten, or a blog gets added, it's worth moving to Eleventy
or Astro instead.

## The Madagascar trips

Real dates, real prices, real itineraries, Amanda's own words — all from the
"Website text" documents. **It is one island sold as three products.**

| Product | Days | Price from | Route |
|---|---|---|---|
| Part One — Lemurs, Baobabs, & Canoeing the Wild Tsiribihina | 10 | €2,400 / £2,060 | Tana to Morondava |
| Part Two — Coast, Canyons, Climbing & Rainforest | 10 | €2,800 / £2,425 | Ifaty to Tana |
| Grand Tour — both, back to back | 19 | €5,200 / £4,485 | Tana to Tana |

**The two halves dovetail, and that is the whole design of the page.** Each
Part One departure ends on the morning its Part Two departure begins, and the
changeover day belongs to both. That is why the Grand Tour is 19 days and not
20, and why every Madagascar page carries a `.part-switch` nav and a sidebar
chip pointing at its partner.

| Window | Part One | Part Two | Grand Tour |
|---|---|---|---|
| 1 | 30 Jun – 9 Jul | 9 – 18 Jul | 30 Jun – 18 Jul |
| 2 | 20 – 29 Jul | 29 Jul – 7 Aug | 20 Jul – 7 Aug |
| 3 | 10 – 19 Aug | 19 – 28 Aug | 10 – 28 Aug |

Six departure pages, one per row per half. **Within a half the pages are
identical except for dates**, so a change to an itinerary, price or inclusion
list has to be made in all three. Each also links to its two siblings and to
its partner in the other half, so adding or dropping a departure means editing
more than just the new file.

The Grand Tour is a **single page**, not three, because all three windows share
everything but their dates. It does not repeat the itineraries — it links to
both halves instead.

`trip-madagascar.html` is a redirect to `trips.html`. It used to be the single
trip page and old links pointed at it.

### Where the trips page copy comes from

The Trips and Home grids show **one card per product, not one per departure**,
with the three dates as chips inside the card. Those chips sit outside the
card's `<a>` — see the note on `.trip-card-dates` in the CSS, links cannot
nest. Before this, three identical Part One cards sat side by side; adding Part
Two would have made that six.

## Before this goes public

- [ ] **The Grand Tour price is not Amanda's.** €5,200 / £4,485 is Part One
      plus Part Two added together, and the document gives no combined figure.
      Daniel chose to show the sum rather than "on request". The sidebar note
      on that page says the price is confirmed on the video call, but this
      needs her sign-off before the noindex comes off.
- [ ] **Part Two has no photographs.** Its hero and card both borrow
      `mad-1-lemur.jpg` from Part One, marked with a PLACEHOLDER comment in
      each file. It also has no gallery at all, deliberately — showing Part
      One's Tsingy cave on a trip that doesn't go there would be worse than
      showing nothing. Amanda's document has empty photo slots for it.
- [ ] **Part Two's inclusion list is two lines shorter than Part One's**,
      missing tips/gratuities and the packing list. The document omits them, so
      the site omits them. Almost certainly an oversight in the document rather
      than a real difference between the halves.
- [ ] **Spellings to check with Amanda.** Part Two days 5 and 6 say "Tsaranoa"
      and "Ranomofana"; the usual spellings are Tsaranoro and Ranomafana. Both
      are hers, left as written.
- [ ] **"Avenue de Baobabs"** appears in Part One day 9's copy, one sentence
      after the heading calls it "Avenue of the Baobabs". Both spellings are
      Amanda's, straight out of her text. Worth asking which she wants.
- [ ] **Egypt has no page.** The card on Home and Trips is a placeholder with
      every field reading TBC — see "The Egypt card" below.
- [ ] **Part Two and the Grand Tour** are mentioned in the trip's own copy
      ("You may do Part One, Part Two, or the whole Experience Madagascar Grand
      Tour") but have no pages. The contact dropdown has an option for them so
      enquiries still work. The second document lists Part Two dates
      (9–18 July, 29 July – 7 Aug, 19–28 Aug 2027) but nothing else.
- [ ] **Three of the four figures** on the Home page — "19 trips run",
      "28 countries", "112 travellers". Only "68% have come back again" was
      confirmed.
- [ ] **Contact page** — the FAQ answers on refunds, minimum group size, the
      single supplement and insurance are still my guesses, not Amanda's terms.
      These are the ones that matter legally.
- [ ] **Group size** is set to 15 everywhere. The second document didn't say,
      so it carried over from the first one.
- [ ] **Remove `<meta name="robots" content="noindex">`** from every page. Now
      that the trip is real this is mostly about the FAQ terms above — take it
      off once those are right.

Later trips, from the third document. **Uganda / Rwanda / Burundi** now has
real numbers — February 2028, 12 days or 15 with the Burundi add-on, from
€2,500 / £2,150, €500 deposit, named "Gorillas, Volcanoes, & the Royal Drums
of Africa" — but no blurb, itinerary, difficulty or spot count, so it has no
card yet. **Antarctica, Egypt and Indonesia** are still entirely blank in the
document; Egypt has a coming-soon card only because Amanda sent a photograph
separately.

**Judgement calls worth a look:**

- The document had two "included" lists that disagreed — a short one saying
  "most meals" and a bulleted one saying "all breakfasts & most dinners". I used
  the bulleted one, because it matches "Lunches" appearing under *not* included.
- Day 8's sentence was cut off in the document; Daniel supplied the ending.
- The mission and "our concept" copy sat next to the *About* nav row in the
  first document rather than against a numbered reference, so it's on the About
  page as "Our concept" and "Where the money goes".
- HOME-54 asks for the mailing-list field to show
  `exploretravelbugtours@gmail.com` as its placeholder. It does, but that's the
  box a *visitor* types their own address into.

## The Egypt card

Egypt is announced on Home and Trips but has no trip page, so the card is
**not a link**. It is a plain `<article class="trip-card is-soon">` wrapping a
`<div class="trip-card-inner">` where a real card wraps an `<a>`.

It still lifts on hover, presses on click, and brings the photograph up from
desaturated to full colour — all from `.trip-card.is-soon` in the CSS. What it
deliberately does *not* do is carry a `tabindex`, so keyboard and screen-reader
users are never sent looking for a destination that does not exist.

Every fact on it reads TBC, because none of them are decided. `contact.html`
has a matching `<option>` so people can still register interest.

**To make it real:** swap the whole `<article>` for a copy of a Madagascar card
pointing at the new page, and drop `is-soon` and `trip-card-inner` with it.

## Logo

Amanda's logo arrived as a single 2048px JPEG on a flat white background: the
mascot on the left, "TRAVEL BUG TOURS" beside him. Four files are cut from it,
all in `assets/img/`.

| File | Where it goes | Rendered at |
|---|---|---|
| `logo-lockup.png` | Footer | 205px wide |
| `logo-mark.png` | Header, next to the site name | 52px tall, 42px once stuck |
| `favicon.png` | Browser tab | 16—32px |
| `apple-touch-icon.png` | iOS home screen | 180px |

**The full lockup is not used in the header, and that is deliberate.** It is
1352—800, so at any height that fits a header the word "TOURS" is about four
pixels tall. The header therefore shows the mascot on his own and keeps the
name as live text in Outfit. The footer has room, so it gets the real thing.

**The three crops are different on purpose**, because each is read at a
different size. The header mark is the hat, sunglasses and grin; wider crops
that take in his arm and backpack turn to mush at 42px. The favicon is tighter
still, just the sunglasses and grin, because at 16px the hat brim is only a
dark smear. **At 16px it is a coloured blob whatever you do** — that is what
happens to a detailed illustration at tab size, and the fix would be a
simplified icon drawn to match, which is Amanda's call and not something to
invent from her artwork.

**How the background was removed:** by connected component, not by turning
white transparent. The character wears a white shirt and has white highlights
in his sunglasses, and a global swap would have punched holes in both. Instead
the white region that touches the border is found and only that is cleared;
both of those are walled off by black outline so the region never reaches them.
The cut is then feathered over two pixels, otherwise a pale halo shows up as
soon as the logo sits on the dark header. The script is in the scratchpad, not
the repo — rerun it from `travel-bug-logo.jpg` if the artwork is ever redrawn.

All four are palette PNGs at around 160 colours. The lockup is 59KB that way
against 336KB as full RGBA, with no banding visible in the gradients.

## Photos

Two sets, and the difference matters.

**Amanda's own photographs** — `amanda.jpg`, the 23 `past-*.jpg` cards, the five
Madagascar photos (`trip-madagascar.jpg` and `mad-1` to `mad-4`) and
`trip-egypt.jpg`. All five Madagascar shots are **Part One**; Part Two has none
of its own and borrows one of them. They
show real, identifiable people, so get everyone's agreement before the site goes
public. `assets/img/CREDITS.md` lists which photo is used where.

**Stock** — only the two page-heading backgrounds are left
(`hero-group.jpg`, `band-summit.jpg`), from
[Pexels](https://www.pexels.com/license/). Checked: free for commercial use, no
attribution required. Both show strangers, so they're next in line to be
replaced.

To swap any image, keep the same filename and update the `width`/`height`
attributes wherever it appears — they're set explicitly to stop the page
jumping as images load.

Resize to roughly 1400px wide and save as JPEG before committing — the repo
shouldn't carry 8MB camera files. Images are about 6MB in total.

## Hero video

The homepage hero cycles three clips, 7 seconds each, with the destination
named in the corner. The list lives at the top of the hero block in
`assets/js/main.js` — add, remove or reorder entries there and drop the file
in `assets/video/`. A clip with no `caption` shows no label.

It's built to not cost anyone much:

- The poster photo (`hero-group.jpg`) paints first and is the only thing
  guaranteed to load. Clips fade in over it, so a slow connection, a blocked
  autoplay or a missing file just leaves the photograph.
- Clips load one at a time, so someone who scrolls straight past fetches about
  2.6MB rather than all 6.1MB.
- **Phones get the first clip on a loop**, not the montage — no point spending
  someone's mobile data on the full set.
- Nothing is fetched at all if the visitor has "reduce motion" turned on or
  data-saver enabled. They see the poster photo.
- Playback pauses when the hero scrolls off screen or the tab is hidden.

Video is 8.4MB against about 6MB of photographs. Adding or removing a clip is
a one-line change to that list.

**The climbing clip came in as a 31MB vertical phone video**, 2160x3840 at
60fps. Three things had to happen to it, and they are worth knowing if another
arrives the same way:

- **It was portrait.** The hero is a landscape band, and `object-fit: cover`
  would have thrown away about two thirds of the frame while still downloading
  all of it. It is cropped to the centre 16:9 band instead, which is the slice
  that keeps the climbers in shot for the whole clip.
- **It was too fast.** Time is stretched 2x, so 4.1 seconds becomes 8.2. The
  source was 60fps and the output is 29.97, so every frame is kept exactly
  once - real slow motion, not dropped frames.
- **It was 31MB.** Re-encoded to 960x540 H.264 to match the others, which
  brought it to 2MB.

The exact command is in the commit that added it. `ffmpeg` is not installed on
this machine; `pip install imageio-ffmpeg` brings a bundled binary.

## Forms

There's no backend. Both the enquiry form and the newsletter signup open the
visitor's email client with the fields filled in. That works, but it loses
anyone without a configured mail app.

When the real address is live, swap for a form service —
[Formspree](https://formspree.io) has a free tier and needs only an `action`
attribute on the `<form>`.

"Register your interest" on the trip page links to
`contact.html?trip=<trip name>`, and `main.js` uses that to pre-select the
dropdown and pre-fill the message. If you add a trip, add a matching
`<option>` in `contact.html` so the names line up exactly.

Taking actual deposits needs a payment provider. Stripe Payment Links are the
cheapest route and need no backend.

## Colours

The palette is bright, which makes contrast the easy thing to get wrong. The
rule is at the top of `styles.css`: **bright fills always carry dark ink text.**
Turquoise with white text is 2.3:1 and fails badly; with ink it's 5.9:1 and
passes. Two surfaces are the exception and take white text instead —
`--deep-teal` (6.4:1) and `--grape` (9.4:1). Nothing else does.

There are two bright fills (`--tangerine`, `--lime`) and one dark surface
(`--grape`) beyond the original four, plus four near-white washes
(`--mist`, `--cream`, `--blush`, `--lilac`) so a page can alternate through
several colours rather than white → mist → white. Ink reads on all four washes.

Colour mostly arrives through **position, not markup**. Trip cards, past-journey
cards, itinerary days, FAQ rows and quotes each set an `--accent` from an
`:nth-child` cycle, so adding a fourth trip or a twenty-fourth country picks up
the next colour on its own. The two places that are chosen by hand are the
section background (`.section-cream`, `.section-blush`, `.section-lilac`,
`.section-grape`) and the eyebrow tab (`.eyebrow-coral` and friends).

**Waves** carry a coloured crest along the top edge. There is no second path in
the markup — it is a `drop-shadow` on the existing one, offset upwards with
zero blur, which traces the curve exactly. Each `.wave-*` fill class sets its
own `--wave-crest`, so a wave still only needs its fill class. Don't add blur
to that shadow; the crisp edge is the whole effect.

The rainbow rules under the stuck header and above the footer both come from
one token, `--spectrum`.

## Deployment

AWS hosts the static site in a private S3 bucket behind CloudFront, with Route
53 DNS and an ACM certificate. The contact form uses API Gateway, Lambda and
Amazon SES; it does not use a database. See `infrastructure/README.md` for the
stack and upload commands.
