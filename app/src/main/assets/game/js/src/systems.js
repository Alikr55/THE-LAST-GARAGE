/* THE LAST GARAGE — systems: inventory, journal notes, achievements, items 3D preview */
window.Systems = (function () {
  var ICONS = {
    key: '🔑', key_brass: '🗝', paper: '📄', photo: '🖼', fuse: '🔌', book: '📕',
    can: '🥫', bulb: '💡', rope: '🪢', tape: '🧻', battery: '🔋', map: '🗺',
    gear: '⚙️', letter: '✉️', medal: '🎖', crowbar: '🪓', valve: '🚰', chip: '💾',
    lighter: '🔥', mug: '☕', watch: '⌚', ring: '💍', toolbox: '🧰', wrench: '🔧'
  };
  function addItem(id, icon, name) {
    var S = SaveSys.data;
    if (S.items.some(function (i) { return i.id === id; })) return false;
    S.items.push({ id: id, icon: ICONS[icon] || '📦', name: name, level: S.cur });
    SaveSys.commit();
    UI.toast(I18N.t('itemGot') + I18N.pick(name));
    AudioSys.SFX.pickup();
    Player.buzz(25);
    if (S.items.length >= 10) grant('collector');
    return true;
  }
  function addNote(id, text) {
    var S = SaveSys.data;
    if (S.notes.some(function (n) { return n.id === id; })) return false;
    S.notes.push({ id: id, text: text, level: S.cur });
    SaveSys.commit();
    UI.toast(I18N.t('noteSaved'));
    if (S.notes.length >= 20) grant('scholar');
    return true;
  }
  function grant(id) {
    var got = SaveSys.grant(id);
    if (got) {
      var a = SaveSys.ACH.filter(function (x) { return x.id === id; })[0];
      if (a) UI.toast('🏆 ' + I18N.pick({ fa: a.fa, en: a.en }));
      AudioSys.SFX.ach();
    }
    return got;
  }
  function recordChoice(level, kind, value) {
    var S = SaveSys.data;
    S.choices.push({ level: level, kind: kind, value: value });
    S.flags['choice_' + kind] = value;
    SaveSys.commit();
  }
  function puzzleSolved() {
    SaveSys.data.stats.puzzles++;
    if (SaveSys.data.stats.puzzles >= 25) grant('decipher');
    SaveSys.commit();
  }
  function checkPlaytime() {
    var mins = (Date.now() - SaveSys.data.stats.started) / 60000;
    if (mins >= 30) grant('night');
  }

  // 3D item preview in inventory modal
  var previewRaf = null;
  function showItemPreview(canvas, icon) {
    var w = canvas.clientWidth || 110, h = canvas.clientHeight || 110;
    canvas.width = w * 2; canvas.height = h * 2;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(w, h, false);
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
    cam.position.set(0, 0.4, 3.4); cam.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    var pt = new THREE.PointLight(0xfff2d8, 2.4); pt.position.set(1.5, 2, 2.5); scene.add(pt);
    var pt2 = new THREE.PointLight(0xd8e8ff, 1.2); pt2.position.set(-2, -1, 1.5); scene.add(pt2);
    var mesh = makeIconMesh(icon);
    scene.add(mesh);
    var stop = false;
    (function loop(t) {
      if (stop) { renderer.dispose(); return; }
      mesh.rotation.y = (t || 0) * 0.0009;
      renderer.render(scene, cam);
      previewRaf = requestAnimationFrame(loop);
    })(0);
    return function () { stop = true; if (previewRaf) cancelAnimationFrame(previewRaf); };
  }
  function makeIconMesh(icon) {
    var g = new THREE.Group();
    function mat(c, e) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.75, emissive: e || 0x000000, emissiveIntensity: 0.35 }); }
    if (icon === '🔑' || icon === '🗝') {
      var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 10), mat(0xd8b34a));
      shaft.rotation.z = Math.PI / 2;
      var head = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 10, 20), mat(0xd8b34a));
      head.position.x = -0.85;
      var tooth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.08), mat(0xd8b34a));
      tooth.position.set(0.55, -0.18, 0);
      g.add(shaft, head, tooth);
    } else if (icon === '📄' || icon === '✉️') {
      var p = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.7, 0.04), new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.9 }));
      g.add(p);
    } else if (icon === '🖼') {
      var fr = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.08), mat(0x7a5a38));
      var ph = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.02), new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.7 }));
      ph.position.z = 0.06;
      g.add(fr, ph);
    } else if (icon === '🔌' || icon === '💡') {
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.55, 12), mat(0xc05040));
      var b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 10), mat(0xd8d8d8));
      b.position.y = 0.4;
      g.add(c, b);
    } else {
      var bx = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), mat(0x8a7a4a));
      g.add(bx);
    }
    return g;
  }

  return { addItem: addItem, addNote: addNote, grant: grant, recordChoice: recordChoice, puzzleSolved: puzzleSolved, checkPlaytime: checkPlaytime, showItemPreview: showItemPreview, ICONS: ICONS };
})();
