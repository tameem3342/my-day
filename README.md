# يومي — Project Structure

## قبل وبعد التقسيم

| الملف | قبل | بعد |
|-------|-----|-----|
| `index.html` | 305KB (ملف واحد) | 105KB (HTML فقط) |
| JS modules | — | 12 ملف منظم |
| CSS | inline | `css/styles.css` (34KB) |

---

## هيكل المشروع

```
yawmi/
├── index.html          ← HTML فقط، بدون style أو script
├── css/
│   └── styles.css      ← كل الـ CSS (قابل للـ cache)
└── js/
    ├── init.js         ← يشتغل أول شيء: anti-iframe + اتجاه اللغة
    ├── i18n.js         ← ترجمات عربي/إنجليزي (5KB)
    ├── storage.js      ← localStorage + Supabase layer (5KB)
    ├── data.js         ← state, presets, day management (7KB)
    ├── ui.js           ← theme, tabs, tasks, calendar (24KB)
    ├── food.js         ← سعرات، وجبات، food modal (29KB)
    ├── notes_log.js    ← ملاحظات، سجل الأيام (14KB)
    ├── workout.js      ← تمارين، workout planner (34KB)
    ├── weight.js       ← الوزن، SVG chart (8KB)
    ├── settings.js     ← الأقسام، الإعدادات (19KB)
    ├── auth.js         ← تسجيل دخول، Supabase sync (14KB)
    ├── health.js       ← BMI، TDEE، onboarding (21KB)
    └── pwa.js          ← Service Worker، install banner (3KB)
```

---

## ترتيب تحميل الـ JS (مهم)

الملفات تتحمل بالترتيب لأن كل ملف يعتمد على اللي قبله:

```
init.js → i18n.js → storage.js → data.js → ui.js
→ food.js → notes_log.js → workout.js → weight.js
→ settings.js → auth.js → health.js → pwa.js
```

---

## فوائد التقسيم

### 1. Browser Caching
المتصفح يحفظ كل ملف منفصل. لو عدّلت `food.js` فقط،
المستخدم يُعيد تحميل 29KB بدل 305KB.

### 2. سهولة الصيانة
- تغيير ترجمة؟ افتح `i18n.js`
- مشكلة في الوجبات؟ افتح `food.js`
- خطأ في المصادقة؟ افتح `auth.js`

### 3. الخطوة التالية: Code Splitting حقيقي

لو أردت تطبيق lazy loading (تحميل الكود فقط عند الحاجة)،
المسار الصحيح هو تحويل المشروع لـ Vite:

```bash
npm create vite@latest yawmi -- --template vanilla
```

ثم تحويل الملفات لـ ES modules بإضافة `export` و `import`:

```js
// i18n.js
export const T = { en: {...}, ar: {...} };

// ui.js
import { T } from './i18n.js';
```

وفي index.html:
```html
<script type="module" src="js/main.js"></script>
```

Vite يقوم تلقائياً بـ:
- Tree shaking (حذف الكود غير المستخدم)
- Code splitting (تقسيم حسب الـ routes)
- Minification (ضغط الملفات)
- Bundle analysis (شوف مين يأكل من الحجم)
