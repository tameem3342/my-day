// ── يومي — Workout Planner: exercises, weekly grid, AI suggestions, water tracker
// ── Workout Planner ──────────────────────────────────────────────
const DAYS_EN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAYS_AR = ['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'];
const DAY_KEYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

let weekPlan   = {};
let exLibrary  = [];   // [{id, name, muscle, defaultSets, defaultReps, preset?}]
let weightLog  = [];   // [{id, val, unit, date, dateKey}]
let wpModalDay = null;

// ── Preset Exercise Library ───────────────────────────────────────
const loadWeekPlan  = () => {
  weekPlan  = loadCfg('weekPlan', {});
  DAY_KEYS.forEach(d => { if(!weekPlan[d]) weekPlan[d] = {rest:false,focus:'',notes:'',exercises:[]}; });
  exLibrary = loadCfg('exLibrary', []);
  weightLog = loadCfg('weightLog', []);
  injectPresets();
};
const saveWeekPlan  = () => {
  saveCfg('weekPlan', weekPlan);
  const dk = todayDayKey();
  const todayExs = weekPlan[dk]?.exercises;
  if(todayExs?.length) {
    saveCfg('workoutHistory_' + todayKey(), { date: todayKey(), exercises: todayExs });
  }
};
const saveExLib     = () => saveCfg('exLibrary', exLibrary);
const saveWeightLog = () => saveCfg('weightLog', weightLog);

const todayDayKey = () => {
  const d = new Date();
  return DAY_KEYS[d.getDay()===0 ? 6 : d.getDay()-1];
};

// ── Weekly Grid ───────────────────────────────────────────────────
const renderWpGrid = () => {
  const grid = $('wpGrid'); if(!grid) return;
  grid.innerHTML = '';
  const tdk = todayDayKey();
  DAY_KEYS.forEach((dk, i) => {
    const day = weekPlan[dk] || {};
    const isToday = dk === tdk;
    const label = lang==='ar' ? DAYS_AR[i] : dk;
    const col = document.createElement('div');
    col.className = 'wp-day-col';
    const hdr = document.createElement('div');
    hdr.className = 'wp-day-header';
    hdr.style.color = isToday ? 'var(--text)' : '';
    hdr.style.fontWeight = isToday ? '800' : '';
    hdr.textContent = label;
    col.appendChild(hdr);
    const cell = document.createElement('div');
    const cls = ['wp-day-cell'];
    if(day.rest) cls.push('rest-day');
    else if(day.exercises?.length) cls.push('has-workout');
    if(isToday) cls.push('today-col');
    cell.className = cls.join(' ');
    if(day.rest){
      cell.innerHTML = `<span class="wp-rest-label">😴</span>`;
    } else if(day.focus || day.exercises?.length){
      if(day.focus) cell.innerHTML += `<span class="wp-ex-chip" style="font-weight:700;">${esc(day.focus)}</span>`;
      (day.exercises||[]).slice(0,2).forEach(ex => {
        cell.innerHTML += `<span class="wp-ex-chip">${esc(ex.name)}</span>`;
      });
      if((day.exercises||[]).length > 2)
        cell.innerHTML += `<span style="font-size:.52rem;color:var(--text3);">+${day.exercises.length-2}</span>`;
    } else {
      cell.innerHTML = `<span style="font-size:.55rem;color:var(--text3);text-align:center;margin:auto;">—</span>`;
    }
    cell.addEventListener('click', () => openWpModal(dk, i));
    col.appendChild(cell);
    grid.appendChild(col);
  });
};

