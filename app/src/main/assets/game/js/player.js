window.Player = /* @__PURE__ */ (function() {
  var POS = { x: 0, z: 2.4 }, YAW = Math.PI, PITCH = 0;
  var SPEED = 2.2, RADIUS = 0.34, EYE = 1.55;
  var keys = {}, joy = { active: false, dx: 0, dy: 0 }, look = { id: null, lx: 0, ly: 0 };
  var sens = 1, vibrate = true;
  var stepTimer = 0, interactTarget = null;
  var onInteract = null;
  function el(id) {
    return document.getElementById(id);
  }
  function init(cbInteract) {
    onInteract = cbInteract;
    setupJoystick();
    setupLook();
    setupKeys();
    setupInteractButton();
  }
  function setupJoystick() {
    var joyEl = el("joy"), knob = el("joy-knob");
    function setKnob(dx, dy) {
      knob.style.right = 34 - dx * 34 + "px";
      knob.style.top = 34 + dy * 34 + "px";
    }
    function start(e) {
      var t = e.changedTouches ? e.changedTouches[0] : e;
      joy.active = true;
      joy.cx = t.clientX;
      joy.cy = t.clientY;
      e.preventDefault();
    }
    function move(e) {
      if (!joy.active) return;
      var t = e.changedTouches ? e.changedTouches[0] : e;
      var dx = t.clientX - joy.cx, dy = t.clientY - joy.cy;
      var len = Math.hypot(dx, dy), max = 44;
      if (len > max) {
        dx = dx / len * max;
        dy = dy / len * max;
      }
      joy.dx = dx / max;
      joy.dy = dy / max;
      setKnob(joy.dx, joy.dy);
      e.preventDefault();
    }
    function end(e) {
      joy.active = false;
      joy.dx = joy.dy = 0;
      setKnob(0, 0);
    }
    joyEl.addEventListener("touchstart", start, { passive: false });
    joyEl.addEventListener("touchmove", move, { passive: false });
    joyEl.addEventListener("touchend", end);
    joyEl.addEventListener("touchcancel", end);
    joyEl.addEventListener("mousedown", start);
    window.addEventListener("mousemove", function(e) {
      if (joy.active) move(e);
    });
    window.addEventListener("mouseup", function() {
      if (joy.active) end();
    });
  }
  function setupLook() {
    var pad = el("look-pad");
    pad.addEventListener("touchstart", function(e) {
      var t = e.changedTouches[0];
      look.id = t.identifier;
      look.lx = t.clientX;
      look.ly = t.clientY;
      e.preventDefault();
    }, { passive: false });
    pad.addEventListener("touchmove", function(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (t.identifier !== look.id) continue;
        var dx = t.clientX - look.lx, dy = t.clientY - look.ly;
        look.lx = t.clientX;
        look.ly = t.clientY;
        YAW -= dx * 42e-4 * sens;
        PITCH -= dy * 35e-4 * sens;
        PITCH = Math.max(-1.2, Math.min(1.2, PITCH));
      }
      e.preventDefault();
    }, { passive: false });
    pad.addEventListener("touchend", function() {
      look.id = null;
    });
    var mdown = false;
    pad.addEventListener("mousedown", function(e) {
      mdown = true;
      look.lx = e.clientX;
      look.ly = e.clientY;
    });
    window.addEventListener("mousemove", function(e) {
      if (!mdown) return;
      var dx = e.clientX - look.lx, dy = e.clientY - look.ly;
      look.lx = e.clientX;
      look.ly = e.clientY;
      YAW -= dx * 42e-4 * sens;
      PITCH -= dy * 35e-4 * sens;
      PITCH = Math.max(-1.2, Math.min(1.2, PITCH));
    });
    window.addEventListener("mouseup", function() {
      mdown = false;
    });
  }
  function setupKeys() {
    window.addEventListener("keydown", function(e) {
      keys[e.code] = true;
      if (e.code === "KeyE" && interactTarget && onInteract) onInteract(interactTarget);
    });
    window.addEventListener("keyup", function(e) {
      keys[e.code] = false;
    });
  }
  function setupInteractButton() {
    el("btn-interact").addEventListener("click", function() {
      if (interactTarget && onInteract) onInteract(interactTarget);
    });
  }
  function collides(x, z) {
    var cols = W.colliders;
    for (var i = 0; i < cols.length; i++) {
      var c = cols[i];
      if (x > c.x1 - RADIUS && x < c.x2 + RADIUS && z > c.z1 - RADIUS && z < c.z2 + RADIUS) {
        if (doorwayOpen(c, x, z)) continue;
        return true;
      }
    }
    return false;
  }
  function doorwayOpen(c, x, z) {
    var S = SaveSys.data;
    if (c.x1 === 6.2 && S.flags.storage_open) {
      if (z > -1 - RADIUS && z < 1 + RADIUS) return true;
    }
    return false;
  }
  function checkTeleport() {
    var tps = W.doorTeleports, S = SaveSys.data;
    for (var i = 0; i < tps.length; i++) {
      var tp = tps[i];
      if (POS.x > tp.x1 && POS.x < tp.x2 && POS.z > tp.z1 && POS.z < tp.z2) {
        if (tp.hidden) continue;
        var flagOk = !tp.flag || S.flags[tp.flag];
        if (!flagOk) continue;
        var inCellar = POS.x > 30;
        var inStorage = POS.x > 6 && !inCellar;
        var target = tp.hatch ? inCellar ? tp.sideB : tp.sideA : inStorage ? tp.sideA : tp.sideB;
        if (tp.hatch && !inCellar && !inStorage) target = tp.sideA;
        var goingCellar = tp.hatch && !inCellar;
        if (tp.hatch && inCellar) {
          POS.x = tp.sideB.x;
          POS.z = tp.sideB.z;
          areaChanged("garage");
          return;
        }
        if (tp.hatch) {
          POS.x = tp.sideA.x;
          POS.z = tp.sideA.z;
          areaChanged("cellar");
          return;
        }
        if (inStorage) {
          POS.x = tp.sideA.x;
          POS.z = tp.sideA.z;
          areaChanged("garage");
          return;
        }
        POS.x = tp.sideB.x;
        POS.z = tp.sideB.z;
        areaChanged("storage");
        return;
      }
    }
  }
  function areaChanged(name) {
    AudioSys.SFX.door();
    W.setAreaAmbience(name);
    if (name === "cellar" && !SaveSys.data.flags.cellar_visited) {
      SaveSys.data.flags.cellar_visited = true;
      SaveSys.commit();
      if (Systems.grant("cellar")) UI.toast("\u{1F3C6} " + I18N.pick({ fa: "\u062F\u0633\u062A\u0627\u0648\u0631\u062F: \u0628\u0647 \u0632\u06CC\u0631\u0650 \u0632\u06CC\u0631", en: "Achievement: Below Below" }));
    }
    if (window.Levels && Levels.onAreaChanged) Levels.onAreaChanged(name);
  }
  function update(dt, t) {
    var mx = 0, mz = 0;
    if (keys.KeyW || keys.ArrowUp) mz -= 1;
    if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1;
    if (keys.KeyD || keys.ArrowRight) mx += 1;
    if (joy.active) {
      mx += joy.dx;
      mz += joy.dy;
    }
    var len = Math.hypot(mx, mz);
    var moving = false;
    if (len > 0.12) {
      moving = true;
      mx /= Math.max(1, len);
      mz /= Math.max(1, len);
      var sin = Math.sin(YAW), cos = Math.cos(YAW);
      var vx = (mx * cos - mz * sin) * SPEED;
      var vz = (mx * sin + mz * cos) * SPEED;
      var nx = POS.x + vx * dt, nz = POS.z + vz * dt;
      if (!collides(nx, POS.z)) POS.x = nx;
      if (!collides(POS.x, nz)) POS.z = nz;
      checkTeleport();
      stepTimer -= dt;
      if (stepTimer <= 0) {
        AudioSys.SFX.step();
        stepTimer = 0.42;
      }
      SaveSys.data.stats.steps++;
    }
    var cam = W.camera;
    if (cam) {
      var bob = moving ? Math.sin(t * 9) * 0.025 : Math.sin(t * 1.6) * 8e-3;
      cam.position.set(POS.x, EYE + bob, POS.z);
      cam.rotation.order = "YXZ";
      cam.rotation.y = YAW;
      cam.rotation.x = PITCH;
    }
    scanInteract();
  }
  function scanInteract() {
    if (!window.Levels || !Levels.interactables) return;
    var cam = W.camera;
    var best = null, bestScore = 0.985;
    var dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    var camPos = cam.position;
    for (var i = 0; i < Levels.interactables.length; i++) {
      var it = Levels.interactables[i];
      if (it.done) continue;
      var v = it.mesh.position.clone().sub(camPos);
      var dist = v.length();
      if (dist > 3.2) continue;
      v.normalize();
      var dot = v.dot(dir);
      var inCellar = camPos.x > 28;
      var itCellar = it.mesh.position.x > 28;
      if (inCellar !== itCellar) continue;
      if (dot > bestScore) {
        bestScore = dot;
        best = it;
      }
    }
    if (best !== interactTarget) {
      interactTarget = best;
      var btn = el("btn-interact"), name = el("interact-name");
      if (best) {
        btn.classList.remove("hidden");
        btn.textContent = I18N.pick(best.verb || { fa: "\u0628\u0631\u0631\u0633\u06CC", en: "Inspect" });
        name.textContent = I18N.pick(best.name);
        name.classList.remove("hidden");
      } else {
        btn.classList.add("hidden");
        name.classList.add("hidden");
      }
    }
  }
  return {
    init,
    update,
    getPosition: function() {
      return { x: POS.x, z: POS.z, yaw: YAW };
    },
    setPosition: function(x, z, yaw, pitch) {
      POS.x = x;
      POS.z = z;
      if (yaw != null) YAW = yaw;
      if (pitch != null) PITCH = pitch;
    },
    applySettings: function(s) {
      sens = s.sens || 1;
      vibrate = s.vibrate !== false;
    },
    get interactTarget() {
      return interactTarget;
    },
    buzz: function(ms) {
      if (vibrate && navigator.vibrate) {
        try {
          navigator.vibrate(ms || 18);
        } catch (e) {
        }
      }
    }
  };
})();
