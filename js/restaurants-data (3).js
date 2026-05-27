// ================================================================
// SAUDI_RESTAURANTS — logos + food images + macros
// Source: PDF (مطاعم وسعرات نهائي)
// Images: URLs — replace with base64 as needed
// ================================================================

const RESTAURANT_LOGOS = {
  shawarmer:          "https://upload.wikimedia.org/wikipedia/ar/thumb/7/7c/Shawarmer_Logo.png/220px-Shawarmer_Logo.png",
  deep_fries:         "https://deepfries.com.sa/wp-content/uploads/2022/01/deep-logo.png",
  shawarma_house:     "https://shawarmahouse.com.sa/wp-content/uploads/2021/01/logo.png",
  mcdonalds:          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/220px-McDonald%27s_Golden_Arches.svg.png",
  kfc:                "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/200px-KFC_logo.svg.png",
  albik:              "https://upload.wikimedia.org/wikipedia/ar/thumb/4/41/Al_Baik_logo.svg/220px-Al_Baik_logo.svg.png",
  subway:             "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Subway_2016_logo.svg/220px-Subway_2016_logo.svg.png",
  shawayet_alkhaleej: "https://shawayet-alkhaleej.com/wp-content/uploads/2020/01/logo.png",
  rayeq:              "https://rayeq.com.sa/wp-content/uploads/2022/01/logo.png",
  kudu:               "https://upload.wikimedia.org/wikipedia/ar/thumb/1/18/Kudu_logo.png/220px-Kudu_logo.png",
  wendys:             "https://upload.wikimedia.org/wikipedia/en/thumb/3/32/Wendy%27s_full_logo_2012.svg/220px-Wendy%27s_full_logo_2012.svg.png",
  altazej:            "https://altazej.com/wp-content/uploads/2021/01/logo.png",
  five_guys:          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Five_Guys_logo.svg/220px-Five_Guys_logo.svg.png",
  burger_king:        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/220px-Burger_King_logo_%281999%29.svg.png",
  raising_canes:      "https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/Raising_Cane%27s_logo.svg/220px-Raising_Cane%27s_logo.svg.png",
};

