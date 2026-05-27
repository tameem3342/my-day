// ── يومي — Health Calculations: BMI, TDEE, onboarding, weekly achievements
// ── BMI helpers ──────────────────────────────────────────────────
function calcBMI(wKg, hCm) {
  const h = hCm / 100;
  return wKg / (h * h);
}
function bmiLabel(bmi) {
  if(bmi < 18.5) return { ar:'نقص وزن', en:'Underweight', color:'var(--blue)' };
  if(bmi < 25)   return { ar:'طبيعي',    en:'Normal',      color:'var(--success)' };
  if(bmi < 30)   return { ar:'زيادة وزن',en:'Overweight',  color:'var(--amber)' };
  return           { ar:'سمنة',      en:'Obese',        color:'var(--danger)' };
}

// ── Calorie Calculator (Harris-Benedict) ─────────────────────────
let _ccSelectedGoal = null; // 'lose' | 'maintain' | 'gain'

function calcBMR(wKg, hCm, age, isMale) {
  if(isMale) return 88.362 + (13.397*wKg) + (4.799*hCm) - (5.677*age);
  return       447.593 + (9.247*wKg) + (3.098*hCm) - (4.330*age);
}

function calcCalories() {
  const w    = parseFloat(document.getElementById('ccWeight')?.value);
  const h    = parseFloat(document.getElementById('ccHeight')?.value);
  const age  = parseFloat(document.getElementById('ccAge')?.value);
  const gen  = document.getElementById('ccGender')?.value;
  const act  = parseFloat(document.getElementById('ccActivity')?.value) || 1.55;
  const res  = document.getElementById('ccResult');
  const hint = document.getElementById('ccHint');
  if(!w||!h||!age||w<30||h<100||age<10) {
    if(res)  res.style.display  = 'none';
    if(hint) hint.style.display = 'block';
    return;
  }
  const bmr  = calcBMR(w, h, age, gen!=='f');
  const tdee = Math.round(bmr * act);
  if(document.getElementById('ccLose'))     document.getElementById('ccLose').textContent     = (tdee-500).toLocaleString();
  if(document.getElementById('ccMaintain')) document.getElementById('ccMaintain').textContent = tdee.toLocaleString();
  if(document.getElementById('ccGain'))     document.getElementById('ccGain').textContent     = (tdee+300).toLocaleString();
  // Save to config so onboarding can use
  saveCfg('bodyHeight', h); saveCfg('bodyGender', gen); saveCfg('bodyAge', age);
  if(res)  res.style.display  = 'block';
  if(hint) hint.style.display = 'none';
  // Reset selection when inputs change
  _ccSelectedGoal = null;
  ['ccCardLose','ccCardMaintain','ccCardGain'].forEach(id=>{
    const c=document.getElementById(id); if(!c)return;
    c.style.border='1.5px solid var(--border)';
    c.style.background='var(--surface2)';
    c.style.boxShadow='none';
  });
  const applyBtn=document.getElementById('ccApplyBtn');
  const applyLabel=document.getElementById('ccApplyLabel');
  if(applyBtn){applyBtn.style.opacity='.4';applyBtn.style.pointerEvents='none';}
  if(applyLabel) applyLabel.textContent='Select a goal first';
}


