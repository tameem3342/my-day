// ── يومي — Notes, History Log & Week Stats
// ── Log ───────────────────────────────────────────────────────────
const renderLog = () => {
  const list=$('logList'), empty=$('emptyLog'), counter=$('logCount');
  // Remove old month groups
  list.querySelectorAll('.log-month-group').forEach(g=>g.remove());

  const entries = Object.keys(dayCache)
    .filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k))
    .sort((a,b) => b.localeCompare(a));

  if(!entries.length){ empty.style.display='block'; counter.textContent=''; return; }
  empty.style.display='none';
  counter.textContent = `${entries.length} ${t('logDays')}`;

  // Group by YYYY-MM
  const groups = {};
  entries.forEach(date => {
    const ym = date.slice(0,7);
    if(!groups[ym]) groups[ym] = [];
    groups[ym].push(date);
  });

  Object.keys(groups).sort((a,b)=>b.localeCompare(a)).forEach(ym => {
    const [yr, mo] = ym.split('-');
    const monthName = new Date(`${ym}-01T12:00:00`)
      .toLocaleDateString(lang==='ar'?'ar-SA':'en-US', {month:'long', year:'numeric'});

    const group = document.createElement('div');
    group.className = 'log-month-group';

    const monthLabel = document.createElement('div');
    monthLabel.className = 'log-month-label';
    monthLabel.textContent = monthName;
    group.appendChild(monthLabel);

    const cardsWrap = document.createElement('div');
    cardsWrap.style.cssText = 'display:flex;flex-direction:column;gap:.5rem;';
    group.appendChild(cardsWrap);

    groups[ym].forEach(date => {
      const d = dayCache[date]; if(!d) return;
      const isToday = date === todayKey();
      const dt = new Date(date + 'T12:00:00');
      const dayNum  = dt.getDate();
      const dayName = dt.toLocaleDateString(lang==='ar'?'ar-SA':'en-US', {weekday:'short'});

      const done  = d.tasks.filter(x=>x.done).length;
      const total = d.tasks.length;
      const kcal  = (d.meals||[]).reduce((s,m)=>s+m.kcal, 0);
      const steps = d.steps || 0;
      const pct   = total ? Math.round(done/total*100) : 0;

      // Meal thumbnails (up to 3)
      const thumbs = (d.meals||[]).filter(m=>m.img).slice(0,3);
      const thumbsHtml = thumbs.map(m =>
        `<img src="${safeImgSrc(m.img)}" style="width:26px;height:26px;border-radius:6px;object-fit:cover;border:1px solid var(--border);" />`
      ).join('');

      const card = document.createElement('div');
      card.className = 'log-day-card';
      card.innerHTML = `
        <div class="log-day-hdr">
          <!-- Day number box -->
          <div class="log-day-num ${isToday?'is-today':''}">
            <span style="font-size:.58rem;font-weight:700;color:var(--text3);text-transform:uppercase;">${dayName}</span>
            <span style="font-size:1rem;font-weight:800;color:var(--text);">${dayNum}</span>
          </div>
          <!-- Stats -->
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.3rem;">
              ${isToday?`<span class="log-stat-pill" style="">Today</span>`:''}
              <span class="log-stat-pill">✓ ${done}/${total}</span>
              ${kcal?`<span class="log-stat-pill">🔥 ${kcal} kcal</span>`:''}
              ${steps?`<span class="log-stat-pill">👟 ${steps.toLocaleString()}</span>`:''}
            </div>
            <!-- Progress bar -->
            <div class="log-prog-bar" style="width:min(160px,100%);">
              <div class="log-prog-fill" style="width:${pct}%;"></div>
            </div>
          </div>
          <!-- Meal thumbs + actions -->
          <div style="display:flex;align-items:center;gap:.4rem;flex-shrink:0;">
            ${thumbsHtml ? `<div style="display:flex;gap:2px;">${thumbsHtml}</div>` : ''}
            <button class="btn btn-ghost log-goto-btn" data-date="${date}" title="Open day" style="font-size:.72rem;padding:.28rem .6rem;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button class="delbtn log-del-btn" data-date="${date}" style="opacity:.5;width:28px;height:28px;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <!-- Expandable body -->
        <div class="log-day-body" id="logb-${date}">
          ${(d.meals||[]).length ? `
            <div style="margin-bottom:.7rem;">
              <div class="slabel" style="margin-bottom:.4rem;">🍽️ Meals</div>
              <div style="display:flex;flex-direction:column;gap:.25rem;">
                ${(d.meals||[]).map(m=>`
                  <div style="display:flex;align-items:center;gap:.5rem;font-size:.78rem;">
                    ${m.img?`<img src="${safeImgSrc(m.img)}" style="width:22px;height:22px;border-radius:5px;object-fit:cover;"/>`:'<span style="width:22px;text-align:center;">🍴</span>'}
                    <span style="flex:1;color:var(--text2);">${esc(m.name)}</span>
                    <span style="font-weight:700;color:var(--amber);">${m.kcal} kcal</span>
                  </div>`).join('')}
              </div>
            </div>` : ''}
          ${(d.tasks||[]).filter(x=>x.done).length ? `
            <div style="margin-bottom:.7rem;">
              <div class="slabel" style="margin-bottom:.4rem;">✅ Completed Tasks</div>
              <div style="display:flex;flex-wrap:wrap;gap:.3rem;">
                ${(d.tasks||[]).filter(x=>x.done).map(x=>{
                  const lbl=typeof x.label==='object'?(x.label[lang]||x.label.en):x.label;
                  return `<span style="font-size:.72rem;padding:.15rem .5rem;border-radius:99px;background:var(--surface2);color:var(--text2);border:1px solid var(--border);">${esc(lbl)}</span>`;
                }).join('')}
              </div>
            </div>` : ''}
          ${d.notes?.workout||d.notes?.general||d.notes?.food ? `
            <div>
              <div class="slabel" style="margin-bottom:.4rem;">📝 Notes</div>
              ${d.notes?.workout?`<p style="font-size:.78rem;color:var(--text2);margin-bottom:.25rem;">🏋️ ${esc(d.notes.workout.replace(/<[^>]*>/g,'').slice(0,120))}</p>`:''}
              ${d.notes?.general?`<p style="font-size:.78rem;color:var(--text2);margin-bottom:.25rem;">📝 ${esc(d.notes.general.replace(/<[^>]*>/g,'').slice(0,120))}</p>`:''}
              ${d.notes?.food?`<p style="font-size:.78rem;color:var(--text2);">🥗 ${esc(d.notes.food.replace(/<[^>]*>/g,'').slice(0,120))}</p>`:''}
            </div>` : ''}
        </div>`;

      cardsWrap.appendChild(card);

      // Toggle expand
      card.querySelector('.log-day-hdr').addEventListener('click', e => {
        if(e.target.closest('.log-del-btn')||e.target.closest('.log-goto-btn')) return;
        card.querySelector('.log-day-body').classList.toggle('open');
      });

      // Go to day button
      card.querySelector('.log-goto-btn').addEventListener('click', e => {
        e.stopPropagation();
        viewingDate = date;
        switchTab('today');
        renderCalBar(); renderAll(); updatePastBanner();
      });

      // Delete
      card.querySelector('.log-del-btn').addEventListener('click', e => {
        e.stopPropagation();
        showConfirm(t('delDay'),'',t('confirmYes'),t('confirmNo'),()=>{
          auditLog('delete_day', date);
          delete dayCache[date];
          LS.del(`zn_day_${date}`);
          renderLog(); renderCalBar();
        });
      });
    });

    list.appendChild(group);
  });
};

