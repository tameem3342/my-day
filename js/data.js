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
