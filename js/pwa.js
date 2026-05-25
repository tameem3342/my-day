// ── يومي — PWA: Install banner, Service Worker, background sync
// ── PWA Install Banner ────────────────────────────────────────────
function dismissPWABanner(permanent) {
  document.getElementById('pwaBanner').style.display = 'none';
  if(permanent) localStorage.setItem('pwa_banner_dismissed','1');
}

function initPWABanner() {
  // Don't show if: already installed as PWA, already dismissed, or not iOS Safari
  const isStandalone = window.navigator.standalone === true;
  const isDismissed  = localStorage.getItem('pwa_banner_dismissed');
  const isIOS        = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari     = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent);

  if(!isStandalone && !isDismissed && isIOS && isSafari) {
    setTimeout(() => {
      document.getElementById('pwaBanner').style.display = 'block';
    }, 2500); // show after 2.5s so page loads first
  }
}

// ── Service Worker Registration ──────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Only register SW if the file actually exists (avoids 404 errors when running locally)
    fetch('sw.js', { method: 'HEAD' }).then(r => {
      if(r.ok) navigator.serviceWorker.register('sw.js').catch(() => {});
    }).catch(() => {});
    initPWABanner();
  });
}

async function flushPendingSync() {
  if(!_supa || !currentSupaUser) return;
  const pending = Object.keys(_fbTimers);
  if(pending.length === 0) return;

  // Get fresh session token once for all pending items (Supabase v2 getSession is async)
  let token = SUPA_KEY;
  try {
    const { data: sessData } = await (_supa?.auth?.getSession?.() || Promise.resolve({ data: null }));
    if(sessData?.session?.access_token) token = sessData.session.access_token;
  } catch(_) {}

  for(const k of pending) {
    clearTimeout(_fbTimers[k]);
    delete _fbTimers[k];
    const lsVal = localStorage.getItem(k);
    if(!lsVal) continue;
    const body = JSON.stringify([{
      user_id: currentSupaUser.id, key: k, value: lsVal,
      updated_at: new Date().toISOString()
    }]);
    // fetch with keepalive is more reliable than sendBeacon for authenticated requests
    fetch(`${SUPA_URL}/rest/v1/user_data?on_conflict=user_id%2Ckey`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + token,
        'Prefer': 'resolution=merge-duplicates'
      },
      body
    }).catch(()=>{
      // sendBeacon fallback removed — cannot send auth headers, would expose data unauthenticated
    });
  }
}

// Flush when tab goes to background (more reliable than beforeunload on mobile)
// Redraw weight chart on resize
let _wtResizeT = null;
window.addEventListener('resize', () => {
  clearTimeout(_wtResizeT);
  _wtResizeT = setTimeout(() => { if(weightLog.length) drawWeightLineChart(weightLog); }, 200);
});

document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'hidden') flushPendingSync();
});
// Also flush on beforeunload (desktop)
window.addEventListener('beforeunload', flushPendingSync);
