// ── يومي — Storage & Security Layer ── localStorage + Supabase
// ── Security helpers ──────────────────────────────────────────────
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
// Only allow base64 data URLs and https for images — blocks javascript: protocol
const safeImgSrc = src => (typeof src==='string' && (src.startsWith('data:image/') || src.startsWith('https://'))) ? src : '';
const sanitizeText = (s,max=200) => { if(typeof s!=='string')return''; return s.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,'').slice(0,max); };
const sanitizeInt  = (v,min,max) => { const n=parseInt(v,10); return Number.isFinite(n)?Math.max(min,Math.min(max,n)):null; };
const MAX_PAYLOAD  = 200*1024;
const guardStr     = v => { const j=JSON.stringify(v); return j.length>MAX_PAYLOAD?null:j; };
const RATE = { data:{max:120,w:60000}, auth:{max:10,w:15*60000} };
const _rl  = {};
const checkRL = (key,tier='data') => {
  const c=RATE[tier]||RATE.data, now=Date.now();
  _rl[key]=(_rl[key]||[]).filter(x=>now-x<c.w);
  if(_rl[key].length>=c.max){return{ok:false,wait:Math.ceil((c.w-(now-_rl[key][0]))/1000)};}
  _rl[key].push(now); return{ok:true};
};

// ── DOM helpers ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

// ── Supabase ──────────────────────────────────────────────────────
const SUPA_URL = atob('aHR0cHM6Ly94cXhjZWN1aG90dXdtcHp4YmZ4cS5zdXBhYmFzZS5jbw==');
// publishable anon key — obfuscated (client-side, same level as URL)
const SUPA_KEY = atob('c2JfcHVibGlzaGFibGVfSzRBVFBnaG1SZWRVRDNKeGo1b1hkQV9tenotN0JlNA==');
let _supa = null;
try { _supa = window.supabase.createClient(SUPA_URL, SUPA_KEY); } catch(e) {}

const USER_KEY = (()=>{
  const K='zn_uid_v3'; let uid=localStorage.getItem(K);
  if(!uid){uid='u_'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem(K,uid);}
  return uid;
})();

// ── Bulletproof Storage Layer ─────────────────────────────────────
// PRIMARY: localStorage  SECONDARY: Supabase (mirrors async)
const LS = {
  get(k, def=null){
    try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):def; }catch{ return def; }
  },
  set(k, v){
    try{
      const s=JSON.stringify(v);
      if(s.length>MAX_PAYLOAD){ console.warn('Payload too large for key',k); return false; }
      localStorage.setItem(k,s); return true;
    }catch(e){
      if(e && (e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22)) {
        // Show toast if available, otherwise alert
        if(typeof showToast==='function') {
          showToast(typeof lang!=='undefined'&&lang==='ar'
            ? '⚠️ التخزين ممتلئ — احذف بعض البيانات القديمة'
            : '⚠️ Storage full — delete some old data');
        }
      }
      console.warn('localStorage write failed',e); return false;
    }
  },
  del(k){ try{ localStorage.removeItem(k); }catch{} },
  keys(prefix){ try{ return Object.keys(localStorage).filter(k=>k.startsWith(prefix)); }catch{ return []; } }
};

// Auth state (declared early so fbSync can reference it)
let currentSupaUser = null;
let _customAvatarUrl = null; // custom avatar (base64 or URL)

// Debounced Supabase sync
const _fbTimers = {};
const fbSync = (lsKey, value) => {
  if(!_supa || !currentSupaUser) return;
  clearTimeout(_fbTimers[lsKey]);
  _fbTimers[lsKey] = setTimeout(async ()=>{
    const s = JSON.stringify(value);
    if(s.length > MAX_PAYLOAD) return;
    await _supa.from('user_data').upsert(
      { user_id: currentSupaUser.id, key: lsKey, value: s, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  }, 600);
};

const saveDay = (dateKey) => {
  const lk = `zn_day_${dateKey}`;
  LS.set(lk, dayCache[dateKey]);
  if(currentSupaUser) fbSync(lk, dayCache[dateKey]);
  else nudgeSignIn();
};

// Nudge guest users to sign in (max once per session)
let _nudgedSignIn = false;
const nudgeSignIn = () => {
  if(_nudgedSignIn || currentSupaUser) return;
  _nudgedSignIn = true;
  setTimeout(()=>{
    showToast(`<span>${lang==='ar'?'سجّل دخولك لحفظ بياناتك ☁️':'Sign in to save your data ☁️'}</span> <button onclick="openAuthModal()" style="margin-left:.6rem;background:rgba(255,255,255,.2);border:none;border-radius:5px;padding:.15rem .5rem;cursor:pointer;font-family:inherit;font-size:.78rem;font-weight:700;color:inherit;">${lang==='ar'?'سجّل':'Sign In'}</button>`, true);
  }, 800);
};

const saveCfg = (key, val) => {
  const lk = `zn_cfg_${key}`;
  LS.set(lk, val);
  if(currentSupaUser) fbSync(lk, val);
};

const loadCfg = (key, def) => LS.get(`zn_cfg_${key}`, def);