// ── Exercise Log (today) ──────────────────────────────────────────
const renderWpExList = () => {
  const dk = todayDayKey();
  const day = weekPlan[dk] || {exercises:[]};
  const list=$('wpExList'), empty=$('wpExEmpty'), summary=$('wpSummary');
  if(!list) return;
  list.innerHTML = '';
  const exs = day.exercises || [];
  empty.style.display = exs.length ? 'none' : 'block';
  summary.style.display = exs.length ? 'block' : 'none';

  exs.forEach((ex, i) => {
    if(!ex.setLogs || !ex.setLogs.length) {
      ex.setLogs = Array.from({length: ex.sets||1}, () => ({reps: ex.reps||10, weight: ex.weight||null}));
    }
    // Only auto-add trailing empty set when wpAddRow is closed
    const addRowOpen = $('wpAddRow') && $('wpAddRow').style.display !== 'none';
    if(!ex.finished && !addRowOpen) {
      const last = ex.setLogs[ex.setLogs.length-1];
      const lastFilled = last && (last.reps || last.weight != null);
      if(lastFilled) ex.setLogs.push({reps:'', weight:null});
    }
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.6rem .7rem;margin-bottom:.35rem;';
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.45rem;">
        <div style="display:flex;align-items:center;gap:.4rem;">
          <span style="font-size:.85rem;font-weight:700;color:var(--text);">${esc(ex.name)}</span>
          ${ex.finished ? `<span style="font-size:.68rem;font-weight:700;color:var(--success);background:color-mix(in srgb,var(--success) 15%,transparent);border-radius:4px;padding:.1rem .35rem;">${lang==='ar'?'✓ تم':'✓ done'}</span>` : ''}
        </div>
        <div style="display:flex;gap:.25rem;align-items:center;">
          ${!ex.finished ? `<button class="wp-finish-ex btn btn-ghost" data-idx="${i}" style="font-size:.7rem;padding:.2rem .5rem;color:var(--success);border-color:var(--success);">${lang==='ar'?'تم ✓':'Done ✓'}</button>` : `<button class="wp-undo-ex btn btn-ghost" data-idx="${i}" style="font-size:.7rem;padding:.2rem .5rem;">${lang==='ar'?'تراجع':'Undo'}</button>`}
          <button class="delbtn wp-del-ex" data-idx="${i}" style="width:24px;height:24px;">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`;
    ex.setLogs.forEach((sl, si) => {
      const isLast = si === ex.setLogs.length - 1;
      const row = document.createElement('div');
      row.style.cssText = `display:grid;grid-template-columns:22px 1fr 1fr ${ex.finished?'0px':'26px'};gap:.3rem;align-items:center;margin-bottom:.22rem;opacity:${ex.finished?'.7':'1'};`;
      row.innerHTML = `
        <span style="font-size:.7rem;font-weight:700;color:${isLast&&!ex.finished?'var(--accent)':'var(--text3)'};text-align:center;">${si+1}</span>
        <input type="number" min="1" max="999" value="${sl.reps||''}" placeholder="${lang==='ar'?'تكرار':'Reps'}"
          class="inp sl-reps" data-ex="${i}" data-si="${si}"
          ${ex.finished?'readonly':''}
          style="font-size:.82rem;text-align:center;padding:.38rem .2rem;width:100%;${ex.finished?'opacity:.6;pointer-events:none;':''}"/>
        <div style="position:relative;">
          <input type="number" min="0" max="999" step="0.5" value="${sl.weight!=null?sl.weight:''}" placeholder="kg"
            class="inp sl-kg" data-ex="${i}" data-si="${si}"
            ${ex.finished?'readonly':''}
            style="font-size:.82rem;text-align:center;padding:.38rem .2rem;padding-right:1.3rem;width:100%;${ex.finished?'opacity:.6;pointer-events:none;':''}"/>
          <span style="position:absolute;right:.28rem;top:50%;transform:translateY(-50%);font-size:.58rem;color:var(--text3);pointer-events:none;">kg</span>
        </div>
        ${!ex.finished ? `<button class="sl-del-btn delbtn" data-ex="${i}" data-si="${si}" style="width:24px;height:24px;border-radius:5px;">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>` : '<span></span>'}`;
      card.appendChild(row);
    });
    list.appendChild(card);
  });

  list.querySelectorAll('.sl-reps').forEach(inp => {
    inp.addEventListener('input', () => {
      const ex = weekPlan[todayDayKey()].exercises[+inp.dataset.ex];
      if(ex?.setLogs?.[+inp.dataset.si] !== undefined) { ex.setLogs[+inp.dataset.si].reps = parseInt(inp.value)||''; saveWeekPlan(); }
    });
    inp.addEventListener('keydown', e => {
      if(e.key === 'Enter') { const kg = list.querySelector(`.sl-kg[data-ex="${inp.dataset.ex}"][data-si="${inp.dataset.si}"]`); if(kg) { kg.focus(); kg.select(); } }
    });
  });

  list.querySelectorAll('.sl-kg').forEach(inp => {
    inp.addEventListener('input', () => {
      const ei = +inp.dataset.ex, si = +inp.dataset.si;
      const ex = weekPlan[todayDayKey()].exercises[ei];
      if(!ex?.setLogs?.[si] !== undefined) return;
      const v = parseFloat(inp.value);
      ex.setLogs[si].weight = isNaN(v)||v<0 ? null : Math.round(v*10)/10;
      saveWeekPlan();
      if(si === ex.setLogs.length-1 && ex.setLogs[si].reps && ex.setLogs[si].weight != null) {
        ex.setLogs.push({reps:'', weight:null}); ex.sets = ex.setLogs.length;
        saveWeekPlan(); renderWpExList();
        setTimeout(() => { const nr = list.querySelector(`.sl-reps[data-ex="${ei}"][data-si="${si+1}"]`); if(nr) nr.focus(); }, 40);
      }
    });
    inp.addEventListener('keydown', e => {
      if(e.key !== 'Enter') return;
      const ei = +inp.dataset.ex, si = +inp.dataset.si;
      const ex = weekPlan[todayDayKey()].exercises[ei];
      if(!ex) return;
      const v = parseFloat(inp.value);
      ex.setLogs[si].weight = isNaN(v)||v<0 ? null : Math.round(v*10)/10;
      saveWeekPlan();
      const nextReps = list.querySelector(`.sl-reps[data-ex="${ei}"][data-si="${si+1}"]`);
      if(nextReps) { nextReps.focus(); nextReps.select(); }
    });
  });

  list.querySelectorAll('.sl-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ex = weekPlan[todayDayKey()].exercises[+btn.dataset.ex];
      if(ex?.setLogs?.length > 1) { ex.setLogs.splice(+btn.dataset.si, 1); ex.sets = ex.setLogs.length; saveWeekPlan(); renderWpExList(); }
    });
  });

  list.querySelectorAll('.wp-finish-ex').forEach(btn => {
    btn.addEventListener('click', () => {
      const ex = weekPlan[todayDayKey()].exercises[+btn.dataset.idx];
      if(!ex) return;
      while(ex.setLogs.length > 1) { const last = ex.setLogs[ex.setLogs.length-1]; if(!last.reps && last.weight == null) ex.setLogs.pop(); else break; }
      ex.sets = ex.setLogs.length; ex.finished = true;
      saveWeekPlan(); renderWpExList();
    });
  });

  list.querySelectorAll('.wp-undo-ex').forEach(btn => {
    btn.addEventListener('click', () => {
      const ex = weekPlan[todayDayKey()].exercises[+btn.dataset.idx];
      if(ex) { ex.finished = false; saveWeekPlan(); renderWpExList(); }
    });
  });

  list.querySelectorAll('.wp-del-ex').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      weekPlan[todayDayKey()].exercises.splice(+btn.dataset.idx,1);
      saveWeekPlan(); renderWpExList(); renderWpGrid();
    });
  });

  if(exs.length){
    const totalSets = exs.reduce((s,e)=>s+(e.setLogs?.filter(sl=>sl.reps||sl.weight!=null).length||0),0);
    summary.textContent = lang==='ar' ? `${exs.length} تمرين · ${totalSets} جلسة` : `${exs.length} exercise${exs.length!==1?'s':''} · ${totalSets} sets`;
  }
  const titleEl=$('wpLogTitle');
  if(titleEl){
    titleEl.textContent = dk===todayDayKey() ? (lang==='ar' ? 'تمارين اليوم' : "Today's Exercises") : `${lang==='ar'?DAYS_AR[DAY_KEYS.indexOf(dk)]:dk}'s Exercises`;
  }
};

const renderWorkoutTab = () => {
  try { renderWpGrid(); } catch(e) {}
  try { renderWpExList(); } catch(e) {}
  try { renderWeightLog(); } catch(e) {}
  try { renderExLib(); } catch(e) {}
  try { renderWater(); } catch(e) {}
  try { renderWorkoutHistory(); } catch(e) {}
};

const renderWorkoutHistory = () => {
  const listEl = document.getElementById('whistoryList');
  const emptyEl = document.getElementById('whistoryEmpty');
  const titleEl = document.getElementById('whistoryTitle');
  if(!listEl) return;
  if(titleEl) titleEl.textContent = lang==='ar' ? 'السجل التاريخي' : 'Workout History';
  const historyEntries = [];
  try {
    for(let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if(k && (k.includes('workoutHistory_') || k.includes('zn_cfg_workoutHistory_'))) {
        try {
          const raw = localStorage.getItem(k);
          const val = raw ? JSON.parse(raw) : null;
          if(val?.date && val?.exercises?.length) historyEntries.push(val);
        } catch(e){}
      }
    }
  } catch(e) {}
  historyEntries.sort((a,b) => b.date.localeCompare(a.date));
  listEl.innerHTML = '';
  if(!historyEntries.length) { emptyEl.style.display = 'block'; return; }
  emptyEl.style.display = 'none';
  historyEntries.slice(0, 30).forEach(entry => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString(lang==='ar'?'ar-SA':'en-GB', {weekday:'short', day:'numeric', month:'short'});
    const card = document.createElement('div');
    card.style.cssText = 'border:1px solid var(--border);border-radius:9px;padding:.6rem .75rem;';
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem;';
    header.innerHTML = `<span style="font-size:.78rem;font-weight:700;color:var(--text2);">${dateStr}</span><span style="font-size:.7rem;color:var(--text3);">${entry.exercises.length} ${lang==='ar'?'تمرين':'exercises'}</span>`;
    card.appendChild(header);
    entry.exercises.forEach(ex => {
      const sets = ex.setLogs?.filter(s => s.reps || s.weight != null) || [];
      const maxWeight = sets.length ? Math.max(...sets.map(s=>s.weight||0)) : (ex.weight||0);
      const totalSets = sets.length || ex.sets || 0;
      let trend = '';
      const prevEntry = historyEntries.find(e => e.date < entry.date && e.exercises.some(pe => pe.name.toLowerCase() === ex.name.toLowerCase()));
      if(prevEntry) {
        const prevEx = prevEntry.exercises.find(pe => pe.name.toLowerCase() === ex.name.toLowerCase());
        const prevMax = prevEx?.setLogs?.length ? Math.max(...prevEx.setLogs.map(s=>s.weight||0)) : (prevEx?.weight||0);
        if(maxWeight > prevMax) trend = `<span style="color:var(--success);font-size:.68rem;font-weight:700;">↑ +${(maxWeight-prevMax).toFixed(1)}kg</span>`;
        else if(maxWeight < prevMax) trend = `<span style="color:var(--danger);font-size:.68rem;font-weight:700;">↓ ${(maxWeight-prevMax).toFixed(1)}kg</span>`;
        else trend = `<span style="color:var(--text3);font-size:.68rem;">→</span>`;
      }
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:.2rem 0;border-bottom:1px solid var(--border);';
      row.innerHTML = `<span style="font-size:.78rem;font-weight:500;flex:1;">${esc(ex.name)}</span><div style="display:flex;align-items:center;gap:.4rem;flex-shrink:0;"><span style="font-size:.72rem;color:var(--text2);">${totalSets} sets${maxWeight?` · ${maxWeight}kg`:''}</span>${trend}</div>`;
      card.appendChild(row);
    });
    listEl.appendChild(card);
  });
};

