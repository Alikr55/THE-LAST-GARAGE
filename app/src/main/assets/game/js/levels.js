window.Levels = /* @__PURE__ */ (function() {
  var current = null;
  var interactables = [];
  var pulse = [];
  var active = false;
  function el(id) {
    return document.getElementById(id);
  }
  function propMesh(kind, color) {
    var g = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({ color: color || 14209730, roughness: 0.75, emissive: 16771504, emissiveIntensity: 0.35 });
    var glowMat = new THREE.MeshStandardMaterial({ color: 15261640, roughness: 0.8, emissive: 16771504, emissiveIntensity: 0.5 });
    if (kind === "paper" || kind === "letter" || kind === "note") {
      var p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.015, 0.4), mat);
      g.add(p);
    } else if (kind === "photo") {
      var f = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.03), new THREE.MeshStandardMaterial({ color: 8018488, roughness: 0.6 }));
      var ph = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.02), glowMat);
      ph.position.z = 0.02;
      g.add(f, ph);
    } else if (kind === "book") {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.32), mat);
      g.add(b);
    } else if (kind === "can") {
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.24, 12), mat);
      g.add(c);
    } else if (kind === "key") {
      var s = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6), mat);
      s.rotation.z = Math.PI / 2;
      var h = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.015, 8, 14), mat);
      h.position.x = -0.12;
      g.add(s, h);
    } else if (kind === "fuse") {
      var cy = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 10), new THREE.MeshStandardMaterial({ color: color || 12603456, roughness: 0.5, emissive: 16771504, emissiveIntensity: 0.3 }));
      g.add(cy);
    } else if (kind === "toolbox") {
      var tb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.18), new THREE.MeshStandardMaterial({ color: color || 10498088, roughness: 0.6, emissive: 16771504, emissiveIntensity: 0.25 }));
      g.add(tb);
    } else if (kind === "device") {
      var d = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.08), new THREE.MeshStandardMaterial({ color: 2106410, roughness: 0.5, metalness: 0.5, emissive: 15246141, emissiveIntensity: 0.45 }));
      var scr = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.02), new THREE.MeshStandardMaterial({ color: 856083, emissive: 15246141, emissiveIntensity: 0.8 }));
      scr.position.z = 0.045;
      g.add(d, scr);
    } else if (kind === "valve") {
      var v = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), new THREE.MeshStandardMaterial({ color: 9058864, roughness: 0.5, metalness: 0.6, emissive: 16771504, emissiveIntensity: 0.35 }));
      g.add(v);
    } else {
      var o = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.2), mat);
      g.add(o);
    }
    g.traverse(function(m) {
      if (m.isMesh) {
        m.castShadow = true;
      }
    });
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
    var sp = { garage: { x: 0, z: 2.4, yaw: Math.PI }, storage: { x: 8.65, z: 0.4, yaw: -Math.PI / 2 }, cellar: { x: 34, z: 0.6, yaw: Math.PI } }[lv.area || "garage"];
    Player.setPosition(sp.x, sp.z, sp.yaw, 0);
    W.setAreaAmbience(lv.area || "garage");
    if (id >= 2) {
      SaveSys.data.flags.storage_open = true;
      W.openStorageDoor();
    }
    if (id >= 41) {
      SaveSys.data.flags.cellar_open = true;
      W.openCellar();
    }
    SaveSys.commit();
    var CH = window.Chapters;
    var ch = CH.list[lv.ch - 1];
    var chStart = lv.id === ch.first;
    if (!opts.silent && chStart && ch.intro) {
      UI.paperModal({ fa: "\u0641\u0635\u0644 " + lv.ch + " \u2014 " + I18N.pick(ch.title), en: "Chapter " + lv.ch + " \u2014 " + I18N.pick(ch.title) }, ch.intro, function() {
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
      UI.paperModal(I18N.t("level") + " " + I18N.faDigits(lv.id), lv.intro, null, "\u2014 " + I18N.pick({ fa: "\u0631\u0627\u0648\u06CC", en: "Narrator" }));
    }
    (lv.steps || []).forEach(function(st) {
      var mesh2 = spawnAt(st.anchor, st.kind === "item" ? st.icon || "note" : st.icon || "paper", st.color);
      interactables.push({
        mesh: mesh2,
        kind: "step",
        step: st,
        done: false,
        name: st.name,
        verb: st.kind === "item" ? { fa: "\u0628\u0631\u062F\u0627\u0634\u062A\u0646", en: "Take" } : { fa: "\u062E\u0648\u0627\u0646\u062F\u0646", en: "Read" }
      });
    });
    var pz = lv.puzzle;
    if (pz) {
      var pk = { keypad: "device", math: "device", wire: "device", levers: "device", symbols: "device", valve: "valve", hunt: "note", fuse: "fuse", clock: "note", letter: "paper", power: "fuse" }[pz.type] || "device";
      var pc = { fuse: 12603456, valve: 9058864 }[pz.type];
      var mesh = spawnAt(pz.anchor, pk, pc, 0);
      interactables.push({
        mesh,
        kind: "puzzle",
        puzzle: pz,
        done: false,
        name: pz.title,
        verb: { fa: "\u0627\u0633\u062A\u0641\u0627\u062F\u0647", en: "Use" }
      });
    }
  }
  function onInteract(it) {
    if (!active || !it || it.done) return;
    SaveSys.data.stats.taps++;
    Player.buzz(15);
    if (it.kind === "step") {
      var st = it.step;
      it.done = true;
      it.mesh.traverse(function(m) {
        if (m.isMesh && m.material && m.material.emissive) m.material.emissiveIntensity = 0.05;
      });
      var pi = pulse.indexOf(it.mesh);
      if (pi >= 0) pulse.splice(pi, 1);
      if (st.kind === "item") {
        Systems.addItem(st.itemId || "it" + current.id + "_" + st.id, st.icon || "note", st.name);
      } else {
        Systems.addNote("nt" + current.id + "_" + st.id, st.text);
        UI.paperModal(st.name, st.text, null, st.sig);
      }
      AudioSys.SFX.paper();
      checkStepsDone();
    } else if (it.kind === "puzzle") {
      var doneSteps = interactables.filter(function(x) {
        return x.kind === "step";
      }).every(function(x) {
        return x.done;
      });
      if ((current.steps || []).length && !doneSteps) {
        UI.toast(I18N.t("needSteps"));
        AudioSys.SFX.locked();
        return;
      }
      openPuzzle();
    }
  }
  function checkStepsDone() {
    var steps = interactables.filter(function(x) {
      return x.kind === "step";
    });
    if (steps.length && steps.every(function(x) {
      return x.done;
    })) {
      UI.toast(I18N.pick({ fa: "\u0647\u0645\u0647\u0654 \u0633\u0631\u0646\u062E\u200C\u0647\u0627 \u067E\u06CC\u062F\u0627 \u0634\u062F \u2014 \u0645\u0639\u0645 \u0631\u0627 \u062D\u0644 \u06A9\u0646", en: "All clues found \u2014 solve the puzzle" }));
    }
  }
  function openPuzzle() {
    var pz = current.puzzle;
    if (!pz) return;
    UI.puzzleModal(pz, function(attempt, reply) {
      var ok = submitPuzzleAttempt(attempt);
      reply(ok);
    });
  }
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
    attempt = String(attempt == null ? "" : attempt).trim();
    attempt = attempt.replace(/[۰-۹]/g, function(d) {
      return "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9".indexOf(d);
    });
    switch (pz.type) {
      case "letter":
        return true;
      case "keypad":
        return attempt === String(pz.code);
      case "math":
        return attempt === String(pz.answer);
      case "wire":
        return attempt === "all";
      case "clock":
        var p = attempt.split(":");
        if (p.length !== 2) return false;
        return +p[0] === pz.h && +p[1] === pz.m;
      case "levers":
        return attempt === pz.pattern;
      case "symbols":
        return attempt === pz.order.join(",");
      case "fuse":
        return attempt === String(pz.correct);
      case "valve":
        return attempt === pz.target.join(",");
      case "hunt":
        return attempt === String(pz.answer);
      case "power":
        return pz.phase === 2 ? attempt === "all" || attempt === "on" : attempt === String(pz.correct);
      default:
        return false;
    }
  }
  function afterPuzzle() {
    var pz = current.puzzle;
    if (pz.type === "power" && pz.phase !== 2) {
      pz.phase = 2;
      UI.closeAll();
      UI.puzzleModal({ type: "wire", title: pz.title2 || pz.title, clue: pz.clue2, colors: pz.colors }, function(attempt, reply) {
        var ok = submitPuzzleAttempt(attempt);
        reply(ok);
      });
      return;
    }
    if (pz.type === "clock") Systems.grant("timekeeper");
    if (pz.type === "power") {
      pz.phase = 1;
      W.setPower(true);
      Systems.grant("electrician");
    }
    finishLevel();
  }
  function finishLevel() {
    var lv = current;
    var S = SaveSys.data;
    Systems.puzzleSolved();
    S.completed[lv.id] = true;
    S.cur = lv.id;
    if (S.unlocked <= lv.id) S.unlocked = Math.min(100, lv.id + 1);
    if (lv.id === 1) {
      S.flags.storage_open = true;
      W.openStorageDoor();
    }
    if (lv.id === 40) {
      S.flags.cellar_open = true;
      W.openCellar();
    }
    if (lv.id === 50) Systems.grant("halfway");
    if (lv.id === 1) Systems.grant("first_step");
    SaveSys.commit();
    var next = function() {
      if (lv.id >= 100) {
        runFinalChoice();
        return;
      }
      if (lv.choice) {
        runChoice(lv, function() {
          UI.levelCompleteModal(lv, lv.outro, function() {
            load(lv.id + 1);
          });
        });
      } else {
        UI.levelCompleteModal(lv, lv.outro, function() {
          load(lv.id + 1);
        });
      }
    };
    if (lv.reward) {
      Systems.addItem(lv.reward.id, lv.reward.icon, lv.reward.name);
    }
    next();
  }
  function runChoice(lv, done) {
    var spec = lv.choice;
    UI.choiceModal(lv, spec, function(opt) {
      Systems.recordChoice(lv.id, spec.kind, opt.value);
      if (opt.result) UI.paperModal(I18N.t("choiceTitle"), opt.result, done);
      else done();
    });
  }
  function runFinalChoice() {
    var S = SaveSys.data;
    var spec = {
      kind: "final",
      prompt: { fa: "\u0645\u0627\u0634\u06CC\u0646 \u062F\u0631 \u0645\u0642\u0627\u0628\u0644 \u062A\u0648 \u0632\u0645\u0632\u0645\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F. \u062A\u0635\u0645\u06CC\u0645 \u0646\u0647\u0627\u06CC\u06CC \u0628\u0627 \u062A\u0648\u0633\u062A\u2026", en: "The machine whispers before you. The final call is yours\u2026" },
      options: [
        { label: { fa: "\u062D\u0642\u06CC\u0642\u062A \u0631\u0627 \u0628\u0631\u0627\u06CC \u0647\u0645\u0647 \u0641\u0627\u0634 \u06A9\u0646", en: "Reveal the truth to everyone" }, value: "truth" },
        { label: { fa: "\u0645\u0627\u0634\u06CC\u0646 \u0631\u0627 \u0628\u0631\u0627\u06CC \u0647\u0645\u06CC\u0634\u0647 \u0646\u0627\u0628\u0648\u062F \u06A9\u0646", en: "Destroy the machine forever" }, value: "destroy" },
        { label: { fa: "\u06A9\u0644\u06CC\u062F \u0631\u0627 \u0628\u0631\u062F\u0627\u0631 \u0648 \u0628\u0631\u0648", en: "Take the key and walk away" }, value: "leave" }
      ]
    };
    UI.choiceModal({ id: 100 }, spec, function(opt) {
      Systems.recordChoice(100, "final", opt.value);
      var e;
      if (opt.value === "leave") e = window.Endings.list[2];
      else if (S.flags.choice_burn === "burn" || S.flags.choice_destroy === "destroy") e = window.Endings.list[1];
      else e = window.Endings.list[0];
      active = false;
      UI.showHUD(false);
      UI.endingModal(e, function() {
      });
    });
  }
  function update(dt, t) {
    if (!active) return;
    for (var i = 0; i < pulse.length; i++) {
      var m = pulse[i];
      m.traverse(function(o) {
        if (o.isMesh && o.material && o.material.emissive) o.material.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 3 + i);
      });
    }
  }
  function restartLevel() {
    if (current) load(current.id);
  }
  function solveAttempt(pz) {
    switch (pz.type) {
      case "letter":
        return "read";
      case "keypad":
        return String(pz.code);
      case "math":
        return String(pz.answer);
      case "wire":
        return "all";
      case "clock":
        return pz.h + ":" + pz.m;
      case "levers":
        return pz.pattern;
      case "symbols":
        return pz.order.join(",");
      case "fuse":
        return String(pz.correct);
      case "valve":
        return pz.target.join(",");
      case "hunt":
        return String(pz.answer);
      case "power":
        return pz.phase === 2 ? "all" : String(pz.correct);
    }
    return "";
  }
  function autotest(from, to) {
    from = from || 1;
    to = to || 100;
    var results = [];
    var origAlert = window.alert;
    for (var id = from; id <= to; id++) {
      try {
        load(id, { silent: true });
        var steps = interactables.filter(function(x) {
          return x.kind === "step";
        });
        steps.forEach(function(x) {
          onInteract(x);
        });
        UI.closeAll();
        var pz = current.puzzle;
        if (pz) {
          if (pz.type === "power") {
            pz.phase = 1;
            if (!submitPuzzleAttempt(solveAttempt(pz))) throw new Error("power fuse rejected");
            if (!submitPuzzleAttempt("all")) throw new Error("power wire rejected");
          } else if (!submitPuzzleAttempt(solveAttempt(pz))) {
            throw new Error("puzzle " + pz.type + " rejected");
          }
        }
        if (!SaveSys.data.completed[id]) throw new Error("not completed");
        if (current.choice) {
          var opt = current.choice.options[0];
          Systems.recordChoice(id, current.choice.kind, opt.value);
        }
        results.push({ id, ok: true });
      } catch (e) {
        results.push({ id, ok: false, err: String(e && e.message || e) });
      }
    }
    var fails = results.filter(function(r) {
      return !r.ok;
    });
    SaveSys.reset();
    load(1, { silent: true });
    UI.closeAll();
    return { total: to - from + 1, passed: results.length - fails.length, failed: fails };
  }
  return {
    load,
    onInteract,
    update,
    restartLevel,
    get current() {
      return current;
    },
    get interactables() {
      return interactables;
    },
    get active() {
      return active;
    },
    set active(v) {
      active = v;
    },
    checkPuzzle,
    solveAttempt,
    autotest,
    submitPuzzleAttempt,
    get: function(id) {
      return window.DLV.levels[id - 1];
    },
    onAreaChanged: function() {
    }
  };
})();