function ccSelectGoal(goal) {
  _ccSelectedGoal = goal;

  // Highlight selected card
  const colors = { lose: 'var(--danger)', maintain: 'var(--amber)', gain: 'var(--success)' };
  const labels = { lose: 'Lose', maintain: 'Maintain', gain: 'Gain' };
  ['lose','maintain','gain'].forEach(g => {
    const card = document.getElementById('ccCard' + g.charAt(0).toUpperCase() + g.slice(1));
    if(!card) return;
    if(g === goal) {
      card.style.border    = `2px solid ${colors[g]}`;
      card.style.background = 'var(--surface)';
      card.style.boxShadow  = `0 0 0 3px ${colors[g]}22`;
    } else {
      card.style.border     = '1.5px solid var(--border)';
      card.style.background = 'var(--surface2)';
      card.style.boxShadow  = 'none';
    }
  });

  // Get the value for selected goal
  const valEl = document.getElementById('cc' + goal.charAt(0).toUpperCase() + goal.slice(1));
  const val   = valEl ? valEl.textContent : '—';

  // Enable Apply button + update label
  const applyBtn   = document.getElementById('ccApplyBtn');
  const applyLabel = document.getElementById('ccApplyLabel');
  if(applyBtn)   { applyBtn.style.opacity = '1'; applyBtn.style.pointerEvents = 'auto'; }
  if(applyLabel) applyLabel.textContent = `Apply ${labels[goal]}: ${val} kcal`;
}

function ccApplyTarget() {
  if(!_ccSelectedGoal) return;
  const idMap = { lose:'ccLose', maintain:'ccMaintain', gain:'ccGain' };
  const raw = document.getElementById(idMap[_ccSelectedGoal])?.textContent?.replace(/,/g,'');
  const kcal = parseInt(raw);
  if(!kcal) return;
  calTarget = kcal;
  saveCfg('calTarget', calTarget);
  const inp = document.getElementById('calTargetInput');
  if(inp) inp.value = kcal;
  renderMeals();
  const goalEmoji = { lose:'📉', maintain:'⚖️', gain:'💪' }[_ccSelectedGoal];
  showToast(`✅ ${goalEmoji} ${kcal.toLocaleString()} kcal ${lang==='ar'?'تم تطبيقه كهدف':'set as target'}`);
}

// Keep calcTDEE for onboarding
function calcTDEE(weightKg, heightCm, age, isMale, goal) {
  const bmr  = calcBMR(weightKg, heightCm, age, isMale);
  const tdee = Math.round(bmr * 1.375);
  if(goal==='lose') return Math.round(tdee-500);
  if(goal==='gain') return Math.round(tdee+300);
  return tdee;
}
function idealWeight(heightCm, isMale) {
  const inches = (heightCm - 152.4) / 2.54;
  return Math.round(((isMale?50:45.5) + 2.3*inches)*10)/10;
}
// stub — no longer used but referenced in loadBodyInfo
function updateBodyFat() {}

// ── Onboarding Questionnaire ─────────────────────────────────────
let _obGoal = null;
let _obActivity = 1.55; // default moderate
const OB_TOTAL = 7; // steps 0-6

// Helper: compute TDEE preview from current inputs
function obGetNums() {
  const w    = parseFloat(document.getElementById('obWeight')?.value);
  const h    = parseFloat(document.getElementById('obHeight')?.value);
  const a    = parseFloat(document.getElementById('obAge')?.value);
  const g    = document.getElementById('obGender')?.value || 'm';
  const unit = document.getElementById('obWeightUnit')?.value || 'kg';
  const wKg  = unit==='lbs' ? w*0.453592 : w;
  return { w, h, a, g, wKg, isMale: g!=='f' };
}

// Live calc shown on goal buttons (step 3)
function obLiveCalc() {
  const { wKg, h, a, isMale } = obGetNums();
  if(!wKg||!h||!a||wKg<30||h<100||a<10) return;
  const bmrLive = calcBMR(wKg, h, a, isMale);
  const tdee = Math.round(bmrLive * (_obActivity||1.55));
  const lose     = (tdee - 500).toLocaleString();
  const maintain = tdee.toLocaleString();
  const gain     = (tdee + 300).toLocaleString();
  const lp = document.getElementById('obLosePrev');
  const mp = document.getElementById('obMaintainPrev');
  const gp = document.getElementById('obGainPrev');
  if(lp) lp.textContent = lose + ' kcal';
  if(mp) mp.textContent = maintain + ' kcal';
  if(gp) gp.textContent = gain + ' kcal';
}

