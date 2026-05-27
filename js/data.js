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
  rice:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNCODg2MEIiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI1NCIgcng9IjI4IiByeT0iMTYiIGZpbGw9IiNENEEwMTciLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI1MCIgcng9IjI4IiByeT0iMTYiIGZpbGw9IiNGNUYwREMiLz48ZWxsaXBzZSBjeD0iMzAiIGN5PSI0NCIgcng9IjQiIHJ5PSIyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTIwIDMwIDQ0KSIvPjxlbGxpcHNlIGN4PSI0MiIgY3k9IjQwIiByeD0iNCIgcnk9IjIiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InJvdGF0ZSgxMCA0MiA0MCkiLz48ZWxsaXBzZSBjeD0iNTIiIGN5PSI0NiIgcng9IjQiIHJ5PSIyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1IDUyIDQ2KSIvPjxlbGxpcHNlIGN4PSIzNSIgY3k9IjUyIiByeD0iNCIgcnk9IjIiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InJvdGF0ZSg1IDM1IDUyKSIvPjxlbGxpcHNlIGN4PSI0OSIgY3k9IjU0IiByeD0iNCIgcnk9IjIiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InJvdGF0ZSgtMjUgNDkgNTQpIi8+PC9zdmc+',
  egg:          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNFODkwMEEiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0NSIgcng9IjIyIiByeT0iMjYiIGZpbGw9IiNGRkZERTciLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQ4IiByPSIxMyIgZmlsbD0iI0ZGQzEwNyIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDMiIHI9IjQiIGZpbGw9IiNGRkU1N0YiIG9wYWNpdHk9IjAuNyIvPjwvc3ZnPg==',
  toast:        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNBMDUyMkQiLz48cmVjdCB4PSIxNiIgeT0iMTgiIHdpZHRoPSI0OCIgaGVpZ2h0PSI1MCIgcng9IjgiIGZpbGw9IiNDRDg1M0YiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSIyNCIgcng9IjI0IiByeT0iMTEiIGZpbGw9IiM4QjQ1MTMiLz48cmVjdCB4PSIxOSIgeT0iMzAiIHdpZHRoPSI0MiIgaGVpZ2h0PSIzNSIgcng9IjUiIGZpbGw9IiNGNUM4NDIiLz48Y2lyY2xlIGN4PSIzMSIgY3k9IjQyIiByPSIyLjUiIGZpbGw9IiNDOEEwMjAiIG9wYWNpdHk9IjAuOCIvPjxjaXJjbGUgY3g9IjQzIiBjeT0iMzciIHI9IjIiIGZpbGw9IiNDOEEwMjAiIG9wYWNpdHk9IjAuOCIvPjxjaXJjbGUgY3g9IjUxIiBjeT0iNDciIHI9IjIuNSIgZmlsbD0iI0M4QTAyMCIgb3BhY2l0eT0iMC44Ii8+PGNpcmNsZSBjeD0iMzciIGN5PSI1MyIgcj0iMiIgZmlsbD0iI0M4QTAyMCIgb3BhY2l0eT0iMC44Ii8+PC9zdmc+',
  almarai:      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMxQjVFMjAiLz48cmVjdCB4PSIyMiIgeT0iMjIiIHdpZHRoPSIzNiIgaGVpZ2h0PSI0OCIgcng9IjUiIGZpbGw9IndoaXRlIi8+PHBvbHlnb24gcG9pbnRzPSIyMiwyNCA0MCwxMyA1OCwyNCIgZmlsbD0iI0M4RTZDOSIvPjxyZWN0IHg9IjIyIiB5PSI0NCIgd2lkdGg9IjM2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMkU3RDMyIi8+PHRleHQgeD0iNDAiIHk9IjM5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNyIgZmlsbD0iIzFCNUUyMCI+YWxtYXJhaTwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNTEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI1LjUiIGZpbGw9IndoaXRlIj5QUk9URUlOPC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSI2MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNSIgZmlsbD0iIzY2NiI+MjUwbWw8L3RleHQ+PC9zdmc+',
  nadec:        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMwRDQ3QTEiLz48cmVjdCB4PSIyMiIgeT0iMjIiIHdpZHRoPSIzNiIgaGVpZ2h0PSI0OCIgcng9IjUiIGZpbGw9IndoaXRlIi8+PHBvbHlnb24gcG9pbnRzPSIyMiwyNCA0MCwxMyA1OCwyNCIgZmlsbD0iI0JCREVGQSI+PC9wb2x5Z29uPjxyZWN0IHg9IjIyIiB5PSI0NCIgd2lkdGg9IjM2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMTU2NUMwIi8+PHRleHQgeD0iNDAiIHk9IjM5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzBENDdBMSI+bmFkZWM8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjUxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNS41IiBmaWxsPSJ3aGl0ZSI+UFJPVEVJTjwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjUiIGZpbGw9IiM2NjYiPjI1MG1sPC90ZXh0Pjwvc3ZnPg==',
  milk:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMyRTdEMzIiLz48cmVjdCB4PSIyMiIgeT0iMjIiIHdpZHRoPSIzNiIgaGVpZ2h0PSI0OCIgcng9IjUiIGZpbGw9IndoaXRlIi8+PHBvbHlnb24gcG9pbnRzPSIyMiwyNCA0MCwxMyA1OCwyNCIgZmlsbD0iI0M4RTZDOSIvPjxyZWN0IHg9IjIyIiB5PSI0NCIgd2lkdGg9IjM2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzg4RTNDIi8+PHRleHQgeD0iNDAiIHk9IjM5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNyIgZmlsbD0iIzJFN0QzMiI+YWxtYXJhaTwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNTEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI1LjUiIGZpbGw9IndoaXRlIj5GVUxMIEZBVDwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjUiIGZpbGw9IiM1NTUiPjI1MG1sPC90ZXh0Pjwvc3ZnPg==',
  laban:        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMwMjg4RDEiLz48cmVjdCB4PSIyNCIgeT0iMjgiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzOCIgcng9IjUiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMjQiIHk9IjI4IiB3aWR0aD0iMzIiIGhlaWdodD0iMTAiIHJ4PSI1IiBmaWxsPSIjRTFGNUZFIi8+PGVsbGlwc2UgY3g9IjQwIiBjeT0iMjYiIHJ4PSIxNiIgcnk9IjUiIGZpbGw9IiNCM0U1RkMiLz48dGV4dCB4PSI0MCIgeT0iNTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI3IiBmaWxsPSIjMDI3N0JEIj7ZhNio2YY8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjYyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1IiBmaWxsPSIjNTU1Ij4yNTBtbDwvdGV4dD48L3N2Zz4=',
  kiri:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNGOUE4MjUiLz48cG9seWdvbiBwb2ludHM9IjQwLDE0IDY4LDYzIDEyLDYzIiBmaWxsPSIjRkZGREU3IiBzdHJva2U9IiNGNTdGMTciIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjQwIiB5PSI0OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjEwIiBmaWxsPSIjRTY1MTAwIj5LaXJpPC90ZXh0Pjwvc3ZnPg==',
  foul:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiM1RDQwMzciLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI1MiIgcng9IjI4IiByeT0iMTgiIGZpbGw9Ijc5NTU0OCIvPjxlbGxpcHNlIGN4PSI0MCIgY3k9IjQ5IiByeD0iMjgiIHJ5PSIxOCIgZmlsbD0iIzhENkU2MyIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iNDUiIHI9IjUiIGZpbGw9IiM0RTM0MkUiLz48Y2lyY2xlIGN4PSI0NCIgY3k9IjQyIiByPSI1IiBmaWxsPSIjNEUzNDJFIi8+PGNpcmNsZSBjeD0iNTMiIGN5PSI0OCIgcj0iNSIgZmlsbD0iIzRFMzQyRSIvPjxjaXJjbGUgY3g9IjM2IiBjeT0iNTMiIHI9IjQiIGZpbGw9IiM0RTM0MkUiLz48Y2lyY2xlIGN4PSI0OCIgY3k9IjU0IiByPSI0IiBmaWxsPSIjNEUzNDJFIi8+PC9zdmc+',
  grillchicken: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNFNjUxMDAiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0MiIgcng9IjI0IiByeT0iMjAiIGZpbGw9IiNGRkE3MjYiLz48bGluZSB4MT0iMjgiIHkxPSIzNCIgeDI9IjUyIiB5Mj0iNTAiIHN0cm9rZT0iI0JGMzYwQyIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxsaW5lIHgxPSIyOCIgeTE9IjQwIiB4Mj0iNTIiIHkyPSI0NCIgc3Ryb2tlPSIjQkYzNjBDIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGxpbmUgeDE9IjMwIiB5MT0iNDYiIHgyPSI1MiIgeTI9IjM4IiBzdHJva2U9IiNCRjM2MEMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHJlY3QgeD0iMzQiIHk9IjU2IiB3aWR0aD0iMTIiIGhlaWdodD0iMTAiIHJ4PSIzIiBmaWxsPSIjRkZFQ0IzIi8+PC9zdmc+',
  tuna:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiM0NTVBNJQILZ48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0NSIgcng9IjI4IiByeT0iMjAiIGZpbGw9IiNCMEJFQzUiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0MiIgcng9IjI4IiByeT0iMjAiIGZpbGw9IiNDRkQ4REMiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0MiIgcng9IjIwIiByeT0iMTQiIGZpbGw9IiNFQ0VGRjEiLz48dGV4dCB4PSI0MCIgeT0iNDciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI4IiBmaWxsPSIjMzc0NzRGIj5UVU5BPC90ZXh0PjxyZWN0IHg9IjEyIiB5PSIzOCIgd2lkdGg9IjgiIGhlaWdodD0iNCIgcng9IjIiIGZpbGw9Ijc4OTA5QyIvPjxyZWN0IHg9IjYwIiB5PSIzOCIgd2lkdGg9IjgiIGhlaWdodD0iNCIgcng9IjIiIGZpbGw9Ijc4OTA5QyIvPjwvc3ZnPg==',
  banana:       'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNGOUE4MjUiLz48cGF0aCBkPSJNMjAgNTggUTIyIDIwIDU0IDE3IFE2NSAxNyA2MyAyOCBRNDYgMjUgMzYgNTggWiIgZmlsbD0iI0ZGRjE3NiIvPjxwYXRoIGQ9Ik01NCAxNyBRNjUgMTcgNjMgMjgiIHN0cm9rZT0iI0Y1N0YxNyIgc3Ryb2tlLXdpZHRoPSIyLjUiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
  apple:        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNDNjI4MjgiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQ3IiByPSIyNiIgZmlsbD0iI0U1MzkzNSIvPjxlbGxpcHNlIGN4PSIzMiIgY3k9IjM2IiByeD0iNiIgcnk9IjgiIGZpbGw9IiNFRjlBOUEiIG9wYWNpdHk9IjAuNCIvPjxyZWN0IHg9IjM4IiB5PSIxNiIgd2lkdGg9IjQiIGhlaWdodD0iMTAiIHJ4PSIyIiBmaWxsPSIjNUQ0MDM3Ii8+PHBhdGggZD0iTTQyIDIxIFE1MSAxNCA1MCAyNCIgc3Ryb2tlPSIjMzg4RTNDIiBzdHJva2Utd2lkdGg9IjIuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
  cucumber:     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMxQjVFMjAiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0MiIgcng9IjE0IiByeT0iMjYiIGZpbGw9IiM4MUM3ODQiLz48bGluZSB4MT0iNDAiIHkxPSIxOCIgeDI9IjQwIiB5Mj0iNjYiIHN0cm9rZT0iI0E1RDZBNyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI0IDMiLz48bGluZSB4MT0iMjciIHkxPSIzMiIgeDI9IjUzIiB5Mj0iMzIiIHN0cm9rZT0iI0E1RDZBNyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjMgMiIvPjxsaW5lIHgxPSIyNiIgeTE9IjQyIiB4Mj0iNTQiIHkyPSI0MiIgc3Ryb2tlPSIjQTVENkE3IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMyAyIi8+PGxpbmUgeDE9IjI3IiB5MT0iNTIiIHgyPSI1MyIgeTI9IjUyIiBzdHJva2U9IiNBNUQ2QTciIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtZGFzaGFycmF5PSIzIDIiLz48L3N2Zz4=',
  tomato:       'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNCNzFDMUMiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQ3IiByPSIyNiIgZmlsbD0iI0VGNTM1MCIvPjxlbGxpcHNlIGN4PSIzMiIgY3k9IjM3IiByeD0iNiIgcnk9IjgiIGZpbGw9IiNFRjlBOUEiIG9wYWNpdHk9IjAuMzUiLz48cGF0aCBkPSJNMzMgMjIgUTQwIDE1IDQ3IDIyIiBzdHJva2U9IiMzODhFM0MiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHJlY3QgeD0iMzgiIHk9IjE1IiB3aWR0aD0iNCIgaGVpZ2h0PSI5IiByeD0iMiIgZmlsbD0iIzM4OEUzQyIvPjwvc3ZnPg==',
  dates:        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMzRTI3MjMiLz48ZWxsaXBzZSBjeD0iMjYiIGN5PSI0OCIgcng9IjEwIiByeT0iMTQiIGZpbGw9IiM3OTU1NDgiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0NiIgcng9IjEwIiByeT0iMTQiIGZpbGw9IiM3OTU1NDgiLz48ZWxsaXBzZSBjeD0iNTQiIGN5PSI0OCIgcng9IjEwIiByeT0iMTQiIGZpbGw9IiM3OTU1NDgiLz48ZWxsaXBzZSBjeD0iMjYiIGN5PSI0NiIgcng9IjgiIHJ5PSIxMiIgZmlsbD0iI0ExODg3RiIvPjxlbGxpcHNlIGN4PSI0MCIgY3k9IjQ0IiByeD0iOCIgcnk9IjEyIiBmaWxsPSIjQTE4ODdGIi8+PGVsbGlwc2UgY3g9IjU0IiBjeT0iNDYiIHJ4PSI4IiByeT0iMTIiIGZpbGw9IiNBMTg4N0YiLz48bGluZSB4MT0iMjYiIHkxPSIzNCIgeDI9IjI2IiB5Mj0iMjgiIHN0cm9rZT0iI0JDQUFBNCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjQwIiB5MT0iMzIiIHgyPSI0MCIgeTI9IjI2IiBzdHJva2U9IiNCQ0FBQTQiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1NCIgeTE9IjM0IiB4Mj0iNTQiIHkyPSIyOCIgc3Ryb2tlPSIjQkNBQUE0IiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
  oats:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiM2RDRDNDEiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI1MiIgcng9IjI4IiByeT0iMTgiIGZpbGw9IiNBMTg4N0YiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0OSIgcng9IjI4IiByeT0iMTgiIGZpbGw9IiNGRkY4RTEiLz48ZWxsaXBzZSBjeD0iMzAiIGN5PSI0MyIgcng9IjYiIHJ5PSIzIiBmaWxsPSIjRDdDQ0M4IiB0cmFuc2Zvcm09InJvdGF0ZSgtMjAgMzAgNDMpIi8+PGVsbGlwc2UgY3g9IjQ0IiBjeT0iNDAiIHJ4PSI2IiByeT0iMyIgZmlsbD0iI0Q3Q0NDOCIgdHJhbnNmb3JtPSJyb3RhdGUoMTUgNDQgNDApIi8+PGVsbGlwc2UgY3g9IjUzIiBjeT0iNDYiIHJ4PSI1IiByeT0iMi41IiBmaWxsPSIjRDdDQ0M4IiB0cmFuc2Zvcm09InJvdGF0ZSgtMTAgNTMgNDYpIi8+PGVsbGlwc2UgY3g9IjM2IiBjeT0iNTIiIHJ4PSI1IiByeT0iMi41IiBmaWxsPSIjRDdDQ0M4IiB0cmFuc2Zvcm09InJvdGF0ZSg1IDM2IDUyKSIvPjxlbGxpcHNlIGN4PSI1MCIgY3k9IjUzIiByeD0iNSIgcnk9IjIuNSIgZmlsbD0iI0Q3Q0NDOCIgdHJhbnNmb3JtPSJyb3RhdGUoLTIwIDUwIDUzKSIvPjwvc3ZnPg==',
  chickenbreast:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNFRjhDMDAiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0NCIgcng9IjI2IiByeT0iMjAiIGZpbGw9IiNGRkVDQjMiLz48ZWxsaXBzZSBjeD0iMzgiIGN5PSI0MiIgcng9IjI2IiByeT0iMjAiIGZpbGw9IiNGRkY4RTEiLz48ZWxsaXBzZSBjeD0iMzYiIGN5PSI0MCIgcng9IjE4IiByeT0iMTMiIGZpbGw9IiNGRkNDODAiIG9wYWNpdHk9IjAuNiIvPjxwYXRoIGQ9Ik0yMiA0NCBRMzAgMjggNDggMzAgUTU4IDMyIDU4IDQ0IiBzdHJva2U9IiNGRkIzMDAiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
  // ── مطاعم ────────────────────────────────────────────────────────
  baik:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNDNjI4MjgiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0NyIgcng9IjIyIiByeT0iMTgiIGZpbGw9IiNGRjhGMDAiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0NSIgcng9IjIwIiByeT0iMTYiIGZpbGw9IiNGRkE3MjYiLz48bGluZSB4MT0iMjgiIHkxPSIzNyIgeDI9IjUyIiB5Mj0iNTMiIHN0cm9rZT0iI0U2NTEwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48bGluZSB4MT0iMzAiIHkxPSI0NSIgeDI9IjUyIiB5Mj0iNDEiIHN0cm9rZT0iI0U2NTEwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxsaW5lIHgxPSIzNCIgeTE9IjUxIiB4Mj0iNTAiIHkyPSIzNyIgc3Ryb2tlPSIjRTY1MTAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHJlY3QgeD0iMzYiIHk9IjU4IiB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgcng9IjQiIGZpbGw9IiNGRkVDQjMiLz48dGV4dCB4PSI0MCIgeT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxMSIgZmlsbD0id2hpdGUiPkJBSUs8L3RleHQ+PC9zdmc+',
  mcdonalds:    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNGRkMzMDAiLz48cGF0aCBkPSJNMTggNjIgQzE4IDYyIDE4IDIyIDMwIDIyIEM0MiAyMiAzOCA1MCA0MCA1MCBDNDIgNTAgMzggMjIgNTAgMjIgQzYyIDIyIDYyIDYyIDYyIDYyIiBmaWxsPSJub25lIiBzdHJva2U9IiNEQTAyMEUiIHN0cm9rZS13aWR0aD0iMTAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
  shawarmahouse:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiM0RTM0MkUiLz48cmVjdCB4PSIzOCIgeT0iMTEiIHdpZHRoPSI0IiBoZWlnaHQ9IjU2IiByeD0iMiIgZmlsbD0iI0JEQkRCRCIvPjxlbGxpcHNlIGN4PSI0MCIgY3k9IjExIiByeD0iNSIgcnk9IjQiIGZpbGw9IiM5RTlFOUUiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSIyNCIgcng9IjE1IiByeT0iNiIgZmlsbD0iIzc5NTU0OCIvPjxwYXRoIGQ9Ik0yNSAyNCBMMjkgNjIgTDUxIDYyIEw1NSAyNCBaIiBmaWxsPSIjOEQ2RTYzIi8+PHBhdGggZD0iTTI3IDI0IEwzMSA1OCBMNDkgNTggTDUzIDI0IFoiIGZpbGw9IiNBMTg4N0YiLz48bGluZSB4MT0iMzAiIHkxPSIzNCIgeDI9IjUwIiB5Mj0iMzQiIHN0cm9rZT0iIzZENEM0MSIgc3Ryb2tlLXdpZHRoPSIyLjUiLz48bGluZSB4MT0iMzAiIHkxPSI0MyIgeDI9IjUwIiB5Mj0iNDMiIHN0cm9rZT0iIzZENEM0MSIgc3Ryb2tlLXdpZHRoPSIyLjUiLz48bGluZSB4MT0iMzAiIHkxPSI1MiIgeDI9IjUwIiB5Mj0iNTIiIHN0cm9rZT0iIzZENEM0MSIgc3Ryb2tlLXdpZHRoPSIyLjUiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI2MiIgcng9IjE0IiByeT0iNCIgZmlsbD0iIzZENEM0MSIvPjwvc3ZnPg==',
  rayeq:        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiMwMDY5NUMiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0OCIgcng9IjI0IiByeT0iMjAiIGZpbGw9IiM3OTU1NDgiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSI0NiIgcng9IjIyIiByeT0iMTgiIGZpbGw9IiNBMTg4N0YiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzOCIgcng9IjE2IiByeT0iMTAiIGZpbGw9IiNGRjcwNDMiLz48ZWxsaXBzZSBjeD0iMzQiIGN5PSIzNiIgcng9IjYiIHJ5PSI1IiBmaWxsPSIjNENBRjUwIi8+PGVsbGlwc2UgY3g9IjQ2IiBjeT0iMzUiIHJ4PSI1IiByeT0iNCIgZmlsbD0iI0ZGRUIzQiIgb3BhY2l0eT0iMC44NSIvPjx0ZXh0IHg9IjQwIiB5PSI2MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjkiIGZpbGw9IndoaXRlIj7Ysdin2YrZgjwvdGV4dD48L3N2Zz4=',
  dunkin:       'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNGRjZCMDAiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQzIiByPSIyNCIgZmlsbD0iI0Y4QkJEOSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDMiIHI9IjEwIiBmaWxsPSIjRkY2QjAwIi8+PGVsbGlwc2UgY3g9IjQwIiBjeT0iMjEiIHJ4PSI4IiByeT0iNCIgZmlsbD0iI0U5MUU4QyIgb3BhY2l0eT0iMC44Ii8+PGVsbGlwc2UgY3g9IjU1IiBjeT0iMjYiIHJ4PSI1IiByeT0iMyIgZmlsbD0iI0U5MUU4QyIgb3BhY2l0eT0iMC44Ii8+PGVsbGlwc2UgY3g9IjI1IiBjeT0iMjYiIHJ4PSI1IiByeT0iMyIgZmlsbD0iI0U5MUU4QyIgb3BhY2l0eT0iMC44Ii8+PHJlY3QgeD0iMzIiIHk9IjMwIiB3aWR0aD0iNiIgaGVpZ2h0PSIyLjUiIHJ4PSIxLjIiIGZpbGw9IiNGRjUyNTIiIHRyYW5zZm9ybT0icm90YXRlKC0zMCAzMiAzMCkiLz48cmVjdCB4PSI0NCIgeT0iMjkiIHdpZHRoPSI2IiBoZWlnaHQ9IjIuNSIgcng9IjEuMiIgZmlsbD0iIzUzNkRGRSIgdHJhbnNmb3JtPSJyb3RhdGUoMjAgNDQgMjkpIi8+PHJlY3QgeD0iNTEiIHk9IjQwIiB3aWR0aD0iNiIgaGVpZ2h0PSIyLjUiIHJ4PSIxLjIiIGZpbGw9IiM2OUYwQUUiIHRyYW5zZm9ybT0icm90YXRlKC0xMCA1MSA0MCkiLz48cmVjdCB4PSIzMSIgeT0iNDciIHdpZHRoPSI1IiBoZWlnaHQ9IjIuNSIgcng9IjEuMiIgZmlsbD0iI0ZGRDc0MCIgdHJhbnNmb3JtPSJyb3RhdGUoMTUgMzEgNDcpIi8+PHRleHQgeD0iNDAiIHk9IjY3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNy41IiBmaWxsPSJ3aGl0ZSI+RFVOS0lOPC90ZXh0Pjwvc3ZnPg==',
  pizzahut:     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNEMzJGMkYiLz48cGF0aCBkPSJNNDAgMTYgTDcwIDYyIEwxMCA2MiBaIiBmaWxsPSIjRkZDMTA3Ii8+PGVsbGlwc2UgY3g9IjQwIiBjeT0iNjIiIHJ4PSIzMCIgcnk9IjYiIGZpbGw9IiNENEEwNDIiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQ2IiByPSI0LjUiIGZpbGw9IiNDNjI4MjgiLz48Y2lyY2xlIGN4PSIyOSIgY3k9IjU2IiByPSI0IiBmaWxsPSIjQzYyODI4Ii8+PGNpcmNsZSBjeD0iNTEiIGN5PSI1NiIgcj0iNCIgZmlsbD0iI0M2MjgyOCIvPjxjaXJjbGUgY3g9IjMzIiBjeT0iMzciIHI9IjMuNSIgZmlsbD0iI0M2MjgyOCIvPjxjaXJjbGUgY3g9IjQ5IiBjeT0iMzYiIHI9IjMuNSIgZmlsbD0iI0M2MjgyOCIvPjxlbGxpcHNlIGN4PSI0MCIgY3k9IjYyIiByeD0iMjIiIHJ5PSIzLjUiIGZpbGw9IiM4RDZFNjMiLz48L3N2Zz4=',
  krispykreme:  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTQiIGZpbGw9IiNDNjI4MjgiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQyIiByPSIyNiIgZmlsbD0iI0Y1REVCMyIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDIiIHI9IjI2IiBmaWxsPSIjRTkxRThDIiBvcGFjaXR5PSIwLjg1Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MiIgcj0iMTEiIGZpbGw9IiNDNjI4MjgiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSIxOSIgcng9IjkiIHJ5PSI0LjUiIGZpbGw9IiNGRjgwQUIiIG9wYWNpdHk9IjAuNzUiLz48ZWxsaXBzZSBjeD0iNTYiIGN5PSIyNSIgcng9IjUuNSIgcnk9IjMiIGZpbGw9IiNGRjgwQUIiIG9wYWNpdHk9IjAuNzUiLz48ZWxsaXBzZSBjeD0iMjQiIGN5PSIyNSIgcng9IjUuNSIgcnk9IjMiIGZpbGw9IiNGRjgwQUIiIG9wYWNpdHk9IjAuNzUiLz48ZWxsaXBzZSBjeD0iNjIiIGN5PSI0MCIgcng9IjQiIHJ5PSIyLjUiIGZpbGw9IiNGRjgwQUIiIG9wYWNpdHk9IjAuNzUiLz48dGV4dCB4PSI0MCIgeT0iNDYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI5IiBmaWxsPSJ3aGl0ZSI+S0s8L3RleHQ+PC9zdmc+',
};

