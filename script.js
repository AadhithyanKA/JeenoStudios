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
  // Debug area (visible messages for troubleshooting)
  let debugEl = /** @type {HTMLDivElement} */(document.getElementById('notify-debug'));
  if (!debugEl) {
    debugEl = document.createElement('div');
    debugEl.id = 'notify-debug';
    debugEl.setAttribute('role', 'status');
    debugEl.style.fontSize = '0.85rem';
    debugEl.style.marginTop = '0.25rem';
    debugEl.style.color = '#666';
    statusEl?.insertAdjacentElement('afterend', debugEl);
  }

  function setDebug(msg) {
    if (debugEl) debugEl.textContent = String(msg || '');
    try { console.log('[Notify Debug]', msg); } catch {}
  }

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

    // Build a direct test link for manual verification
    try {
      const linkId = 'notify-direct-test-link';
      let link = document.getElementById(linkId);
      const qs = new URLSearchParams({ name, email, t: String(Date.now()) });
      const url = `${SUBSCRIBE_ENDPOINT}?${qs.toString()}`;
      if (!link) {
        link = document.createElement('a');
        link.id = linkId;
        link.textContent = 'Open direct write test';
        link.target = '_blank';
        link.rel = 'noopener';
        link.style.display = 'inline-block';
        link.style.marginTop = '0.25rem';
        link.style.fontSize = '0.85rem';
        statusEl?.insertAdjacentElement('afterend', link);
      }
      link.setAttribute('href', url);
      link.style.visibility = (name && email) ? 'visible' : 'hidden';
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
      setDebug('Fallback: GET beacon sent to server.');
    });
  }

  // Fallback submission using POST beacon (no preflight)
  function submitViaPostBeacon(name, email) {
    const qs = new URLSearchParams({ name, email, t: String(Date.now()) });
    if (navigator.sendBeacon) {
      const blob = new Blob([qs.toString()], { type: 'application/x-www-form-urlencoded' });
      navigator.sendBeacon(SUBSCRIBE_ENDPOINT, blob);
      setDebug('Fallback: POST sendBeacon queued to server.');
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
    setDebug(`Submitting via POST to ${SUBSCRIBE_ENDPOINT}`);
    try {
      const body = new URLSearchParams({ name, email });
      const res = await fetch(SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
      });
      setDebug(`POST response status: ${res.status}`);
      let txt = '';
      let data = null;
      try { txt = await res.text(); } catch {}
      if (txt) setDebug(`POST response text: ${txt}`);
      try { data = JSON.parse(txt); } catch {}
      const ok = !!(data && data.ok === true);
      if (ok) {
        statusEl.textContent = 'Thanks! We will notify you.';
        setDebug('Server confirmed write (ok:true). Row should be added.');
        // Optional verification: request last row to confirm values
        try {
          const vRes = await fetch(`${SUBSCRIBE_ENDPOINT}?verify=1&t=${Date.now()}`);
          const vTxt = await vRes.text();
          let vData = null; try { vData = JSON.parse(vTxt); } catch {}
          const last = vData && vData.lastRow ? vData.lastRow : null;
          if (last) {
            const matched = (last.name === name && last.email === email);
            setDebug(matched
              ? `Verified write: row ${last.row} (${last.name}, ${last.email}).`
              : `Verified last row but values differ: (${last.name || ''}, ${last.email || ''}).`);
          }
        } catch {}
        notifyForm.reset();
        reportChange();
      } else {
        // Fallback: Try POST beacon first (server must parse body), then GET beacon
        await submitViaPostBeacon(name, email);
        statusEl.textContent = 'Thanks! We will notify you.';
        setDebug('Fallback executed. Please check the sheet for a new row.');
        // Try to verify after fallback as well
        try {
          const vRes = await fetch(`${SUBSCRIBE_ENDPOINT}?verify=1&t=${Date.now()}`);
          const vTxt = await vRes.text();
          let vData = null; try { vData = JSON.parse(vTxt); } catch {}
          const last = vData && vData.lastRow ? vData.lastRow : null;
          if (last) {
            const matched = (last.name === name && last.email === email);
            setDebug(matched
              ? `Verified write: row ${last.row} (${last.name}, ${last.email}).`
              : `Verified last row but values differ: (${last.name || ''}, ${last.email || ''}).`);
          }
        } catch {}
        notifyForm.reset();
        reportChange();
      }
    } catch (err) {
      // Network or CORS error: try POST beacon, then GET beacon
      await submitViaPostBeacon(name, email);
      statusEl.textContent = 'Thanks! We will notify you.';
      setDebug('Network/CORS issue. Fallback executed — check sheet for a new row.');
      notifyForm.reset();
      reportChange();
    } finally {
      submitBtn.disabled = false; submitBtn.textContent = 'Notify Me';
    }
  });
}