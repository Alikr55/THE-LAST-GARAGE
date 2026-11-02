window.SaveSys = (function() {
  var KEY = "tlg_save_v2";
  function fresh() {
    return {
      ver: 2,
      unlocked: 1,
      // highest unlocked level id
      completed: {},
      // {levelId:true}
      choices: [],
      // {level, kind, value}
      flags: {},
      // story flags
      notes: [],
      // {id, level, text}
      items: [],
      // {id, level, icon, name}
      achievements: {},
      endings: {},
      stats: { hints: 0, taps: 0, steps: 0, puzzles: 0, started: Date.now() },
      settings: { lang: "fa", quality: "med", volMusic: 0.7, volSfx: 0.8, sens: 1, vibrate: true },
      cur: null,
      // current level id in progress
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
    } catch (e) {
    }
    return data;
  }
  function commit() {
    data.ts = Date.now();
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
    }
  }
  function reset() {
    data = fresh();
    commit();
  }
  var ACH = [
    { id: "first_step", icon: "\u{1F6AA}", fa: "\u0627\u0648\u0644\u06CC\u0646 \u0642\u062F\u0645", en: "First Step", desc_fa: "\u0645\u0631\u062D\u0644\u0647 \u06F1 \u0631\u0627 \u06A9\u0627\u0645\u0644 \u06A9\u0646", desc_en: "Complete level 1" },
    { id: "electrician", icon: "\u26A1", fa: "\u0628\u0631\u0642\u200C\u06A9\u0627\u0631 \u0645\u0627\u0647\u0631", en: "Electrician", desc_fa: "\u0628\u0631\u0642 \u06AF\u0627\u0631\u0627\u0698 \u0631\u0627 \u0628\u0631\u06AF\u0631\u062F\u0627\u0646", desc_en: "Restore the power" },
    { id: "timekeeper", icon: "\u{1F570}", fa: "\u0646\u06AF\u0647\u0628\u0627\u0646 \u0632\u0645\u0627\u0646", en: "Timekeeper", desc_fa: "\u0633\u0627\u0639\u062A \u0631\u0627 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646", desc_en: "Set the clock" },
    { id: "scholar", icon: "\u{1F4DC}", fa: "\u067E\u0698\u0648\u0647\u0634\u06AF\u0631", en: "Scholar", desc_fa: "\u06F2\u06F0 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u062C\u0645\u0639 \u06A9\u0646", desc_en: "Collect 20 notes" },
    { id: "collector", icon: "\u{1F392}", fa: "\u06A9\u0644\u06A9\u0633\u06CC\u0648\u0646\u0631", en: "Collector", desc_fa: "\u06F1\u06F0 \u0648\u0633\u06CC\u0644\u0647 \u062C\u0645\u0639 \u06A9\u0646", desc_en: "Collect 10 items" },
    { id: "cellar", icon: "\u{1F573}", fa: "\u0628\u0647 \u0632\u06CC\u0631\u0650 \u0632\u06CC\u0631", en: "Below Below", desc_fa: "\u0648\u0627\u0631\u062F \u0632\u06CC\u0631\u0632\u0645\u06CC\u0646 \u0634\u0648", desc_en: "Enter the cellar" },
    { id: "halfway", icon: "\u{1F317}", fa: "\u0646\u06CC\u0645\u0647\u0654 \u0631\u0627\u0647", en: "Halfway", desc_fa: "\u0645\u0631\u062D\u0644\u0647 \u06F5\u06F0 \u0631\u0627 \u06A9\u0627\u0645\u0644 \u06A9\u0646", desc_en: "Complete level 50" },
    { id: "decipher", icon: "\u{1F510}", fa: "\u0631\u0645\u0632\u06AF\u0634\u0627", en: "Decipherer", desc_fa: "\u06F2\u06F5 \u0645\u0639\u0645\u0627 \u0631\u0627 \u062D\u0644 \u06A9\u0646", desc_en: "Solve 25 puzzles" },
    { id: "night", icon: "\u{1F319}", fa: "\u0634\u0628\u200C\u0632\u0646\u062F\u0647\u200C\u062F\u0627\u0631", en: "Night Owl", desc_fa: "\u06F3\u06F0 \u062F\u0642\u06CC\u0642\u0647 \u0628\u0627\u0632\u06CC \u06A9\u0646", desc_en: "Play for 30 minutes" },
    { id: "finisher", icon: "\u{1F3C6}", fa: "\u0631\u0627\u0632 \u06AF\u0627\u0631\u0627\u0698", en: "The Secret", desc_fa: "\u0628\u0627\u0632\u06CC \u0631\u0627 \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0628\u0631\u0633\u0627\u0646", desc_en: "Reach an ending" }
  ];
  function grant(id) {
    if (data.achievements[id]) return false;
    data.achievements[id] = { at: Date.now() };
    commit();
    return true;
  }
  return {
    data,
    load,
    commit,
    reset,
    ACH,
    grant,
    has: function() {
      try {
        return !!localStorage.getItem(KEY);
      } catch (e) {
        return false;
      }
    }
  };
})();
