// ── يومي — UI Layer: loading screen, language, theme, tabs, tasks
// ── Loading screen ────────────────────────────────────────────────
// Bootstrap runs after all functions are defined — see bottom of script

// ── Apply Language ────────────────────────────────────────────────
const applyLang = () => {
  const html=document.documentElement;
  html.setAttribute('lang',lang); html.setAttribute('dir',lang==='ar'?'rtl':'ltr');
  saveCfg('lang',lang);
  // Language buttons now live inside settings modal — updated via applySettingsLang()
  const h=new Date().getHours(), gKey=h<12?'greetMorn':h<17?'greetAfter':'greetEve';
  $('greeting').textContent     = t(gKey);
  $('subGreeting').textContent  = t('sub');
  $('headerDate').textContent   = new Date().toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{weekday:'short',month:'long',day:'numeric'});
  $('logoText').textContent     = t('logo');
  $('mainHeader').style.background = '';
  // Tabs
  const setTabLbl = (id, key) => { const el=document.getElementById(id+'Lbl'); if(el) el.textContent=t(key); };
  setTabLbl('tabToday',   'tabToday');
  setTabLbl('tabNotes',   'tabNotes');
  setTabLbl('tabWeek',    'tabWeek');
  setTabLbl('tabLog',     'tabLog');
  setTabLbl('tabWorkout', 'tabWorkout');
  // Habits
  $('titleHabits').textContent    = t('titleHabits');
  if($('resetDayBtnLbl')) $('resetDayBtnLbl').textContent = t('resetDay');
  if($('resetDayBtn') && !$('resetDayBtnLbl')) $('resetDayBtn').textContent = t('resetDay');
  $('lblProgress').textContent    = t('lblProgress');
  $('newTaskInput').placeholder   = t('addTaskPh');
  $('addTaskBtn').textContent     = t('addTask');
  $('fcatAll').textContent        = t('catAll');
  $('fcatWork').textContent       = t('catWork');
  $('fcatSport').textContent      = t('catSport');
  $('fcatPersonal').textContent   = t('catPersonal');
  $('fcatHealth').textContent     = t('catHealth');
  $('optWork').textContent        = t('optWork');
  $('optSport').textContent       = t('optSport');
  $('optPersonal').textContent    = t('optPersonal');
  $('optHealth').textContent      = t('optHealth');
  $('optPrayer').textContent      = t('optPrayer');
  // Steps
  $('titleSteps').textContent      = t('titleSteps');
  $('lblStepTarget').textContent   = t('lblStepTarget');
  $('lblLogSteps').textContent     = t('lblLogSteps');
  $('lblStepsUnit').textContent    = t('stepsUnit');
  $('lblStepsUnitGoal').textContent= t('stepsUnit');
  // Calories
  $('titleCalories').textContent  = t('titleCalories');
  $('lblConsumed').textContent    = t('lblConsumed');
  $('lblTarget').textContent      = t('lblTarget');
  $('lblMealLog').textContent     = t('lblMealLog');
  $('clearMealsBtn').textContent  = t('clearMeals');
  if($('lblAddFood'))    $('lblAddFood').textContent    = lang==='ar'?'إضافة طعام':'Add Food';
  if($('fmTitle'))       $('fmTitle').textContent       = lang==='ar'?'إضافة طعام':'Add Food';
  if($('fmSubmitLbl'))   $('fmSubmitLbl').textContent   = lang==='ar'?'تسجيل':'Log Food';
  if($('lblFmTabMeal'))    $('lblFmTabMeal').textContent    = lang==='ar'?'وجبة جاهزة':'Ready Meal';
  if($('lblFmTabProduct')) $('lblFmTabProduct').textContent = lang==='ar'?'حسب الوزن':'By Weight';
  if($('lblFmTabSaved'))   $('lblFmTabSaved').textContent   = lang==='ar'?'محفوظة':'Saved';
  if($('fmSaveLabel'))     $('fmSaveLabel').textContent     = lang==='ar'?'حفظ في مكتبة الوجبات':'Save to my meals library';
  if($('smSearch'))        $('smSearch').placeholder        = lang==='ar'?'ابحث في الوجبات المحفوظة…':'Search saved meals…';
  if($('emptyMeals'))    $('emptyMeals').textContent    = t('emptyMeals');
  // Notes
  $('titleNotes').textContent     = t('titleNotes');
  $('titleNotesMob').textContent  = t('titleNotesMob');
  $('titleLog').textContent       = t('titleLog');
  $('emptyLog').textContent       = t('logEmpty');
  $('jumpTodayBtn').textContent   = t('jumpToday');
  $('lblAddHabit').textContent    = t('lblAddHabit');
  qsa('.pill-lbl').forEach(el=>el.textContent=t(el.dataset.key));
  $('saveNotesDesktop').textContent = t('saveNotes');
  $('saveNotesMobile').textContent  = t('saveNotes');
  // Timer
  // Week
  $('wTitleTasks').textContent   = t('titleWeekTasks');
  $('wTitleCal').textContent     = t('titleWeekCal');
  $('wTitleCats').textContent    = t('titleWeekCats');
  $('wLblAvgTasks').textContent  = t('wAvgTasksLbl');
  $('wLblAvgCal').textContent    = t('wAvgCalLbl');
  $('wLblBestDay').textContent   = t('wBestDayLbl');
  // Notifs
  $('lblCalNav').textContent        = t('lblCalNav');
  // Modal
  $('modalTitle').textContent      = t('modalTitle');
  $('habitSaveBtn').textContent    = t('habitSave');
  $('habitCancelBtn').textContent  = t('habitCancel');
  // Auth modal — bilingual
  const _au = (id, ar, en) => { const el=document.getElementById(id); if(el) el.textContent=lang==='ar'?ar:en; };
  const _ap = (id, ar, en) => { const el=document.getElementById(id); if(el) el.placeholder=lang==='ar'?ar:en; };
  _au('authModalTitle',  'سجّل دخولك لحفظ بياناتك',         'Sign in to save your data');
  _au('authModalSub',    'بياناتك تتزامن على جميع أجهزتك',  'Your data syncs across all your devices');
  _au('googleBtnLabel',  'تسجيل الدخول بـ Google',           'Continue with Google');
  _au('authOrLabel',     'أو',                                'or');
  _ap('authEmail',       'أدخل بريدك الإلكتروني',            'Enter your email');
  _au('emailSignInBtn',  'إرسال رابط الدخول',                'Send Sign-in Link');
  _au('authStep2Title',  'تحقق من بريدك!',                   'Check your email!');
  _au('authSpamNote',    'إذا لم تجد الرسالة، تحقق من مجلد Spam أو Junk.', "No email? Check your Spam or Junk folder.");
  _au('authResendBtn',   'إعادة الإرسال',                    'Resend link');
  _au('authCloseBtn',    'إغلاق',                            'Close');
  if(!currentSupaUser) _au('authHeaderLabel', 'تسجيل الدخول', 'Sign In');
  if(typeof applySettingsLang === 'function') applySettingsLang();
  // Workout tab
  const exLibTitle = document.querySelector('#sectionExLib .font-display');
  if(exLibTitle) exLibTitle.textContent = lang==='ar' ? 'مكتبة التمارين' : 'Exercise Library';
  _ap('exLibSearch',    'ابحث في التمارين…',      'Search exercises…');
  _ap('exLibName',      'اسم التمرين…',           'Exercise name…');
  _ap('wpExName',       'التمرين…',               'Exercise…');
  _ap('wpExSets',       'جلسات',                  'Sets');
  _ap('wpExReps',       'تكرار',                  'Reps');
  _au('exLibEmpty',     'لا تمارين بعد.\nأضف تمرينك الخاص.', 'No saved exercises yet.\nAdd your own.');
  _au('wpExEmpty',      'لا تمارين مسجلة اليوم.', 'No exercises logged yet.');
  const wpNewBtn = document.getElementById('wpAddExBtn');
  if(wpNewBtn){ const lbl=wpNewBtn.querySelector('span')||wpNewBtn; if(lbl.tagName!=='BUTTON') lbl.textContent=lang==='ar'?'إضافة':'Add'; }
  // Body Weight
  const wtTitle = document.querySelector('#sectionWeight .font-display');
  if(wtTitle) wtTitle.textContent = lang==='ar' ? 'الوزن' : 'Body Weight';
  _ap('wtInput',  'مثال: 75.5', 'e.g. 75.5');
  _au('wtLogBtn', 'تسجيل',      'Log');
  _au('wtEmpty',  'لا سجل وزن بعد.', 'No weight logged yet.');
  const wtChartEmpty = document.getElementById('wtChartEmpty');
  if(wtChartEmpty) wtChartEmpty.textContent = lang==='ar' ? 'لا بيانات بعد' : 'No data yet';
  // Calorie Calculator
  const ccTitle = document.querySelector('#sectionCalCalc .font-display');
  if(ccTitle) ccTitle.textContent = lang==='ar' ? 'حاسبة السعرات' : 'Calorie Calculator';
  document.querySelectorAll('#sectionCalCalc .fm-lbl').forEach((lbl,i)=>{
    const ar = ['الوزن (كغ)','الطول (سم)','العمر','الجنس','مستوى النشاط'];
    const en = ['Weight (kg)','Height (cm)','Age','Gender','Activity Level'];
    if(ar[i]) lbl.textContent = lang==='ar' ? ar[i] : en[i];
  });
  const ccGenderEl = document.getElementById('ccGender');
  if(ccGenderEl){ ccGenderEl.options[0].text=lang==='ar'?'ذكر':'Male'; ccGenderEl.options[1].text=lang==='ar'?'أنثى':'Female'; }
  const ccActEl = document.getElementById('ccActivity');
  if(ccActEl){
    const ar=['خامل — مكتبي، بدون رياضة','خفيف — 1-3 أيام/أسبوع','متوسط — 3-5 أيام/أسبوع','نشيط — 6-7 أيام/أسبوع','نشيط جداً — عمل جسدي + تدريب'];
    const en=['Sedentary — desk job, no exercise','Light — 1-3x / week','Moderate — 3-5x / week','Active — 6-7x / week','Very Active — physical job + training'];
    Array.from(ccActEl.options).forEach((o,i)=>{ o.text=lang==='ar'?ar[i]:en[i]; });
  }
  document.querySelectorAll('.cc-goal-card > div:first-child').forEach((el,i)=>{
    const ar=['📉 إنقاص','⚖️ ثبات','💪 زيادة'], en=['📉 Lose','⚖️ Maintain','💪 Gain'];
    if(ar[i]) el.textContent=lang==='ar'?ar[i]:en[i];
  });
  const ccApplyLbl=document.getElementById('ccApplyLabel');
  if(ccApplyLbl&&(ccApplyLbl.textContent==='Select a goal first'||ccApplyLbl.textContent==='اختر هدفك أولاً'))
    ccApplyLbl.textContent=lang==='ar'?'اختر هدفك أولاً':'Select a goal first';
  _au('ccHint','أدخل بياناتك لمعرفة احتياجك اليومي','Fill in your info to see your TDEE');
  // Water Intake
  const waterTitle = document.querySelector('#sectionWater .font-display');
  if(waterTitle) waterTitle.textContent = lang==='ar' ? '💧 شرب الماء' : '💧 Water Intake';
  document.querySelectorAll('#sectionWater span').forEach(el=>{
    if(el.textContent==='Daily goal'||el.textContent==='الهدف اليومي') el.textContent=lang==='ar'?'الهدف اليومي':'Daily goal';
  });
  const waterCupSel=document.getElementById('waterUnitSel');
  if(waterCupSel){ waterCupSel.options[0].text=lang==='ar'?'كوب':'Cup'; }
  const waterResetBtn=document.getElementById('waterReset');
  if(waterResetBtn) waterResetBtn.textContent=lang==='ar'?'تصفير':'Reset';
  renderExLib();
  renderCalBar();
  renderAll();
};
window.setLang = nl => { lang=nl; applyLang(); };

