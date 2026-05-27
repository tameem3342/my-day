// ── يومي — Authentication: auth modal, Supabase sync, bootstrap
// ── Auth Modal ────────────────────────────────────────────────────
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if(modal) { modal.style.display = 'flex'; applyLang(); }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if(modal) modal.style.display = 'none';
  const s1 = document.getElementById('authStep1');
  const s2 = document.getElementById('authStep2');
  if(s1) s1.style.display = '';
  if(s2) s2.style.display = 'none';
  showAuthError('');
}

function showAuthError(msg) {
  let el = document.getElementById('authError');
  if(!el) {
    el = document.createElement('p');
    el.id = 'authError';
    el.style.cssText = 'font-size:.78rem;color:var(--danger);margin-top:.5rem;text-align:center;';
    const s1 = document.getElementById('authStep1');
    if(s1) s1.appendChild(el);
  }
  el.textContent = msg || '';
}

async function signInWithGoogle() {
  if(!_supa) return;
  try {
    const { error } = await _supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/app.html' }
    });
    if(error) showAuthError(lang==='ar'?'فشل تسجيل الدخول بـ Google: '+error.message:'Google sign-in failed: '+error.message);
  } catch(e) {
    showAuthError(lang==='ar'?'خطأ غير متوقع':'Unexpected error');
  }
}

async function sendEmailLink(resend=false) {
  if(!_supa) return;
  const emailEl = document.getElementById('authEmail');
  const email = emailEl?.value?.trim();
  if(!email || !email.includes('@')) {
    showAuthError(lang==='ar'?'أدخل بريدًا إلكترونيًا صحيحًا':'Enter a valid email');
    return;
  }
  try {
    const { error } = await _supa.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/app.html' }
    });
    if(error) { showAuthError(error.message); return; }
    document.getElementById('authStep1').style.display = 'none';
    document.getElementById('authStep2').style.display = '';
    const sentMsg = document.getElementById('authSentMsg');
    if(sentMsg) sentMsg.textContent = lang==='ar'
      ? `أرسلنا رابط الدخول إلى ${email}. اضغط على الرابط في بريدك لتسجيل الدخول.`
      : `We sent a sign-in link to ${email}. Click the link in your email to sign in.`;
  } catch(e) {
    showAuthError(lang==='ar'?'خطأ في الإرسال':'Send error');
  }
}

window.openAuthModal  = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.signInWithGoogle = signInWithGoogle;
window.sendEmailLink  = sendEmailLink;

async function authSignOut() {
  auditLog('sign_out', currentSupaUser?.email || '');
  if(_supa) await _supa.auth.signOut();
  currentSupaUser = null;
  updateAuthUI(null);
  window.location.replace('/');
}

function showUserMenu() {
  const u = currentSupaUser;
  if(!u) return;
  const existing = document.getElementById('userDropdown');
  if(existing) { existing.remove(); return; }
  const name = u.user_metadata?.full_name || u.email || 'User';
  const email = u.email || '';
  const drop = document.createElement('div');
  drop.id = 'userDropdown';
  drop.innerHTML = `
    <div style="padding:.5rem .75rem .4rem;">
      <div style="font-size:.82rem;font-weight:700;color:var(--text);">${esc(name)}</div>
      <div style="font-size:.72rem;color:var(--text3);margin-top:.1rem;">${esc(email)}</div>
    </div>
    <div class="user-drop-divider"></div>
    <button class="user-drop-item danger" onclick="authSignOut();document.getElementById('userDropdown')?.remove();">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Sign out
    </button>
  `;
  document.body.appendChild(drop);
  const btn = document.getElementById('authHeaderBtn');
  const rect = btn.getBoundingClientRect();
  drop.style.top = (rect.bottom + 6) + 'px';
  drop.style.right = (window.innerWidth - rect.right) + 'px';
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if(!drop.contains(e.target) && e.target !== btn) {
        drop.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 10);
}