// Food images: restaurantId → { itemName: imageURL }
// Replace URLs with base64 strings as needed
const FOOD_IMAGES = {
  shawarmer: {
    "الراهية":           "https://shawarmer.com/images/menu/rahiya.jpg",
    "سيييلي":            "https://shawarmer.com/images/menu/siyali.jpg",
    "أبو خلطة":          "https://shawarmer.com/images/menu/abu-khalta.jpg",
    "الصندوق 8 قطع":     "https://shawarmer.com/images/menu/box-8.jpg",
    "عربو دجاج 6 قطع":   "https://shawarmer.com/images/menu/arbo-6.jpg",
  },
  deep_fries: {
    "Classic Burger":                  "https://deepfries.com.sa/images/classic-burger.jpg",
    "Deep Signature Chicken Medium":   "https://deepfries.com.sa/images/sig-chicken-m.jpg",
    "Deep Signature Chicken Large":    "https://deepfries.com.sa/images/sig-chicken-l.jpg",
  },
  shawarma_house: {
    "عربي دجاج":       "https://shawarmahouse.com.sa/images/arabi-chicken.jpg",
    "شاورما دجاج":     "https://shawarmahouse.com.sa/images/shawarma-chicken.jpg",
    "شاورما لحم":      "https://shawarmahouse.com.sa/images/shawarma-meat.jpg",
    "ترفل هاوس":       "https://shawarmahouse.com.sa/images/truffle-house.jpg",
    "امريكان تشكن":    "https://shawarmahouse.com.sa/images/american-chicken.jpg",
    "سموكي برجر":      "https://shawarmahouse.com.sa/images/smoky-burger.jpg",
    "دبل N برجر":      "https://shawarmahouse.com.sa/images/double-n-burger.jpg",
    "ماش برجر":        "https://shawarmahouse.com.sa/images/mash-burger.jpg",
    "ريد برجر":        "https://shawarmahouse.com.sa/images/red-burger.jpg",
    "برجر ناشفل":      "https://shawarmahouse.com.sa/images/nashville-burger.jpg",
    "تويستر ناشفل":    "https://shawarmahouse.com.sa/images/nashville-twister.jpg",
    "تاكو تاشفل":      "https://shawarmahouse.com.sa/images/nashville-taco.jpg",
    "بروستد":          "https://shawarmahouse.com.sa/images/brosted.jpg",
    "كرانشي سبريم":    "https://shawarmahouse.com.sa/images/crunchy-supreme.jpg",
  },
  mcdonalds: {
    "بيج تايستي":              "https://www.mcdonalds.com.sa/images/big-tasty.jpg",
    "جراند تشيكن":             "https://www.mcdonalds.com.sa/images/grand-chicken.jpg",
    "بيج تايستي (مش)":         "https://www.mcdonalds.com.sa/images/big-tasty-mush.jpg",
    "بيج تايستي (فطر)":        "https://www.mcdonalds.com.sa/images/big-tasty-mush2.jpg",
    "جراند تشيكن ديلوكس":     "https://www.mcdonalds.com.sa/images/grand-chicken-dlx.jpg",
    "بيج ماك":                 "https://www.mcdonalds.com.sa/images/big-mac.jpg",
    "تشيكن ماك":               "https://www.mcdonalds.com.sa/images/chicken-mac.jpg",
    "ماك عربي":                "https://www.mcdonalds.com.sa/images/mac-arabi.jpg",
    "ليتل تايستي":             "https://www.mcdonalds.com.sa/images/little-tasty.jpg",
    "ماك راب":                 "https://www.mcdonalds.com.sa/images/mac-wrap.jpg",
    "تربل تشيز برجر":          "https://www.mcdonalds.com.sa/images/triple-cheese.jpg",
    "تشيكن برجر":              "https://www.mcdonalds.com.sa/images/chicken-burger.jpg",
    "ناجتس 4 قطع":             "https://www.mcdonalds.com.sa/images/nuggets-4.jpg",
    "ناجتس 6 قطع":             "https://www.mcdonalds.com.sa/images/nuggets-6.jpg",
    "ناجتس 9 قطع":             "https://www.mcdonalds.com.sa/images/nuggets-9.jpg",
    "بطاطس بالحجم الصغير":     "https://www.mcdonalds.com.sa/images/fries-s.jpg",
    "بطاطس بالحجم وسط":        "https://www.mcdonalds.com.sa/images/fries-m.jpg",
    "بطاطس بالحجم الكبير":     "https://www.mcdonalds.com.sa/images/fries-l.jpg",
  },
  kfc: {
    "تويستر للوديد":     "https://kfc.com.sa/images/twister-loaded.jpg",
    "تويستر عادي":       "https://kfc.com.sa/images/twister-regular.jpg",
    "بوكس ماستر":        "https://kfc.com.sa/images/box-master.jpg",
    "مايتي زينجر":       "https://kfc.com.sa/images/mighty-zinger.jpg",
    "ستربس بوكس":        "https://kfc.com.sa/images/strips-box.jpg",
    "كرانشي":            "https://kfc.com.sa/images/crunchy.jpg",
    "اورينجل كرانشي":    "https://kfc.com.sa/images/original-crunchy.jpg",
    "تويستر بوكس":       "https://kfc.com.sa/images/twister-box.jpg",
    "زينجر عادي":        "https://kfc.com.sa/images/zinger-regular.jpg",
    "بطاطس وسط":         "https://kfc.com.sa/images/fries-m.jpg",
    "سناك بوكس":         "https://kfc.com.sa/images/snack-box.jpg",
    "دينر وجبة":         "https://kfc.com.sa/images/dinner-meal.jpg",
    "8 قطع باكيت":       "https://kfc.com.sa/images/bucket-8.jpg",
    "12 قطع باكيت":      "https://kfc.com.sa/images/bucket-12.jpg",
    "16 قطع باكيت":      "https://kfc.com.sa/images/bucket-16.jpg",
  },
  albik: {
    "بيج بيك (حار)":         "https://albaik.com/images/big-baik-hot.jpg",
    "بيج بيك (عادي)":        "https://albaik.com/images/big-baik-regular.jpg",
    "بروستد (حار)":           "https://albaik.com/images/broasted-hot.jpg",
    "بروستد (عادي)":          "https://albaik.com/images/broasted-regular.jpg",
    "مسحب 7 قطع (حار)":      "https://albaik.com/images/mashab-7-hot.jpg",
    "مسحب 7 قطع (عادي)":     "https://albaik.com/images/mashab-7-regular.jpg",
    "سوبر بيك دجاج":          "https://albaik.com/images/super-baik-chicken.jpg",
    "باربكيو بيك":            "https://albaik.com/images/bbq-baik.jpg",
  },
  subway: {
    "Steak & Cheese 6 Inch":         "https://www.subway.com/images/steak-cheese.jpg",
    "Chicken Fajita 6 Inch":         "https://www.subway.com/images/chicken-fajita.jpg",
    "Chicken Teriyaki 6 Inch":       "https://www.subway.com/images/chicken-teriyaki.jpg",
    "BMT Classic 6 Inch":            "https://www.subway.com/images/bmt-classic.jpg",
    "Turkey Breast 6 Inch":          "https://www.subway.com/images/turkey-breast.jpg",
    "Tuna 6 Inch":                   "https://www.subway.com/images/tuna.jpg",
    "Grilled Chicken Breast 6 Inch": "https://www.subway.com/images/grilled-chicken.jpg",
    "Peri Peri Chicken 6 Inch":      "https://www.subway.com/images/peri-peri.jpg",
    "Rotisserie Chicken 6 Inch":     "https://www.subway.com/images/rotisserie-chicken.jpg",
  },
  shawayet_alkhaleej: {
    "دجاج شواية (100 جرام)":          "https://shawayet-alkhaleej.com/images/grilled-chicken-100.jpg",
    "رز أحمر (100 جرام)":             "https://shawayet-alkhaleej.com/images/red-rice-100.jpg",
    "حبة شواية كاملة":                "https://shawayet-alkhaleej.com/images/full-chicken.jpg",
    "حبة شواية (بدون عظم)":           "https://shawayet-alkhaleej.com/images/boneless-chicken.jpg",
    "رز أحمر وجبة (400-500 جرام)":    "https://shawayet-alkhaleej.com/images/red-rice-meal.jpg",
  },
  rayeq: {
    "4 قطع عربي":      "https://rayeq.com.sa/images/4-arabi.jpg",
    "7 قطع عربي":      "https://rayeq.com.sa/images/7-arabi.jpg",
    "10 قطع عربي":     "https://rayeq.com.sa/images/10-arabi.jpg",
    "القطعة الواحدة":  "https://rayeq.com.sa/images/one-piece.jpg",
  },
  kudu: {
    "ساندوش كودو لحم":      "https://kudu.com.sa/images/kudu-beef.jpg",
    "ساندوش فيلي ستيك":     "https://kudu.com.sa/images/philly-steak.jpg",
    "لفينو فيلي ستيك":      "https://kudu.com.sa/images/lavino-philly.jpg",
    "ساندوش برجر الدجاج":   "https://kudu.com.sa/images/chicken-burger.jpg",
    "كلوب ساندوش":          "https://kudu.com.sa/images/club-sandwich.jpg",
    "ساندوش دجاج":          "https://kudu.com.sa/images/chicken-sandwich.jpg",
    "لفينو دجاج":           "https://kudu.com.sa/images/lavino-chicken.jpg",
  },
  wendys: {
    "سينقل برجر":        "https://wendys.com/images/single-burger.jpg",
    "دبل برجر":          "https://wendys.com/images/double-burger.jpg",
    "تريب برجر":         "https://wendys.com/images/triple-burger.jpg",
    "بيف برجر":          "https://wendys.com/images/beef-burger.jpg",
    "كلاسيك تشكن برجر":  "https://wendys.com/images/classic-chicken.jpg",
    "كلاسيك سبايسي":     "https://wendys.com/images/classic-spicy.jpg",
  },
  altazej: {
    "فروج دجاج (100 جرام)": "https://altazej.com/images/chicken-100.jpg",
  },
};