// ── Theme ─────────────────────────────────────────────────────────
const applyTheme = () => {
  document.documentElement.setAttribute('data-theme',theme);
  saveCfg('theme',theme);
  $('mainHeader').style.background = '';
};
$('themeToggle').addEventListener('click',()=>{ theme=theme==='dark'?'light':'dark'; applyTheme(); });

// ── Tabs ──────────────────────────────────────────────────────────
const TABS = ['today','notes','week','workout','log'];
const switchTab = name => {
  if(!TABS.includes(name)) return; // guard: ignore invalid tab names
  TABS.forEach(t2=>{
    const tabEl = $(`tab-${t2}`);
    const tabBtn = qs(`.tab-btn[data-tab="${t2}"]`);
    if(tabEl) tabEl.style.display = t2===name?'block':'none';
    if(tabBtn) tabBtn.classList.toggle('active',t2===name);
  });
  if(name==='log')     renderLog();
  if(name==='week')    renderWeekStats();
  if(name==='workout') renderWorkoutTab();
};
qsa('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', e => {
    e.stopPropagation();
    // Only switch if click target is inside tabBar div
    const tabBar = document.getElementById('tabBar');
    if(tabBar && tabBar.contains(e.currentTarget) && btn.dataset.tab) {
      switchTab(btn.dataset.tab);
    }
  });
});

