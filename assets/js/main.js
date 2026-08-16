/* =========================================================================
   TravelBug — site behaviour
   ------------------------------------------------------------------------
   CHANGE ME: the address enquiries are sent to.
   ========================================================================= */
const CONTACT_EMAIL = 'hello@travelbug.example';

/* ------------------------- sticky header state ------------------------- */
const header = document.getElementById('siteHeader');

const syncHeader = () => {
  header.classList.toggle('is-stuck', window.scrollY > 40);
};

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

/* ----------------------------- mobile nav ------------------------------ */
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('primaryNav');

const closeNav = () => {
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
};

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// Close after tapping a link, or on Escape.
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) closeNav();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});

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

/* ------------------------------ enquiry form ---------------------------- */
/* No backend yet: the form composes an email in the visitor's mail client.
   Swap this handler for a form service (Formspree / Netlify Forms) when the
   real address is live. */
const form = document.getElementById('inquiryForm');
const note = document.getElementById('formNote');

const setNote = (text, isError = false) => {
  note.textContent = text;
  note.classList.toggle('is-error', isError);
};

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
    setNote('Please add your name and email so I can reply.', true);
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
    `Where: ${get('where') || '—'}`,
    `When: ${get('when') || '—'}`,
    '',
    get('message') || '(no additional details)',
  ].join('\n');

  const href = `mailto:${CONTACT_EMAIL}`
    + `?subject=${encodeURIComponent(`Trip enquiry — ${name}`)}`
    + `&body=${encodeURIComponent(body)}`;

  window.location.href = href;
  setNote('Opening your email app — press send and it’s on its way.');
});

/* --------------------------------- misc -------------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();
