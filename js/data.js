// ── يومي — Data Layer: state, presets, default values, day management
// ── Date helpers ──────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().slice(0,10);
let viewingDate = todayKey();

// ── Default data ──────────────────────────────────────────────────
const DEFAULT_TASKS = [];
const DEFAULT_DAY = () => ({
  tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
  meals: [],
  steps: 0,
  notes: {workout:'',general:'',food:''},
  _dateLabel: null,
});

// ── State ─────────────────────────────────────────────────────────
let lang, theme, calTarget, stepsTarget, customNotifs, customTasks;
let dayCache = {};
const t = key => (T[lang]||T.ar)[key]||key;
let activeNoteCat='workout', activeCatFilter='all', activeNoteColor='';

// ── Preset Exercises ─────────────────────────────────────────────
const PRESET_EXERCISES = [
  {name:'Squat',                    muscle:'Legs'},
  {name:'Leg Press',                muscle:'Legs'},
  {name:'Leg Extension',            muscle:'Legs'},
  {name:'Leg Curl',                 muscle:'Legs'},
  {name:'Romanian Deadlift',        muscle:'Legs'},
  {name:'Hack Squat',               muscle:'Legs'},
  {name:'Walking Lunges',           muscle:'Legs'},
  {name:'Calf Raise',               muscle:'Legs'},
  {name:'Bench Press',              muscle:'Chest'},
  {name:'Incline Bench Press',      muscle:'Chest'},
  {name:'Decline Bench Press',      muscle:'Chest'},
  {name:'Dumbbell Fly',             muscle:'Chest'},
  {name:'Cable Fly',                muscle:'Chest'},
  {name:'Push Up',                  muscle:'Chest'},
  {name:'Chest Dip',                muscle:'Chest'},
  {name:'Pec Deck',                 muscle:'Chest'},
  {name:'Deadlift',                 muscle:'Back'},
  {name:'Pull Up',                  muscle:'Back'},
  {name:'Lat Pulldown',             muscle:'Back'},
  {name:'Seated Cable Row',         muscle:'Back'},
  {name:'Barbell Row',              muscle:'Back'},
  {name:'Dumbbell Row',             muscle:'Back'},
  {name:'Face Pull',                muscle:'Back'},
  {name:'Overhead Press',           muscle:'Shoulders'},
  {name:'Dumbbell Lateral Raise',   muscle:'Shoulders'},
  {name:'Cable Lateral Raise',      muscle:'Shoulders'},
  {name:'Front Raise',              muscle:'Shoulders'},
  {name:'Rear Delt Fly',            muscle:'Shoulders'},
  {name:'Arnold Press',             muscle:'Shoulders'},
  {name:'Upright Row',              muscle:'Shoulders'},
  {name:'Barbell Curl',             muscle:'Biceps'},
  {name:'Dumbbell Curl',            muscle:'Biceps'},
  {name:'Hammer Curl',              muscle:'Biceps'},
  {name:'Cable Curl',               muscle:'Biceps'},
  {name:'Preacher Curl',            muscle:'Biceps'},
  {name:'Incline Dumbbell Curl',    muscle:'Biceps'},
  {name:'Tricep Pushdown',          muscle:'Triceps'},
  {name:'Skull Crusher',            muscle:'Triceps'},
  {name:'Overhead Tricep Extension',muscle:'Triceps'},
  {name:'Tricep Dip',               muscle:'Triceps'},
  {name:'Cable Crunch',             muscle:'Core'},
  {name:'Leg Raise',                muscle:'Core'},
  {name:'Hanging Knee Raise',       muscle:'Core'},
  {name:'Wrist Curl',               muscle:'Forearms'},
  {name:'Reverse Curl',             muscle:'Forearms'},
];

const MUSCLE_AR = {
  'Legs':'أرجل', 'Chest':'صدر', 'Back':'ظهر', 'Shoulders':'كتف',
  'Biceps':'بايسبس', 'Triceps':'ترايسبس', 'Core':'بطن', 'Forearms':'سواعد'
};
const muscleLbl = m => lang==='ar' ? (MUSCLE_AR[m]||m) : m;

const injectPresets = () => {
  if(!Array.isArray(exLibrary)) exLibrary = [];
  let changed = false;
  PRESET_EXERCISES.forEach(p => {
    if(!exLibrary.some(e => e.name.toLowerCase() === p.name.toLowerCase())) {
      exLibrary.push({id:'pre_'+p.name.replace(/\s/g,'_'), name:p.name, muscle:p.muscle, defaultSets:3, defaultReps:10, preset:true});
      changed = true;
    }
  });
  if(changed) saveExLib();
};