// ── Calendar Bar ──────────────────────────────────────────────────
const renderCalBar = () => {
  const bar=$('calBar'); bar.innerHTML='';
  // 29 past days + today + 7 future = 37 total
  for(let i=29;i>=-7;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const key=d.toISOString().slice(0,10);
    const isToday=key===todayKey(), isViewing=key===viewingDate;
    const isFuture=i<0;
    const hasData=dayHasRealData(key);
    const dayName=d.toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{weekday:'short'});
    const dayNum=d.getDate();
    const btn=document.createElement('button');

    let cls=`cal-day-btn`;
    if(isViewing) cls+=' active';
    else if(hasData) cls+=' has-data';
    if(isToday && !isViewing) cls+=' is-today';
    if(isFuture && !isViewing) cls+=' is-future';
    btn.className=cls;
    btn.dataset.date=key;

    const label = isToday ? (lang==='ar'?'اليوم':'TODAY') : dayName.toUpperCase();
    btn.innerHTML=`
      <span class="cal-dname">${label}</span>
      <span class="cal-dnum">${dayNum}</span>
      ${hasData&&!isViewing?'<span class="cal-dot"></span>':''}
      ${isToday&&!isViewing?'<span style="width:14px;height:2px;border-radius:99px;background:var(--accent);margin-top:1px;"></span>':''}
    `;
    btn.addEventListener('click',()=>{ viewingDate=key; renderCalBar(); renderAll(); updatePastBanner(); });
    bar.appendChild(btn);
  }
  setTimeout(()=>{
    const active=bar.querySelector('.active');
    if(!active) return;
    bar.scrollLeft = active.offsetLeft - bar.offsetWidth/2 + active.offsetWidth/2;
  },50);
};

