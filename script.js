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
const SUBSCRIBE_ENDPOINT = window.SUBSCRIBE_ENDPOINT || 'https://script.google.com/macros/s/AKfycbzj6uKIh7V6U1qAdIBB-LJy6001LDMHWj7x-2MhUXKS6bZbR2oWdh9dpRrsUBAZr7-ICQ/exec';
const notifyForm = document.getElementById('notify-form');
if (notifyForm) {
  const submitBtn = document.getElementById('notify-submit');
  const statusEl = document.getElementById('notify-status');
  const nameInput = /** @type {HTMLInputElement} */(document.getElementById('name'));
  const emailInput = /** @type {HTMLInputElement} */(document.getElementById('email'));

  // Real-time callback on input changes
  function reportChange() {
    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const hasName = !!name;
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const valid = hasName && hasEmail;

    // Enable/disable submit button based on validity
    if (submitBtn) {
      submitBtn.disabled = !valid;
      submitBtn.setAttribute('aria-disabled', String(!valid));
    }

    // Gentle guidance in status area
    if (statusEl) {
      if (valid) {
        statusEl.textContent = 'Ready to submit.';
      } else if (hasName && !hasEmail) {
        statusEl.textContent = 'Name looks good — enter a valid email.';
      } else if (!hasName && hasEmail) {
        statusEl.textContent = 'Email looks good — enter your name.';
      } else {
        statusEl.textContent = '';
      }
    }

    // Optional external hook
    try {
      if (typeof window.onNotifyFormChange === 'function') {
        window.onNotifyFormChange({ name, email, hasName, hasEmail, valid });
      }
    } catch {}
  }

  // Attach listeners for real-time feedback
  nameInput?.addEventListener('input', reportChange);
  emailInput?.addEventListener('input', reportChange);
  nameInput?.addEventListener('change', reportChange);
  emailInput?.addEventListener('change', reportChange);
  // Initial state
  reportChange();

  // Fallback submission using a GET beacon to avoid CORS
  function submitViaBeacon(name, email) {
    return new Promise((resolve) => {
      const qs = new URLSearchParams({ name, email, t: String(Date.now()) });
      const url = `${SUBSCRIBE_ENDPOINT}?${qs.toString()}`;
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  // Fallback submission using POST beacon (no preflight)
  function submitViaPostBeacon(name, email) {
    const qs = new URLSearchParams({ name, email, t: String(Date.now()) });
    if (navigator.sendBeacon) {
      const blob = new Blob([qs.toString()], { type: 'application/x-www-form-urlencoded' });
      navigator.sendBeacon(SUBSCRIBE_ENDPOINT, blob);
      return Promise.resolve();
    }
    // If sendBeacon unavailable, fall back to GET beacon
    return submitViaBeacon(name, email);
  }
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
      let txt = '';
      let data = null;
      try { txt = await res.text(); } catch {}
      try { data = JSON.parse(txt); } catch {}
      const ok = !!(data && data.ok === true);
      if (ok) {
        statusEl.textContent = 'Thanks! We will notify you.';
        notifyForm.reset();
        reportChange();
      } else {
        // Fallback: Try POST beacon first (server must parse body), then GET beacon
        await submitViaPostBeacon(name, email);
        statusEl.textContent = 'Thanks! We will notify you.';
        notifyForm.reset();
        reportChange();
      }
    } catch (err) {
      // Network or CORS error: try POST beacon, then GET beacon
      await submitViaPostBeacon(name, email);
      statusEl.textContent = 'Thanks! We will notify you.';
      notifyForm.reset();
      reportChange();
    } finally {
      submitBtn.disabled = false; submitBtn.textContent = 'Notify Me';
    }
  });
}