// ── Add exercise ──────────────────────────────────────────────────
$('wpAddExBtn').addEventListener('click', () => {
  const row=$('wpAddRow');
  const isOpen = row.style.display!=='none';
  row.style.display = isOpen?'none':'block';
  $('aiSuggestPanel').classList.remove('open');
  if(!isOpen) $('wpExName').focus();
});

const renderQuickFills = () => {
  // now handled by wpLibPickerBtn — no-op kept for compat
};

const renderWpLibPicker = (q='') => {
  const items = $('wpLibPickerItems'); if(!items) return;
  items.innerHTML = '';
  const filtered = q
    ? exLibrary.filter(e=>e.name.toLowerCase().includes(q.toLowerCase()))
    : exLibrary;
  if(!exLibrary.length){
    items.innerHTML = `<p style="font-size:.78rem;color:var(--text3);text-align:center;padding:.6rem;">No saved exercises yet.</p>`;
    return;
  }
  if(!filtered.length){
    items.innerHTML = `<p style="font-size:.78rem;color:var(--text3);text-align:center;padding:.5rem;">No results.</p>`;
    return;
  }
  filtered.forEach(ex => {
    const btn = document.createElement('button');
    btn.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;background:transparent;border:none;cursor:pointer;padding:.4rem .55rem;border-radius:6px;font-family:inherit;transition:background .12s;gap:.5rem;text-align:left;';
    btn.innerHTML = `<span style="font-size:.82rem;font-weight:500;color:var(--text);">${esc(ex.name)}</span>`;
    btn.addEventListener('mouseenter', () => btn.style.background = 'var(--surface2)');
    btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
    btn.addEventListener('click', () => {
      $('wpExName').value = ex.name;
      closeWpLibPicker();
      $('wpExSets').focus();
    });
    items.appendChild(btn);
  });
};