// ── Preset Meals ─────────────────────────────────────────────────
const _IMG = {
  rice:    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNCODg2MEIiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI1NCIgcng9IjI4IiByeT0iMTYiIGZpbGw9IiNENEEwMTciLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI1MCIgcng9IjI4IiByeT0iMTYiIGZpbGw9IiNGNUYwREMiLz48ZWxsaXBzZSBjeD0iMzAiIGN5PSI0NCIgcng9IjQiIHJ5PSIyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTIwIDMwIDQ0KSIvPjxlbGxpcHNlIGN4PSI0MiIgY3k9IjQwIiByeD0iNCIgcnk9IjIiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InJvdGF0ZSgxMCA0MiA0MCkiLz48ZWxsaXBzZSBjeD0iNTIiIGN5PSI0NiIgcng9IjQiIHJ5PSIyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1IDUyIDQ2KSIvPjxlbGxpcHNlIGN4PSIzNSIgY3k9IjUyIiByeD0iNCIgcnk9IjIiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InJvdGF0ZSg1IDM1IDUyKSIvPjxlbGxpcHNlIGN4PSI0OSIgY3k9IjU0IiByeD0iNCIgcnk9IjIiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InJvdGF0ZSgtMjUgNDkgNTQpIi8+PC9zdmc+',
  egg:     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNFODkwMEEiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0NSIgcng9IjIyIiByeT0iMjYiIGZpbGw9IiNGRkZERTciLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQ4IiByPSIxMyIgZmlsbD0iI0ZGQzEwNyIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDMiIHI9IjQiIGZpbGw9IiNGRkU1N0YiIG9wYWNpdHk9IjAuNyIvPjwvc3ZnPg==',
  toast:   'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNBMDUyMkQiLz48cmVjdCB4PSIxNiIgeT0iMTgiIHdpZHRoPSI0OCIgaGVpZ2h0PSI1MCIgcng9IjgiIGZpbGw9IiNDRDg1M0YiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSIyNCIgcng9IjI0IiByeT0iMTEiIGZpbGw9IiM4QjQ1MTMiLz48cmVjdCB4PSIxOSIgeT0iMzAiIHdpZHRoPSI0MiIgaGVpZ2h0PSIzNSIgcng9IjUiIGZpbGw9IiNGNUM4NDIiLz48Y2lyY2xlIGN4PSIzMSIgY3k9IjQyIiByPSIyLjUiIGZpbGw9IiNDOEEwMjAiIG9wYWNpdHk9IjAuOCIvPjxjaXJjbGUgY3g9IjQzIiBjeT0iMzciIHI9IjIiIGZpbGw9IiNDOEEwMjAiIG9wYWNpdHk9IjAuOCIvPjxjaXJjbGUgY3g9IjUxIiBjeT0iNDciIHI9IjIuNSIgZmlsbD0iI0M4QTAyMCIgb3BhY2l0eT0iMC44Ii8+PGNpcmNsZSBjeD0iMzciIGN5PSI1MyIgcj0iMiIgZmlsbD0iI0M4QTAyMCIgb3BhY2l0eT0iMC44Ii8+PC9zdmc+',
  almarai: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMxQjVFMjAiLz48cmVjdCB4PSIyMiIgeT0iMjIiIHdpZHRoPSIzNiIgaGVpZ2h0PSI0OCIgcng9IjUiIGZpbGw9IndoaXRlIi8+PHBvbHlnb24gcG9pbnRzPSIyMiwyNCA0MCwxMyA1OCwyNCIgZmlsbD0iI0M4RTZDOSIvPjxyZWN0IHg9IjIyIiB5PSI0NCIgd2lkdGg9IjM2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMkU3RDMyIi8+PHRleHQgeD0iNDAiIHk9IjM5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNyIgZmlsbD0iIzFCNUUyMCI+YWxtYXJhaTwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNTEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI1LjUiIGZpbGw9IndoaXRlIj5QUk9URUlOPC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSI2MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNSIgZmlsbD0iIzY2NiI+MjUwbWw8L3RleHQ+PC9zdmc+',
  nadec:   'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMwRDQ3QTEiLz48cmVjdCB4PSIyMiIgeT0iMjIiIHdpZHRoPSIzNiIgaGVpZ2h0PSI0OCIgcng9IjUiIGZpbGw9IndoaXRlIi8+PHBvbHlnb24gcG9pbnRzPSIyMiwyNCA0MCwxMyA1OCwyNCIgZmlsbD0iI0JCREVGQSI+PC9wb2x5Z29uPjxyZWN0IHg9IjIyIiB5PSI0NCIgd2lkdGg9IjM2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMTU2NUMwIi8+PHRleHQgeD0iNDAiIHk9IjM5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzBENDdBMSI+bmFkZWM8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjUxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNS41IiBmaWxsPSJ3aGl0ZSI+UFJPVEVJTjwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjUiIGZpbGw9IiM2NjYiPjI1MG1sPC90ZXh0Pjwvc3ZnPg==',
};

