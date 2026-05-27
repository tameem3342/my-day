// ── يومي — Settings, Section Management, Session & Security
// ── Section Visibility ───────────────────────────────────────────
const SECTIONS = {
  habits:   { id:'sectionHabits',   label:{ en:'Daily Habits',    ar:'العادات اليومية' } },
  steps:    { id:'sectionSteps',    label:{ en:'Daily Steps',     ar:'الخطوات اليومية' } },
  calories: { id:'sectionCalories', label:{ en:'Calorie Tracker', ar:'تتبع السعرات' } },
  notes:    { id:'sectionNotes',    label:{ en:'Day Notes',       ar:'الملاحظات' } },
  wpplanner:{ id:'sectionWorkoutPlanner', label:{ en:'Workout Schedule', ar:'جدول التمرين' } },
  wplog:    { id:'sectionWorkoutLog',     label:{ en:'Exercise Log',     ar:'سجل التمارين' } },
  weight:   { id:'sectionWeight',         label:{ en:'Body Weight',           ar:'الوزن' } },
  calcal:   { id:'sectionCalCalc',        label:{ en:'Calorie Calculator',    ar:'حاسبة السعرات' } },
  water:    { id:'sectionWater',          label:{ en:'Water Intake',          ar:'شرب الماء' } },
  exlib:    { id:'sectionExLib',          label:{ en:'Exercise Library',      ar:'مكتبة التمارين' } },
  whistory: { id:'sectionWorkoutHistory', label:{ en:'Workout History',        ar:'السجل التاريخي' } },
};

const TODAY_SECTION_KEYS = ['habits','steps','calories','notes'];
const WORKOUT_SECTION_KEYS = ['wpplanner','wplog','weight','calcal','water','exlib','whistory'];
const DEFAULT_SECTIONS_ORDER = [...TODAY_SECTION_KEYS];
let sectionsOrder = [...DEFAULT_SECTIONS_ORDER]; // ordered list of section keys
let hiddenSections = []; // array of section keys currently hidden

const loadHiddenSections = () => {
  hiddenSections = loadCfg('hiddenSections', ['water']); // water hidden by default
  const saved = loadCfg('sectionsOrder', null);
  if(saved && Array.isArray(saved)) {
    // Merge: keep saved order, append any new sections at end
    sectionsOrder = [...saved.filter(k => SECTIONS[k]), ...DEFAULT_SECTIONS_ORDER.filter(k => !saved.includes(k))];
  } else {
    sectionsOrder = [...DEFAULT_SECTIONS_ORDER];
  }
};

const saveHiddenSections = () => {
  saveCfg('hiddenSections', hiddenSections);
};

const saveSectionsOrder = () => {
  saveCfg('sectionsOrder', sectionsOrder);
};

const applyHiddenSections = () => {
  // Apply visibility
  Object.entries(SECTIONS).forEach(([key, sec]) => {
    const el = $(sec.id);
    if(!el) return;
    el.style.display = hiddenSections.includes(key) ? 'none' : '';
  });
  // Apply DOM order within each column
  _applySectionsOrder();
};

// Reorder the actual section cards in the DOM to match sectionsOrder
const _applySectionsOrder = () => {
  const leftCol  = document.getElementById('todayColLeft');
  const rightCol = document.getElementById('todayColRight');
  if(!leftCol || !rightCol) return;

  sectionsOrder.filter(k => TODAY_SECTION_KEYS.includes(k)).forEach(key => {
    const sec = SECTIONS[key];
    if(!sec) return;
    const el = $(sec.id);
    if(!el) return;
    const targetCol = (key === 'notes') ? rightCol : leftCol;
    targetCol.appendChild(el);
  });
};

const hideSection = key => {
  if(!hiddenSections.includes(key)) hiddenSections.push(key);
  saveHiddenSections();
  applyHiddenSections();
  renderQuickFills();
  const lbl = SECTIONS[key]?.label[lang] || key;
  showToast(`${lbl} ${lang==='ar'?'مخفي — اضغط ☰ لإرجاعه':'hidden — tap ☰ to restore'}`);
};

const restoreSection = key => {
  hiddenSections = hiddenSections.filter(k => k !== key);
  saveHiddenSections();
  applyHiddenSections();
  renderQuickFills();
};

// ── Manage Sections panel (rendered inline above calendar) ────────
// ── Quick Nav Drawer ──────────────────────────────────────────────


const SECTION_ICONS = {
  habits:   '•', steps:    '•', calories: '•', notes:    '•',
  wpplanner:'•', wplog:    '•', weight:   '•', calcal:   '•',
  water:    '•', exlib:    '•'
};
const SECTION_TAB = {
  habits:'today', steps:'today', calories:'today', notes:'today',
  wpplanner:'workout', wplog:'workout', weight:'workout', calcal:'workout',
  water:'workout', exlib:'workout'
};