function obShowStep(n) {
  const total = OB_TOTAL;
  for(let i=0;i<total;i++){
    const s=document.getElementById('obStep'+i);
    if(s) s.style.display = i===n ? 'block' : 'none';
  }
  const bar   = document.getElementById('obProgressBar');
  const label = document.getElementById('obStepLabel');
  if(bar)   bar.style.width = ((n/(total-1))*100)+'%';
  if(label) label.textContent = `الخطوة ${n+1} من ${total}`;
  // Update live calorie previews when reaching goal step (now step 5)
  if(n===5) obLiveCalc();
}

function obNext(step) {
  if(step === 0) {
    const w = parseFloat(document.getElementById('obWeight')?.value);
    if(!w||w<30||w>300){ showToast('⚠️ أدخل وزناً صحيحاً'); return; }
    obShowStep(1);
  } else if(step === 1) {
    // target weight — optional, just proceed
    obShowStep(2);
  } else if(step === 2) {
    const h = parseFloat(document.getElementById('obHeight')?.value);
    if(!h||h<100||h>250){ showToast('⚠️ أدخل طولاً صحيحاً'); return; }
    obShowStep(3);
  } else if(step === 3) {
    const a = parseFloat(document.getElementById('obAge')?.value);
    if(!a||a<10||a>100){ showToast('⚠️ أدخل عمراً صحيحاً'); return; }
    obShowStep(4); // activity
  } else if(step === 4) {
    if(!_obActivity){ showToast('⚠️ اختر مستوى نشاطك أولاً'); return; }
    obShowStep(5); // goal
  } else if(step === 5) {
    if(!_obGoal){ showToast('⚠️ اختر هدفك أولاً'); return; }
    // Compute and show results
    const { wKg, h, a, isMale } = obGetNums();
    const bmr   = calcBMR(wKg, h, a, isMale);
    const tdee  = Math.round(bmr * _obActivity);
    const final = _obGoal==='lose' ? tdee-500 : _obGoal==='gain' ? tdee+300 : tdee;
    const ideal = idealWeight(h, isMale);
    const goalLabels = { lose:'📉 إنقاص الوزن', maintain:'⚖️ الحفاظ على الوزن', gain:'💪 زيادة العضل' };
    // ETA calculation
    const targetW = parseFloat(document.getElementById('obTargetWeight')?.value);
    const etaEl   = document.getElementById('obResultETA');
    const etaUnit = document.getElementById('obResultETAUnit');
    if(etaEl) {
      if(targetW && targetW > 0 && Math.abs(targetW - wKg) > 0.5) {
        const diff = Math.abs(targetW - wKg); // kg difference
        // ~0.5kg/week deficit of 500kcal, ~0.3kg/week surplus of 300kcal
        const weeklyRate = _obGoal==='lose' ? 0.5 : _obGoal==='gain' ? 0.3 : 0;
        if(weeklyRate > 0) {
          const weeks = Math.round(diff / weeklyRate);
          if(weeks >= 4) {
            etaEl.textContent = Math.round(weeks / 4.33);
            if(etaUnit) etaUnit.textContent = 'شهر تقريباً';
          } else {
            etaEl.textContent = weeks;
            if(etaUnit) etaUnit.textContent = 'أسبوع تقريباً';
          }
        } else {
          etaEl.textContent = '—';
          if(etaUnit) etaUnit.textContent = 'الوزن ثابت';
        }
      } else {
        etaEl.textContent = '—';
        if(etaUnit) etaUnit.textContent = 'لم يُحدد';
      }
    }
    // Fill results
    document.getElementById('obResultCal').textContent   = final.toLocaleString();
    document.getElementById('obResultTDEE').textContent  = tdee.toLocaleString();
    document.getElementById('obResultIdeal').textContent = ideal;
    const badge = document.getElementById('obGoalBadge');
    if(badge) badge.textContent = goalLabels[_obGoal]||'';
    obShowStep(6);
  }
}

