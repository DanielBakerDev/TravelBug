# Travel Bug Tours

Website for Amanda's small-group adventure trips.

**Live:** https://exploretravelbugtours.com/

Enquiries open the visitor's mail app addressed to
`exploretravelbugtours@gmail.com` (set at the top of `assets/js/main.js`).

Amanda edits the words and photos herself in [Pages CMS](https://app.pagescms.org);
Daniel decides when her changes go live. The pages are built with
[Eleventy](https://www.11ty.dev/) from the content files she edits. The site
is hosted in a private Amazon S3 bucket behind CloudFront; deployment
resources and instructions live in `infrastructure/`.

## Editing and publishing

```
Amanda saves in Pages CMS ──► commit to main ──► preview rebuilds (GitHub Pages)
                                                   danielbakerdev.github.io/TravelBug/
Amanda presses "Send my changes to Daniel" ──► GitHub issue, emailed to Daniel
Daniel checks the preview, runs "Publish to live site" ──► exploretravelbugtours.com
```

- **Every save is a commit to `main`.** That rebuilds the preview
  (`.github/workflows/preview.yml`) within a minute or two. The preview has a
  yellow "Preview" label pinned to the bottom and is always hidden from search
  engines.
- **The live site only changes when Daniel publishes.** Actions tab → "Publish
  to live site" → Run workflow, or `gh workflow run publish.yml`. It builds
  `main`, uploads it to S3, clears CloudFront, and moves the `live` git tag to
  that commit.
- **What will a publish change?**
  https://github.com/DanielBakerDev/TravelBug/compare/live...main shows every
  edit since the last publish, file by file.
- **"Send my changes to Daniel"** is a button in Pages CMS
  (`.github/workflows/ready-for-review.yml`). It opens — or comments on — an
  issue labelled `ready-for-review`, assigned to Daniel, with those three links.
  Publishing closes it.
- **Daniel's own edits go through the same path**: push to `main`, check the
  preview, publish.

Amanda signs in to Pages CMS with her email address — she doesn't need a
GitHub account. She can edit the content and upload photos; she can't change
the layout, the code, or `.pages.yml`.

### What Amanda can edit

`.pages.yml` defines the editor. The sidebar shows:

- **Trips** — one entry per trip: text, prices, photos, the day by day, the
  inclusion lists, and its **Dates**, each with its own spots left. Setting
  spots left to 0 shows "Fully booked" and turns "Request a spot" into "Join
  the waiting list". She can add a new trip or a new date; its page is named
  automatically (`trip-<trip file>-<ddmonyyyy>.html`) and it appears on Home,
  Trips and in the contact form's dropdown on its own.
- **Pages** — Home, Trips page, Past journeys, About, Contact, and Footer &
  settings. Every heading, paragraph and photo on them.

**Photos.** Every trip (Grand Tour included) and the About page have a gallery
she can add to, remove from and reorder; Past journeys is a list she can do the
same with. The single photos — page headers, trip cards, Amanda's portrait —
can be swapped. Removing a photo never breaks the build: an empty photo field,
a blank gallery entry, or a photo deleted from the media library while still
in use is simply left off the page (the last one logs `[images] … left off the
page` in the build). A header or card left with no photo shows a plain fill
(deep teal / mist) rather than a hole.

What stays with Daniel: the hero videos, the layout and colours, the logo, and
the shape of a "combined" trip like the Grand Tour (which trips it joins).

**Photos are shrunk on the way out, not on upload.** `lib/images.js` re-encodes
any photo over 1600px on its longest side, over 400KB, or carrying EXIF data
(phone photos carry their GPS position): turned upright, scaled down,
metadata stripped. The original stays in `assets/img/` as uploaded; only the
built site gets the small copy. Photos already on the site are under all three
limits and are copied untouched — `band-summit.jpg` is the one exception, as it
has camera EXIF. Width and height attributes are read from the processed file,
so a replacement photo of a different shape needs no other change.

### One-time setup

1. **Pages CMS.** Sign in at https://app.pagescms.org with GitHub, install the
   Pages CMS GitHub App on the `TravelBug` repository only, open the repo, and
   invite Amanda by email under Collaborators.
2. **GitHub Pages.** Settings → Pages → Source: **GitHub Actions**. (It used to
   serve the repo root from `main`; there's nothing there to serve any more.)
3. **AWS publishing role.** Deploy `infrastructure/github-publish.yaml` — see
   `infrastructure/README.md`. It lets the publish workflow sign in to AWS with
   no stored keys, and only from the `live` environment.
4. **Repository variables** (Settings → Secrets and variables → Actions →
   Variables): `AWS_PUBLISH_ROLE_ARN`, `AWS_BUCKET`, `AWS_DISTRIBUTION_ID`.
5. **The `live` tag** marks what's on the live site, so the compare link works
   from day one. It starts at the last commit deployed by hand.

## Files

| Path | What's in it |
|---|---|
| `content/*.yml` | The words and photo choices for each page — what Amanda edits |
| `content/trips/*.yml` | One file per trip, including its dates |
| `src/*.njk` | Page templates. `trip-departure.njk` makes one page per date of every trip; `trip-combined.njk` makes the Grand Tour |
| `src/_includes/` | The shared header and footer (`base.njk`), cards, waves and the other repeated pieces (`macros.njk`) |
| `src/static/trip-madagascar.html` | Redirect to `trips.html`, so the old link doesn't 404. Copied as is |
| `lib/content.js` | Reads `content/` and works out everything derived: page names, date labels, which Part One date joins which Part Two date, the contact dropdown |
| `lib/dates.js` | How date ranges are written |
| `lib/images.js` | Photo shrinking, see above |
| `eleventy.config.js` | Wires the above together |
| `.pages.yml` | The Pages CMS editor: which fields Amanda sees, with labels and help text written for her |
| `.github/workflows/` | Preview, publish, and the "send to Daniel" button |
| `assets/css/styles.css` | All styling. Colour tokens and the contrast rule are at the top |
| `assets/js/main.js` | Sticky header, mobile menu, scroll reveals, both forms, hero video list |
| `assets/img/` | Photos and the logo files, plus `CREDITS.md` listing every source |
| `assets/video/` | The four hero montage clips |

The build writes every page flat into `_site/` (`about.html`, not
`about/index.html`), so every page references `assets/…` by the same relative
path. That's what lets one build work both at the domain root and under
`/TravelBug/` on the preview. Keep it that way.

**Filenames are inconsistent between the two halves** and it is deliberate.
Part One is named by start month (`jun2027`), which broke down for Part Two
because two of its departures start in July. Part Two is therefore named by
start *date* (`p2-09jul2027`). Renaming Part One to match would change three
URLs that are already live, for no gain. Those six names are pinned with a
hidden `page` value on each date in the trip file; new dates are named
automatically.

## Working on it

```bash
npm install
npm run dev
```

That builds into `_site/` and serves it at http://localhost:4321, rebuilding
when anything in `src/`, `content/` or `assets/` changes. `npm run build` just
builds.

**Content goes in `content/`, never in the templates.** If Amanda should be able
to change a piece of text, it needs a field in the content file *and* in
`.pages.yml`. A field missing from `.pages.yml` is invisible to her, but it is
kept when she saves (`settings.content.merge`).

**Comments in `content/*.yml` don't survive.** Pages CMS rewrites the whole file
on save. Notes about content belong in this README or in a field's
`description` in `.pages.yml`.

**Trip text can use tokens** that fill in per date: `{start}`, `{end}`,
`{dates}`, and on the Madagascar halves `{combined-dates}` — the joined-up
Grand Tour window. Bold, italics and links in the rich-text fields arrive as
Markdown and are rendered with raw HTML switched off.

Then push to `main` — it shows up on the preview, not the live site.

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

Six departure pages, one per row per half, all made from one trip file per
half (`content/trips/madagascar-part-one.yml` and `-part-two.yml`). An
itinerary, price or inclusion-list change is made once and lands on all three
pages. The sibling chips, the Part One / Part Two / Grand Tour switch and the
"runs straight into" chip are all worked out by `lib/content.js`.

**Pairing is by position.** The Grand Tour file
(`madagascar-grand-tour.yml`, `kind: combined`) lists its `parts`, and the
first date of Part One joins the first date of Part Two, second with second,
and so on — each list is sorted by start date first. If one half gets a date
the other doesn't have, that date simply has no partner: no "runs straight
into" chip, and the plain ending instead of "Carry on south?".

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
      `mad-1-lemur.jpg` from Part One (the card and hero photo fields in
      `madagascar-part-two.yml`). It also has no gallery at all, deliberately — showing Part
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
- [ ] **Let search engines in.** Every page carries
      `<meta name="robots" content="noindex">` while "Hide the website from
      Google" is ticked in Pages CMS (Footer & settings, `hide_from_search` in
      `content/site.yml`). Now that the trip is real this is mostly about the
      FAQ terms above — untick it once those are right. The preview stays
      hidden regardless.

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

Every fact on it reads TBC, because none of them are decided. The contact
dropdown gets a matching "Egypt — the trip that's in the works" option so
people can still register interest.

All of that comes from `kind: coming-soon` in `content/trips/egypt.yml`.
**To make it real:** in Pages CMS, change its type to "Bookable", add its
dates, and fill in the rest. The card becomes a link and the pages appear.

## Logo

Amanda's logo arrived as a single 2048px JPEG on a flat white background: the
mascot on the left, "TRAVEL BUG TOURS" beside him. Three files are cut from it,
all in `assets/img/`.

| File | Where it goes | Rendered at |
|---|---|---|
| `logo-lockup.png` | Header and footer | 76px tall in the header, 58px once stuck, 205px wide in the footer |
| `apple-touch-icon.png` | iOS home screen | 180px |
| `favicon.png` | Browser tab | 16—32px |

**The whole logo is used everywhere it fits.** An earlier version cropped the
mascot out for the header and set the name in Outfit beside him; Daniel didn't
like it, and it is gone.

**That is what sets the header height.** The lockup is 1352×800, so the word
TOURS stops being readable below about 70px tall. The header carries it at
76px, which makes the bar 108px deep — much deeper than a text wordmark would
need. `--header-h` exists for exactly this reason: the hero's top padding and
two sticky offsets are all calculated from it, so **changing the logo height
means changing that token, not the padding**. Scrolling shrinks it to 58px,
which is as small as it goes while staying legible.

**The tab icon is the one exception**, and it is a physical limit rather than a
preference: a 1.7:1 lockup squeezed into a 16px square is an unreadable smear.
The favicon is a tight crop of the sunglasses and grin, which is the most of
him that survives at that size. The touch icon is 180px, big enough for the
real logo, so it gets it.

**How the background was removed:** by connected component, not by turning
white transparent. The character wears a white shirt and has white highlights
in his sunglasses, and a global swap would have punched holes in both. Instead
the white region that touches the border is found and only that is cleared;
both of those are walled off by black outline so the region never reaches them.
The cut is then feathered over two pixels, otherwise a pale halo shows up as
soon as the logo sits on the dark header. The script is in the scratchpad, not
the repo — rerun it from `travel-bug-logo.jpg` if the artwork is ever redrawn.

The files are palette PNGs at around 160 colours. The lockup is 59KB that way
against 336KB as full RGBA, with no banding visible in the gradients.

## Photos

Two sets, and the difference matters.

**Amanda's own photographs** — `amanda.jpg`, the 23 `past-*.jpg` cards, the five
Madagascar photos (`trip-madagascar.jpg` and `mad-1` to `mad-4`) and
`trip-egypt.jpg`. All five Madagascar shots are **Part One**; Part Two has none
of its own and borrows one of them. They
show real, identifiable people, so get everyone's agreement before the site goes
public. `assets/img/CREDITS.md` lists which photo is used where.

**Stock** — only one page-heading background is left
(`band-summit.jpg`, on the About page), from
[Pexels](https://www.pexels.com/license/). Checked: free for commercial use, no
attribution required. Both show strangers, so they're next in line to be
replaced.

To swap a photo, pick or upload a different one in Pages CMS. `width` and
`height` are filled in from the file at build time (they're there to stop the
page jumping as images load), so nothing else needs changing. Uploads land in
`assets/img/` with a slugified filename.

The build shrinks anything large (see "What Amanda can edit"), so the live site
never serves a camera-sized file. The repository still keeps the original,
though — if it grows uncomfortably, resizing the originals in `assets/img/` is
safe. Before Pages CMS, images were about 6MB in total.

## Hero video

The homepage hero cycles four clips, 7 seconds each. **All four are Amanda's
own footage**; the Pexels stock clips that used to be here are gone. The list
lives at the top of the hero block in `assets/js/main.js` — add, remove or
reorder entries there and drop the file in `assets/video/`. A clip with a
`caption` gets that label in the corner. **None of the four has one yet**,
because the files carry no location and nobody has said where they were shot.

| File | What it shows | Source | Speed |
|---|---|---|---|
| `hero-1-climb.mp4` | Drone pull-back from three climbers on a ridge | Insta360, 2160×3840 | 0.5× |
| `hero-2-traverse.mp4` | A roped line crossing a sloping rock face | WhatsApp copy, 478×850 | 0.8× |
| `hero-3-summit.mp4` | The group on a summit, then the view along the ridge | WhatsApp copy, 478×850 | 0.65× |
| `hero-4-lookout.mp4` | Drone pull-back from the group on a lookout | Insta360, 2160×3840 | 0.4× |

It's built to not cost anyone much:

- The poster (`hero-poster.jpg`) paints first and is the only thing guaranteed
  to load. Clips fade in over it, so a slow connection, a blocked autoplay or
  a missing file just leaves the still. **It is the first frame of
  `hero-1-climb.mp4`, cropped identically**, so the fade in is invisible. If
  the first clip ever changes, regenerate the poster from the new one.
- Clips load one at a time, so someone who scrolls straight past fetches about
  2MB rather than all 6.7MB.
- **Phones get the first clip on a loop**, not the montage — no point spending
  someone's mobile data on the full set. That is a second reason the sharpest
  clip is first.
- Nothing is fetched at all if the visitor has "reduce motion" turned on or
  data-saver enabled. They see the poster.
- Playback pauses when the hero scrolls off screen or the tab is hidden.

### The tint over the video

The homepage hero is **not** tinted like the other pages. The inner pages lay a
dark teal wash over their still photos; over Amanda's footage that turned every
clip the same murky green, so the homepage (`.hero.is-home` in the CSS) uses a
neutral black shadow in just two places: a band under the header for the nav
links, and a soft patch behind the words. Everywhere else the footage shows at
full colour.

The shadow is as light as it can be while the words stay readable. The area
behind the text gets as bright as a relative luminance of 0.70 in the summit
clip (open sky), where bare white text is 1.4:1; the patch plus a heavy shadow
on the letters themselves carries it. **If a new clip goes in, check its
brightest frame with the text over it** before assuming the tint still works.

### Preparing a clip

Every clip so far has arrived **vertical, too fast and too big**, so each one
went through the same three steps. Worth repeating for the next.

- **Crop to a 16:9 band.** The hero is landscape, and `object-fit: cover` on a
  portrait file throws away about two thirds of it while still downloading all
  of it. Which band to keep is a per-clip decision: look at frames from across
  the clip and keep the slice where the people stay in shot.
- **Slow it down.** Stretch time until the clip is a little over the 7-second
  dwell, so it doesn't loop back to its opening mid-display. When the new rate
  divides evenly into the source's 60fps — 30 at 0.5×, 24 at 0.4× — every frame is
  kept once and it is genuine slow motion.
- **Re-encode to 960×540 H.264** with the audio stripped. That takes a 30MB
  camera file down to about 2MB.

**The two WhatsApp clips are soft, and cropping can't fix it.** WhatsApp had
already shrunk them to 478 pixels wide before they reached us, so the 16:9 band
is 478×268 and the site upscales it 2×. Behind the dark scrim it passes as
depth of field, but the original files off Amanda's phone would be noticeably
sharper. Re-run the same crop on those if she can send them.

`ffmpeg` is not installed on this machine; `pip install imageio-ffmpeg` brings
a bundled binary. The exact crop, trim and speed for each clip is in the commit
that added it.

## Forms

There's no backend. Both the enquiry form and the newsletter signup open the
visitor's email client with the fields filled in. That works, but it loses
anyone without a configured mail app.

When the real address is live, swap for a form service —
[Formspree](https://formspree.io) has a free tier and needs only an `action`
attribute on the `<form>`.

"Register your interest" on the trip page links to
`contact.html?trip=<trip name>`, and `main.js` uses that to pre-select the
dropdown and pre-fill the message. Both the link and the dropdown are built
from the trip files by the same code in `lib/content.js`, so a new trip or date
lines up on its own.

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
stacks.

Publishing is the "Publish to live site" workflow — see "Editing and
publishing" at the top. `infrastructure/deploy-site.ps1` still works as a
manual fallback: it builds and uploads `_site/`, but doesn't move the `live`
tag, so move it by hand afterwards
(`git tag -f live && git push -f origin refs/tags/live`).

The preview on GitHub Pages and the publishing workflows cost nothing on a
public repository. Pages CMS's hosted app is free.