const updatePastBanner = () => {
  const isToday=viewingDate===todayKey();
  $('pastBanner').style.display=isToday?'none':'flex';
  if(!isToday){
    const d=new Date(viewingDate+'T12:00:00');
    const lbl=d.toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{weekday:'long',month:'long',day:'numeric'});
    const isFuture = viewingDate > todayKey();
    const prefix = isFuture ? (lang==='ar'?'📅 تصفح:':'📅 Viewing:') : t('viewingPast');
    $('pastBannerText').textContent=`${prefix} ${lbl}`;
  }
};

$('jumpTodayBtn').addEventListener('click',()=>{ viewingDate=todayKey(); renderCalBar(); renderAll(); updatePastBanner(); });

// ── Render All ────────────────────────────────────────────────────
function renderAll() {
  renderWeeklySummary();
  renderLastWeekCard();
  ensureDay(viewingDate);
  renderTasks();
  renderMeals();
  renderSteps();
  loadNotes();
  $('calTargetInput').value = calTarget;
  $('stepsTargetInput').value = stepsTarget;
}

// ── Tasks ─────────────────────────────────────────────────────────
const CAT_COLORS = {work:'cat-work',sport:'cat-sport',personal:'cat-personal',health:'cat-health',prayer:'cat-prayer'};
const CAT_LABELS = cat=>({work:t('optWork'),sport:t('optSport'),personal:t('optPersonal'),health:t('optHealth'),prayer:t('optPrayer')})[cat]||cat;

