// ================================================================
// Restaurants Tab — Add Food Modal
// Requires: restaurants-data.js loaded before this file
// ================================================================

// ── State ────────────────────────────────────────────────────────
let _restViewId = null; // null = grid view, string = restaurant items view

// ── Open restaurants tab ─────────────────────────────────────────
const openRestaurantsTab = () => {
  _restViewId = null;
  renderRestaurantGrid();
  const search = $('restSearch');
  if (search) { search.value = ''; search.focus(); }
};

// ── Render restaurant grid (home screen) ────────────────────────
const renderRestaurantGrid = () => {
  const wrap = $('restContent');
  if (!wrap) return;

  const searchBar = `
    <div style="padding:10px 12px 6px;">
      <input id="restSearch" type="text" placeholder="🔍  ابحث في كل المطاعم..."
        oninput="onRestSearch(this.value)"
        style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:12px;
               background:var(--surface2);color:var(--text);font-family:inherit;font-size:.88rem;
               box-sizing:border-box;outline:none;"/>
    </div>`;

  const grid = SAUDI_RESTAURANTS.map(r => {
    const logo = getRestaurantLogo(r.id);
    const logoHtml = logo
      ? `<img src="${logo}" style="width:56px;height:56px;object-fit:contain;border-radius:10px;" alt="${r.name}"/>`
      : `<div style="width:56px;height:56px;border-radius:10px;background:${r.color};display:flex;align-items:center;justify-content:center;font-size:1.4rem;">🍽️</div>`;
    return `
      <div onclick="openRestaurant('${r.id}')"
        style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;
               border-radius:14px;border:1px solid var(--border);background:var(--surface);
               cursor:pointer;transition:background .15s;text-align:center;"
        onmouseover="this.style.background='var(--surface2)'"
        onmouseout="this.style.background='var(--surface)'">
        ${logoHtml}
        <span style="font-size:.75rem;font-weight:600;color:var(--text);line-height:1.3;">${r.name}</span>
        <span style="font-size:.65rem;color:var(--text3);">${r.items.length} وجبة</span>
      </div>`;
  }).join('');

  wrap.innerHTML = searchBar + `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:4px 12px 16px;">
      ${grid}
    </div>`;
};

// ── Open single restaurant ───────────────────────────────────────
const openRestaurant = (id) => {
  _restViewId = id;
  const r = getRestaurantById(id);
  if (!r) return;
  const wrap = $('restContent');
  if (!wrap) return;

  const logo = getRestaurantLogo(id);
  const logoHtml = logo
    ? `<img src="${logo}" style="height:40px;object-fit:contain;border-radius:8px;" alt="${r.name}"/>`
    : '';

  const header = `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 14px 8px;border-bottom:1px solid var(--border);">
      <button onclick="renderRestaurantGrid()" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:1.3rem;padding:0 4px;">←</button>
      ${logoHtml}
      <span style="font-size:1rem;font-weight:700;color:var(--text);">${r.name}</span>
    </div>`;

  const items = r.items.map(item => {
    const img = getFoodImage(id, item.name);
    const imgHtml = img
      ? `<img src="${img}" style="width:58px;height:58px;object-fit:cover;border-radius:10px;flex-shrink:0;" alt="${item.name}"/>`
      : `<div style="width:58px;height:58px;border-radius:10px;background:${r.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.4rem;">🍽️</div>`;

    return `
      <div onclick="addRestaurantItem(${JSON.stringify(JSON.stringify({name:item.name,kcal:item.kcal,protein:item.protein,carbs:item.carbs,fat:item.fat,restaurantName:r.name,restaurantId:id}))})"
        style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);
               cursor:pointer;transition:background .12s;"
        onmouseover="this.style.background='var(--surface2)'"
        onmouseout="this.style.background='transparent'">
        ${imgHtml}
        <div style="flex:1;min-width:0;">
          <div style="font-size:.88rem;font-weight:600;color:var(--text);margin-bottom:3px;">${item.name}</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;">
            <span style="font-size:.65rem;color:var(--blue);background:rgba(96,165,250,.12);padding:2px 6px;border-radius:4px;">P ${item.protein}g</span>
            <span style="font-size:.65rem;color:var(--green);background:rgba(74,222,128,.12);padding:2px 6px;border-radius:4px;">C ${item.carbs}g</span>
            <span style="font-size:.65rem;color:var(--amber);background:rgba(251,191,36,.12);padding:2px 6px;border-radius:4px;">F ${item.fat}g</span>
          </div>
        </div>
        <div style="text-align:center;flex-shrink:0;">
          <div style="font-size:1rem;font-weight:800;color:${r.color};">${item.kcal}</div>
          <div style="font-size:.6rem;color:var(--text3);">kcal</div>
        </div>
      </div>`;
  }).join('');

  wrap.innerHTML = header + `<div style="overflow-y:auto;max-height:380px;">${items}</div>`;
};