function obBack(step) { obShowStep(step - 1); }

function obSelectGoal(btn) {
  document.querySelectorAll('#obStep5 .ob-goal-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  _obGoal = btn.dataset.goal;
  const nb = document.getElementById('obGoalNextBtn');
  if(nb){ nb.style.opacity='1'; nb.style.pointerEvents='auto'; }
}

function obSelectActivity(btn) {
  document.querySelectorAll('#obStep4 .ob-goal-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  _obActivity = parseFloat(btn.dataset.act) || 1.55;
  const nb = document.getElementById('obActNextBtn');
  if(nb){ nb.style.opacity='1'; nb.style.pointerEvents='auto'; }
  // Update live previews on goal step too
  obLiveCalc();
}

function obCalcPreview() { obLiveCalc(); }

function obFinish() {
  const { wKg, h, a, isMale, g, w } = obGetNums();
  const unit = document.getElementById('obWeightUnit')?.value || 'kg';
  if(w && h && a && _obGoal) {
    const bmr2  = calcBMR(wKg, h, a, isMale);
    const tdee  = Math.round(bmr2 * _obActivity);
    const final = _obGoal==='lose' ? tdee-500 : _obGoal==='gain' ? tdee+300 : tdee;
    calTarget = final;
    saveCfg('calTarget', calTarget);
    saveCfg('bodyHeight', h);
    saveCfg('bodyGender', g);
    saveCfg('bodyAge', a);
    saveCfg('bodyGoal', _obGoal);
    saveCfg('bodyActivity', _obActivity);
    // Log first weight entry
    const now = new Date();
    const dateKey   = now.toISOString().slice(0,10);
    const dateLabel = now.toLocaleDateString('ar-SA',{month:'short',day:'numeric'});
    if(!weightLog.find(e=>e.dateKey===dateKey)){
      const wVal = unit==='lbs' ? Math.round(wKg*10)/10 : Math.round(w*10)/10;
      weightLog.push({id:'w'+Date.now(), val:wVal, unit:'kg', dateKey, dateLabel});
      saveWeightLog();
    }
    // Pre-fill calorie calc
    const ccW = document.getElementById('ccWeight');
    const ccH = document.getElementById('ccHeight');
    const ccA = document.getElementById('ccAge');
    const ccG = document.getElementById('ccGender');
    if(ccW) ccW.value = Math.round(wKg*10)/10;
    if(ccH) ccH.value = h;
    if(ccA) ccA.value = a;
    if(ccG) ccG.value = g;
    setTimeout(calcCalories, 200);
    // Apply to calorie target input
    const inp = document.getElementById('calTargetInput');
    if(inp) inp.value = final;
    renderMeals(); renderWeightLog();
    showToast(`🎯 هدفك: ${final.toLocaleString()} kcal / يوم`);
  }
  closeOnboarding();
}

function showOnboarding() {
  if(!currentSupaUser) return;
  const key = 'zn_onboarded_' + currentSupaUser.id;
  if(localStorage.getItem(key)) return;
  _obGoal = null;
  _obActivity = 1.55;
  // Reset all selections
  document.querySelectorAll('.ob-goal-btn').forEach(b => b.classList.remove('selected'));
  const nb = document.getElementById('obGoalNextBtn');
  if(nb){ nb.style.opacity='.4'; nb.style.pointerEvents='none'; }
  const ab = document.getElementById('obActNextBtn');
  if(ab){ ab.style.opacity='.4'; ab.style.pointerEvents='none'; }
  const m = document.getElementById('onboardingModal');
  if(m) { m.style.display = 'flex'; obShowStep(0); }
}

// ── Last Week Achievements Card ───────────────────────────────────
function renderLastWeekCard() {
  const card = document.getElementById('lastWeekCard');
  if(!card) return;

  // Build last week's 7 days (Mon–Sun or 7 days ending last Sunday)
  const today = new Date();
  const days = [];
  for(let i=13; i>=7; i--) {
    const d = new Date(today); d.setDate(today.getDate()-i);
    days.push(d.toISOString().slice(0,10));
  }

  // Check if any data exists for last week
  const hasAnyData = days.some(dk => {
    const e = dayCache[dk];
    if(!e) return false;
    return (e.meals&&e.meals.length>0)||(e.steps&&e.steps>0)||(e.tasks&&e.tasks.some(t=>t.done));
  });

  if(!hasAnyData) { card.style.display='none'; return; }
  card.style.display='block';

  // Range label
  const fmt = d => new Date(d+'T12:00:00').toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{month:'short',day:'numeric'});
  const rangeEl = document.getElementById('lastWeekRange');
  if(rangeEl) rangeEl.textContent = fmt(days[0]) + ' – ' + fmt(days[6]);

  // Title
  const titleEl = document.getElementById('lastWeekTitle');
  if(titleEl) titleEl.textContent = lang==='ar' ? 'الأسبوع الماضي' : 'Last Week';

  // Compute stats
  let totalTaskPct=0, totalSteps=0, totalCal=0, daysWithTasks=0, streak=0, tempStreak=0, bestDay='';
  let bestPct=0;
  days.forEach(dk => {
    const day = dayCache[dk];
    const tasks = day?.tasks || [];
    const done = tasks.filter(t=>t.done).length;
    const total = tasks.length;
    const pct = total>0 ? Math.round((done/total)*100) : 0;
    if(total>0) { totalTaskPct+=pct; daysWithTasks++; }
    if(pct>bestPct) { bestPct=pct; bestDay=dk; }
    totalSteps += (day?.steps||0);
    totalCal += (day?.meals||[]).reduce((s,m)=>s+(m.kcal||0),0);
    if(pct===100&&total>0) tempStreak++; else { streak=Math.max(streak,tempStreak); tempStreak=0; }
  });
  streak = Math.max(streak, tempStreak);
  const avgTasks = daysWithTasks>0 ? Math.round(totalTaskPct/daysWithTasks) : 0;
  const avgSteps = Math.round(totalSteps/7/100)*100;
  const avgCal   = Math.round(totalCal/7);
  const bestDayName = bestDay ? new Date(bestDay+'T12:00:00').toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{weekday:'short'}) : '—';

  // Render stats grid
  const statsEl = document.getElementById('lastWeekStats');
  if(statsEl) statsEl.innerHTML = [
    { val: avgTasks+'%',     lbl: lang==='ar'?'متوسط الإنجاز':'Avg Tasks' },
    { val: streak+(lang==='ar'?' أيام':' days'), lbl: lang==='ar'?'أفضل سلسلة':'Best Streak' },
    { val: avgSteps>0 ? (avgSteps>=1000?(avgSteps/1000).toFixed(1)+'k':avgSteps) : '—', lbl: lang==='ar'?'متوسط الخطوات':'Avg Steps' },
    { val: avgCal>0 ? avgCal.toLocaleString()+' kcal' : '—', lbl: lang==='ar'?'متوسط السعرات':'Avg Kcal' },
  ].map(s=>`<div class="lw-stat"><span class="lw-stat-val">${s.val}</span><span class="lw-stat-lbl">${s.lbl}</span></div>`).join('');

  // Badges for achievements
  const badges = [];
  if(avgTasks>=80) badges.push('🏆 ' + (lang==='ar'?'أسبوع ممتاز':'Excellent Week'));
  if(streak>=5)    badges.push('🔥 ' + (lang==='ar'?`${streak} أيام متواصلة`:`${streak}-Day Streak`));
  if(avgSteps>=10000) badges.push('👟 ' + (lang==='ar'?'هدف الخطوات':'Steps Goal'));
  if(bestPct===100)   badges.push('⭐ ' + (lang==='ar'?`أفضل يوم: ${bestDayName}`:`Best: ${bestDayName}`));
  if(badges.length===0 && hasAnyData) badges.push('📈 ' + (lang==='ar'?'استمر، أنت تتقدم!':'Keep going!'));

  const badgesEl = document.getElementById('lastWeekBadges');
  if(badgesEl) badgesEl.innerHTML = badges.map(b=>`<span class="lw-badge">${b}</span>`).join('');
}

