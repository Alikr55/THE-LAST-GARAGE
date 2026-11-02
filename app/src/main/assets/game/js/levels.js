/* THE LAST GARAGE — level runtime: spawns interactables, drives puzzles, completes levels */
window.Levels = (function () {
  var current = null;          // current level object
  var interactables = [];      // [{mesh, kind, name, verb, step|puzzle, done}]
  var pulse = [];              // meshes with pulsing emissive
  var active = false;

  function el(id) { return document.getElementById(id); }

  /* ---------- prop factory ---------- */
  function propMesh(kind, color) {
    var g = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({ color: color || 0xd8d2c2, roughness: 0.75, emissive: 0xffe9b0, emissiveIntensity: 0.35 });
    var glowMat = new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.8, emissive: 0xffe9b0, emissiveIntensity: 0.5 });
    if (kind === 'paper' || kind === 'letter' || kind === 'note') {
      var p = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.015, 0.4), mat);
      g.add(p);
    } else if (kind === 'photo') {
      var f = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.03), new THREE.MeshStandardMaterial({ color: 0x7a5a38, roughness: 0.6 }));
      var ph = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.02), glowMat);
      ph.position.z = 0.02;
      g.add(f, ph);
    } else if (kind === 'book') {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.32), mat);
      g.add(b);
    } else if (kind === 'can') {
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.24, 12), mat);
      g.add(c);
    } else if (kind === 'key') {
      var s = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6), mat);
      s.rotation.z = Math.PI / 2;
      var h = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.015, 8, 14), mat);
      h.position.x = -0.12;
      g.add(s, h);
    } else if (kind === 'fuse') {
      var cy = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 10), new THREE.MeshStandardMaterial({ color: color || 0xc05040, roughness: 0.5, emissive: 0xffe9b0, emissiveIntensity: 0.3 }));
      g.add(cy);
    } else if (kind === 'toolbox') {
      var tb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.18), new THREE.MeshStandardMaterial({ color: color || 0xa03028, roughness: 0.6, emissive: 0xffe9b0, emissiveIntensity: 0.25 }));
      g.add(tb);
    } else if (kind === 'device') {
      // generic puzzle terminal
      var d = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.08), new THREE.MeshStandardMaterial({ color: 0x20242a, roughness: 0.5, metalness: 0.5, emissive: 0xe8a33d, emissiveIntensity: 0.45 }));
      var scr = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.02), new THREE.MeshStandardMaterial({ color: 0x0d1013, emissive: 0xe8a33d, emissiveIntensity: 0.8 }));
      scr.position.z = 0.045;
      g.add(d, scr);
    } else if (kind === 'valve') {
      var v = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), new THREE.MeshStandardMaterial({ color: 0x8a3a30, roughness: 0.5, metalness: 0.6, emissive: 0xffe9b0, emissiveIntensity: 0.35 }));
      g.add(v);
    } else { // generic small object
      var o = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.2), mat);
      g.add(o);
    }
    g.traverse(function (m) { if (m.isMesh) { m.castShadow = true; } });
    return g;
  }

  function spawnAt(anchorName, kind, color, yOff) {
    var an = W.anchors()[anchorName] || W.anchors().floor_c;
    var m = propMesh(kind, color);
    m.position.set(an.x + (Math.random() - 0.5) * 0.12, an.y + (yOff || 0), an.z + (Math.random() - 0.5) * 0.12);
    m.rotation.y = an.ry + (Math.random() - 0.5) * 0.4;
    W.addLevelProp(m);
    pulse.push(m);
    return m;
  }

  /* ---------- loading ---------- */
  function load(id, opts) {
    opts = opts || {};
    var lv = window.DLV.levels[id - 1];
    if (!lv) return false;
    if (!opts.silent) SaveSys.data.cur = id;
    active = true;
    current = lv;
    interactables.length = 0;
    pulse.length = 0;
    W.clearLevelProps();
    UI.closeAll();
    UI.showHUD(true);
    UI.updateHUD(lv);
    UI.hideLoading();

    // position player by area
    var sp = { garage: { x: 0, z: 2.4, yaw: Math.PI }, storage: { x: 8.65, z: 0.4, yaw: -Math.PI / 2 }, cellar: { x: 34, z: 0.6, yaw: Math.PI } }[lv.area || 'garage'];
    Player.setPosition(sp.x, sp.z, sp.yaw, 0);
    W.setAreaAmbience(lv.area || 'garage');

    // story flags from progress
    if (id >= 2) { SaveSys.data.flags.storage_open = true; W.openStorageDoor(); }
    if (id >= 41) { SaveSys.data.flags.cellar_open = true; W.openCellar(); }
    SaveSys.commit();

    // chapter intro?
    var CH = window.Chapters;
    var ch = CH.list[lv.ch - 1];
    var chStart = (lv.id === ch.first);
    if (!opts.silent && chStart && ch.intro) {
      UI.paperModal({ fa: 'فصل ' + lv.ch + ' — ' + I18N.pick(ch.title), en: 'Chapter ' + lv.ch + ' — ' + I18N.pick(ch.title) }, ch.intro, function () {
        levelIntro(lv, opts);
      });
    } else {
      levelIntro(lv, opts);
    }
    SaveSys.commit();
    return true;
  }

  function levelIntro(lv, opts) {
    if (!opts.silent && lv.intro) {
      UI.paperModal(I18N.t('level') + ' ' + I18N.faDigits(lv.id), lv.intro, null, '— ' + I18N.pick({ fa: 'راوی', en: 'Narrator' }));
    }
    // spawn steps
    (lv.steps || []).forEach(function (st) {
      var mesh = spawnAt(st.anchor, st.kind === 'item' ? (st.icon || 'note') : (st.icon || 'paper'), st.color);
      interactables.push({
        mesh: mesh, kind: 'step', step: st, done: false,
        name: st.name, verb: st.kind === 'item' ? { fa: 'برداشتن', en: 'Take' } : { fa: 'خواندن', en: 'Read' }
      });
    });
    // spawn puzzle prop
    var pz = lv.puzzle;
    if (pz) {
      var pk = { keypad: 'device', math: 'device', wire: 'device', levers: 'device', symbols: 'device', valve: 'valve', hunt: 'note', fuse: 'fuse', clock: 'note', letter: 'paper', power: 'fuse' }[pz.type] || 'device';
      var pc = { fuse: 0xc05040, valve: 0x8a3a30 }[pz.type];
      var mesh = spawnAt(pz.anchor, pk, pc, 0);
      interactables.push({
        mesh: mesh, kind: 'puzzle', puzzle: pz, done: false,
        name: pz.title, verb: { fa: 'استفاده', en: 'Use' }
      });
    }
  }

  /* ---------- interaction ---------- */
  function onInteract(it) {
    if (!active || !it || it.done) return;
    SaveSys.data.stats.taps++;
    Player.buzz(15);
    if (it.kind === 'step') {
      var st = it.step;
      it.done = true;
      it.mesh.traverse(function (m) {
        if (m.isMesh && m.material && m.material.emissive) m.material.emissiveIntensity = 0.05;
      });
      var pi = pulse.indexOf(it.mesh);
      if (pi >= 0) pulse.splice(pi, 1);
      if (st.kind === 'item') {
        Systems.addItem(st.itemId || ('it' + current.id + '_' + st.id), st.icon || 'note', st.name);
      } else {
        Systems.addNote('nt' + current.id + '_' + st.id, st.text);
        UI.paperModal(st.name, st.text, null, st.sig);
      }
      AudioSys.SFX.paper();
      checkStepsDone();
    } else if (it.kind === 'puzzle') {
      var doneSteps = interactables.filter(function (x) { return x.kind === 'step'; }).every(function (x) { return x.done; });
      if ((current.steps || []).length && !doneSteps) {
        UI.toast(I18N.t('needSteps'));
        AudioSys.SFX.locked();
        return;
      }
      openPuzzle();
    }
  }

  function checkStepsDone() {
    var steps = interactables.filter(function (x) { return x.kind === 'step'; });
    if (steps.length && steps.every(function (x) { return x.done; })) {
      UI.toast(I18N.pick({ fa: 'همهٔ سرنخ‌ها پیدا شد — معم را حل کن', en: 'All clues found — solve the puzzle' }));
    }
  }

  function openPuzzle() {
    var pz = current.puzzle;
    if (!pz) return;
    UI.puzzleModal(pz, function (attempt, reply) {
      var ok = submitPuzzleAttempt(attempt);
      reply(ok);
    });
  }

  /* single entry: player (and autotest) submit a puzzle attempt */
  function submitPuzzleAttempt(attempt) {
    var pz = current.puzzle;
    if (!pz) return false;
    var ok = checkPuzzle(pz, attempt);
    if (ok) {
      AudioSys.SFX.solve();
      afterPuzzle();
    }
    return ok;
  }

  function checkPuzzle(pz, attempt) {
    attempt = String(attempt == null ? '' : attempt).trim();
    attempt = attempt.replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); });
    switch (pz.type) {
      case 'letter': return true;
      case 'keypad': return attempt === String(pz.code);
      case 'math': return attempt === String(pz.answer);
      case 'wire': return attempt === 'all';
      case 'clock':
        var p = attempt.split(':');
        if (p.length !== 2) return false;
        return (+p[0]) === pz.h && (+p[1]) === pz.m;
      case 'levers': return attempt === pz.pattern;
      case 'symbols': return attempt === pz.order.join(',');
      case 'fuse': return attempt === String(pz.correct);
      case 'valve': return attempt === pz.target.join(',');
      case 'hunt': return attempt === String(pz.answer);
      case 'power':
        return pz.phase === 2 ? (attempt === 'all' || attempt === 'on') : attempt === String(pz.correct);
      default: return false;
    }
  }

  /* ---------- completion flow ---------- */
  function afterPuzzle() {
    var pz = current.puzzle;
    if (pz.type === 'power' && pz.phase !== 2) {
      // fuse accepted → wire phase
      pz.phase = 2;
      UI.closeAll();
      UI.puzzleModal({ type: 'wire', title: pz.title2 || pz.title, clue: pz.clue2, colors: pz.colors }, function (attempt, reply) {
        var ok = submitPuzzleAttempt(attempt);
        reply(ok);
      });
      return;
    }
    if (pz.type === 'clock') Systems.grant('timekeeper');
    if (pz.type === 'power') { pz.phase = 1; W.setPower(true); Systems.grant('electrician'); }
    finishLevel();
  }

  function finishLevel() {
    var lv = current;
    var S = SaveSys.data;
    Systems.puzzleSolved();
    S.completed[lv.id] = true;
    S.cur = lv.id;
    if (S.unlocked <= lv.id) S.unlocked = Math.min(100, lv.id + 1);
    if (lv.id === 1) { S.flags.storage_open = true; W.openStorageDoor(); }
    if (lv.id === 40) { S.flags.cellar_open = true; W.openCellar(); }
    if (lv.id === 50) Systems.grant('halfway');
    if (lv.id === 1) Systems.grant('first_step');
    SaveSys.commit();

    var next = function () {
      if (lv.id >= 100) { runFinalChoice(); return; }
      if (lv.choice) {
        runChoice(lv, function () {
          UI.levelCompleteModal(lv, lv.outro, function () { load(lv.id + 1); });
        });
      } else {
        UI.levelCompleteModal(lv, lv.outro, function () { load(lv.id + 1); });
      }
    };

    if (lv.reward) {
      Systems.addItem(lv.reward.id, lv.reward.icon, lv.reward.name);
    }
    next();
  }

  function runChoice(lv, done) {
    var spec = lv.choice;
    UI.choiceModal(lv, spec, function (opt) {
      Systems.recordChoice(lv.id, spec.kind, opt.value);
      if (opt.result) UI.paperModal(I18N.t('choiceTitle'), opt.result, done);
      else done();
    });
  }

  function runFinalChoice() {
    var S = SaveSys.data;
    var spec = {
      kind: 'final',
      prompt: { fa: 'ماشین در مقابل تو زمزمه می‌کند. تصمیم نهایی با توست…', en: 'The machine whispers before you. The final call is yours…' },
      options: [
        { label: { fa: 'حقیقت را برای همه فاش کن', en: 'Reveal the truth to everyone' }, value: 'truth' },
        { label: { fa: 'ماشین را برای همیشه نابود کن', en: 'Destroy the machine forever' }, value: 'destroy' },
        { label: { fa: 'کلید را بردار و برو', en: 'Take the key and walk away' }, value: 'leave' }
      ]
    };
    UI.choiceModal({ id: 100 }, spec, function (opt) {
      Systems.recordChoice(100, 'final', opt.value);
      var e;
      if (opt.value === 'leave') e = window.Endings.list[2];
      else if (S.flags.choice_burn === 'burn' || S.flags.choice_destroy === 'destroy') e = window.Endings.list[1];
      else e = window.Endings.list[0];
      active = false;
      UI.showHUD(false);
      UI.endingModal(e, function () {});
    });
  }

  /* ---------- per-frame ---------- */
  function update(dt, t) {
    if (!active) return;
    for (var i = 0; i < pulse.length; i++) {
      var m = pulse[i];
      m.traverse(function (o) {
        if (o.isMesh && o.material && o.material.emissive) o.material.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 3 + i);
      });
    }
  }

  function restartLevel() { if (current) load(current.id); }

  function solveAttempt(pz) {
    // correct attempt for autotest
    switch (pz.type) {
      case 'letter': return 'read';
      case 'keypad': return String(pz.code);
      case 'math': return String(pz.answer);
      case 'wire': return 'all';
      case 'clock': return pz.h + ':' + pz.m;
      case 'levers': return pz.pattern;
      case 'symbols': return pz.order.join(',');
      case 'fuse': return String(pz.correct);
      case 'valve': return pz.target.join(',');
      case 'hunt': return String(pz.answer);
      case 'power': return pz.phase === 2 ? 'all' : String(pz.correct);
    }
    return '';
  }

  /* ---------- autotest: play every level programmatically ---------- */
  function autotest(from, to) {
    from = from || 1; to = to || 100;
    var results = [];
    var origAlert = window.alert;
    for (var id = from; id <= to; id++) {
      try {
        load(id, { silent: true });
        // complete steps
        var steps = interactables.filter(function (x) { return x.kind === 'step'; });
        steps.forEach(function (x) { onInteract(x); });
        // close any paper modal from steps
        UI.closeAll();
        // puzzle — through the real submit path
        var pz = current.puzzle;
        if (pz) {
          if (pz.type === 'power') {
            pz.phase = 1;
            if (!submitPuzzleAttempt(solveAttempt(pz))) throw new Error('power fuse rejected');
            if (!submitPuzzleAttempt('all')) throw new Error('power wire rejected');
          } else if (!submitPuzzleAttempt(solveAttempt(pz))) {
            throw new Error('puzzle ' + pz.type + ' rejected');
          }
        }
        if (!SaveSys.data.completed[id]) throw new Error('not completed');
        // choice handling
        if (current.choice) {
          var opt = current.choice.options[0];
          Systems.recordChoice(id, current.choice.kind, opt.value);
        }
        results.push({ id: id, ok: true });
      } catch (e) {
        results.push({ id: id, ok: false, err: String(e && e.message || e) });
      }
    }
    var fails = results.filter(function (r) { return !r.ok; });
    // restore clean state
    SaveSys.reset();
    load(1, { silent: true });
    UI.closeAll();
    return { total: to - from + 1, passed: results.length - fails.length, failed: fails };
  }

  return {
    load: load, onInteract: onInteract, update: update, restartLevel: restartLevel,
    get current() { return current; },
    get interactables() { return interactables; },
    get active() { return active; },
    set active(v) { active = v; },
    checkPuzzle: checkPuzzle, solveAttempt: solveAttempt, autotest: autotest, submitPuzzleAttempt: submitPuzzleAttempt,
    get: function (id) { return window.DLV.levels[id - 1]; },
    onAreaChanged: function () {}
  };
})();