// ── Search across all restaurants ────────────────────────────────
const onRestSearch = (query) => {
  const q = query.trim();
  if (!q) { renderRestaurantGrid(); return; }

  const results = searchRestaurantItems(q);
  const wrap = $('restContent');
  if (!wrap) return;

  const searchBar = `
    <div style="padding:10px 12px 6px;">
      <input id="restSearch" type="text" placeholder="🔍  ابحث في كل المطاعم..."
        oninput="onRestSearch(this.value)" value="${q}"
        style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:12px;
               background:var(--surface2);color:var(--text);font-family:inherit;font-size:.88rem;
               box-sizing:border-box;outline:none;"/>
    </div>`;

  if (!results.length) {
    wrap.innerHTML = searchBar + `
      <div style="text-align:center;padding:40px 16px;color:var(--text3);">
        <div style="font-size:2.5rem;margin-bottom:10px;">🔍</div>
        <div>ما فيه نتائج لـ "${q}"</div>
      </div>`;
    return;
  }

  const items = results.map(item => {
    const img = getFoodImage(item.restaurantId, item.name);
    const imgHtml = img
      ? `<img src="${img}" style="width:50px;height:50px;object-fit:cover;border-radius:9px;flex-shrink:0;" alt="${item.name}"/>`
      : `<div style="width:50px;height:50px;border-radius:9px;background:${item.color}22;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🍽️</div>`;

    return `
      <div onclick="addRestaurantItem(${JSON.stringify(JSON.stringify({name:item.name,kcal:item.kcal,protein:item.protein,carbs:item.carbs,fat:item.fat,restaurantName:item.restaurant,restaurantId:item.restaurantId}))})"
        style="display:flex;align-items:center;gap:10px;padding:9px 14px;border-bottom:1px solid var(--border);
               cursor:pointer;transition:background .12s;"
        onmouseover="this.style.background='var(--surface2)'"
        onmouseout="this.style.background='transparent'">
        ${imgHtml}
        <div style="flex:1;min-width:0;">
          <div style="font-size:.82rem;font-weight:600;color:var(--text);">${item.name}</div>
          <div style="font-size:.68rem;color:var(--text3);margin-bottom:3px;">${item.restaurant}</div>
          <div style="display:flex;gap:4px;">
            <span style="font-size:.62rem;color:var(--blue);background:rgba(96,165,250,.12);padding:1px 5px;border-radius:4px;">P ${item.protein}g</span>
            <span style="font-size:.62rem;color:var(--green);background:rgba(74,222,128,.12);padding:1px 5px;border-radius:4px;">C ${item.carbs}g</span>
            <span style="font-size:.62rem;color:var(--amber);background:rgba(251,191,36,.12);padding:1px 5px;border-radius:4px;">F ${item.fat}g</span>
          </div>
        </div>
        <div style="text-align:center;flex-shrink:0;">
          <div style="font-size:.95rem;font-weight:800;color:${item.color};">${item.kcal}</div>
          <div style="font-size:.6rem;color:var(--text3);">kcal</div>
        </div>
      </div>`;
  }).join('');

  wrap.innerHTML = searchBar + `<div style="overflow-y:auto;max-height:380px;">${items}</div>`;
  // restore focus
  const inp = $('restSearch');
  if (inp) { inp.focus(); inp.setSelectionRange(q.length, q.length); }
};

// ── Add item to food log ─────────────────────────────────────────
const addRestaurantItem = (jsonStr) => {
  const item = JSON.parse(jsonStr);
  const timeStr = new Date().toTimeString().slice(0,5);
  const img = getFoodImage(item.restaurantId, item.name);
  const entry = {
    id: 'm' + Date.now(),
    name: item.name + ' — ' + item.restaurantName,
    kcal: item.kcal,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    type: 'meal',
    time: timeStr,
    img: img || null,
  };
  const day = getDay(viewingDate);
  if (!Array.isArray(day.meals)) day.meals = [];
  day.meals.push(entry);
  saveDay(viewingDate, day);
  renderMeals();
  closeFoodModal();
  showToast(`✅ ${item.name} · ${item.kcal} kcal`);
};