// ── Sections Toggle Drawer ────────────────────────────────────────
function openQuickNav() {
  if(document.getElementById('quickNavDrawer')) { closeQuickNav(); return; }

  if(!document.getElementById('quickNavStyle')) {
    const style = document.createElement('style');
    style.id = 'quickNavStyle';
    style.textContent = `
      @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
      #quickNavDrawer .qnav-row { display:flex;align-items:center;gap:.75rem;padding:.65rem 1rem;border-bottom:1px solid var(--border); }
      #quickNavDrawer .qnav-group-lbl { font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);padding:.7rem 1rem .3rem; }
      #quickNavOverlay { position:fixed;inset:0;z-index:998;background:rgba(0,0,0,.4);backdrop-filter:blur(2px); }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.id = 'quickNavOverlay';
  overlay.addEventListener('click', closeQuickNav);
  document.body.appendChild(overlay);

  const drawer = document.createElement('div');
  drawer.id = 'quickNavDrawer';
  drawer.style.cssText = `position:fixed;top:0;right:0;bottom:0;z-index:999;width:min(280px,82vw);background:var(--surface);border-left:1px solid var(--border);box-shadow:-8px 0 32px rgba(0,0,0,.35);display:flex;flex-direction:column;animation:slideInRight .2s cubic-bezier(.4,0,.2,1);overflow:hidden;`;

  const ALL_GROUPS = [
    { labelAr:'اليوم', labelEn:'Today', keys:[...TODAY_SECTION_KEYS] },
    { labelAr:'التمرين', labelEn:'Workout', keys:[...WORKOUT_SECTION_KEYS] }
  ];

  const EYE_ON  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const EYE_OFF = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

  const ICONS = { habits:'•',steps:'•',calories:'•',notes:'•',wpplanner:'•',wplog:'•',weight:'•',calcal:'•',water:'•',exlib:'•' };

  let rowsHTML = '';
  ALL_GROUPS.forEach(grp => {
    rowsHTML += `<div class="qnav-group-lbl">${lang==='ar'?grp.labelAr:grp.labelEn}</div>`;
    grp.keys.forEach(key => {
      const sec = SECTIONS[key]; if(!sec) return;
      const hidden = hiddenSections.includes(key);
      const lbl = sec.label[lang] || key;
      rowsHTML += `<div class="qnav-row">
        <span style="font-size:1.05rem;width:22px;text-align:center;flex-shrink:0;">${ICONS[key]||'•'}</span>
        <span style="flex:1;font-size:.86rem;font-weight:500;color:${hidden?'var(--text3)':'var(--text)'};">${lbl}</span>
        <button class="qnav-eye" data-key="${key}" style="background:none;border:none;cursor:pointer;color:${hidden?'var(--text3)':'var(--accent)'};padding:.3rem;display:flex;align-items:center;border-radius:7px;">
          ${hidden ? EYE_ON : EYE_OFF}
        </button>
      </div>`;
    });
  });

  drawer.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:.85rem 1rem .65rem;border-bottom:1px solid var(--border);flex-shrink:0;">
      <span style="font-size:.9rem;font-weight:700;color:var(--text);">${lang==='ar'?'الأقسام':'Sections'}</span>
      <button id="qnavCloseBtn" style="background:none;border:none;cursor:pointer;color:var(--text3);padding:.2rem;display:flex;align-items:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div style="overflow-y:auto;flex:1;">${rowsHTML}</div>
  `;

  document.body.appendChild(drawer);

  document.getElementById('qnavCloseBtn').addEventListener('click', closeQuickNav);

  drawer.querySelectorAll('.qnav-eye').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const key = btn.dataset.key;
      if(hiddenSections.includes(key)) restoreSection(key); else hideSection(key);
      // Refresh drawer
      closeQuickNav(); openQuickNav();
    });
  });
}

function closeQuickNav() {
  document.getElementById('quickNavDrawer')?.remove();
  document.getElementById('quickNavOverlay')?.remove();
}


// ── Settings Modal ────────────────────────────────────────────────

function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  modal.style.display = 'flex';
  refreshSettingsAvatar();
  applySettingsLang();
  const googleBtn = document.getElementById('settingsGoogleAvatarBtn');
  if(googleBtn) {
    const hasGoogle = currentSupaUser?.app_metadata?.provider === 'google' ||
                      currentSupaUser?.user_metadata?.avatar_url ||
                      currentSupaUser?.user_metadata?.picture;
    googleBtn.style.display = hasGoogle ? 'flex' : 'none';
  }
  const removeBtn = document.getElementById('settingsRemoveAvatarBtn');
  if(removeBtn) removeBtn.style.display = _customAvatarUrl ? 'block' : 'none';
  document.removeEventListener('click', _settingsOutsideClick);
  setTimeout(() => document.addEventListener('click', _settingsOutsideClick), 50);
}