const renderTasks = () => {
  const day = getDay(viewingDate);
  const list = $('taskList'); list.innerHTML='';
  const filtered = activeCatFilter==='all' ? day.tasks : day.tasks.filter(x=>x.cat===activeCatFilter);
  filtered.forEach(task=>{
    const lbl = typeof task.label==='object' ? (task.label[lang]||task.label.en) : task.label;
    const catCls = CAT_COLORS[task.cat]||'cat-personal';
    const row = document.createElement('div');
    row.className = `task-row${task.done?' done':''}`;
    row.innerHTML = `
      <label class="cb-wrap" onclick="event.stopPropagation()">
        <input type="checkbox" ${task.done?'checked':''} data-id="${esc(task.id)}"/>
        <div class="cb-box">
          <svg viewBox="0 0 13 13" fill="none" stroke="var(--accent-fg)" stroke-width="2.5" stroke-linecap="round">
            <polyline points="1.5 7 5 10.5 11.5 2.5"/>
          </svg>
        </div>
      </label>
      <span class="task-lbl" style="flex:1;font-size:.875rem;">${esc(lbl)}</span>
      <span class="cat-badge ${catCls}">${CAT_LABELS(task.cat)}</span>
      <button class="delbtn task-del" title="${t('confirmDelTask')}" data-id="${esc(task.id)}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`;
    list.appendChild(row);
  });

  // Checkbox handlers
  list.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
    cb.addEventListener('change',e=>{
      const task=dayCache[viewingDate].tasks.find(x=>x.id===e.target.dataset.id);
      if(!task)return;
      task.done=e.target.checked;
      saveDay(viewingDate);
      const box=e.target.nextElementSibling;
      box.classList.add('pop'); box.addEventListener('animationend',()=>box.classList.remove('pop'),{once:true});
      renderTasks(); updateProgress();
    });
  });

  // Delete handlers — with confirm dialog
  list.querySelectorAll('.task-del').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      showConfirm(t('confirmDelTask'),t('confirmDelTaskSub'),t('confirmYes'),t('confirmNo'),()=>{
        dayCache[viewingDate].tasks = dayCache[viewingDate].tasks.filter(x=>x.id!==btn.dataset.id);
        // Also remove from customTasks if it was a permanent habit
        const wasCustom = customTasks.findIndex(x=>x.id===btn.dataset.id);
        if(wasCustom>=0){
          customTasks.splice(wasCustom,1);
          saveCfg('customTasks',customTasks);
        }
        saveDay(viewingDate); renderTasks(); updateProgress();
        showToast(lang==='ar'?'تم حذف المهمة 🗑️':'Task deleted 🗑️');
      });
    });
  });

  updateProgress();
};

const updateProgress = () => {
  const day=getDay(viewingDate);
  const total=day.tasks.length, done=day.tasks.filter(x=>x.done).length;
  $('progressBar').style.width = total?Math.round(done/total*100)+'%':'0%';
  $('progressLabel').textContent = `${done}/${total} ${t('tasksDone')}`;
};

$('addTaskBtn').addEventListener('click',()=>{
  const v=sanitizeText($('newTaskInput').value,60);
  if(!v){showToast(lang==='ar'?'أدخل نصًا':'Enter text');return;}
  const allowed=['work','sport','personal','health','prayer'];
  const cat=allowed.includes($('newTaskCat').value)?$('newTaskCat').value:'personal';
  const rl=checkRL('add_task','data');
  if(!rl.ok){showToast(`${lang==='ar'?'انتظر':'Wait'} ${rl.wait}s`);return;}
  ensureDay(viewingDate);
  dayCache[viewingDate].tasks.push({id:'t'+Date.now(),label:{en:v,ar:v},done:false,fixed:false,cat});
  saveDay(viewingDate); $('newTaskInput').value=''; renderTasks(); updateProgress();
  showToast(lang==='ar'?'تمت الإضافة ✅':'Added ✅');
});
$('newTaskInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('addTaskBtn').click();});

// ── Habits ⋯ menu ─────────────────────────────────────────────────
const habitsMenuBtn = $('habitsMenuBtn');
const habitsMenuDrop = $('habitsMenuDrop');
if(habitsMenuBtn && habitsMenuDrop) {
  habitsMenuBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = habitsMenuDrop.style.display !== 'none';
    habitsMenuDrop.style.display = isOpen ? 'none' : 'block';
  });
  document.addEventListener('click', e => {
    if(!habitsMenuDrop.contains(e.target) && e.target !== habitsMenuBtn)
      habitsMenuDrop.style.display = 'none';
  });
}