const closeWpLibPicker = () => {
  const list = $('wpLibPickerList'); if(list) list.style.display = 'none';
  const arrow = $('wpLibPickerArrow');
  if(arrow) arrow.style.transform = '';
};

$('wpLibPickerBtn').addEventListener('click', e => {
  e.stopPropagation();
  const list = $('wpLibPickerList');
  const arrow = $('wpLibPickerArrow');
  const isOpen = list.style.display !== 'none';
  if(isOpen){
    closeWpLibPicker();
  } else {
    renderWpLibPicker();
    list.style.display = 'block';
    if(arrow) arrow.style.transform = 'rotate(180deg)';
    setTimeout(()=>{ const s=$('wpLibPickerSearch'); if(s){s.value='';s.focus();} },50);
  }
});

document.addEventListener('input', e => {
  if(e.target.id==='wpLibPickerSearch') renderWpLibPicker(e.target.value);
});

// Close picker when clicking outside
document.addEventListener('click', e => {
  if(!e.target.closest('#wpQuickFillsWrap')) closeWpLibPicker();
});

const addExerciseToToday = (name, sets=3, reps=10, muscle='', weight=null) => {
  const dk=todayDayKey();
  if(!weekPlan[dk]) weekPlan[dk]={rest:false,focus:'',notes:'',exercises:[]};
  weekPlan[dk].rest=false;
  const setLogs = Array.from({length: sets}, () => ({reps, weight, done: false}));
  weekPlan[dk].exercises.push({id:'ex'+Date.now(),name,sets,reps,muscle,weight,setLogs});
  saveWeekPlan(); renderWpExList(); renderWpGrid();
  const wtStr = weight ? ` · ${weight}kg` : '';
  showToast(`✅ ${name} · ${sets}×${reps}${wtStr}`);
};

