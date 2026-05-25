// ── يومي — Food & Steps Module: calorie tracker, meal log, saved meals
// ── Food Log ──────────────────────────────────────────────────────
// Meal data shape: {id, name, kcal, type:'meal'|'product', protein?, carbs?, fat?, img?, time, detail?}

const renderMeals = () => {
  const day = getDay(viewingDate);
  const meals = day.meals || [];
  const list = $('mealList'), empty = $('emptyMeals');
  list.querySelectorAll('.food-card').forEach(r => r.remove());
  empty.style.display = meals.length ? 'none' : 'block';
  const clearBtn = $('clearMealsBtn');
  if(clearBtn) clearBtn.style.display = meals.length ? '' : 'none';

  meals.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'food-card';

    const imgHtml = m.img
      ? `<img class="food-thumb" src="${safeImgSrc(m.img)}" alt="${esc(m.name)}" loading="lazy"/>`
      : `<div class="food-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-linecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 .55.45 1 1 1h3m0 0v7"/></svg></div>`;

    const typeClass = m.type === 'product' ? 'food-type-product' : 'food-type-meal';
    const typeLabel = m.type === 'product' ? '⚖️' : '🍽️';
    const macroHtml = (m.protein || m.carbs || m.fat)
      ? `<div style="display:flex;gap:.3rem;margin-top:.25rem;">
          ${m.protein ? `<span style="font-size:.62rem;color:var(--blue);background:rgba(96,165,250,.1);padding:.05rem .35rem;border-radius:4px;">P ${m.protein}g</span>` : ''}
          ${m.carbs   ? `<span style="font-size:.62rem;color:var(--green);background:rgba(74,222,128,.1);padding:.05rem .35rem;border-radius:4px;">C ${m.carbs}g</span>` : ''}
          ${m.fat     ? `<span style="font-size:.62rem;color:var(--amber);background:rgba(251,191,36,.1);padding:.05rem .35rem;border-radius:4px;">F ${m.fat}g</span>` : ''}
        </div>` : '';
    const detailHtml = m.detail ? `<div style="font-size:.65rem;color:var(--text3);margin-top:.1rem;">${esc(m.detail)}</div>` : '';
    const timeHtml = m.time ? `<div style="font-size:.62rem;color:var(--text3);">${m.time}</div>` : '';

    card.innerHTML = `
      ${imgHtml}
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;">
          <span style="font-size:.85rem;font-weight:600;">${esc(m.name)}</span>
          <span class="food-type-badge ${typeClass}">${typeLabel}</span>
        </div>
        ${detailHtml}${macroHtml}${timeHtml}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.15rem;flex-shrink:0;">
        <span style="font-size:.95rem;font-weight:800;color:var(--text);">${m.kcal}</span>
        <span style="font-size:.62rem;color:var(--text3);">kcal</span>
        <button class="delbtn meal-del" data-i="${i}" style="margin-top:.1rem;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
    list.appendChild(card);
  });

  list.querySelectorAll('.meal-del').forEach(btn => {
    btn.addEventListener('click', () => {
      dayCache[viewingDate].meals.splice(+btn.dataset.i, 1);
      saveDay(viewingDate); renderMeals();
    });
  });
  updateCalStats(meals);
};

const updateCalStats = meals => {
  const total    = meals.reduce((s, m) => s + m.kcal, 0);
  const proteins = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const carbsT   = meals.reduce((s, m) => s + (m.carbs   || 0), 0);
  const fatsT    = meals.reduce((s, m) => s + (m.fat     || 0), 0);

  // Ring
  const circ = 2 * Math.PI * 44, pct = Math.min(total / calTarget, 1);
  $('calRing').style.strokeDashoffset = circ - circ * pct;
  $('calRing').style.stroke = total > calTarget ? 'var(--rose)' : 'var(--amber)';
  $('calTotal').textContent = total;
  $('calTotalBig').innerHTML = `${total} <span style="font-size:.85rem;color:var(--text3);font-weight:400;">kcal</span>`;
  const rem = calTarget - total;
  $('calRemaining').textContent = rem >= 0
    ? `${rem} kcal ${t('remaining')}`
    : `${Math.abs(rem)} kcal ${t('over')}`;
  $('calRemaining').style.color = rem < 0 ? 'var(--rose)' : 'var(--text2)';

  // Macro mini chips
  const mb = $('macroBar');
  if(mb){
    if(proteins || carbsT || fatsT){
      mb.style.display = 'grid';
      mb.innerHTML = `
        <div class="macro-chip"><span style="font-size:.95rem;font-weight:800;color:var(--text);">${proteins}g</span><span style="font-size:.6rem;color:var(--text3);margin-top:.15rem;">Protein</span></div>
        <div class="macro-chip"><span style="font-size:.95rem;font-weight:800;color:var(--text);">${carbsT}g</span><span style="font-size:.6rem;color:var(--text3);margin-top:.15rem;">Carbs</span></div>
        <div class="macro-chip"><span style="font-size:.95rem;font-weight:800;color:var(--text);">${fatsT}g</span><span style="font-size:.6rem;color:var(--text3);margin-top:.15rem;">Fat</span></div>`;
    } else {
      mb.style.display = 'none';
    }
  }
};

$('calTargetInput').addEventListener('change', e => {
  const v = sanitizeInt(e.target.value, 500, 9999);
  if(v){ calTarget = v; saveCfg('calTarget', calTarget); renderMeals();
    showToast(`Target: ${v} kcal`);
  }
});

$('clearMealsBtn').addEventListener('click', () => {
  if(!dayCache[viewingDate] || !dayCache[viewingDate].meals.length) return;
  showConfirm(
    lang==='ar'?'مسح جميع الوجبات؟':'Clear all meals?',
    lang==='ar'?'لا يمكن التراجع عن هذا.':'This cannot be undone.',
    lang==='ar'?'مسح':'Clear',
    t('confirmNo'),
    () => {
      auditLog('clear_meals', viewingDate);
      dayCache[viewingDate].meals = [];
      saveDay(viewingDate); renderMeals();
      showToast(lang==='ar'?'تم مسح الوجبات ✅':'Meals cleared ✅');
    }
  );
});

// ── Food Modal ────────────────────────────────────────────────────
let fmType    = 'meal';  // 'meal' | 'product' | 'saved'
let fmImgData = null;    // base64 data URL
let savedMeals = [];     // persistent library — loaded from localStorage

// Load saved meals library
const loadSavedMeals = () => {
  savedMeals = loadCfg('savedMeals', []);
};
const persistSavedMeals = () => saveCfg('savedMeals', savedMeals);

// ── Saved Meals library render ────────────────────────────────────
const renderSavedList = (filter='') => {
  const list  = $('smList');
  const empty = $('smEmpty');
  list.querySelectorAll('.saved-meal-row').forEach(r => r.remove());

  const lc = filter.toLowerCase();
  const filtered = savedMeals.filter(m => !lc || m.name.toLowerCase().includes(lc));

  if(!filtered.length){
    empty.style.display = 'block';
    empty.innerHTML = savedMeals.length
      ? `No matches for "<strong>${esc(filter)}</strong>"`
      : `No saved meals yet.<br><span style="font-size:.75rem;">Log a meal to save it here.</span>`;
    return;
  }
  empty.style.display = 'none';

  filtered.forEach(sm => {
    const row = document.createElement('div');
    row.className = 'saved-meal-row';

    const thumbHtml = sm.img
      ? `<img class="sm-thumb" src="${safeImgSrc(sm.img)}" alt="${esc(sm.name)}"/>`
      : `<div class="sm-thumb-ph"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.8" stroke-linecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 .55.45 1 1 1h3m0 0v7"/></svg></div>`;

    const typeLabel = sm.type === 'product' ? '⚖️' : '🍽️';
    const macroTxt  = [sm.protein?`P${sm.protein}g`:'', sm.carbs?`C${sm.carbs}g`:'', sm.fat?`F${sm.fat}g`:''].filter(Boolean).join(' · ');
    const subDetail = sm.type === 'product'
      ? `${sm.baseKcal} kcal per ${sm.baseG}g`
      : (macroTxt || '');

    row.innerHTML = `
      ${thumbHtml}
      <div style="flex:1;min-width:0;">
        <div style="font-size:.84rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(sm.name)}</div>
        <div style="font-size:.68rem;color:var(--text3);margin-top:.1rem;">${typeLabel} ${subDetail}</div>
      </div>
      <span style="font-size:.88rem;font-weight:800;color:var(--text);flex-shrink:0;margin:0 .3rem;">${sm.type==='product'?sm.baseKcal+'↗':sm.kcal} kcal</span>
      <button class="sm-add-btn" title="Add to today" data-sid="${esc(sm.sid)}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button class="sm-del-btn" title="Remove from library" data-sid="${esc(sm.sid)}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;

    // Quick-add: for product type, ask for amount; for meal, add directly
    row.querySelector('.sm-add-btn').addEventListener('click', e => {
      e.stopPropagation();
      const sm2 = savedMeals.find(x => x.sid === sm.sid);
      if(!sm2) return;
      quickAddSaved(sm2);
    });

    row.querySelector('.sm-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      showConfirm(
        `Remove "${sm.name}" from library?`, '',
        'Remove', 'Cancel',
        () => {
          savedMeals = savedMeals.filter(x => x.sid !== sm.sid);
          persistSavedMeals();
          renderSavedList($('smSearch').value);
        }
      );
    });

    list.appendChild(row);
  });
};

