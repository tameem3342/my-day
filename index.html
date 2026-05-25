// ── يومي — Weight Tracker & SVG Line Chart
// ── Weight Tracker ────────────────────────────────────────────────
const renderWeightLog = () => {
  const list=$('wtList'), empty=$('wtEmpty'), cur=$('wtCurrentVal'), unitEl=$('wtUnit');
  if(!list) return;
  list.innerHTML='';

  if(!weightLog.length){
    if(empty) empty.style.display='block';
    if(cur) cur.textContent='—';
    drawWeightLineChart([]);
    return;
  }
  if(empty) empty.style.display='none';
  const last=weightLog[weightLog.length-1];
  if(cur) cur.textContent=last.val;
  if(unitEl) unitEl.textContent=last.unit||'kg';

  // Draw SVG line chart
  drawWeightLineChart(weightLog);

  // History list (latest first, up to 8)
  weightLog.slice().reverse().slice(0,8).forEach((w,i)=>{
    const arr = weightLog.slice().reverse();
    const prev = arr[i+1];
    const diff = prev ? (w.val - prev.val).toFixed(1) : null;
    const diffHtml = diff!==null
      ? `<span style="font-size:.7rem;font-weight:600;color:${+diff>0?'var(--danger)':+diff<0?'var(--success)':'var(--text3)'};">${+diff>0?'▲':'▼'} ${Math.abs(diff)}</span>`
      : '';
    const row=document.createElement('div');
    row.className='weight-row';
    row.innerHTML=`
      <div class="weight-dot"></div>
      <span style="font-size:.84rem;font-weight:600;flex:1;">${w.val} <span style="font-weight:400;color:var(--text3);font-size:.78rem;">${w.unit||'kg'}</span></span>
      ${diffHtml}
      <span style="font-size:.7rem;color:var(--text3);">${w.dateLabel||w.dateKey||''}</span>
      <button class="delbtn wt-del" data-wid="${w.id}" style="opacity:0;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    row.addEventListener('mouseenter',()=>row.querySelector('.wt-del').style.opacity='1');
    row.addEventListener('mouseleave',()=>row.querySelector('.wt-del').style.opacity='0');
    list.appendChild(row);
  });
  list.querySelectorAll('.wt-del').forEach(btn=>{
    btn.addEventListener('click',()=>{
      weightLog=weightLog.filter(w=>w.id!==btn.dataset.wid);
      saveWeightLog(); renderWeightLog();
    });
  });
};

// ── SVG Line Chart for Weight ─────────────────────────────────────
function drawWeightLineChart(data) {
  const svg = document.getElementById('wtLineChart');
  const emptyTxt = document.getElementById('wtChartEmpty');
  if(!svg) return;

  // Clear previous paths/circles/labels (keep defs)
  [...svg.querySelectorAll('.wt-line,.wt-dot,.wt-label,.wt-area,.wt-grid')].forEach(el=>el.remove());

  const pts = data.slice(-20); // last 20 entries
  if(pts.length < 2) {
    if(emptyTxt) emptyTxt.style.display = pts.length===0 ? 'block' : 'none';
    return;
  }
  if(emptyTxt) emptyTxt.style.display = 'none';

  const W = svg.clientWidth || 300;
  const H = 90;
  const PAD = { top:12, right:8, bottom:22, left:32 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top  - PAD.bottom;

  const vals = pts.map(p=>p.val);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const xOf = i => PAD.left + (i / (pts.length-1)) * cw;
  const yOf = v => PAD.top  + ch - ((v - minV) / range) * ch;

  // Grid lines (2)
  [minV, maxV].forEach(v=>{
    const y = yOf(v);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('class','wt-grid');
    line.setAttribute('x1', PAD.left); line.setAttribute('x2', W - PAD.right);
    line.setAttribute('y1', y); line.setAttribute('y2', y);
    line.setAttribute('stroke','var(--border)'); line.setAttribute('stroke-width','1');
    line.setAttribute('stroke-dasharray','3,3');
    svg.insertBefore(line, svg.firstChild);
    // Y label
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('class','wt-grid');
    txt.setAttribute('x', PAD.left - 4); txt.setAttribute('y', y+4);
    txt.setAttribute('text-anchor','end'); txt.setAttribute('font-size','9');
    txt.setAttribute('fill','var(--text3)'); txt.setAttribute('font-family','inherit');
    txt.textContent = v.toFixed(1);
    svg.appendChild(txt);
  });

  // Area fill
  const areaD = pts.map((p,i)=>`${i===0?'M':'L'}${xOf(i)},${yOf(p.val)}`).join(' ')
    + ` L${xOf(pts.length-1)},${H-PAD.bottom} L${xOf(0)},${H-PAD.bottom} Z`;
  const area = document.createElementNS('http://www.w3.org/2000/svg','path');
  area.setAttribute('class','wt-area');
  area.setAttribute('d', areaD);
  area.setAttribute('fill','var(--accent)'); area.setAttribute('opacity','0.07');
  svg.appendChild(area);

  // Line
  const lineD = pts.map((p,i)=>`${i===0?'M':'L'}${xOf(i)},${yOf(p.val)}`).join(' ');
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('class','wt-line');
  path.setAttribute('d', lineD);
  path.setAttribute('fill','none');
  path.setAttribute('stroke','var(--accent)'); path.setAttribute('stroke-width','2');
  path.setAttribute('stroke-linecap','round'); path.setAttribute('stroke-linejoin','round');
  svg.appendChild(path);

  // Dots + X labels (show first, last, and every ~4th)
  pts.forEach((p,i)=>{
    const x=xOf(i), y=yOf(p.val);
    const isLast = i===pts.length-1;
    const showLabel = isLast || i===0 || (pts.length>4 && i%(Math.ceil(pts.length/4))===0);

    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('class','wt-dot');
    circle.setAttribute('cx',x); circle.setAttribute('cy',y);
    circle.setAttribute('r', isLast ? '4' : '2.5');
    circle.setAttribute('fill', isLast ? 'var(--accent)' : 'var(--surface)');
    circle.setAttribute('stroke','var(--accent)'); circle.setAttribute('stroke-width','2');
    svg.appendChild(circle);

    if(showLabel) {
      const lbl = document.createElementNS('http://www.w3.org/2000/svg','text');
      lbl.setAttribute('class','wt-label');
      lbl.setAttribute('x', x); lbl.setAttribute('y', H - PAD.bottom + 14);
      lbl.setAttribute('text-anchor','middle'); lbl.setAttribute('font-size','9');
      lbl.setAttribute('fill', isLast ? 'var(--text)' : 'var(--text3)');
      lbl.setAttribute('font-family','inherit');
      lbl.textContent = p.dateLabel || p.dateKey?.slice(5) || '';
      svg.appendChild(lbl);
    }
  });
}

$('wtLogBtn').addEventListener('click',()=>{
  const val=parseFloat($('wtInput').value);
  if(!val||val<20||val>300){showToast('Enter a valid weight (20–300)');return;}
  const unit=$('wtUnitSel').value;
  const now=new Date();
  const dateKey=now.toISOString().slice(0,10);
  const dateLabel=now.toLocaleDateString(lang==='ar'?'ar-SA':'en-US',{month:'short',day:'numeric'});
  weightLog.push({id:'w'+Date.now(),val:Math.round(val*10)/10,unit,dateKey,dateLabel});
  saveWeightLog(); $('wtInput').value=''; renderWeightLog();
  showToast(`✅ ${val} ${unit} logged`);
});
$('wtInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('wtLogBtn').click();});

// ── Day Edit Modal ────────────────────────────────────────────────
const openWpModal=(dk,dayIdx)=>{
  wpModalDay=dk;
  const day=weekPlan[dk]||{};
  const dayName=lang==='ar'?DAYS_AR[dayIdx]:DAYS_EN[dayIdx];
  $('wmTitle').textContent=dayName;
  $('wmRestChk').checked=!!day.rest;
  $('wmFocus').value=day.focus||'';
  $('wmNotes').value=day.notes||'';
  $('workoutModal').classList.add('open');
  setTimeout(()=>$('wmFocus').focus(),80);
};
$('closeWorkoutModal').addEventListener('click',()=>$('workoutModal').classList.remove('open'));
$('workoutModal').addEventListener('click',e=>{if(e.target===$('workoutModal'))$('workoutModal').classList.remove('open');});
$('wmSaveBtn').addEventListener('click',()=>{
  if(!wpModalDay)return;
  if(!weekPlan[wpModalDay])weekPlan[wpModalDay]={exercises:[]};
  weekPlan[wpModalDay].rest=  $('wmRestChk').checked;
  weekPlan[wpModalDay].focus= sanitizeText($('wmFocus').value,60);
  weekPlan[wpModalDay].notes= sanitizeText($('wmNotes').value,300);
  saveWeekPlan();
  $('workoutModal').classList.remove('open');
  renderWpGrid(); renderWpExList();
  showToast('Saved ✅');
});