$('resetDayBtn').addEventListener('click',()=>{
  if(habitsMenuDrop) habitsMenuDrop.style.display = 'none';
  showConfirm(t('confirmReset'),t('confirmResetSub'),t('confirmYes'),t('confirmNo'),()=>{
    auditLog('reset_day', viewingDate);
    ensureDay(viewingDate);
    dayCache[viewingDate].tasks = dayCache[viewingDate].tasks.map(x=>({...x,done:false}));
    saveDay(viewingDate); renderTasks(); showToast(lang==='ar'?'تم إعادة التعيين 🌅':'Day reset 🌅');
  });
});

qsa('.fcat-pill').forEach(btn=>{
  btn.addEventListener('click',()=>{
    activeCatFilter=btn.dataset.fcat;
    qsa('.fcat-pill').forEach(b=>{
      b.className='fcat-pill';
      if(b.dataset.fcat===activeCatFilter) b.classList.add(activeCatFilter==='all'?'active-all':`active-${activeCatFilter}`);
    });
    renderTasks();
  });
});

// ── Custom Habit Modal ────────────────────────────────────────────
$('addHabitBtn').addEventListener('click',()=>{
  $('habitNameInp').value='';
  $('habitModal').classList.add('open');
});
$('habitCancelBtn').addEventListener('click',()=>$('habitModal').classList.remove('open'));
$('habitModal').addEventListener('click',e=>{if(e.target===$('habitModal'))$('habitModal').classList.remove('open');});
$('habitSaveBtn').addEventListener('click',()=>{
  const v=sanitizeText($('habitNameInp').value,60); if(!v)return;
  if(v.length < 1){ showToast(lang==='ar'?'أدخل اسماً':'Enter a name'); return; }
  const cat=$('habitCatInp').value||'personal';
  if(!['work','sport','personal','health','prayer'].includes(cat)){ return; } // guard against invalid category
  const rl=checkRL('add_habit','data'); if(!rl.ok){showToast(`Wait ${rl.wait}s`);return;}
  // Guard: max 50 custom tasks
  if(customTasks.length >= 50){ showToast(lang==='ar'?'وصلت الحد الأقصى للعادات':'Max 50 habits reached'); return; }
  const newTask={id:'ct'+Date.now(),label:{en:v,ar:v},done:false,fixed:false,cat,custom:true};
  customTasks.push(newTask);
  saveCfg('customTasks',customTasks);
  ensureDay(viewingDate);
  dayCache[viewingDate].tasks.push({...newTask,done:false});
  saveDay(viewingDate); renderTasks(); $('habitModal').classList.remove('open');
  showToast(lang==='ar'?'تم إضافة العادة ✅':'Habit added ✅');
});
$('habitNameInp').addEventListener('keydown',e=>{if(e.key==='Enter')$('habitSaveBtn').click();});

// ── Steps ─────────────────────────────────────────────────────────
const renderSteps = () => {
  const day=getDay(viewingDate);
  const steps=day.steps||0;
  $('stepsCount').textContent=steps.toLocaleString();
  $('stepsTargetInput').value=stepsTarget;
  const circ=2*Math.PI*36, pct=Math.min(steps/stepsTarget,1);
  $('stepsRing').style.strokeDashoffset=circ-circ*pct;
  $('stepsRing').style.stroke='var(--text)';
  const rem=stepsTarget-steps;
  $('stepsRemaining').textContent=rem>=0?`${rem.toLocaleString()} ${t('stepsRemaining')}`:`${Math.abs(rem).toLocaleString()} ${t('stepsOver')}`;
  $('stepsRemaining').style.color=rem<0?'var(--danger)':'var(--text2)';
};

$('logStepsBtn').addEventListener('click',()=>{
  const v=sanitizeInt($('stepsInput').value,0,99999);
  if(v===null){showToast(lang==='ar'?'أدخل رقمًا':'Enter a number');return;}
  ensureDay(viewingDate);
  dayCache[viewingDate].steps=v;
  saveDay(viewingDate); renderSteps();
  $('stepsInput').value='';
  showToast(lang==='ar'?`${v.toLocaleString()} خطوة ✅`:`${v.toLocaleString()} steps ✅`);
});

$('stepsTargetInput').addEventListener('change',e=>{
  const v=sanitizeInt(e.target.value,100,99999);
  if(v){ stepsTarget=v; saveCfg('stepsTarget',stepsTarget); renderSteps();
    showToast(lang==='ar'?`الهدف: ${v.toLocaleString()} خطوة`:`Goal: ${v.toLocaleString()} steps`);
  }
});
$('stepsInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('logStepsBtn').click();});