// ── Week Stats ────────────────────────────────────────────────────
const renderWeekStats = () => {
  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const key=d.toISOString().slice(0,10);
    const dayShort=d.toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{weekday:'short'});
    days.push({key,dayShort,entry:dayCache[key]||null});
  }
  const withData=days.filter(d=>d.entry);
  const avgTasks=withData.length?Math.round(withData.map(d=>d.entry.tasks.filter(x=>x.done).length/Math.max(d.entry.tasks.length,1)*100).reduce((a,b)=>a+b,0)/withData.length):0;
  const avgCal=withData.length?Math.round(withData.map(d=>d.entry.meals.reduce((s,m)=>s+m.kcal,0)).reduce((a,b)=>a+b,0)/withData.length):0;
  let bestDay=null, bestPct=0;
  withData.forEach(d=>{
    const pct=d.entry.tasks.filter(x=>x.done).length/Math.max(d.entry.tasks.length,1)*100;
    if(pct>bestPct){bestPct=pct;bestDay=d;}
  });
  $('wAvgTasks').textContent=withData.length?avgTasks+'%':'—';
  $('wAvgCal').textContent=withData.length?avgCal.toLocaleString():'—';
  $('wBestDay').textContent=bestDay?bestDay.dayShort:'—';

  const maxTask=Math.max(...days.map(d=>d.entry?d.entry.tasks.length:0),1);
  const maxCal =Math.max(...days.map(d=>d.entry?d.entry.meals.reduce((s,m)=>s+m.kcal,0):0),1);

  $('wTaskChart').innerHTML=''; $('wTaskChartLabels').innerHTML='';
  $('wCalChart').innerHTML='';  $('wCalChartLabels').innerHTML='';

  days.forEach(d=>{
    const isTd=d.key===todayKey();
    const done=d.entry?d.entry.tasks.filter(x=>x.done).length:0;
    const total=d.entry?d.entry.tasks.length:0;
    const h=Math.round(total?done/total*80:0);
    const bt=document.createElement('div'); bt.className='wbar-wrap';
    bt.innerHTML=`<div class="wbar-val" style="color:var(--text2);">${done||''}</div><div class="wbar-bg"><div class="wbar-fill" style="height:${h}px;background:${isTd?'var(--accent)':'var(--surface3)'};"></div></div>`;
    $('wTaskChart').appendChild(bt);
    const lt=document.createElement('div'); lt.className='wbar-wrap';
    lt.innerHTML=`<div class="wbar-lbl" style="color:${isTd?'var(--text)':'var(--text3)'};">${d.dayShort}</div>`;
    $('wTaskChartLabels').appendChild(lt);

    const kcal=d.entry?d.entry.meals.reduce((s,m)=>s+m.kcal,0):0;
    const hc=Math.round(kcal/maxCal*80);
    const over=d.entry&&kcal>calTarget;
    const bc=document.createElement('div'); bc.className='wbar-wrap';
    bc.innerHTML=`<div class="wbar-val" style="color:var(--text2);">${kcal>0?kcal.toLocaleString():''}</div><div class="wbar-bg"><div class="wbar-fill" style="height:${hc}px;background:${over?'var(--danger)':isTd?'var(--accent)':'var(--surface3)'};"></div></div>`;
    $('wCalChart').appendChild(bc);
    const lc=document.createElement('div'); lc.className='wbar-wrap';
    lc.innerHTML=`<div class="wbar-lbl" style="color:${isTd?'var(--text)':'var(--text3)'};">${d.dayShort}</div>`;
    $('wCalChartLabels').appendChild(lc);
  });

  const catTotals={work:{done:0,total:0},sport:{done:0,total:0},personal:{done:0,total:0},health:{done:0,total:0}};
  days.forEach(d=>{
    if(!d.entry)return;
    Object.keys(catTotals).forEach(cat=>{
      catTotals[cat].done  += d.entry.tasks.filter(x=>x.cat===cat&&x.done).length;
      catTotals[cat].total += d.entry.tasks.filter(x=>x.cat===cat).length;
    });
  });
  const catColors={work:'var(--text)',sport:'var(--text)',personal:'var(--text)',health:'var(--text)'};
  const catIcons ={work:'💼',sport:'🏃',personal:'🌱',health:'💊'};
  $('wCatBreakdown').innerHTML=Object.entries(catTotals).map(([cat,{done,total}])=>{
    const pct=total?Math.round(done/total*100):0;
    return `<div><div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:.3rem;"><span>${catIcons[cat]} ${CAT_LABELS(cat)}</span><span style="font-weight:700;">${pct}%</span></div><div class="pbar"><div style="height:100%;border-radius:99px;background:var(--accent);width:${pct}%;transition:width .5s cubic-bezier(.4,0,.2,1);"></div></div></div>`;
  }).join('');
};

// ── Confirm dialog ────────────────────────────────────────────────
let _cb=null;
const showConfirm = (msg,sub,ok,cancel,cb) => {
  $('confirmMsg').textContent=msg; $('confirmSub').textContent=sub;
  $('confirmOk').textContent=ok;   $('confirmCancel').textContent=cancel;
  _cb=cb; $('confirmDialog').classList.add('open');
};
$('confirmOk').addEventListener('click',()=>{ $('confirmDialog').classList.remove('open'); if(_cb){_cb();_cb=null;} });
$('confirmCancel').addEventListener('click',()=>{ $('confirmDialog').classList.remove('open'); _cb=null; });
$('confirmDialog').addEventListener('click',e=>{ if(e.target===$('confirmDialog')){$('confirmDialog').classList.remove('open');_cb=null;} });

// ── Toast ─────────────────────────────────────────────────────────
let _tt=null;
const showToast = (msg, html=false) => {
  const el=$('toast');
  if(html) el.innerHTML=msg; else el.textContent=msg;
  el.style.opacity='1'; el.style.transform='translateX(-50%) translateY(0)';
  clearTimeout(_tt);
  _tt=setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateX(-50%) translateY(80px)'; if(html) el.textContent=''; },2800);
};