// ── Add exercise: Name once, then Reps+kg+Done per set ──────────
let _wpActiveExName = ''; // holds the exercise name across sets

$('wpExName').addEventListener('blur', () => {
  const v = sanitizeText($('wpExName').value, 50);
  if(v) { _wpActiveExName = v; $('wpExReps').focus(); }
});
$('wpExName').addEventListener('keydown', e => {
  if(e.key === 'Enter') { const v=sanitizeText($('wpExName').value,50); if(v){_wpActiveExName=v; $('wpExReps').focus();} }
});

$('wpExSaveBtn').addEventListener('click', () => {
  const name = sanitizeText($('wpExName').value, 50) || _wpActiveExName;
  if(!name){ showToast(lang==='ar'?'أدخل اسم التمرين':'Enter exercise name'); return; }
  _wpActiveExName = name;
  const reps   = sanitizeInt($('wpExReps').value, 1, 999) || 10;
  const weightRaw = parseFloat($('wpExWeight').value);
  const weight = !isNaN(weightRaw) && weightRaw > 0 ? Math.round(weightRaw*10)/10 : null;

  const dk = todayDayKey();
  if(!weekPlan[dk]) weekPlan[dk] = {rest:false,focus:'',notes:'',exercises:[]};
  weekPlan[dk].rest = false;

  // Check if exercise already exists for today — add set to it
  const existing = weekPlan[dk].exercises.find(e => e.name.toLowerCase() === name.toLowerCase());
  if(existing) {
    // Remove trailing empty set if present
    while(existing.setLogs.length > 0) {
      const last = existing.setLogs[existing.setLogs.length-1];
      if(!last.reps && last.weight == null) existing.setLogs.pop(); else break;
    }
    existing.setLogs.push({reps, weight, done:false});
    existing.sets = existing.setLogs.length;
    existing.finished = false;
  } else {
    const setLogs = [{reps, weight, done:false}];
    weekPlan[dk].exercises.push({id:'ex'+Date.now(), name, sets:1, reps, muscle:'', weight, setLogs});
  }

  const setNum = (weekPlan[dk].exercises.find(e=>e.name.toLowerCase()===name.toLowerCase())?.setLogs?.length) || 1;

  saveWeekPlan(); renderWpExList(); renderWpGrid();

  // After render, restore name and focus reps
  setTimeout(() => {
    $('wpExName').value = name;
    $('wpExReps').value = '';
    $('wpExWeight').value = '';
    $('wpExReps').focus();
  }, 30);

  showToast(lang==='ar' ? `✅ جلسة ${setNum}` : `✅ Set ${setNum} added`);
});

['wpExReps','wpExWeight'].forEach(id=>{
  $(id)&&$(id).addEventListener('keydown',e=>{if(e.key==='Enter')$('wpExSaveBtn').click();});
});

$('wpClearWeekBtn').addEventListener('click',()=>{
  showConfirm('Clear entire week plan?','All exercises will be removed.','Clear','Cancel',()=>{
    DAY_KEYS.forEach(d=>{weekPlan[d]={rest:false,focus:'',notes:'',exercises:[]};});
    saveWeekPlan(); renderWpGrid(); renderWpExList();
    showToast('Week cleared');
  });
});