function closeSettingsModal() {
  document.getElementById('settingsModal').style.display = 'none';
  document.removeEventListener('click', _settingsOutsideClick);
}

function _settingsOutsideClick(e) {
  const modal = document.getElementById('settingsModal');
  const btn   = document.getElementById('settingsHeaderBtn');
  const inner = modal?.querySelector('div');
  if(modal && modal.style.display !== 'none'
     && !inner?.contains(e.target)
     && e.target !== btn && !btn?.contains(e.target)) {
    closeSettingsModal();
  }
}

function refreshSettingsAvatar() {
  const preview = document.getElementById('settingsAvatarPreview');
  const nameEl  = document.getElementById('settingsAvatarName');
  if(!preview) return;
  const avatarSrc = _customAvatarUrl
    || currentSupaUser?.user_metadata?.avatar_url
    || currentSupaUser?.user_metadata?.picture
    || null;
  if(avatarSrc) {
    preview.innerHTML = `<img src="${safeImgSrc(avatarSrc)}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='👤'"/>`;
    if(nameEl) nameEl.textContent = lang==='ar'?'الصورة الشخصية':'Profile photo';
  } else if(currentSupaUser) {
    const n = currentSupaUser.user_metadata?.full_name?.charAt(0) || currentSupaUser.email?.charAt(0) || '?';
    preview.textContent = n.toUpperCase();
    preview.style.fontSize = '1.5rem';
    if(nameEl) nameEl.textContent = lang==='ar'?'الأحرف الأولى':'Initials';
  } else {
    preview.textContent = '👤';
    if(nameEl) nameEl.textContent = lang==='ar'?'لا توجد صورة':'No photo';
  }
}

function useGoogleAvatar() {
  const url = currentSupaUser?.user_metadata?.avatar_url || currentSupaUser?.user_metadata?.picture;
  if(!url) { showToast(lang==='ar'?'لا توجد صورة Google':'No Google avatar found'); return; }
  _customAvatarUrl = null;
  saveCfg('customAvatar', null);
  updateHeaderAvatar(url);
  refreshSettingsAvatar();
  document.getElementById('settingsRemoveAvatarBtn').style.display = 'none';
  showToast(lang==='ar'?'✅ تم استخدام صورة Google':'✅ Using Google photo');
}