function updateAuthUI(user) {
  const btn   = document.getElementById('authHeaderBtn');
  const label = document.getElementById('authHeaderLabel');
  if(user) {
    const name = user.user_metadata?.full_name
      ? user.user_metadata.full_name.split(' ')[0]
      : (user.email ? user.email.split('@')[0] : 'Account');
    label.textContent = name;
    btn.onclick = showUserMenu;
    btn.querySelector('svg').style.display = 'none';
    // Priority: custom upload > Google > initials
    const googleUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    const avatarUrl = _customAvatarUrl || googleUrl;
    if(avatarUrl) {
      updateHeaderAvatar(avatarUrl);
    } else {
      // Initials fallback
      let el = document.getElementById('headerAvatar');
      if(!el) {
        el = document.createElement('span');
        el.id = 'headerAvatar';
        el.style.cssText = 'width:26px;height:26px;border-radius:50%;background:var(--accent);color:var(--accent-fg);font-size:.72rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
        btn.prepend(el);
      }
      el.textContent = name.charAt(0).toUpperCase();
      btn.style.padding = '.3rem .6rem';
    }
  } else {
    label.textContent = lang==='ar'?'تسجيل الدخول':'Sign In';
    btn.onclick = openAuthModal;
    btn.querySelector('svg').style.display = '';
    document.getElementById('headerAvatar')?.remove();
  }
}



// ── Load user data from Supabase ──────────────────────────────────
async function loadSupabaseData(user) {
  if(!_supa || !user) { renderAll(); renderCalBar(); renderWeightLog(); return; }
  try {
    // Clear local cache first — so previous user data doesn't bleed through
    const prevUserId = localStorage.getItem('zn_active_user');
    if(prevUserId && prevUserId !== user.id) {
      // Different user logged in — wipe local storage
      LS.keys('zn_day_').forEach(k => LS.del(k));
      LS.keys('zn_cfg_').forEach(k => LS.del(k));
      dayCache = {}; weightLog = []; savedMeals = []; weekPlan = {};
      waterLog = { cups:0, unit:'cup', goal:8, date:todayKey() };
      exLibrary = []; customTasks = []; customNotifs = [];
      injectPresets();
      calTarget = 2500; stepsTarget = 10000;
    }
    localStorage.setItem('zn_active_user', user.id);

    // 5-second timeout so Supabase never hangs the UI
    const fetchPromise = _supa.from('user_data').select('key, value').eq('user_id', user.id);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if(error || !data || data.length === 0) {
      // No cloud data yet — upload local data
      await uploadLocalToSupabase(user);
      showOnboarding();
    } else {
      // Merge cloud data into localStorage and memory
      data.forEach(row => {
        try {
          const parsed = JSON.parse(row.value);
          LS.set(row.key, parsed);
          if(row.key.startsWith('zn_day_')) {
            const date = row.key.replace('zn_day_','');
            if(/^\d{4}-\d{2}-\d{2}$/.test(date)) dayCache[date] = parsed;
          } else if(row.key.startsWith('zn_cfg_')) {
            const k = row.key.replace('zn_cfg_','');
            if(k==='lang')          lang=parsed;
            if(k==='theme')         theme=parsed;
            if(k==='calTarget')     calTarget=parsed;
            if(k==='stepsTarget')   stepsTarget=parsed;
            if(k==='customNotifs')  customNotifs=parsed;
            if(k==='customTasks')   customTasks=Array.isArray(parsed)?parsed:[];
            if(k==='weightLog')     weightLog=parsed;
            if(k==='savedMeals')    savedMeals=parsed;
            if(k==='weekPlan')      { weekPlan=parsed; DAY_KEYS.forEach(d=>{ if(!weekPlan[d]) weekPlan[d]={rest:false,focus:'',notes:'',exercises:[]}; }); }
            if(k==='waterLog')      waterLog=parsed;
            if(k==='hiddenSections'){ hiddenSections=parsed; }
            if(k==='exLibrary')     { exLibrary=parsed; injectPresets(); }
            if(k==='sectionsOrder') { const saved=parsed; if(Array.isArray(saved)) sectionsOrder=[...saved.filter(k=>SECTIONS[k]),...DEFAULT_SECTIONS_ORDER.filter(k=>!saved.includes(k))]; }
          }
        } catch(e){ console.warn('Failed to parse row', row.key, e); }
      });
    }
  } catch(e) {
    // Network error or timeout — just render with local data
    console.warn('Supabase load failed, using local data:', e.message);
  } finally {
    // Always render UI regardless of what happened
    applyTheme(); applyLang();
    applyHiddenSections();
    renderAll();
    renderCalBar();
    renderWeightLog();
    renderWorkoutTab();
  }
}