// ── AI Suggest ────────────────────────────────────────────────────
$('wpSuggestBtn') && $('wpSuggestBtn').addEventListener('click',()=>{
  const panel = $('aiSuggestPanel');
  if(panel){ panel.style.display = panel.style.display==='none' ? 'block' : 'none'; }
  if(panel && panel.style.display !== 'none') $('aiMuscleInput')?.focus();
});
$('aiSuggestRunBtn') && $('aiSuggestRunBtn').addEventListener('click',()=>{
  const q = ($('aiMuscleInput')?.value||'').trim().toLowerCase();
  const results = $('aiSuggestResults');
  if(!results) return;
  results.innerHTML = '';
  if(!q){ results.innerHTML=`<p style="font-size:.78rem;color:var(--text3);">${lang==='ar'?'أدخل اسم العضلة…':'Enter a muscle group…'}</p>`; return; }
  const matches = exLibrary.filter(e=>
    e.name.toLowerCase().includes(q) ||
    (e.muscle||'').toLowerCase().includes(q) ||
    muscleLbl(e.muscle||'').includes(q)
  ).slice(0,6);
  if(!matches.length){
    results.innerHTML=`<p style="font-size:.78rem;color:var(--text3);">${lang==='ar'?'لا نتائج':'No matches found'}</p>`; return;
  }
  matches.forEach(ex=>{
    const row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:.35rem .5rem;background:var(--surface);border:1px solid var(--border);border-radius:7px;font-size:.8rem;';
    row.innerHTML=`<span style="font-weight:600;">${esc(ex.name)}</span><button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .5rem;">${lang==='ar'?'إضافة':'Add'}</button>`;
    row.querySelector('button').addEventListener('click',()=>{ showExAddPopup(ex); });
    results.appendChild(row);
  });
});
$('aiMuscleInput') && $('aiMuscleInput').addEventListener('keydown',e=>{ if(e.key==='Enter') $('aiSuggestRunBtn')?.click(); });

// ── Water Tracker ─────────────────────────────────────────────────
let waterLog = { cups: 0, unit: 'cup', goal: 8, date: todayKey() };

const saveWaterLog = () => saveCfg('waterLog', waterLog);
const loadBodyInfo = () => {
  const h   = loadCfg('bodyHeight', null);
  const g   = loadCfg('bodyGender', null);
  const age = loadCfg('bodyAge',    null);
  // Pre-fill calorie calculator
  if(h   && document.getElementById('ccHeight'))   document.getElementById('ccHeight').value   = h;
  if(g   && document.getElementById('ccGender'))   document.getElementById('ccGender').value   = g;
  if(age && document.getElementById('ccAge'))      document.getElementById('ccAge').value      = age;
  // Pre-fill weight from last log
  if(weightLog.length && document.getElementById('ccWeight')) {
    document.getElementById('ccWeight').value = weightLog[weightLog.length-1].val;
  }
  // Pre-fill activity level
  const act = loadCfg('bodyActivity', null);
  if(act) {
    const ccA = document.getElementById('ccActivity');
    if(ccA) ccA.value = act;
  }
  // Run calc if we have enough data
  setTimeout(calcCalories, 100);
};

const loadWaterLog = () => {
  const saved = loadCfg('waterLog', null);
  const today = todayKey();
  if(saved && saved.date === today) {
    waterLog = saved;
  } else {
    waterLog = { cups: 0, unit: saved?.unit || 'cup', goal: saved?.goal || 8, date: today };
    saveWaterLog();
  }
};

const renderWater = () => {
  const total = $('waterTotal');
  const bar   = $('waterBar');
  const viz   = $('waterCupsViz');
  const unitLbl = $('waterGoalUnit');
  const goalInp = $('waterGoal');
  const sel   = $('waterUnitSel');
  if(!total) return;
  const unit = waterLog.unit || 'cup';
  const goal = waterLog.goal || 8;
  if(sel) sel.value = unit;
  if(goalInp) goalInp.value = goal;
  if(unitLbl) unitLbl.textContent = unit === 'L' ? 'L' : 'cups';
  document.querySelectorAll('.water-unit-lbl').forEach(el => {
    el.textContent = unit === 'L' ? 'L' : (el.parentElement.id === 'waterAdd2' ? 'cups' : 'cup');
  });
  const cups = waterLog.cups || 0;
  total.textContent = unit === 'L' ? (cups * 0.25).toFixed(2) : cups;
  const pct = Math.min(100, Math.round((cups / goal) * 100));
  if(bar) bar.style.width = pct + '%';
  // Visualize
  if(viz) {
    viz.innerHTML = '';
    const icons = Math.min(cups, 20);
    const remaining = Math.max(0, goal - cups);
    for(let i=0;i<icons;i++){
      const d = document.createElement('div');
      d.style.cssText='font-size:1.3rem;line-height:1;cursor:pointer;';
      d.textContent='💧';
      d.title='Click to remove';
      d.addEventListener('click',()=>{ if(waterLog.cups>0){waterLog.cups--;saveWaterLog();renderWater();} });
      viz.appendChild(d);
    }
    for(let i=0;i<Math.min(remaining,20-icons);i++){
      const d = document.createElement('div');
      d.style.cssText='font-size:1.3rem;line-height:1;opacity:.18;';
      d.textContent='💧';
      viz.appendChild(d);
    }
  }
};