const PRESET_MEALS = [
  // ── حبوب ومخبوزات ──────────────────────────────────────────────
  { sid:'preset_rice',         name:'أرز أبيض مطبوخ',        type:'product', baseKcal:130, baseG:100, protein:2.7, carbs:28,  fat:0.3, img:_IMG.rice         },
  { sid:'preset_oats',         name:'شوفان',                  type:'product', baseKcal:389, baseG:100, protein:17,  carbs:66,  fat:7,   img:_IMG.oats         },
  { sid:'preset_toast',        name:'خبز توست (شريحة)',        type:'meal',    kcal:80,                protein:2.7, carbs:15,  fat:1,   img:_IMG.toast        },
  // ── بيض ومنتجات ألبان ──────────────────────────────────────────
  { sid:'preset_egg',          name:'بيضة مسلوقة',            type:'meal',    kcal:77,                protein:6,   carbs:0.6, fat:5,   img:_IMG.egg          },
  { sid:'preset_milk',         name:'حليب المراعي كامل الدسم', type:'meal',    kcal:162,               protein:8,   carbs:12,  fat:9,   img:_IMG.milk         },
  { sid:'preset_laban',        name:'لبن (250ml)',             type:'meal',    kcal:95,                protein:7,   carbs:12,  fat:2,   img:_IMG.laban        },
  { sid:'preset_kiri',         name:'جبن كيري (مثلثة)',        type:'meal',    kcal:53,                protein:1.5, carbs:2,   fat:4.5, img:_IMG.kiri         },
  { sid:'preset_almarai',      name:'حليب بروتين المراعي',    type:'meal',    kcal:200,               protein:20,  carbs:12,  fat:6,   img:_IMG.almarai      },
  { sid:'preset_nadec',        name:'حليب بروتين نادك',       type:'meal',    kcal:180,               protein:18,  carbs:10,  fat:6,   img:_IMG.nadec        },
  // ── دجاج وبروتين ───────────────────────────────────────────────
  { sid:'preset_chickenbreast',name:'صدر دجاج مطبوخ',         type:'product', baseKcal:165, baseG:100, protein:31,  carbs:0,   fat:3.6, img:_IMG.chickenbreast},
  { sid:'preset_grillchicken', name:'دجاج مشوي (وجبة)',        type:'meal',    kcal:330,               protein:62,  carbs:0,   fat:7,   img:_IMG.grillchicken },
  { sid:'preset_tuna',         name:'تونة (100g)',             type:'product', baseKcal:116, baseG:100, protein:26,  carbs:0,   fat:1,   img:_IMG.tuna         },
  { sid:'preset_foul',         name:'فول مدمس',                type:'meal',    kcal:187,               protein:13,  carbs:33,  fat:1,   img:_IMG.foul         },
  // ── فواكه وخضار ────────────────────────────────────────────────
  { sid:'preset_banana',       name:'موز (حبة)',               type:'meal',    kcal:107,               protein:1.3, carbs:27,  fat:0,   img:_IMG.banana       },
  { sid:'preset_apple',        name:'تفاح (حبة)',              type:'meal',    kcal:78,                protein:0.4, carbs:21,  fat:0,   img:_IMG.apple        },
  { sid:'preset_dates',        name:'تمر (3 حبات)',            type:'meal',    kcal:83,                protein:0.6, carbs:22,  fat:0,   img:_IMG.dates        },
  { sid:'preset_cucumber',     name:'خيار',                   type:'product', baseKcal:16,  baseG:100, protein:0.7, carbs:3.6, fat:0,   img:_IMG.cucumber     },
  { sid:'preset_tomato',       name:'طماطم',                   type:'product', baseKcal:18,  baseG:100, protein:0.9, carbs:3.9, fat:0,   img:_IMG.tomato       },
  // ── مطاعم سعودية ───────────────────────────────────────────────
  // البيك
  { sid:'preset_baik_broast',  name:'البيك — بروستد (2 قطعة)', type:'meal',    kcal:460,               protein:32,  carbs:28,  fat:22,  img:_IMG.baik         },
  { sid:'preset_baik_haraq',   name:'البيك — بروستد حراق',     type:'meal',    kcal:470,               protein:32,  carbs:29,  fat:23,  img:_IMG.baik         },
  { sid:'preset_baik_burger',  name:'البيك — برجر بيك',        type:'meal',    kcal:540,               protein:28,  carbs:44,  fat:26,  img:_IMG.baik         },
  { sid:'preset_baik_bites',   name:'البيك — بايتس (6 قطع)',   type:'meal',    kcal:350,               protein:22,  carbs:20,  fat:18,  img:_IMG.baik         },
  // ماكدونالدز
  { sid:'preset_mc_bigmac',    name:'ماكدونالدز — بيج ماك',    type:'meal',    kcal:550,               protein:25,  carbs:46,  fat:28,  img:_IMG.mcdonalds    },
  { sid:'preset_mc_crispy',    name:'ماكدونالدز — ماك كريسبي', type:'meal',    kcal:490,               protein:26,  carbs:42,  fat:22,  img:_IMG.mcdonalds    },
  { sid:'preset_mc_nuggets',   name:'ماكدونالدز — نجتس (6)',   type:'meal',    kcal:280,               protein:15,  carbs:16,  fat:15,  img:_IMG.mcdonalds    },
  // بيت الشاورما
  { sid:'preset_bsh_meat',     name:'بيت الشاورما — شاورما لحم',  type:'meal', kcal:450,               protein:28,  carbs:35,  fat:18,  img:_IMG.shawarmahouse},
  { sid:'preset_bsh_chicken',  name:'بيت الشاورما — شاورما دجاج', type:'meal', kcal:380,               protein:30,  carbs:32,  fat:12,  img:_IMG.shawarmahouse},
  { sid:'preset_bsh_mix',      name:'بيت الشاورما — شاورما مشكل', type:'meal', kcal:420,               protein:29,  carbs:34,  fat:15,  img:_IMG.shawarmahouse},
  // شاورما رايق
  { sid:'preset_rayeq_chicken',name:'شاورما رايق — دجاج',      type:'meal',    kcal:370,               protein:28,  carbs:32,  fat:11,  img:_IMG.rayeq        },
  { sid:'preset_rayeq_meat',   name:'شاورما رايق — لحم',       type:'meal',    kcal:440,               protein:26,  carbs:36,  fat:17,  img:_IMG.rayeq        },
  // دانكن
  { sid:'preset_dunkin_glazed',name:'دانكن — دونات جلازد',     type:'meal',    kcal:260,               protein:4,   carbs:32,  fat:12,  img:_IMG.dunkin       },
  { sid:'preset_dunkin_choco', name:'دانكن — دونات شوكولاتة',  type:'meal',    kcal:290,               protein:4,   carbs:36,  fat:14,  img:_IMG.dunkin       },
  { sid:'preset_dunkin_cap',   name:'دانكن — كابتشينو (وسط)',  type:'meal',    kcal:120,               protein:6,   carbs:14,  fat:4,   img:_IMG.dunkin       },
  // بيتزا هت
  { sid:'preset_ph_margarita', name:'بيتزا هت — مارغريتا (قطعة)', type:'meal', kcal:260,               protein:11,  carbs:32,  fat:9,   img:_IMG.pizzahut     },
  { sid:'preset_ph_pepperoni', name:'بيتزا هت — بيبروني (قطعة)',  type:'meal', kcal:290,               protein:13,  carbs:32,  fat:12,  img:_IMG.pizzahut     },
  // كريسبي كريم
  { sid:'preset_kk_oreo',      name:'كريسبي كريم — دونات أوريو', type:'meal', kcal:380,               protein:5,   carbs:45,  fat:19,  img:_IMG.krispykreme  },
  { sid:'preset_kk_classic',   name:'كريسبي كريم — دونات كلاسيك', type:'meal',kcal:190,               protein:2,   carbs:22,  fat:10,  img:_IMG.krispykreme  },
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