function handleSettingsAvatarUpload(e) {
  const file = e.target.files[0]; if(!file) return;
  const ALLOWED_IMG_TYPES = ['image/jpeg','image/png','image/webp','image/gif'];
  if(!ALLOWED_IMG_TYPES.includes(file.type)) { showToast(lang==='ar'?'يُسمح بـ JPG، PNG، WEBP، GIF فقط':'Only JPG, PNG, WEBP, GIF allowed'); e.target.value=''; return; }
  if(file.size > 5*1024*1024) { showToast(lang==='ar'?'الصورة كبيرة جداً (الحد 5 ميغا)':'Image too large (max 5 MB)'); e.target.value=''; return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      let w = img.width, h = img.height;
      if(w > MAX || h > MAX) {
        if(w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.82);
      _customAvatarUrl = compressed;
      saveCfg('customAvatar', compressed);
      updateHeaderAvatar(compressed);
      refreshSettingsAvatar();
      document.getElementById('settingsRemoveAvatarBtn').style.display = 'block';
      showToast(lang==='ar'?'✅ تم حفظ الصورة':'✅ Avatar saved');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function removeAvatar() {
  _customAvatarUrl = null;
  saveCfg('customAvatar', null);
  const googleUrl = currentSupaUser?.user_metadata?.avatar_url || currentSupaUser?.user_metadata?.picture || null;
  updateHeaderAvatar(googleUrl);
  refreshSettingsAvatar();
  document.getElementById('settingsRemoveAvatarBtn').style.display = 'none';
  showToast(lang==='ar'?'تم حذف الصورة الشخصية':'Avatar removed');
}

function updateHeaderAvatar(url) {
  const btn = document.getElementById('authHeaderBtn');
  if(!btn) return;
  let el = document.getElementById('headerAvatar');
  if(url) {
    if(!el) {
      el = document.createElement('img');
      el.id = 'headerAvatar';
      el.setAttribute('referrerpolicy', 'no-referrer');
      el.style.cssText = 'width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid var(--border2);';
      el.onerror = () => { el.style.display='none'; };
      btn.prepend(el);
    }
    el.src = url; el.style.display = '';
    btn.style.padding = '.3rem .6rem';
  } else {
    if(el) el.remove();
    btn.style.padding = '.38rem .75rem';
  }
}

function applySettingsLang() {
  const _s = (id, ar, en) => { const el=document.getElementById(id); if(el) el.textContent=lang==='ar'?ar:en; };
  _s('settingsModalTitle',      'الإعدادات',                         'Settings');
  _s('settingsAvatarLabel',     'الصورة الشخصية',                    'Profile Photo');
  _s('settingsAvatarSub',       'ارفع صورة أو استخدم صورة Google',   'Upload a photo or use Google');
  _s('settingsGoogleAvatarLbl', 'استخدام صورة Google',               'Use Google photo');
  _s('settingsUploadAvatarLbl', 'رفع صورة من الجهاز',                'Upload from device');
  _s('settingsRemoveAvatarLbl', 'حذف الصورة الشخصية',                'Remove photo');
  _s('settingsUsernameLabel',   'الاسم في التحية',                   'Display Name');
  _s('settingsUsernameSub',     'يظهر بجانب تحية الصباح',            'Shown next to your greeting');
  _s('settingsUsernameSave',    'حفظ',                               'Save');
  const unameInp = document.getElementById('settingsUsernameInput');
  if(unameInp) {
    unameInp.placeholder = lang==='ar' ? 'اسمك…' : 'Your name…';
    unameInp.value = loadCfg('displayName', '');
  }
  _s('settingsLangLabel',       'اللغة',                             'Language');
  _s('settingsSignOutLbl',      currentSupaUser?'تسجيل الخروج':'تسجيل الدخول', currentSupaUser?'Sign out':'Sign in');
  const arBtn = document.getElementById('settingsLangAR');
  const enBtn = document.getElementById('settingsLangEN');
  if(arBtn) { arBtn.style.background=lang==='ar'?'var(--accent)':'var(--surface2)'; arBtn.style.color=lang==='ar'?'var(--accent-fg)':'var(--text)'; arBtn.style.borderColor=lang==='ar'?'var(--accent)':'var(--border)'; }
  if(enBtn) { enBtn.style.background=lang==='en'?'var(--accent)':'var(--surface2)'; enBtn.style.color=lang==='en'?'var(--accent-fg)':'var(--text)'; enBtn.style.borderColor=lang==='en'?'var(--accent)':'var(--border)'; }
}

// ── Username save ────────────────────────────────────────────────
function saveDisplayName() {
  const inp = document.getElementById('settingsUsernameInput');
  if(!inp) return;
  const val = sanitizeText(inp.value.trim(), 30);
  saveCfg('displayName', val);
  // Update greeting immediately
  const nameEl = document.getElementById('greetingName');
  if(nameEl) nameEl.textContent = val ? ` ${val}` : '';
  showToast(val ? (lang==='ar' ? `✅ تم حفظ الاسم: ${val}` : `✅ Name saved: ${val}`) : (lang==='ar'?'تم حذف الاسم':'Name cleared'));
}
window.saveDisplayName = saveDisplayName;

window.openSettingsModal  = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.useGoogleAvatar    = useGoogleAvatar;
window.handleSettingsAvatarUpload = handleSettingsAvatarUpload;
window.removeAvatar       = removeAvatar;

window.openQuickNav  = openQuickNav;
window.closeQuickNav = closeQuickNav;

// Wire up the sections button
const _secBtn = document.getElementById('manageSectionsBtn');
if(_secBtn) _secBtn.addEventListener('click', e => { e.stopPropagation(); openQuickNav(); });

document.querySelectorAll('.section-eye[data-section]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const key = btn.dataset.section;
    if(key) hideSection(key);
  });
});


window.addEventListener('error', e => { console.warn('App error:', e.message); });

// ── Paste sanitization for contenteditable note panels ────────────
document.addEventListener('paste', e => {
  const target = e.target;
  if(!target || target.getAttribute('contenteditable') !== 'true') return;
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  const safe = sanitizeText(text, 5000);
  document.execCommand('insertText', false, safe);
});

// ── Session timeout: auto sign-out after 60 minutes of inactivity ─
let _lastActivity = Date.now();
['click','keydown','touchstart','scroll'].forEach(ev =>
  document.addEventListener(ev, () => { _lastActivity = Date.now(); }, { passive: true })
);
setInterval(() => {
  if(currentSupaUser && Date.now() - _lastActivity > 60 * 60 * 1000) {
    authSignOut();
    showToast(lang==='ar'?'⏱️ انتهت جلستك تلقائياً لعدم النشاط':'⏱️ Session expired due to inactivity');
  }
}, 60 * 1000);

// ── Audit log ──────────────────────────────────────────────────────
const auditLog = (action, detail='') => {
  try {
    const logs = LS.get('zn_audit', []);
    logs.push({ action, detail, ts: new Date().toISOString() });
    LS.set('zn_audit', logs.slice(-100)); // keep last 100 actions
  } catch(e) {}
};
