/* THE LAST GARAGE — i18n (fa/en) */
window.I18N = (function () {
  var STR = {
    fa: {
      title: 'آخرین گاراژ', sub: 'THE LAST GARAGE',
      newGame: 'بازی جدید', continue: 'ادامه بازی', chapters: 'انتخاب فصل', settings: 'تنظیمات',
      about: 'درباره', exit: 'خروج', loading: 'در حال بارگذاری…', tapToStart: 'برای شروع لمس کنید',
      resume: 'ادامه', restart: 'شروع دوباره مرحله', mainMenu: 'منوی اصلی',
      bag: 'کیف', journal: 'دفترچه', hint: 'راهنما', pause: 'مکث',
      obj: 'هدف', look: 'بررسی', open: 'باز کردن', take: 'برداشتن', use: 'استفاده',
      read: 'خواندن', close: 'بستن', back: 'بازگشت', ok: 'تأیید', submit: 'ثبت', cancel: 'لغو',
      locked: 'قفل است', soon: 'به‌زودی', done: 'انجام شد', stepDone: '✓ مرحله کامل شد',
      unlockedNext: 'مرحله بعدی باز شد', saved: 'ذخیره شد', itemGot: 'وسیله‌ی جدید: ',
      noteSaved: 'یادداشت به دفترچه اضافه شد', hintUsed: 'راهنما استفاده شد',
      objectives: 'اهداف', notes: 'یادداشت‌ها', items: 'وسایل', achs: 'دستاوردها', endings: 'پایان‌ها',
      noNotes: 'هنوز یادداشتی نیست.', noItems: 'کیف خالی است.', noAch: 'هنوز دستاوردی نیست.',
      endingsLocked: 'با پیشروی در داستان، پایان‌ها اینجا ثبت می‌شوند.',
      quality: 'کیفیت تصویر', low: 'کم', med: 'متوسط', high: 'بالا',
      volume: 'موزیک محیط', sfxVol: 'جلوه‌های صوتی', sens: 'حساسیت چرخش دوربین', vibrate: 'لرزش در تعامل',
      lang: 'زبان', on: 'روشن', off: 'خاموش',
      chLock: 'این فصل هنوز باز نشده است.', deleteSave: 'پاک کردن ذخیره', confirmDel: 'همه‌ی پیشرفت پاک شود؟',
      yes: 'بله', no: 'نه',
      aboutText: 'بازی ماجرایی ترسناک اول‌شخص — ساخته‌شده با Three.js و صدا و تصویر کاملاً رویه‌ای. نسخه فول ۱۰۰ مرحله در ۱۰ فصل.',
      wrongCode: 'درست نیست… دوباره فکر کن', solved: 'معما حل شد!',
      hintTitle: 'راهنمای این مرحله', hintCost: 'استفاده از راهنما در آمار ثبت می‌شود.',
      interactHint: 'برای بررسی نزدیک شو', choiceTitle: 'انتخاب شما',
      ending1T: 'پایان «حقیقت»', ending2T: 'پایان «خاکستر»', ending3T: 'پایان «رفتن»',
      level: 'مرحله', chapter: 'فصل', lvDone: 'این مرحله قبلاً کامل شده — می‌توانی دوباره بازی کنی.',
      continueQ: 'از کجا ادامه بدهیم؟', nextLv: 'مرحلهٔ بعد', menuLv: 'منو',
      keypad: 'صفحه‌کلید رمز', wires: 'اتصال سیم‌ها', clockSet: 'تنظیم ساعت', levers: 'اهرم‌ها',
      symbols: 'نمادها', fuseBox: 'جعبهٔ فیوز', mathT: 'قفل عددی', valves: 'شیرها', hunt: 'جست‌وجو',
      fusePick: 'فیوز مناسب را انتخاب کن:', wirePick: 'هر سیم را به جفتِ هم‌رنگش وصل کن:',
      leverHint: 'الگوی راهنما را روی اهرم‌ها پیاده کن (بالا=روشن):',
      symHint: 'ترتیب درست نمادها را از سرنخ انتخاب کن:',
      valveHint: 'فشار هر خط را روی عدد هدف تنظیم کن:',
      huntHint: 'جای‌های مشکوک را بگرد؛ چیزی که می‌خواهی همان‌جاست.',
      mathHint: 'پاسخ را از سرنخ‌ها حساب کن و وارد کن:',
      clockHint: 'عقربه‌ها را روی زمان سرنخ بگذار:',
      kpHint: 'رمز را از سرنخ‌ها پیدا کن:',
      cleared: 'پاک‌سازی شد', found: 'پیدا شد!', nothing: 'چیزی نیست…',
      needSteps: 'اول سرنخ‌های مرحله را پیدا کن.',
      autotest: 'حالت تست', restartAll: 'شروع داستان از نو'
    },
    en: {
      title: 'The Last Garage', sub: 'THE LAST GARAGE',
      newGame: 'New Game', continue: 'Continue', chapters: 'Chapters', settings: 'Settings',
      about: 'About', exit: 'Exit', loading: 'Loading…', tapToStart: 'Tap to start',
      resume: 'Resume', restart: 'Restart Level', mainMenu: 'Main Menu',
      bag: 'Bag', journal: 'Journal', hint: 'Hint', pause: 'Paused',
      obj: 'Objective', look: 'Inspect', open: 'Open', take: 'Take', use: 'Use',
      read: 'Read', close: 'Close', back: 'Back', ok: 'OK', submit: 'Submit', cancel: 'Cancel',
      locked: 'Locked', soon: 'Soon', done: 'Done', stepDone: '✓ Stage complete',
      unlockedNext: 'Next level unlocked', saved: 'Saved', itemGot: 'New item: ',
      noteSaved: 'Note added to journal', hintUsed: 'Hint used',
      objectives: 'Objectives', notes: 'Notes', items: 'Items', achs: 'Achievements', endings: 'Endings',
      noNotes: 'No notes yet.', noItems: 'Bag is empty.', noAch: 'No achievements yet.',
      endingsLocked: 'Endings you reach will be recorded here.',
      quality: 'Graphics quality', low: 'Low', med: 'Medium', high: 'High',
      volume: 'Ambient music', sfxVol: 'SFX volume', sens: 'Look sensitivity', vibrate: 'Haptics',
      lang: 'Language', on: 'On', off: 'Off',
      chLock: 'This chapter is still locked.', deleteSave: 'Delete save', confirmDel: 'Erase all progress?',
      yes: 'Yes', no: 'No',
      aboutText: 'First-person horror adventure — Three.js with fully procedural audio & textures. Full edition: 100 levels across 10 chapters.',
      wrongCode: "It doesn't fit… think again", solved: 'Puzzle solved!',
      hintTitle: 'Level hint', hintCost: 'Hint usage is tracked in stats.',
      interactHint: 'Come closer to inspect', choiceTitle: 'Your choice',
      ending1T: 'Ending: "The Truth"', ending2T: 'Ending: "Ashes"', ending3T: 'Ending: "Leaving"',
      level: 'Level', chapter: 'Chapter', lvDone: 'Already completed — you can replay it.',
      continueQ: 'Where to continue?', nextLv: 'Next level', menuLv: 'Menu',
      keypad: 'Code keypad', wires: 'Connect wires', clockSet: 'Set the clock', levers: 'Levers',
      symbols: 'Symbols', fuseBox: 'Fuse box', mathT: 'Numeric lock', valves: 'Valves', hunt: 'Search',
      fusePick: 'Pick the right fuse:', wirePick: 'Connect each wire to its color pair:',
      leverHint: 'Apply the pattern from the clue (up = on):',
      symHint: 'Pick symbols in the order from the clue:',
      valveHint: 'Set each line pressure to its target:',
      huntHint: 'Search suspicious spots; what you need is there.',
      mathHint: 'Compute the answer from the clues and enter it:',
      clockHint: 'Set the hands to the clue time:',
      kpHint: 'Find the code from the clues:',
      cleared: 'Cleared', found: 'Found it!', nothing: 'Nothing here…',
      needSteps: 'Find the level clues first.',
      autotest: 'Test mode', restartAll: 'Restart story'
    }
  };
  var lang = 'fa';
  return {
    setLang: function (l) { lang = (l === 'en') ? 'en' : 'fa'; document.documentElement.lang = lang; document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'; },
    getLang: function () { return lang; },
    t: function (k) { return (STR[lang] && STR[lang][k]) || STR.fa[k] || k; },
    pick: function (o) { if (o == null) return ''; return (typeof o === 'string') ? o : (o[lang] != null ? o[lang] : o.fa); },
    faDigits: function (s) {
      s = String(s);
      if (lang !== 'fa') return s;
      var D = '۰۱۲۳۴۵۶۷۸۹';
      return s.replace(/\d/g, function (d) { return D[+d]; });
    }
  };
})();
