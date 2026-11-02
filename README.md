# THE LAST GARAGE — آخرین گاراژ (نسخهٔ فول ۱.۱.۰)

بازی ماجراجویی داستانی، معمایی و ترسناک **اول‌شخص سه‌بعدی** برای اندروید — دوزبانه (فارسی/انگلیسی)، کاملاً لمسی، با ذخیرهٔ خودکار پایدار.
همهٔ تکسچرها، آیکون‌ها و صداها **به‌صورت رویه‌ای در خود کد ساخته می‌شوند**؛ هیچ فایل صوتی/تصویری دارای حق نشر وجود ندارد.

> **نسخهٔ فول:** هر **۱۰۰ مرحله** در **۱۰ فصل** داستانی، کامل و قابل بازی است — با ۱۱ نوع معما (قفل رمزی، سیم‌کشی، ساعت، اهرم‌ها، نمادها، فیوز، قفل عددی، شیر فشار، جست‌وجو، نامه و ترکیبی) و ۳ پایان متفاوت بر اساس انتخاب‌های شما.

## 🎮 داستان
پدربزرگت سه هفته پیش بی‌سر و صدا ناپدید شد؛ فقط یک وکیل، یک قلم امضا و کلیدی زنگ‌زده برایت گذاشت. حالا جلوی گاراژ قدیمی او ایستاده‌ای. این گاراژ فقط یک تعمیرگاه نیست…

## ✨ امکانات
- محیط سه‌بعدی WebGL (Three.js r147): گاراژ، انبار و زیرزمین مخفی با نورپردازی سینمایی چراغ‌قوه، لامپ چشمک‌زن، مخروط نور و گردوغبار
- کنترل لمسی کامل: جوی‌استیک + نگاه با کشیدن + دکمه‌های تعامل/کیف/دفترچه/راهنما/مکث (کیبورد WASD/E برای دسکتاپ)
- ۱۰۰ مرحله در ۱۰ فصل با معما، یادداشت، وسیله، دستاورد (۱۰ عدد) و انتخاب‌های داستانی چندشاخه
- ۳ پایان متفاوت (حقیقت / خاکستر / رفتن) بر اساس انتخاب‌های شما در طول بازی
- کیف با پیش‌نمایش سه‌بعدی وسیله، دفترچه (اهداف/یادداشت‌ها/وسایل/دستاوردها/پایان‌ها)، راهنمای مرحله‌ای
- صدا کاملاً سینتز‌شده با WebAudio؛ بدون هیچ فایل صوتی
- ذخیره و ذخیرهٔ خودکار پایدار (بعد از بستن برنامه)، انتخاب فصل، تنظیمات کیفیت/صدا/حساسیت/لرزش/زبان

## 📲 نصب روی گوشی
1. فایل `TheLastGarage-v1.1.0-release.apk` را به گوشی بفرستید (تلگرام/ایمیل/کابل).
2. روی فایل بزنید و «اجازه نصب از این منبع» را فعال کنید.
3. نصب و بازی! حداقل اندروید: ۷.۰ (API 24).

## 🛠 ساخت از سورس
```bash
./gradlew assembleDebug      # app/build/outputs/apk/debug/
./gradlew assembleRelease    # نسخهٔ امضاشده (در صورت وجود app/keystore.properties)
./gradlew bundleRelease      # فایل AAB برای گوگل‌پلی
```
پیش‌نیاز: JDK 17 و Android SDK (platform 34 + build-tools 34).

### امضای Release
کلید را هرگز commit نکنید. محلی: فایل `app/keystore.properties` با فیلدهای
`storeFile / storePassword / keyAlias / keyPassword` بسازید و `release.jks` را در `app/` بگذارید.
در CI: چهار Secret با نام‌های `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` تعریف کنید؛
ورک‌فلو `.github/workflows/android.yml` خودش decode و امضا می‌کند و APK/AAB را در Artifacts می‌گذارد.
برای تگ‌گذاری (`v1.1.0`) به‌طور خودکار GitHub Release ساخته می‌شود.

## 📁 ساختار
```
app/src/main/assets/game/  ← کل بازی (WebGL): js/ (12 ماژول) + css + fonts (Vazirmatn)
app/src/main/java/…/MainActivity.java  ← پوستهٔ WebView + بریج لرزش/خروج
app/src/main/res/          ← آیکون‌ها و تم
.github/workflows/android.yml  ← بیلد ابری خودکار (APK + AAB + Release)
js/data_levels.js          ← دادهٔ ۱۰۰ مرحله، ۱۰ فصل و ۳ پایان
js/levels.js               ← موتور اجرای مراحل و ۱۱ نوع معما
```

## 🧭 ساختار داستانی (۱۰ فصل)
ورود به گاراژ · ماشین مرموز · دفترچهٔ رمزگذاری‌شده · اتاق ممنوعه · زیرزمین مخفی · حقیقت پنهان · آزمایشگاه سری · دنبال‌کردن سرنخ‌ها · قطعات نهایی · راز نهایی

## 📜 مجوزها
کد: MIT. Three.js (MIT) و Vazirmatn (SIL OFL 1.1). بقیهٔ دارایی‌ها ساخت اختصاصی همین پروژه و بدون حق نشر ثالث است.

---

## English Summary
First-person story-driven mystery/horror game for Android (WebView + Three.js WebGL, Gradle build). Fully touch-controlled, bilingual (Persian/English, RTL), procedural textures & audio only — no third-party copyrighted assets. **All 100 levels across 10 chapters are playable**, with 11 puzzle types, 10 achievements, branching choices and 3 endings. Persistent saves via WebView DOM storage. Build with `./gradlew assembleDebug` or push to GitHub — the included Actions workflow produces debug APK, release APK and AAB automatically.