// ── Restaurant data with macros from PDF ─────────────────────────
const SAUDI_RESTAURANTS = [
  {
    id: 'shawarmer', name: 'شاورمر', nameEn: 'Shawarmer', color: '#6B0E28',
    items: [
      { name: "الراهية",         kcal: 1154, protein: 35, carbs: 100, fat: 55 },
      { name: "سيييلي",          kcal: 1337, protein: 38, carbs: 110, fat: 65 },
      { name: "أبو خلطة",        kcal: 823,  protein: 28, carbs: 80,  fat: 35 },
      { name: "الصندوق 8 قطع",   kcal: 1451, protein: 48, carbs: 110, fat: 70 },
      { name: "عربو دجاج 6 قطع", kcal: 1312, protein: 40, carbs: 105, fat: 60 },
    ]
  },
  {
    id: 'deep_fries', name: 'Deep Fries', nameEn: 'Deep Fries', color: '#E5A500',
    items: [
      { name: "Classic Burger",                 kcal: 1120, protein: 30, carbs: 95,  fat: 55 },
      { name: "Deep Signature Chicken Medium",  kcal: 960,  protein: 25, carbs: 80,  fat: 45 },
      { name: "Deep Signature Chicken Large",   kcal: 1244, protein: 33, carbs: 100, fat: 60 },
    ]
  },
  {
    id: 'shawarma_house', name: 'بيت الشاورما', nameEn: 'Shawarma House', color: '#E07B00',
    items: [
      { name: "عربي دجاج",      kcal: 970,  protein: 36, carbs: 70, fat: 50 },
      { name: "شاورما دجاج",    kcal: 330,  protein: 19, carbs: 32, fat: 15 },
      { name: "شاورما لحم",     kcal: 350,  protein: 20, carbs: 26, fat: 17 },
      { name: "ترفل هاوس",      kcal: 590,  protein: 30, carbs: 35, fat: 36 },
      { name: "امريكان تشكن",   kcal: 440,  protein: 24, carbs: 37, fat: 22 },
      { name: "سموكي برجر",     kcal: 960,  protein: 42, carbs: 45, fat: 55 },
      { name: "دبل N برجر",     kcal: 395,  protein: 26, carbs: 28, fat: 19 },
      { name: "ماش برجر",       kcal: 568,  protein: 28, carbs: 32, fat: 32 },
      { name: "ريد برجر",       kcal: 900,  protein: 45, carbs: 40, fat: 55 },
      { name: "برجر ناشفل",     kcal: 730,  protein: 33, carbs: 45, fat: 43 },
      { name: "تويستر ناشفل",   kcal: 670,  protein: 32, carbs: 50, fat: 34 },
      { name: "تاكو تاشفل",     kcal: 620,  protein: 30, carbs: 38, fat: 35 },
      { name: "بروستد",         kcal: 1395, protein: 59, carbs: 49, fat: 94 },
      { name: "كرانشي سبريم",   kcal: 440,  protein: 24, carbs: 37, fat: 22 },
    ]
  },
  {
    id: 'mcdonalds', name: 'ماكدونالدز', nameEn: "McDonald's", color: '#FFC300',
    items: [
      { name: "بيج تايستي",              kcal: 870,  protein: 45,   carbs: 61, fat: 50   },
      { name: "جراند تشيكن",             kcal: 858,  protein: 36.7, carbs: 75, fat: 47   },
      { name: "بيج تايستي (مش)",         kcal: 820,  protein: 42.8, carbs: 76, fat: 42   },
      { name: "بيج تايستي (فطر)",        kcal: 1000, protein: 47,   carbs: 70, fat: 59   },
      { name: "جراند تشيكن ديلوكس",     kcal: 812,  protein: 42,   carbs: 77, fat: 42   },
      { name: "بيج ماك",                 kcal: 603,  protein: 31,   carbs: 52, fat: 31   },
      { name: "تشيكن ماك",               kcal: 579,  protein: 24,   carbs: 60, fat: 27   },
      { name: "ماك عربي",                kcal: 579,  protein: 24,   carbs: 60, fat: 27   },
      { name: "ليتل تايستي",             kcal: 489,  protein: 21,   carbs: 48, fat: 23   },
      { name: "ماك راب",                 kcal: 481,  protein: 19,   carbs: 34, fat: 29   },
      { name: "تربل تشيز برجر",          kcal: 858,  protein: 36.7, carbs: 75, fat: 47   },
      { name: "تشيكن برجر",              kcal: 820,  protein: 42.8, carbs: 76, fat: 42   },
      { name: "ناجتس 4 قطع",             kcal: 158,  protein: 10,   carbs: 10, fat: 8    },
      { name: "ناجتس 6 قطع",             kcal: 237,  protein: 12,   carbs: 15, fat: 12   },
      { name: "ناجتس 9 قطع",             kcal: 355,  protein: 24,   carbs: 23, fat: 18   },
      { name: "بطاطس بالحجم الصغير",     kcal: 203,  protein: 3.5,  carbs: 25, fat: 10   },
      { name: "بطاطس بالحجم وسط",        kcal: 382,  protein: 6.5,  carbs: 47, fat: 18.6 },
      { name: "بطاطس بالحجم الكبير",     kcal: 527,  protein: 9,    carbs: 65, fat: 25   },
    ]
  },
  {
    id: 'kfc', name: 'KFC', nameEn: 'KFC', color: '#E4002B',
    items: [
      { name: "تويستر للوديد",  kcal: 443,  protein: 21,  carbs: 42,  fat: 19    },
      { name: "تويستر عادي",    kcal: 420,  protein: 18,  carbs: 38,  fat: 17    },
      { name: "بوكس ماستر",     kcal: 635,  protein: 32,  carbs: 52,  fat: 29    },
      { name: "مايتي زينجر",    kcal: 835,  protein: 47,  carbs: 63,  fat: 42    },
      { name: "ستربس بوكس",     kcal: 1050, protein: 50,  carbs: 75,  fat: 52    },
      { name: "كرانشي",         kcal: 720,  protein: 29,  carbs: 64,  fat: 24    },
      { name: "اورينجل كرانشي", kcal: 520,  protein: 19,  carbs: 44,  fat: 14    },
      { name: "تويستر بوكس",    kcal: 950,  protein: 45,  carbs: 90,  fat: 43    },
      { name: "زينجر عادي",     kcal: 570,  protein: 27,  carbs: 47,  fat: 26    },
      { name: "بطاطس وسط",      kcal: 319,  protein: 4,   carbs: 35,  fat: 15    },
      { name: "سناك بوكس",      kcal: 620,  protein: 35,  carbs: 50,  fat: 32    },
      { name: "دينر وجبة",      kcal: 960,  protein: 55,  carbs: 70,  fat: 70    },
      { name: "8 قطع باكيت",    kcal: 1520, protein: 112, carbs: 85,  fat: 85    },
      { name: "12 قطع باكيت",   kcal: 2202, protein: 172, carbs: 105, fat: 123   },
      { name: "16 قطع باكيت",   kcal: 2900, protein: 224, carbs: 125, fat: 171   },
    ]
  },
  {
    id: 'albik', name: 'البيك', nameEn: 'AlBaik', color: '#CC0000',
    items: [
      { name: "بيج بيك (حار)",       kcal: 1066, protein: 41,   carbs: 101, fat: 38.6 },
      { name: "بيج بيك (عادي)",      kcal: 1035, protein: 46.8, carbs: 104, fat: 33.6 },
      { name: "بروستد (حار)",        kcal: 1425, protein: 67,   carbs: 92,  fat: 52.7 },
      { name: "بروستد (عادي)",       kcal: 1316, protein: 78,   carbs: 83,  fat: 43   },
      { name: "مسحب 7 قطع (حار)",   kcal: 1066, protein: 38,   carbs: 102, fat: 28   },
      { name: "مسحب 7 قطع (عادي)",  kcal: 1052, protein: 45,   carbs: 106, fat: 24.7 },
      { name: "سوبر بيك دجاج",      kcal: 1025, protein: 45,   carbs: 85,  fat: 52   },
      { name: "باربكيو بيك",         kcal: 581,  protein: 28,   carbs: 42,  fat: 32   },
    ]
  },
  {
    id: 'subway', name: 'ساب واي', nameEn: 'Subway', color: '#009B3A',
    items: [
      { name: "Steak & Cheese 6 Inch",         kcal: 320, protein: 23, carbs: 40, fat: 10 },
      { name: "Chicken Fajita 6 Inch",         kcal: 290, protein: 22, carbs: 39, fat: 6  },
      { name: "Chicken Teriyaki 6 Inch",       kcal: 370, protein: 25, carbs: 50, fat: 5  },
      { name: "BMT Classic 6 Inch",            kcal: 390, protein: 20, carbs: 40, fat: 19 },
      { name: "Turkey Breast 6 Inch",          kcal: 280, protein: 25, carbs: 32, fat: 6  },
      { name: "Tuna 6 Inch",                   kcal: 450, protein: 19, carbs: 40, fat: 24 },
      { name: "Grilled Chicken Breast 6 Inch", kcal: 330, protein: 28, carbs: 34, fat: 7  },
      { name: "Peri Peri Chicken 6 Inch",      kcal: 330, protein: 26, carbs: 38, fat: 7  },
      { name: "Rotisserie Chicken 6 Inch",     kcal: 310, protein: 24, carbs: 37, fat: 6  },
    ]
  },
  {
    id: 'shawayet_alkhaleej', name: 'شواية الخليج', nameEn: 'Shawayet AlKhaleej', color: '#1A237E',
    items: [
      { name: "دجاج شواية (100 جرام)",         kcal: 197,  protein: 27,  carbs: 0,   fat: 8  },
      { name: "رز أحمر (100 جرام)",            kcal: 155,  protein: 2,   carbs: 26,  fat: 4  },
      { name: "حبة شواية كاملة",               kcal: 2154, protein: 199, carbs: 130, fat: 76 },
      { name: "حبة شواية (بدون عظم)",          kcal: 1379, protein: 189, carbs: 0,   fat: 56 },
      { name: "رز أحمر وجبة (400-500 جرام)",   kcal: 775,  protein: 10,  carbs: 130, fat: 20 },
    ]
  },
  {
    id: 'rayeq', name: 'رايق', nameEn: 'Rayeq', color: '#CC0000',
    items: [
      { name: "4 قطع عربي",     kcal: 540,  protein: 24, carbs: 52,  fat: 24 },
      { name: "7 قطع عربي",     kcal: 945,  protein: 42, carbs: 91,  fat: 42 },
      { name: "10 قطع عربي",    kcal: 1350, protein: 60, carbs: 130, fat: 60 },
      { name: "القطعة الواحدة", kcal: 135,  protein: 6,  carbs: 13,  fat: 6  },
    ]
  },
  {
    id: 'kudu', name: 'كودو', nameEn: 'KUDU', color: '#1B3A8C',
    items: [
      { name: "ساندوش كودو لحم",    kcal: 715,  protein: 27, carbs: 51, fat: 35 },
      { name: "ساندوش فيلي ستيك",   kcal: 764,  protein: 29, carbs: 54, fat: 38 },
      { name: "لفينو فيلي ستيك",    kcal: 1042, protein: 25, carbs: 50, fat: 5  },
      { name: "ساندوش برجر الدجاج", kcal: 599,  protein: 26, carbs: 48, fat: 30 },
      { name: "كلوب ساندوش",        kcal: 885,  protein: 38, carbs: 55, fat: 52 },
      { name: "ساندوش دجاج",        kcal: 609,  protein: 30, carbs: 47, fat: 28 },
      { name: "لفينو دجاج",         kcal: 575,  protein: 31, carbs: 43, fat: 24 },
    ]
  },
  {
    id: 'wendys', name: "ويندي'ز", nameEn: "Wendy's", color: '#E2231A',
    items: [
      { name: "سينقل برجر",       kcal: 580,  protein: 29, carbs: 35, fat: 36 },
      { name: "دبل برجر",         kcal: 850,  protein: 49, carbs: 35, fat: 57 },
      { name: "تريب برجر",        kcal: 1150, protein: 71, carbs: 36, fat: 81 },
      { name: "بيف برجر",         kcal: 930,  protein: 67, carbs: 34, fat: 63 },
      { name: "كلاسيك تشكن برجر", kcal: 480,  protein: 29, carbs: 44, fat: 21 },
      { name: "كلاسيك سبايسي",    kcal: 603,  protein: 31, carbs: 52, fat: 31 },
    ]
  },
  {
    id: 'altazej', name: 'الطازج', nameEn: 'AlTazej', color: '#E8701A',
    items: [
      { name: "فروج دجاج (100 جرام)", kcal: 297, protein: 55, carbs: 0, fat: 8 },
    ]
  },
];

// ── Helpers ───────────────────────────────────────────────────────
function getRestaurantLogo(id)      { return RESTAURANT_LOGOS[id] || null; }
function getFoodImage(id, name)     { return (FOOD_IMAGES[id] && FOOD_IMAGES[id][name]) || null; }
function getRestaurantById(id)      { return SAUDI_RESTAURANTS.find(r => r.id === id) || null; }
function searchRestaurantItems(query) {
  const q = query.trim();
  if (!q) return [];
  const results = [];
  for (const r of SAUDI_RESTAURANTS) {
    for (const item of r.items) {
      if (item.name.includes(q) || r.name.includes(q) || r.nameEn.toLowerCase().includes(q.toLowerCase())) {
        results.push({ ...item, restaurant: r.name, restaurantId: r.id, color: r.color });
      }
    }
  }
  return results;
}
