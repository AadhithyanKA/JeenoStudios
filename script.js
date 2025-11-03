// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Close nav when a link is clicked (mobile)
siteNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Current year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// --- Notify form submission ---
const SUBSCRIBE_ENDPOINT = window.SUBSCRIBE_ENDPOINT || 'https://script.google.com/macros/s/AKfycbwh-68P1H8E-MC5NYuPuK0W8kNkH76-tArkRudIWFrfjTqsMeMfUJXJz7uqr8xvNsURrw/exec';
const notifyForm = document.getElementById('notify-form');
if (notifyForm) {
  const submitBtn = document.getElementById('notify-submit');
  const statusEl = document.getElementById('notify-status');
  notifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    const name = /** @type {HTMLInputElement} */(document.getElementById('name')).value.trim();
    const email = /** @type {HTMLInputElement} */(document.getElementById('email')).value.trim();
    const honeypot = /** @type {HTMLInputElement} */(notifyForm.querySelector('.hp')).value.trim();
    if (honeypot) return; // bot
    if (!name) { statusEl.textContent = 'Please enter your name.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { statusEl.textContent = 'Please enter a valid email.'; return; }

    submitBtn.disabled = true; submitBtn.textContent = 'Submitting…';
    try {
      const body = new URLSearchParams({ name, email });
      const res = await fetch(SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
      });
      let ok = res.ok;
      let txt = '';
      try { txt = await res.text(); } catch {}
      try {
        const data = JSON.parse(txt);
        if (typeof data.ok !== 'undefined') ok = ok && !!data.ok;
      } catch {}
      if (ok) {
        statusEl.textContent = 'Thanks! We will notify you.';
        notifyForm.reset();
      } else {
        statusEl.textContent = 'Could not submit right now. Please try again later.';
      }
    } catch (err) {
      statusEl.textContent = 'Network error. Please try again later.';
    } finally {
      submitBtn.disabled = false; submitBtn.textContent = 'Notify Me';
    }
  });
}