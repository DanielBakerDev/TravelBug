/* =========================================================================
   Travel Bug Tours — site behaviour
   ========================================================================= */
const CONTACT_EMAIL = 'exploretravelbugtours@gmail.com';

/* ------------------------- sticky header state ------------------------- */
const header = document.getElementById('siteHeader');

if (header) {
  const syncHeader = () => header.classList.toggle('is-stuck', window.scrollY > 40);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
}

/* ----------------------------- mobile nav ------------------------------ */
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('primaryNav');

if (navToggle && nav) {
  const closeNav = () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Close after tapping a link, or on Escape.
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeNav(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
}

/* -------------------------- reveal on scroll --------------------------- */
const revealables = document.querySelectorAll('.reveal');

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger items that enter together, so groups cascade rather than pop.
      entry.target.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  revealables.forEach((el) => observer.observe(el));
}

/* ---------------------------- hero video montage ------------------------ */
/* Cycles short clips behind the homepage hero. Design constraints:
   - The poster <img> is the only thing guaranteed to load. Clips fade in over
     it, so a slow connection or a blocked autoplay just leaves the photo.
   - preload="none" plus loading one clip at a time: a visitor who scrolls
     straight past downloads ~2.6MB, not the full 6.1MB.
   - Small screens get the first clip on a loop rather than the whole montage,
     to avoid spending someone's mobile data on five files.
   - Nothing is fetched at all under reduced-motion or data-saver. */
const heroVideos = document.querySelectorAll('.hero-video');

if (heroVideos.length === 2) {
  const CLIPS = [
    { src: 'assets/video/hero-1-ridge.mp4',  caption: '' },
    { src: 'assets/video/hero-2-baobab.mp4', caption: 'Madagascar' },
    { src: 'assets/video/hero-3-forest.mp4', caption: 'Madagascar' },
  ];
  const DWELL = 7000;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const small = matchMedia('(max-width: 700px)').matches;
  const caption = document.getElementById('heroCaption');

  if (!reduced && !saveData) {
    const playlist = small ? CLIPS.slice(0, 1) : CLIPS;
    let index = 0;
    let slot = 0;
    let timer = null;
    let visible = true;
    // show() awaits before it sets `timer`, so without this a second
    // IntersectionObserver callback in that window starts a parallel run and
    // the montage skips a clip.
    let busy = false;

    const load = (video, clip) => new Promise((resolve, reject) => {
      video.src = clip.src;
      video.load();
      video.addEventListener('canplay', resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
    });

    const show = async () => {
      if (busy) return;
      busy = true;

      const clip = playlist[index];
      const next = heroVideos[slot];
      const prev = heroVideos[1 - slot];

      try {
        await load(next, clip);
        await next.play();
      } catch {
        busy = false;
        return; // autoplay refused or file missing — poster stays, no retry
      }

      busy = false;

      next.classList.add('is-live');
      prev.classList.remove('is-live');

      if (caption) {
        caption.classList.toggle('is-live', Boolean(clip.caption));
        if (clip.caption) caption.textContent = clip.caption;
      }

      // Free the outgoing clip once it has faded out.
      setTimeout(() => {
        if (!prev.classList.contains('is-live')) { prev.pause(); prev.removeAttribute('src'); prev.load(); }
      }, 1000);

      slot = 1 - slot;
      index = (index + 1) % playlist.length;

      if (playlist.length > 1 && visible) timer = setTimeout(show, DWELL);
    };

    // Don't start until the hero is actually on screen, and stop when it isn't.
    const hero = document.querySelector('.hero');
    const gate = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !timer) {
        show();
      } else if (!visible) {
        clearTimeout(timer);
        timer = null;
        heroVideos.forEach((v) => v.pause());
      }
    }, { threshold: 0.15 });

    if (hero) gate.observe(hero);

    // Tab hidden: stop burning battery decoding video nobody can see.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(timer);
        timer = null;
        heroVideos.forEach((v) => v.pause());
      } else if (visible && !timer) {
        const live = [...heroVideos].find((v) => v.classList.contains('is-live'));
        if (live) live.play().catch(() => {});
        if (playlist.length > 1) timer = setTimeout(show, DWELL);
      }
    });
  }
}

/* ------------------------------ enquiry form ---------------------------- */
/* No backend: the form composes an email in the visitor's mail client.
   Swap for a form service (Formspree / Netlify Forms) once the real address
   is live — it only needs an `action` on the <form>. */
const form = document.getElementById('inquiryForm');
const note = document.getElementById('formNote');

const setNote = (text, isError = false) => {
  if (!note) return;
  note.textContent = text;
  note.classList.toggle('is-error', isError);
};

/* "Request a spot" on a trip page links to contact.html?trip=<name>.
   Pre-fill the message so the enquiry says which departure it's about. */
if (form) {
  const requestedTrip = new URLSearchParams(location.search).get('trip');
  if (requestedTrip) {
    // Already decoded by URLSearchParams; keep letters, digits and the
    // punctuation the trip names actually use, drop everything else.
    const clean = requestedTrip.replace(/[^\w\s,'&–—-]/g, '').slice(0, 120).trim();

    if (clean) {
      // Select the matching dropdown option if there is one, so the enquiry
      // carries the trip in a structured field rather than only in prose.
      const select = form.elements.trip;
      let matched = '';
      if (select) {
        const option = [...select.options].find((o) => o.text.trim() === clean);
        if (option) { select.value = option.value || option.text; matched = option.text; }
      }

      const msg = form.elements.message;
      if (msg && !msg.value) msg.value = `I'd like to request a spot on ${clean}.\n\n`;

      const heading = document.getElementById('tripPrefillNote');
      if (heading) heading.textContent = `Enquiring about ${matched || clean}`;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const get = (key) => (data.get(key) || '').toString().trim();

    const name = get('name');
    const email = get('email');

    form.querySelectorAll('[required]').forEach((el) => el.removeAttribute('aria-invalid'));

    if (!name || !email) {
      const missing = !name ? form.elements.name : form.elements.email;
      missing.setAttribute('aria-invalid', 'true');
      missing.focus();
      setNote('Please add your name and email so Amanda can reply.', true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.elements.email.setAttribute('aria-invalid', 'true');
      form.elements.email.focus();
      setNote("That email doesn't look right — mind checking it?", true);
      return;
    }

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Trip: ${get('trip') || '—'}`,
      `Travellers: ${get('people') || '—'}`,
      '',
      get('message') || '(no additional details)',
    ].join('\n');

    const href = `mailto:${CONTACT_EMAIL}`
      + `?subject=${encodeURIComponent(`Trip enquiry — ${name}`)}`
      + `&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    setNote('Opening your email app — press send and it’s on its way.');
  });
}

/* ----------------------------- newsletter ------------------------------ */
/* Also has no backend. Rather than pretend it worked, say what it does. */
const newsletter = document.getElementById('newsletterForm');

if (newsletter) {
  newsletter.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletter.querySelector('input[type="email"]');
    const out = document.getElementById('newsletterNote');
    const value = (input.value || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      if (out) { out.textContent = 'That email doesn’t look right.'; out.classList.add('is-error'); }
      return;
    }

    input.removeAttribute('aria-invalid');
    window.location.href = `mailto:${CONTACT_EMAIL}`
      + `?subject=${encodeURIComponent('Add me to the Travel Bug Tours list')}`
      + `&body=${encodeURIComponent(`Please add ${value} to the mailing list.`)}`;
    if (out) { out.textContent = 'Opening your email app to confirm.'; out.classList.remove('is-error'); }
  });
}

/* --------------------------------- misc -------------------------------- */
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