// Quick-add a saved meal to today ─────────────────────────────────
const quickAddSaved = (sm) => {
  if(sm.type === 'product'){
    // For "by weight" items, need amount — show a small prompt overlay
    showAmountPrompt(sm);
    return;
  }
  const now = new Date();
  const timeStr = now.toLocaleTimeString(lang==='ar'?'ar-SA':'en-US', {hour:'2-digit', minute:'2-digit'});
  const entry = { ...sm, id:'m'+Date.now(), time:timeStr };
  delete entry.sid; // don't store library id in day entry
  confirmMealOnPastDay(() => {
    ensureDay(viewingDate);
    dayCache[viewingDate].meals.push(entry);
    saveDay(viewingDate);
    renderMeals();
    closeFoodModal();
    showToast(`✅ ${entry.name} · ${entry.kcal} kcal`);
  });
};

// Amount prompt for product-type quick-add ─────────────────────────
let _apResolve = null;
const showAmountPrompt = (sm) => {
  // Build a small inline overlay inside the modal
  const existing = $('fmAmountPrompt');
  if(existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'fmAmountPrompt';
  overlay.style.cssText = 'position:absolute;inset:0;background:rgba(13,18,32,.92);backdrop-filter:blur(4px);z-index:10;display:flex;align-items:center;justify-content:center;border-radius:20px;';
  overlay.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:1.3rem;width:80%;max-width:300px;box-shadow:0 12px 40px rgba(0,0,0,.5);">
      <p style="font-size:.9rem;font-weight:700;margin-bottom:.3rem;">${esc(sm.name)}</p>
      <p style="font-size:.75rem;color:var(--text3);margin-bottom:.85rem;">${sm.baseKcal} kcal per ${sm.baseG}g</p>
      <label class="fm-lbl">Amount (g)</label>
      <input class="inp" id="fmApAmt" type="number" min="1" max="9999" placeholder="e.g. 150" style="margin-bottom:.5rem;"/>
      <div id="fmApCalcPreview" style="font-size:.8rem;color:var(--amber);font-weight:700;min-height:1.2rem;margin-bottom:.7rem;"></div>
      <div style="display:flex;gap:.5rem;">
        <button class="btn btn-ghost" id="fmApCancel" style="flex:1;justify-content:center;">Cancel</button>
        <button class="btn btn-cyan"  id="fmApConfirm" style="flex:1;justify-content:center;">Add</button>
      </div>
    </div>`;

  $('foodModal').querySelector('div').style.position = 'relative';
  $('foodModal').querySelector('div').appendChild(overlay);
  setTimeout(() => $('fmApAmt').focus(), 80);

  const inp = $('fmApAmt');
  inp.addEventListener('input', () => {
    const amt = parseFloat(inp.value);
    const calc = (amt > 0 && sm.baseG > 0) ? Math.round((sm.baseKcal / sm.baseG) * amt) : null;
    $('fmApCalcPreview').textContent = calc ? `= ${calc} kcal` : '';
  });

  $('fmApCancel').addEventListener('click', () => overlay.remove());
  $('fmApConfirm').addEventListener('click', () => {
    const amount = sanitizeInt(inp.value, 1, 9999);
    if(!amount){ showToast('Enter amount'); return; }
    const kcal = Math.round((sm.baseKcal / sm.baseG) * amount);
    const now = new Date();
    const timeStr = now.toLocaleTimeString(lang==='ar'?'ar-SA':'en-US', {hour:'2-digit', minute:'2-digit'});
    const entry = {
      id:'m'+Date.now(), name:sm.name, kcal, type:'product',
      protein:sm.protein||0, carbs:sm.carbs||0, fat:sm.fat||0,
      img:sm.img||null, time:timeStr,
      detail:`${amount}g · ${sm.baseKcal} kcal per ${sm.baseG}g`
    };
    confirmMealOnPastDay(() => {
      ensureDay(viewingDate);
      dayCache[viewingDate].meals.push(entry);
      saveDay(viewingDate);
      renderMeals();
      overlay.remove();
      closeFoodModal();
      showToast(`✅ ${entry.name} · ${entry.kcal} kcal`);
    });
  });
  inp.addEventListener('keydown', e => { if(e.key==='Enter') $('fmApConfirm').click(); });
};

// ── Modal open / close ────────────────────────────────────────────
const openFoodModal = (preTab='meal') => {
  try {
    fmImgData = null;
    ['fmMealName','fmMealKcal','fmMealProtein','fmMealCarbs','fmMealFat',
     'fmProdName','fmProdBaseKcal','fmProdBaseG','fmProdAmount','fmProdProtein','fmProdCarbs','fmProdFat','smSearch']
      .forEach(id => { const el=$(id); if(el) el.value=''; });
    const prev = $('fmImgPreviewWrap');
    if(prev) prev.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    const hint = $('fmImgHint'); if(hint) hint.textContent = 'Click or drag an image';
    const calc = $('fmCalcPreview'); if(calc) calc.style.display = 'none';
    const saveRow = $('fmSaveRow'); if(saveRow) saveRow.style.display = preTab === 'saved' ? 'none' : 'flex';
    setFmType(preTab);
    if(preTab === 'saved') renderSavedList();
    $('foodModal').style.display = 'flex';
    _showPastDayBanner();
    setTimeout(() => {
      if(preTab === 'meal'   && $('fmMealName'))  $('fmMealName').focus();
      if(preTab === 'product'&& $('fmProdName'))  $('fmProdName').focus();
      if(preTab === 'saved'  && $('smSearch'))    $('smSearch').focus();
    }, 100);
  } catch(err) {
    // Fallback: force show modal even if something fails
    const m = $('foodModal');
    if(m) m.style.display = 'flex';
    console.warn('openFoodModal error:', err);
  }
};

const closeFoodModal = () => {
  $('foodModal').style.display = 'none';
  const ap = $('fmAmountPrompt'); if(ap) ap.remove();
};

const setFmType = type => {
  fmType = type;
  $('fmPanelMeal').style.display    = type==='meal'    ? 'block' : 'none';
  $('fmPanelProduct').style.display = type==='product' ? 'block' : 'none';
  $('fmPanelSaved').style.display   = type==='saved'   ? 'block' : 'none';
  $('fmSaveRow').style.display      = type==='saved'   ? 'none'  : 'flex';
  $('fmSubmitBtn').style.display    = type==='saved'   ? 'none'  : '';
  qsa('.fm-3tab').forEach(btn => btn.classList.toggle('active', btn.id === `fmTab${type.charAt(0).toUpperCase()+type.slice(1)}`));
};

// Use capture phase so this fires BEFORE any other listener
document.getElementById('openFoodModalBtn').addEventListener('click', e => {
  e.stopPropagation();
  e.preventDefault();
  openFoodModal('meal');
}, true); // true = capture phase
$('closeFoodModal').addEventListener('click', closeFoodModal);
$('foodModal').addEventListener('click', e => { if(e.target === $('foodModal')) closeFoodModal(); });
$('fmTabMeal').addEventListener('click',    () => setFmType('meal'));
$('fmTabProduct').addEventListener('click', () => setFmType('product'));
$('fmTabSaved').addEventListener('click',   () => { setFmType('saved'); renderSavedList(); });
$('smSearch').addEventListener('input', () => renderSavedList($('smSearch').value));

// Image upload / preview
$('fmImgInput').addEventListener('change', e => {
  const file = e.target.files[0]; if(!file) return;
  const ALLOWED_IMG_TYPES = ['image/jpeg','image/png','image/webp','image/gif'];
  if(!ALLOWED_IMG_TYPES.includes(file.type)){
    showToast(lang==='ar'?'يُسمح بـ JPG، PNG، WEBP، GIF فقط':'Only JPG, PNG, WEBP, GIF allowed');
    e.target.value=''; return;
  }
  if(file.size > 5*1024*1024){ showToast(lang==='ar'?'الصورة كبيرة جداً (الحد 5 ميغا)':'Image too large (max 5 MB)'); e.target.value=''; return; }
  // Auto-compress using canvas — target ≤ 800px, JPEG 85%
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
      fmImgData = canvas.toDataURL('image/jpeg', 0.85);
      $('fmImgPreviewWrap').innerHTML = `<img src="${fmImgData}" style="width:52px;height:52px;object-fit:cover;border-radius:9px;"/>`;
      $('fmImgHint').textContent = file.name.slice(0, 28);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Live calorie calculation for product mode
const calcProduct = () => {
  const base = parseFloat($('fmProdBaseKcal').value);
  const per  = parseFloat($('fmProdBaseG').value);
  const amt  = parseFloat($('fmProdAmount').value);
  if(base > 0 && per > 0 && amt > 0){
    const calc = Math.round((base / per) * amt);
    $('fmCalcValue').textContent = calc;
    $('fmCalcPreview').style.display = 'block';
    return calc;
  }
  $('fmCalcPreview').style.display = 'none';
  return null;
};
['fmProdBaseKcal','fmProdBaseG','fmProdAmount'].forEach(id => $(id).addEventListener('input', calcProduct));

// ── Past-day meal warning (inline banner inside modal) ────────────
const _showPastDayBanner = () => {
  if(viewingDate === todayKey()) { _hidePastDayBanner(); return; }
  let banner = document.getElementById('pastDayMealBanner');
  if(!banner) {
    banner = document.createElement('div');
    banner.id = 'pastDayMealBanner';
    banner.style.cssText = 'background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.35);border-radius:10px;padding:.6rem .85rem;margin-bottom:.75rem;font-size:.8rem;color:var(--amber);font-weight:600;display:flex;align-items:center;gap:.5rem;';
    const submitBtn = $('fmSubmitBtn');
    submitBtn.parentNode.insertBefore(banner, submitBtn);
  }
  const dayLabel = new Date(viewingDate+'T12:00:00').toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{weekday:'long',day:'numeric',month:'long'});
  banner.textContent = (lang==='ar' ? `⚠️ أنت تسجل في يوم ${dayLabel}` : `⚠️ Logging to ${dayLabel} (past day)`);
  banner.style.display = 'flex';
};
const _hidePastDayBanner = () => {
  const b = document.getElementById('pastDayMealBanner');
  if(b) b.style.display = 'none';
};
const confirmMealOnPastDay = (onConfirm) => { onConfirm(); };

// Submit
$('fmSubmitBtn').addEventListener('click', () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString(lang==='ar'?'ar-SA':'en-US', {hour:'2-digit', minute:'2-digit'});
  let entry = null;
  let libEntry = null; // what gets saved to library

  if(fmType === 'meal'){
    const name    = sanitizeText($('fmMealName').value, 60);
    const kcal    = sanitizeInt($('fmMealKcal').value, 1, 9999);
    if(!name){ showToast('Enter meal name'); return; }
    if(!kcal){ showToast('Enter calories');  return; }
    const protein = sanitizeInt($('fmMealProtein').value, 0, 999) || 0;
    const carbs   = sanitizeInt($('fmMealCarbs').value,   0, 999) || 0;
    const fat     = sanitizeInt($('fmMealFat').value,     0, 999) || 0;
    entry    = { id:'m'+Date.now(), name, kcal, type:'meal', protein, carbs, fat, time:timeStr };
    libEntry = { sid:'s'+Date.now(), name, kcal, type:'meal', protein, carbs, fat };

  } else { // product
    const name     = sanitizeText($('fmProdName').value, 60);
    const baseKcal = sanitizeInt($('fmProdBaseKcal').value, 1, 9999);
    const baseG    = sanitizeInt($('fmProdBaseG').value, 1, 9999);
    const amount   = sanitizeInt($('fmProdAmount').value, 1, 9999);
    if(!name)    { showToast('Enter product name');  return; }
    if(!baseKcal){ showToast('Enter base calories'); return; }
    if(!baseG)   { showToast('Enter base grams');    return; }
    if(!amount)  { showToast('Enter amount');         return; }
    const kcal    = Math.round((baseKcal / baseG) * amount);
    const protein = sanitizeInt($('fmProdProtein').value, 0, 999) || 0;
    const carbs   = sanitizeInt($('fmProdCarbs').value,   0, 999) || 0;
    const fat     = sanitizeInt($('fmProdFat').value,     0, 999) || 0;
    const detail  = `${amount}g · ${baseKcal} kcal per ${baseG}g`;
    entry    = { id:'m'+Date.now(), name, kcal, type:'product', protein, carbs, fat, time:timeStr, detail };
    libEntry = { sid:'s'+Date.now(), name, type:'product', baseKcal, baseG, protein, carbs, fat };
  }

  if(fmImgData){
    entry.img    = fmImgData;
    if(libEntry) libEntry.img = fmImgData;
  }

  // Save to library if checkbox is ticked and not already saved
  if($('fmSaveChk').checked && libEntry){
    const alreadySaved = savedMeals.some(m => m.name.toLowerCase() === libEntry.name.toLowerCase() && m.type === libEntry.type);
    if(!alreadySaved){
      savedMeals.push(libEntry);
      persistSavedMeals();
    }
  }

  const doSave = () => {
    const rl2 = checkRL('add_meal','data'); if(!rl2.ok){ showToast(`Wait ${rl2.wait}s`); return; }
    ensureDay(viewingDate);
    // Guard: max 100 meals per day to prevent localStorage overflow
    if((dayCache[viewingDate].meals||[]).length >= 100){ showToast(lang==='ar'?'وصلت الحد الأقصى للوجبات اليوم':'Max 100 meals per day'); return; }
    dayCache[viewingDate].meals.push(entry);
    saveDay(viewingDate);
    renderMeals();
    closeFoodModal();
    showToast(`✅ ${entry.name} · ${entry.kcal} kcal`);
  };

  confirmMealOnPastDay(doSave);
});

// ── Notes with Color ──────────────────────────────────────────────
const NOTE_IDS = {
  workout:{d:'note-preview-dw',m:'note-preview-mw'},
  general:{d:'note-preview-dg',m:'note-preview-mg'},
  food:   {d:'note-preview-df',m:'note-preview-mf'}
};

const sanitizeNoteHtml = (html) => {
  if(typeof html !== 'string') return '';
  // Strip script tags and event handlers, allow only safe formatting
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');
};

const loadNotes = () => {
  const day=getDay(viewingDate);
  const saved=day.notes||{workout:'',general:'',food:''};
  Object.entries(NOTE_IDS).forEach(([cat,{d,m}])=>{
    const dEl=$(d), mEl=$(m);
    if(dEl) dEl.innerHTML = sanitizeNoteHtml(saved[cat]||'');
    if(mEl) mEl.innerHTML = sanitizeNoteHtml(saved[cat]||'');
  });
};

const collectNotes = () => {
  const out={};
  Object.entries(NOTE_IDS).forEach(([cat,{d,m}])=>{
    const el=$(d)||$(m); out[cat]=el?el.innerHTML:'';
  });
  return out;
};

const saveTodayNotes = (loud=true) => {
  ensureDay(viewingDate);
  dayCache[viewingDate].notes = collectNotes();
  saveDay(viewingDate);
  if(loud) showToast(lang==='ar'?'تم الحفظ ✅':'Notes saved ✅');
};

// Sync desktop ↔ mobile panels
Object.entries(NOTE_IDS).forEach(([cat,{d,m}])=>{
  const dEl=$(d), mEl=$(m);
  if(dEl) dEl.addEventListener('input',()=>{ if(mEl)mEl.innerHTML=sanitizeNoteHtml(dEl.innerHTML); saveTodayNotes(false); });
  if(mEl) mEl.addEventListener('input',()=>{ if(dEl)dEl.innerHTML=sanitizeNoteHtml(mEl.innerHTML); saveTodayNotes(false); });
});

$('saveNotesDesktop').addEventListener('click',()=>saveTodayNotes(true));
$('saveNotesMobile').addEventListener('click',()=>saveTodayNotes(true));

// Note category pills
const switchNoteCat = cat => {
  activeNoteCat=cat;
  ['desktop','mobile'].forEach(side=>{
    const prefix=side==='desktop'?'d':'m';
    qsa(`.${prefix}note-panel`).forEach(p=>p.style.display=p.id===`${prefix}panel-${cat}`?'block':'none');
    const pillsId=side==='desktop'?'pillsDesktop':'pillsMobile';
    $(pillsId).querySelectorAll('.npill').forEach(btn=>{
      const c=btn.dataset.cat; btn.className=`npill${c===cat?' p-'+c:''}`;
    });
  });
};
$('pillsDesktop').querySelectorAll('.npill').forEach(btn=>btn.addEventListener('click',()=>switchNoteCat(btn.dataset.cat)));
$('pillsMobile').querySelectorAll('.npill').forEach(btn=>btn.addEventListener('click',()=>switchNoteCat(btn.dataset.cat)));

// Color toolbar
// savedRange: preserve selection when user clicks a swatch (mousedown fires before blur)
let savedRange = null;

const saveSelection = () => {
  const sel = window.getSelection();
  if(sel && sel.rangeCount > 0) savedRange = sel.getRangeAt(0).cloneRange();
};

const restoreSelection = () => {
  if(!savedRange) return false;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(savedRange);
  return true;
};

const updateSwatchUI = color => {
  activeNoteColor = color;
  ['noteToolbarD','noteToolbarM'].forEach(tid=>{
    const el=$(tid); if(!el) return;
    el.querySelectorAll('.color-swatch').forEach(sw=>sw.classList.toggle('active-swatch', sw.dataset.color===color));
  });
};

// Save selection whenever user interacts with a note editor
Object.values(NOTE_IDS).forEach(({d,m})=>{
  [d,m].forEach(id=>{ const el=$(id); if(!el) return;
    el.addEventListener('mouseup', saveSelection);
    el.addEventListener('keyup',   saveSelection);
  });
});

['noteToolbarD','noteToolbarM'].forEach(tid=>{
  const toolbar=$(tid); if(!toolbar) return;
  toolbar.querySelectorAll('.color-swatch').forEach(sw=>{
    // mousedown: prevent blur so selection isn't lost, then save it
    sw.addEventListener('mousedown', e=>{
      e.preventDefault(); // keeps focus in the editor
      saveSelection();     // capture selection right now (before any focus change)
    });

    sw.addEventListener('click', ()=>{
      const color = sw.dataset.color;
      updateSwatchUI(color);

      const ids = NOTE_IDS[activeNoteCat]; if(!ids) return;
      const activeEl = $(ids.d) || $(ids.m); if(!activeEl) return;

      // Restore the saved selection and apply color
      activeEl.focus();
      if(restoreSelection()){
        const sel = window.getSelection();
        if(sel && !sel.isCollapsed){
          // Text is selected — color it
          if(color){
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('foreColor', false, color);
          } else {
            document.execCommand('removeFormat', false, null);
          }
          saveSelection(); // update savedRange after modification
          saveTodayNotes(false);
          return;
        }
      }
      // Nothing selected — set color for next typed characters
      // We insert a zero-width span so execCommand has a target
      if(color){
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, color);
      }
    });
  });
});
