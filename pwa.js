// ── يومي — Early init: anti-clickjacking + language direction ──
// Runs BEFORE page renders to prevent flash of wrong layout
(function(){
  // ── Anti-clickjacking: escape if embedded in iframe ──
  if(window.self !== window.top) {
    try { window.top.location = window.self.location; } catch(e) {}
    document.body.innerHTML = '<p style="font-family:sans-serif;padding:2rem;">⚠️ This page cannot be embedded.</p>';
  }
  // ── Language init ──
  try {
    var l = JSON.parse(localStorage.getItem('zn_cfg_lang') || '"ar"');
    var h = document.documentElement;
    h.setAttribute('lang', l === 'en' ? 'en' : 'ar');
    h.setAttribute('dir',  l === 'en' ? 'ltr' : 'rtl');
  } catch(e) {}
})();