$('waterAdd1') && $('waterAdd1').addEventListener('click',()=>{
  waterLog.cups=(waterLog.cups||0)+1; saveWaterLog(); renderWater();
  showToast('💧 +1 ' + (waterLog.unit==='L'?'L':'cup'));
});
$('waterAdd2') && $('waterAdd2').addEventListener('click',()=>{
  waterLog.cups=(waterLog.cups||0)+2; saveWaterLog(); renderWater();
  showToast('💧 +2 ' + (waterLog.unit==='L'?'L':'cups'));
});
$('waterReset') && $('waterReset').addEventListener('click',()=>{
  waterLog.cups=0; saveWaterLog(); renderWater();
  showToast('Water reset');
});
$('waterUnitSel') && $('waterUnitSel').addEventListener('change',()=>{
  waterLog.unit=$('waterUnitSel').value; saveWaterLog(); renderWater();
});
$('waterGoal') && $('waterGoal').addEventListener('change',()=>{
  const v = parseInt($('waterGoal').value);
  if(v>=1&&v<=30){ waterLog.goal=v; saveWaterLog(); renderWater(); }
});

// ── Edit Exercise Modal ───────────────────────────────────────────
$('closeEditExModal').addEventListener('click',()=>$('editExModal').style.display='none');
$('editExModal').addEventListener('click',e=>{if(e.target===$('editExModal'))$('editExModal').style.display='none';});
$('editExSaveBtn').addEventListener('click',()=>{
  const idx = parseInt($('editExIdx').value);
  const dk = todayDayKey();
  const exs = weekPlan[dk]?.exercises;
  if(!exs||idx<0||idx>=exs.length) return;
  const name = sanitizeText($('editExName').value,50);
  if(!name){showToast('Enter exercise name');return;}
  const sets = sanitizeInt($('editExSets').value,1,99)||exs[idx].sets;
  const reps = sanitizeInt($('editExReps').value,1,999)||exs[idx].reps;
  const wRaw = parseFloat($('editExWeight').value);
  const weight = !isNaN(wRaw)&&wRaw>0 ? Math.round(wRaw*10)/10 : null;
  exs[idx] = {...exs[idx], name, sets, reps, weight};
  saveWeekPlan();
  $('editExModal').style.display='none';
  renderWpExList(); renderWpGrid();
  showToast('✅ Exercise updated');
});
['editExName','editExSets','editExReps','editExWeight'].forEach(id=>{
  $(id)&&$(id).addEventListener('keydown',e=>{if(e.key==='Enter')$('editExSaveBtn').click();});
});
const addToExLib = (name,muscle='',defaultSets=3,defaultReps=10)=>{
  if(exLibrary.some(e=>e.name.toLowerCase()===name.toLowerCase())) return false;
  exLibrary.push({id:'el'+Date.now(),name,muscle,defaultSets,defaultReps});
  saveExLib(); renderExLib(); return true;
};