async function uploadLocalToSupabase(user) {
  if(!_supa || !user) return;
  const rows = [];
  LS.keys('zn_day_').forEach(k => {
    const v = LS.get(k, null);
    if(v) rows.push({ user_id: user.id, key: k, value: JSON.stringify(v), updated_at: new Date().toISOString() });
  });
  ['lang','theme','calTarget','stepsTarget','customNotifs','customTasks',
   'savedMeals','weekPlan','waterLog','hiddenSections','exLibrary','weightLog',
   'bodyHeight','bodyGender','bodyAge','bodyGoal','sectionsOrder'].forEach(cfgKey => {
    const lk = 'zn_cfg_' + cfgKey;
    const v = LS.get(lk, null);
    if(v !== null) rows.push({ user_id: user.id, key: lk, value: JSON.stringify(v), updated_at: new Date().toISOString() });
  });
  if(rows.length > 0) {
    await _supa.from('user_data').upsert(rows, { onConflict: 'user_id,key' });
    showToast('✅ بياناتك المحلية رُفعت إلى حسابك');
    showOnboarding();
  }
}

// ── Skeleton helpers ──────────────────────────────────────────────
const _skelMsg = document.getElementById('skeletonMsg');
let _skelHidden = false;
const hideSkeleton = () => {
  if(_skelHidden) return;
  _skelHidden = true;
  const ov = document.getElementById('skeletonOverlay');
  if(ov) { ov.classList.add('hidden'); setTimeout(()=>{ if(ov.parentNode) ov.remove(); }, 400); }
};
setTimeout(hideSkeleton, 2500);

// ── Bootstrap: load local data first ─────────────────────────────
loadLocalData();
if(typeof applyTheme === 'function') applyTheme();
if(typeof applyLang === 'function') applyLang();
if(typeof applyHiddenSections === 'function') applyHiddenSections();

// ── Init Supabase Auth ────────────────────────────────────────────
if(!_supa) {
  // No Supabase — render immediately with local data
  renderAll(); renderCalBar(); renderWeightLog();
  hideSkeleton();
}
if(_supa) {
  _supa.auth.getSession().then(({ data: { session } }) => {
    if(session?.user) {
      currentSupaUser = session.user;
      updateAuthUI(session.user);
      if(_skelMsg) _skelMsg.textContent = lang==='ar' ? 'جاري تحميل بياناتك…' : 'Loading your data…';
      loadSupabaseData(session.user).finally(hideSkeleton);
    } else {
      // Check for magic-link tokens (hash or PKCE code)
      const hasMagicLink = window.location.hash.includes('access_token')
                        || window.location.search.includes('code=');
      if(hasMagicLink) {
        if(_skelMsg) _skelMsg.textContent = lang==='ar' ? 'جاري تسجيل دخولك…' : 'Signing you in…';
        setTimeout(hideSkeleton, 5000); // fallback in case exchange fails
      } else {
        // Guest — render local data immediately
        renderAll(); renderCalBar(); renderWeightLog();
        hideSkeleton();
      }
    }
  }).catch(() => {
    // getSession failed (offline?) — render local data
    renderAll(); renderCalBar(); renderWeightLog();
    hideSkeleton();
  });

  _supa.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user || null;
    currentSupaUser = user;
    updateAuthUI(user);
    if(user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
      // Close auth modal if open (e.g. returned from magic link)
      const modal = document.getElementById('authModal');
      if(modal) modal.style.display = 'none';
      await loadSupabaseData(user);
      hideSkeleton();
      if(event === 'SIGNED_IN') {
        auditLog('sign_in', user.email || user.id);
        showToast('✅ ' + (lang==='ar'?'تم تسجيل الدخول بنجاح':'Signed in successfully!'));
      }
    }
    if(!user && event === 'SIGNED_OUT') {
      // Clear all in-memory data so next user sees clean state
      dayCache = {}; weightLog = []; savedMeals = []; weekPlan = {};
      waterLog = { cups:0, unit:'cup', goal:8, date:todayKey() };
      exLibrary = []; customTasks = []; customNotifs = [];
      injectPresets();
      hiddenSections = ['water']; sectionsOrder = [...DEFAULT_SECTIONS_ORDER];
      calTarget = 2500; stepsTarget = 10000;
      DAY_KEYS.forEach(d=>{ weekPlan[d]={rest:false,focus:'',notes:'',exercises:[]}; });
      renderAll(); renderCalBar(); renderWeightLog(); applyHiddenSections();
    }
  });
}