// ── Weekly Summary Render ─────────────────────────────────────────
function renderWeeklySummary() {
  const rowsEl = document.getElementById('weekDayRows');
  const rangeEl = document.getElementById('weeklySummaryRange');
  const streakEl = document.getElementById('wSumStreak');
  const avgEl = document.getElementById('wSumAvg');
  const stepsEl = document.getElementById('wSumSteps');
  const calEl = document.getElementById('wSumCal');
  if(!rowsEl) return;

  const DAY_NAMES_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const DAY_NAMES_AR = ['أحد','اثن','ثلا','أرب','خمس','جمع','سبت'];
  const today = new Date();
  const days = [];
  for(let i=6; i>=0; i--) {
    const d = new Date(today); d.setDate(today.getDate()-i);
    days.push(d.toISOString().slice(0,10));
  }

  // Range label
  if(rangeEl) {
    const fmt = d => new Date(d+'T12:00:00').toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{month:'short',day:'numeric'});
    rangeEl.textContent = fmt(days[0]) + ' – ' + fmt(days[6]);
  }

  let totalTaskPct=0, totalSteps=0, totalCal=0, streak=0, tempStreak=0;

  rowsEl.innerHTML = days.map(dk => {
    const day = dayCache[dk];
    const tasks = day?.tasks || [];
    const done = tasks.filter(t=>t.done).length;
    const total = tasks.length;
    const pct = total>0 ? Math.round((done/total)*100) : 0;
    const steps = day?.steps || 0;
    const cal = (day?.meals||[]).reduce((s,m)=>s+(m.kcal||0),0);
    totalTaskPct += pct; totalSteps += steps; totalCal += cal;
    if(pct===100 && total>0) tempStreak++; else { streak=Math.max(streak,tempStreak); tempStreak=0; }
    const d = new Date(dk+'T12:00:00');
    const dayName = lang==='ar' ? DAY_NAMES_AR[d.getDay()] : DAY_NAMES_EN[d.getDay()];
    const isToday = dk===todayKey();
    return `<div class="week-day-row">
      <span class="week-day-name" style="${isToday?'color:var(--text);font-weight:800;':''}">${dayName}</span>
      <div class="week-day-bar-wrap"><div class="week-day-bar" style="width:${pct}%;${pct===100?'background:var(--success);':''}"></div></div>
      <span class="week-day-pct">${total>0?pct+'%':'—'}</span>
      <span class="week-day-steps">${steps>0?(steps>=1000?(steps/1000).toFixed(1)+'k':steps):'—'}</span>
    </div>`;
  }).join('');

  streak = Math.max(streak, tempStreak);
  if(streakEl) streakEl.textContent = streak + (lang==='ar'?' أيام':' days');
  if(avgEl) avgEl.textContent = Math.round(totalTaskPct/7) + '%';
  if(stepsEl) stepsEl.textContent = totalSteps>0 ? (Math.round(totalSteps/7/100)*100).toLocaleString() : '—';
  if(calEl) calEl.textContent = totalCal>0 ? Math.round(totalCal/7).toLocaleString() : '—';
}


// ── Onboarding ───────────────────────────────────────────────────

function closeOnboarding() {
  const key = currentSupaUser ? ('zn_onboarded_' + currentSupaUser.id) : 'zn_onboarded';
  localStorage.setItem(key, '1');
  const m = document.getElementById('onboardingModal');
  if(m) m.style.display = 'none';
  // Refresh UI after onboarding completes
  renderAll();
  renderCalBar();
  renderWeightLog();
  applyTheme();
  applyLang();
}