// ── Quick-add popup from Exercise Library ────────────────────────
const showExAddPopup = (ex) => {
  // Remove any existing popup
  document.getElementById('exAddPopup')?.remove();
  document.getElementById('exAddPopupOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'exAddPopupOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:1rem;';

  const isAr = lang === 'ar';
  overlay.innerHTML = `
    <div id="exAddPopup" style="background:var(--surface);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:320px;box-shadow:0 24px 64px rgba(0,0,0,.5);animation:fadeUp .18s ease;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.1rem .7rem;border-bottom:1px solid var(--border);">
        <div>
          <div style="font-size:.95rem;font-weight:700;color:var(--text);">${esc(ex.name)}</div>
          ${ex.muscle?`<div style="font-size:.7rem;color:var(--text3);margin-top:.1rem;">${muscleLbl(ex.muscle)}</div>`:''}
        </div>
        <button id="exAddPopupClose" style="width:28px;height:28px;border-radius:6px;background:var(--surface2);border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text2);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="padding:.9rem 1.1rem 1.1rem;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin-bottom:.9rem;">
          <div>
            <label class="fm-lbl">${isAr?'مجموعات':'Sets'}</label>
            <input class="inp" id="exPopSets" type="number" min="1" max="99" placeholder="3" style="text-align:center;font-size:.9rem;font-weight:700;"/>
          </div>
          <div>
            <label class="fm-lbl">${isAr?'تكرارات':'Reps'}</label>
            <input class="inp" id="exPopReps" type="number" min="1" max="999" placeholder="10" style="text-align:center;font-size:.9rem;font-weight:700;"/>
          </div>
          <div>
            <label class="fm-lbl">${isAr?'الوزن (كغ)':'Weight (kg)'}</label>
            <input class="inp" id="exPopWeight" type="number" min="0" max="999" step="0.5" placeholder="${isAr?'اختياري':'opt.'}" style="text-align:center;font-size:.9rem;font-weight:700;"/>
          </div>
        </div>
        <button id="exPopConfirm" class="btn btn-cyan" style="width:100%;justify-content:center;font-size:.9rem;">
          ${isAr?'إضافة للتمارين':'Add to Today'}
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.getElementById('exPopSets').focus();

  const close = () => overlay.remove();
  document.getElementById('exAddPopupClose').addEventListener('click', close);
  overlay.addEventListener('click', e => { if(e.target === overlay) close(); });

  document.getElementById('exPopConfirm').addEventListener('click', () => {
    const sets   = sanitizeInt(document.getElementById('exPopSets').value,   1, 99)  || 3;
    const reps   = sanitizeInt(document.getElementById('exPopReps').value,   1, 999) || 10;
    const wRaw   = parseFloat(document.getElementById('exPopWeight').value);
    const weight = !isNaN(wRaw) && wRaw > 0 ? Math.round(wRaw * 10) / 10 : null;
    addExerciseToToday(ex.name, sets, reps, ex.muscle||'', weight);
    close();
  });

  ['exPopSets','exPopReps','exPopWeight'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if(e.key === 'Enter') document.getElementById('exPopConfirm').click();
    });
  });
};

const renderExLib = () => {
  const list=$('exLibList'), empty=$('exLibEmpty'); if(!list) return;
  list.innerHTML='';
  const q=($('exLibSearch')?.value||'').toLowerCase();
  const filtered = exLibrary.filter(e=>!q||e.name.toLowerCase().includes(q)||e.muscle?.toLowerCase().includes(q)||muscleLbl(e.muscle||'').includes(q));
  empty.style.display=filtered.length?'none':'block';

  // Group: presets first, then user-added
  const presets = filtered.filter(e=>e.preset);
  const custom  = filtered.filter(e=>!e.preset);

  const renderGroup = (items, isPreset) => {
    items.forEach(ex=>{
      const row=document.createElement('div');
      row.className='exlib-row';
      if(isPreset){
        row.style.cssText='border-color:rgba(251,191,36,.35);background:rgba(251,191,36,.06);';
      }
      row.innerHTML=`
        <div style="flex:1;min-width:0;">
          <div style="font-size:.83rem;font-weight:600;${isPreset?'color:var(--amber);':''}">${esc(ex.name)}</div>
          ${ex.muscle?`<span class="muscle-tag" style="${isPreset?'color:rgba(251,191,36,.8);background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.25);':''}">${muscleLbl(ex.muscle)}</span>`:''}
        </div>
        <button class="exlib-add-btn" title="Add to today" data-exid="${ex.id}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        ${isPreset
          ? `<span style="font-size:.65rem;color:var(--amber);opacity:.7;padding:0 .2rem;" title="Built-in exercise">✦</span>`
          : `<button class="exlib-del-btn" data-exid="${ex.id}">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </button>`
        }`;
      list.appendChild(row);
    });
  };

  renderGroup(presets, true);
  // Divider between presets and custom
  if(presets.length && custom.length){
    const div = document.createElement('div');
    div.style.cssText='height:1px;background:var(--border);margin:.4rem 0;';
    list.appendChild(div);
  }
  renderGroup(custom, false);

  list.querySelectorAll('.exlib-add-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const ex=exLibrary.find(e=>e.id===btn.dataset.exid); if(!ex) return;
      showExAddPopup(ex);
    });
  });
  list.querySelectorAll('.exlib-del-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      exLibrary=exLibrary.filter(e=>e.id!==btn.dataset.exid);
      saveExLib(); renderExLib();
    });
  });
};

$('exLibSearch').addEventListener('input',()=>renderExLib());
$('exLibAddBtn').addEventListener('click',()=>{
  const row=$('exLibAddRow');
  row.style.display=row.style.display==='none'?'block':'none';
  if(row.style.display!=='none') $('exLibName').focus();
});
$('exLibSaveBtn').addEventListener('click',()=>{
  const name=sanitizeText($('exLibName').value,50);
  if(!name){showToast('Enter exercise name');return;}
  if(!addToExLib(name,'',3,10)){showToast('Already in library');return;}
  $('exLibName').value='';
  $('exLibAddRow').style.display='none';
  showToast(`⭐ ${name} saved`);
});
$('exLibName').addEventListener('keydown',e=>{if(e.key==='Enter')$('exLibSaveBtn').click();});
