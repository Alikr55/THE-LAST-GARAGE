window.Systems = /* @__PURE__ */ (function() {
  var ICONS = {
    key: "\u{1F511}",
    key_brass: "\u{1F5DD}",
    paper: "\u{1F4C4}",
    photo: "\u{1F5BC}",
    fuse: "\u{1F50C}",
    book: "\u{1F4D5}",
    can: "\u{1F96B}",
    bulb: "\u{1F4A1}",
    rope: "\u{1FAA2}",
    tape: "\u{1F9FB}",
    battery: "\u{1F50B}",
    map: "\u{1F5FA}",
    gear: "\u2699\uFE0F",
    letter: "\u2709\uFE0F",
    medal: "\u{1F396}",
    crowbar: "\u{1FA93}",
    valve: "\u{1F6B0}",
    chip: "\u{1F4BE}",
    lighter: "\u{1F525}",
    mug: "\u2615",
    watch: "\u231A",
    ring: "\u{1F48D}",
    toolbox: "\u{1F9F0}",
    wrench: "\u{1F527}"
  };
  function addItem(id, icon, name) {
    var S = SaveSys.data;
    if (S.items.some(function(i) {
      return i.id === id;
    })) return false;
    S.items.push({ id, icon: ICONS[icon] || "\u{1F4E6}", name, level: S.cur });
    SaveSys.commit();
    UI.toast(I18N.t("itemGot") + I18N.pick(name));
    AudioSys.SFX.pickup();
    Player.buzz(25);
    if (S.items.length >= 10) grant("collector");
    return true;
  }
  function addNote(id, text) {
    var S = SaveSys.data;
    if (S.notes.some(function(n) {
      return n.id === id;
    })) return false;
    S.notes.push({ id, text, level: S.cur });
    SaveSys.commit();
    UI.toast(I18N.t("noteSaved"));
    if (S.notes.length >= 20) grant("scholar");
    return true;
  }
  function grant(id) {
    var got = SaveSys.grant(id);
    if (got) {
      var a = SaveSys.ACH.filter(function(x) {
        return x.id === id;
      })[0];
      if (a) UI.toast("\u{1F3C6} " + I18N.pick({ fa: a.fa, en: a.en }));
      AudioSys.SFX.ach();
    }
    return got;
  }
  function recordChoice(level, kind, value) {
    var S = SaveSys.data;
    S.choices.push({ level, kind, value });
    S.flags["choice_" + kind] = value;
    SaveSys.commit();
  }
  function puzzleSolved() {
    SaveSys.data.stats.puzzles++;
    if (SaveSys.data.stats.puzzles >= 25) grant("decipher");
    SaveSys.commit();
  }
  function checkPlaytime() {
    var mins = (Date.now() - SaveSys.data.stats.started) / 6e4;
    if (mins >= 30) grant("night");
  }
  var previewRaf = null;
  function showItemPreview(canvas, icon) {
    var w = canvas.clientWidth || 110, h = canvas.clientHeight || 110;
    canvas.width = w * 2;
    canvas.height = h * 2;
    var renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(w, h, false);
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
    cam.position.set(0, 0.4, 3.4);
    cam.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(16777215, 0.95));
    var pt = new THREE.PointLight(16773848, 2.4);
    pt.position.set(1.5, 2, 2.5);
    scene.add(pt);
    var pt2 = new THREE.PointLight(14215423, 1.2);
    pt2.position.set(-2, -1, 1.5);
    scene.add(pt2);
    var mesh = makeIconMesh(icon);
    scene.add(mesh);
    var stop = false;
    (function loop(t) {
      if (stop) {
        renderer.dispose();
        return;
      }
      mesh.rotation.y = (t || 0) * 9e-4;
      renderer.render(scene, cam);
      previewRaf = requestAnimationFrame(loop);
    })(0);
    return function() {
      stop = true;
      if (previewRaf) cancelAnimationFrame(previewRaf);
    };
  }
  function makeIconMesh(icon) {
    var g = new THREE.Group();
    function mat(c2, e) {
      return new THREE.MeshStandardMaterial({ color: c2, roughness: 0.35, metalness: 0.75, emissive: e || 0, emissiveIntensity: 0.35 });
    }
    if (icon === "\u{1F511}" || icon === "\u{1F5DD}") {
      var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 10), mat(14201674));
      shaft.rotation.z = Math.PI / 2;
      var head = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 10, 20), mat(14201674));
      head.position.x = -0.85;
      var tooth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.08), mat(14201674));
      tooth.position.set(0.55, -0.18, 0);
      g.add(shaft, head, tooth);
    } else if (icon === "\u{1F4C4}" || icon === "\u2709\uFE0F") {
      var p = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.7, 0.04), new THREE.MeshStandardMaterial({ color: 15261640, roughness: 0.9 }));
      g.add(p);
    } else if (icon === "\u{1F5BC}") {
      var fr = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.08), mat(8018488));
      var ph = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.02), new THREE.MeshStandardMaterial({ color: 13621468, roughness: 0.7 }));
      ph.position.z = 0.06;
      g.add(fr, ph);
    } else if (icon === "\u{1F50C}" || icon === "\u{1F4A1}") {
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.55, 12), mat(12603456));
      var b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 10), mat(14211288));
      b.position.y = 0.4;
      g.add(c, b);
    } else {
      var bx = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), mat(9075274));
      g.add(bx);
    }
    return g;
  }
  return { addItem, addNote, grant, recordChoice, puzzleSolved, checkPlaytime, showItemPreview, ICONS };
})();