const PRESET_MEALS = [
  // أرز مطبوخ — product (per 100g)
  { sid:'preset_rice',    name:'أرز مطبوخ',              type:'product', baseKcal:130, baseG:100, protein:2.7, carbs:28,  fat:0.3, img:_IMG.rice    },
  // بيضة مسلوقة — meal (per egg)
  { sid:'preset_egg',     name:'بيضة مسلوقة',            type:'meal',    kcal:77,                protein:6,   carbs:0.6, fat:5,   img:_IMG.egg     },
  // خبز توست — meal (per slice ~30g)
  { sid:'preset_toast',   name:'خبز توست (شريحة)',        type:'meal',    kcal:80,                protein:2.7, carbs:15,  fat:1,   img:_IMG.toast   },
  // المراعي حليب بروتين — meal (250ml)
  { sid:'preset_almarai', name:'حليب بروتين المراعي',    type:'meal',    kcal:200,               protein:20,  carbs:12,  fat:6,   img:_IMG.almarai },
  // نادك حليب بروتين — meal (250ml)
  { sid:'preset_nadec',   name:'حليب بروتين نادك',       type:'meal',    kcal:180,               protein:18,  carbs:10,  fat:6,   img:_IMG.nadec   },
];

const injectPresetMeals = () => {
  if(!Array.isArray(savedMeals)) savedMeals = [];
  let changed = false;
  PRESET_MEALS.forEach(p => {
    if(!savedMeals.some(m => m.sid === p.sid)) {
      savedMeals.unshift({...p});
      changed = true;
    }
  });
  if(changed) saveCfg('savedMeals', savedMeals);
};

// ── Load all data from localStorage ──────────────────────────────
const loadLocalData = () => {
  lang  = loadCfg('lang','en');
  _customAvatarUrl = loadCfg('customAvatar', null);
  const savedTheme = loadCfg('theme', null);
  theme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  // Load actual saved values so guest users still see their data
  calTarget    = loadCfg('calTarget',    2500);
  stepsTarget  = loadCfg('stepsTarget',  10000);
  customNotifs = loadCfg('customNotifs', []) || [];
  customTasks  = loadCfg('customTasks',  []) || [];
  if(!Array.isArray(customTasks)) customTasks = [];
  if(!Array.isArray(customNotifs)) customNotifs = [];
  // Load all day entries from localStorage for guest mode
  dayCache = {};
  LS.keys('zn_day_').forEach(k => {
    const date = k.replace('zn_day_','');
    if(/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const v = LS.get(k, null);
      if(v) dayCache[date] = v;
    }
  });
  // Load workout + exercise library + saved meals
  weekPlan  = loadCfg('weekPlan', {});
  DAY_KEYS.forEach(d => { if(!weekPlan[d]) weekPlan[d] = {rest:false,focus:'',notes:'',exercises:[]}; });
  exLibrary = loadCfg('exLibrary', []);
  weightLog = loadCfg('weightLog', []);
  savedMeals = loadCfg('savedMeals', []);
  injectPresets();
  injectPresetMeals();
};

// ── System theme auto-follow (only if user hasn't manually set it) ──
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  const manualTheme = loadCfg('theme', null);
  if(!manualTheme) {
    theme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }
});

// mergeFirebaseData removed — project uses Supabase, not Firebase

// ── ensureDay: init day if not in cache, merge customTasks ────────
const ensureDay = d => {
  if(!dayCache[d]) dayCache[d] = DEFAULT_DAY();
  // Guard: ensure tasks array always exists (old cached data may lack it)
  if(!Array.isArray(dayCache[d].tasks)) dayCache[d].tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  if(!Array.isArray(dayCache[d].meals)) dayCache[d].meals = [];
  // Tag with date label
  if(!dayCache[d]._dateLabel){
    const dt = new Date(d+'T12:00:00');
    dayCache[d]._dateLabel = {
      en: dt.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}),
      ar: dt.toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'}),
    };
  }
  // Inject custom tasks that are missing from this day
  if(Array.isArray(customTasks) && customTasks.length > 0) customTasks.forEach(ct=>{
    if(!dayCache[d].tasks.find(x=>x.id===ct.id)){
      dayCache[d].tasks.push({...ct, done:false});
    }
  });
};

const getDay = d => dayCache[d] || DEFAULT_DAY();

// True only when the day has at least one meaningful entry (not just ensureDay skeleton)
const dayHasRealData = d => {
  const e = dayCache[d];
  if(!e) return false;
  if((e.meals  && e.meals.length  > 0)) return true;
  if((e.steps  && e.steps         > 0)) return true;
  if((e.tasks  && e.tasks.some(t => t.done))) return true;
  if(e.notes && (e.notes.workout || e.notes.general || e.notes.food)) return true;
  return false;
};
