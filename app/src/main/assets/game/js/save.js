/* THE LAST GARAGE — save system (WebView DOM storage, persistent) */
window.SaveSys = (function () {
  var KEY = 'tlg_save_v2';
  function fresh() {
    return {
      ver: 2,
      unlocked: 1,          // highest unlocked level id
      completed: {},        // {levelId:true}
      choices: [],          // {level, kind, value}
      flags: {},            // story flags
      notes: [],            // {id, level, text}
      items: [],            // {id, level, icon, name}
      achievements: {},
      endings: {},
      stats: { hints: 0, taps: 0, steps: 0, puzzles: 0, started: Date.now() },
      settings: { lang: 'fa', quality: 'med', volMusic: 0.7, volSfx: 0.8, sens: 1.0, vibrate: true },
      cur: null,            // current level id in progress
      ts: Date.now()
    };
  }
  var data = fresh();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && d.ver === 2) data = Object.assign(fresh(), d);
      }
    } catch (e) {}
    return data;
  }
  function commit() {
    data.ts = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }
  function reset() { data = fresh(); commit(); }

  // achievements catalog
  var ACH = [
    { id: 'first_step', icon: '🚪', fa: 'اولین قدم', en: 'First Step', desc_fa: 'مرحله ۱ را کامل کن', desc_en: 'Complete level 1' },
    { id: 'electrician', icon: '⚡', fa: 'برق‌کار ماهر', en: 'Electrician', desc_fa: 'برق گاراژ را برگردان', desc_en: 'Restore the power' },
    { id: 'timekeeper', icon: '🕰', fa: 'نگهبان زمان', en: 'Timekeeper', desc_fa: 'ساعت را تنظیم کن', desc_en: 'Set the clock' },
    { id: 'scholar', icon: '📜', fa: 'پژوهشگر', en: 'Scholar', desc_fa: '۲۰ یادداشت جمع کن', desc_en: 'Collect 20 notes' },
    { id: 'collector', icon: '🎒', fa: 'کلکسیونر', en: 'Collector', desc_fa: '۱۰ وسیله جمع کن', desc_en: 'Collect 10 items' },
    { id: 'cellar', icon: '🕳', fa: 'به زیرِ زیر', en: 'Below Below', desc_fa: 'وارد زیرزمین شو', desc_en: 'Enter the cellar' },
    { id: 'halfway', icon: '🌗', fa: 'نیمهٔ راه', en: 'Halfway', desc_fa: 'مرحله ۵۰ را کامل کن', desc_en: 'Complete level 50' },
    { id: 'decipher', icon: '🔐', fa: 'رمزگشا', en: 'Decipherer', desc_fa: '۲۵ معما را حل کن', desc_en: 'Solve 25 puzzles' },
    { id: 'night', icon: '🌙', fa: 'شب‌زنده‌دار', en: 'Night Owl', desc_fa: '۳۰ دقیقه بازی کن', desc_en: 'Play for 30 minutes' },
    { id: 'finisher', icon: '🏆', fa: 'راز گاراژ', en: 'The Secret', desc_fa: 'بازی را به پایان برسان', desc_en: 'Reach an ending' }
  ];
  function grant(id) {
    if (data.achievements[id]) return false;
    data.achievements[id] = { at: Date.now() };
    commit();
    return true;
  }

  return {
    data: data, load: load, commit: commit, reset: reset, ACH: ACH, grant: grant,
    has: function () { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  };
})();
