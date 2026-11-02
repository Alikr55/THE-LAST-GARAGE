/* THE LAST GARAGE — main: boot, loop, menu wiring */
window.Main = (function () {
  var started = false, last = 0, clockT = 0;

  function el(id) { return document.getElementById(id); }

  function boot() {
    var S = SaveSys.load();
    I18N.setLang(S.settings.lang);
    AudioSys.setMusic(S.settings.volMusic); AudioSys.setSfx(S.settings.volSfx);
    if (window.Music) Music.setVol(S.settings.volMusic);

    if (!window.THREE) { TLG_FATAL('موتور سه‌بعدی (three.js) بارگذاری نشد.'); return; }
    try {
      W.init(el('gl'), S.settings.quality);
    } catch (err) {
      var probe = null;
      try {
        var c = document.createElement('canvas');
        probe = c.getContext('webgl') || c.getContext('experimental-webgl');
      } catch (e2) { probe = null; }
      TLG_FATAL(probe
        ? 'خطا در راه‌اندازی گرافیک: ' + (err && err.message ? err.message : err)
        : 'دستگاه شما از WebGL پشتیبانی نمی‌کند یا در تنظیمات WebView غیرفعال است.');
      return;
    }
    Player.init(function (target) { Levels.onInteract(target); });
    Player.applySettings(S.settings);

    wireMenu();
    UI.showMenu();
    setPowerByProgress();
    requestAnimationFrame(loop);
    AudioSys.ensure();
    document.addEventListener('pointerdown', function once() {
      AudioSys.ensure(); AudioSys.resume(); AudioSys.startAmbient();
      if (window.Music) Music.ensure();
      document.removeEventListener('pointerdown', once);
    });
    if (window.Music) Music.play('menu');
    setInterval(function () { Systems.checkPlaytime(); }, 60000);
    // resume prompt if mid-level
    if (S.cur && !S.completed[S.cur]) {
      el('btn-continue').onclick = function () { startGame(S.cur); };
    }
  }

  function chapterMusic(levelId) {
    if (!window.Music || !window.Chapters) return;
    var ch = 1;
    for (var i = 0; i < Chapters.list.length; i++) {
      if (levelId >= Chapters.list[i].first && levelId <= Chapters.list[i].last) { ch = Chapters.list[i].id; break; }
    }
    Music.play('ch' + (ch < 10 ? '0' : '') + ch);
  }

  function setPowerByProgress() {
    // power is on if level 2 completed (story)
    if (SaveSys.data.completed[2]) W.setPower(true, true);
  }

  function wireMenu() {
    el('btn-new').onclick = function () {
      SaveSys.reset();
      I18N.setLang('fa');
      startGame(1);
    };
    el('btn-continue').onclick = function () {
      var S = SaveSys.data;
      var target = S.cur && !S.completed[S.cur] ? S.cur : Math.min(100, S.unlocked);
      startGame(target);
    };
    el('btn-chapters').onclick = function () { UI.chaptersModal(); };
    el('btn-settings').onclick = function () { UI.settingsModal(); };
    el('btn-about').onclick = function () { UI.aboutModal(); };
    el('btn-exit').onclick = function () {
      if (window.AndroidBridge && AndroidBridge.exit) AndroidBridge.exit();
    };
    // HUD buttons
    el('btn-pause').onclick = function () { UI.pauseMenu(); };
    el('btn-journal').onclick = function () { UI.journalModal(); };
    el('btn-bag').onclick = function () { UI.bagModal(); };
    el('btn-hint').onclick = function () {
      var lv = Levels.current;
      if (lv) UI.hintModal(lv);
    };
    document.addEventListener('keydown', function (e) {
      if (e.code === 'Escape') {
        if (UI.modalOpen()) UI.closeModal();
        else if (Levels.active) UI.pauseMenu();
      }
      if (e.code === 'KeyJ' && Levels.active) UI.journalModal();
      if (e.code === 'KeyB' && Levels.active) UI.bagModal();
      if (e.code === 'KeyH' && Levels.active) { var lv = Levels.current; if (lv) UI.hintModal(lv); }
    });
    window.addEventListener('resize', function () { W.resize(); });
  }

  function startGame(levelId) {
    UI.showLoading(0.2, I18N.t('loading'));
    UI.hideMenu();
    if (window.Music) chapterMusic(levelId);
    setTimeout(function () {
      UI.showLoading(0.6);
      SaveSys.data.cur = levelId; SaveSys.commit();
      Levels.load(levelId);
      UI.showLoading(1);
      setTimeout(function () { UI.hideLoading(); UI.showHUD(true); }, 350);
      started = true;
    }, 120);
  }

  function toMenu() {
    Levels.active = false;
    UI.closeAll();
    UI.showHUD(false);
    UI.showMenu();
    if (window.Music) Music.play('menu');
    SaveSys.commit();
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts; clockT += dt;
    if (W.renderer) {
      Player.update(dt, clockT);
      Levels.update(dt, clockT);
      W.update(dt, clockT);
      W.renderer.render(W.scene, W.camera);
    }
  }

  return { boot: boot, startGame: startGame, toMenu: toMenu, get started() { return started; } };
})();

window.addEventListener('load', function () { Main.boot(); });
