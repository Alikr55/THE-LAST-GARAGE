/* THE LAST GARAGE — 3D world: garage + storage + cellar, lights, anchors */
window.W = (function () {
  var scene, camera, renderer, hemi, flash, camLight;
  var fixtures = [], storageLight = null, dust = null;
  var colliders = [];          // AABB {x1,z1,x2,z2}
  var doorTeleports = [];      // {x1,z1,x2,z2, to:'storage'|'garage'|'cellar', needFlag}
  var levelProps = new THREE.Group();
  var power = false;

  var A = {}; // anchors

  function box(w, h, d, mat, x, y, z, ry) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (ry) m.rotation.y = ry;
    m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
    return m;
  }
  function addCollider(x, z, w, d) { colliders.push({ x1: x - w / 2, z1: z - d / 2, x2: x + w / 2, z2: z + d / 2 }); }

  function fixture(x, z, baseI) {
    var g = new THREE.Group();
    var housing = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.3), TEX.M.metalDark);
    var tube = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.14), TEX.M.tubeOff);
    tube.position.y = -0.06;
    var cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.3, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xfff2cc, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    cone.position.y = -1.7;
    var light = new THREE.PointLight(0xffe6b3, 0, 13, 1.6);
    light.position.set(0, -0.2, 0);
    g.add(housing, tube, cone, light);
    g.position.set(x, 3.05, z);
    scene.add(g);
    fixtures.push({ g: g, light: light, tube: tube, cone: cone, baseI: baseI, on: false });
  }

  function makeCar(col, x, z, ry) {
    var g = new THREE.Group();
    var bodyMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0.35 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 4.3), bodyMat);
    body.position.y = 0.65;
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.55, 2.0), bodyMat);
    cabin.position.set(0, 1.18, -0.25);
    var winMat = new THREE.MeshStandardMaterial({ color: 0x2a343c, roughness: 0.2, metalness: 0.6 });
    var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.06), winMat);
    windshield.position.set(0, 1.2, 0.78); windshield.rotation.x = -0.25;
    g.add(body, cabin, windshield);
    var wheelG = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14);
    var wheelM = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });
    [[-0.95, 1.35], [0.95, 1.35], [-0.95, -1.45], [0.95, -1.45]].forEach(function (p) {
      var w = new THREE.Mesh(wheelG, wheelM);
      w.rotation.z = Math.PI / 2;
      w.position.set(p[0], 0.34, p[1]);
      g.add(w);
    });
    g.position.set(x, 0, z); g.rotation.y = ry || 0;
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g);
    addCollider(x, z, 2.4, 4.6);
    return g;
  }

  function makeShelf(x, z, ry) {
    var g = new THREE.Group();
    var side = new THREE.BoxGeometry(0.06, 1.9, 0.5);
    [-1.1, 1.1].forEach(function (dx) {
      var s = new THREE.Mesh(side, TEX.M.woodDark); s.position.set(dx, 0.95, 0); g.add(s);
    });
    [0.5, 1.0, 1.5].forEach(function (y) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.5), TEX.M.wood);
      b.position.set(0, y, 0); g.add(b);
    });
    g.position.set(x, 0, z); g.rotation.y = ry || 0;
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g);
    return g;
  }

  function makeTable(x, z, ry, w, d, h) {
    w = w || 1.6; d = d || 0.9; h = h || 0.85;
    var g = new THREE.Group();
    var top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), TEX.M.wood);
    top.position.y = h;
    [[-w / 2 + 0.08, -d / 2 + 0.08], [w / 2 - 0.08, -d / 2 + 0.08], [-w / 2 + 0.08, d / 2 - 0.08], [w / 2 - 0.08, d / 2 - 0.08]].forEach(function (p) {
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.08), TEX.M.woodDark);
      leg.position.set(p[0], h / 2, p[1]);
      g.add(leg);
    });
    g.add(top);
    g.position.set(x, 0, z); g.rotation.y = ry || 0;
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g);
    addCollider(x, z, w + 0.1, d + 0.1);
    return g;
  }

  function makeCrate(x, z, s, ry, mat) {
    var m = box(s, s * 0.8, s, mat || TEX.M.wood, x, s * 0.4, z, ry);
    return m;
  }

  function makeBarrel(x, z) {
    var m = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 12), TEX.M.rust);
    m.position.set(x, 0.45, z); m.castShadow = true; m.receiveShadow = true;
    scene.add(m); addCollider(x, z, 0.7, 0.7);
    return m;
  }

  function makeTire(x, z, stack) {
    var g = new THREE.Group();
    var t = new THREE.TorusGeometry(0.32, 0.13, 10, 18);
    for (var i = 0; i < (stack || 2); i++) {
      var m = new THREE.Mesh(t, new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.95 }));
      m.rotation.x = Math.PI / 2;
      m.position.y = 0.14 + i * 0.26;
      m.castShadow = true;
      g.add(m);
    }
    g.position.set(x, 0, z);
    scene.add(g); addCollider(x, z, 0.8, 0.8);
    return g;
  }

  // ---------- the static garage ----------
  function buildGarage() {
    // floor & ceiling
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 7.4), TEX.M.floor);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    var ceil = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 7.4), TEX.M.dark);
    ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.2; scene.add(ceil);
    // beams
    for (var bx = -4.5; bx <= 4.5; bx += 3) box(0.25, 0.22, 7.2, TEX.M.woodDark, bx, 3.1, 0);

    // walls: north (z=-3.6) south (big door), east x=+6.2 (storage door), west x=-6.2
    var wallN = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 3.2), TEX.M.wall);
    wallN.position.set(0, 1.6, -3.6); wallN.receiveShadow = true; scene.add(wallN);
    var wallS_l = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 3.2), TEX.M.wall2);
    wallS_l.position.set(-4.2, 1.6, 3.6); wallS_l.rotation.y = Math.PI; scene.add(wallS_l);
    var wallS_r = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 3.2), TEX.M.wall2);
    wallS_r.position.set(4.2, 1.6, 3.6); wallS_r.rotation.y = Math.PI; scene.add(wallS_r);
    var wallS_t = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.9), TEX.M.wall2);
    wallS_t.position.set(0, 2.75, 3.6); wallS_t.rotation.y = Math.PI; scene.add(wallS_t);
    var wallE = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 3.2), TEX.M.brick);
    wallE.position.set(6.2, 1.6, 0); wallE.rotation.y = -Math.PI / 2; scene.add(wallE);
    var wallW = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 3.2), TEX.M.wall);
    wallW.position.set(-6.2, 1.6, 0); wallW.rotation.y = Math.PI / 2; scene.add(wallW);

    // big door visual (closed per story until ch10)
    var bigDoor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.3, 0.12), TEX.M.metal);
    bigDoor.position.set(0, 1.15, 3.62); scene.add(bigDoor);
    for (var li = -1; li <= 1; li += 2) {
      var line = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.3, 0.02), TEX.M.metalDark);
      line.position.set(li * 1.4, 1.15, 3.56); scene.add(line);
    }

    // outside ground (visible through door gap edges)
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), TEX.M.dirt);
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 12); scene.add(ground);

    // vehicles
    makeCar(0x5a6f5d, -2.6, -1.6, 0.12);        // old pickup
    makeCar(0x74504a, 3.1, -1.4, -0.35);        // covered sedan

    // workbench west
    makeTable(-4.9, 1.6, Math.PI / 2, 2.4, 0.95);
    // wall tool board
    box(2.2, 1.1, 0.06, TEX.M.woodDark, -6.05, 1.7, 1.6, 0);
    // desk (letter desk) north-west corner
    makeTable(-4.6, -2.7, 0, 1.5, 0.8);
    // shelf east near storage door + shelf north
    makeShelf(5.5, 2.6, -Math.PI / 2);
    makeShelf(0.8, -3.25, 0);
    // crates & barrels & tires
    makeCrate(4.8, 1.4, 0.62, 0.3);
    makeCrate(5.4, 0.6, 0.5, -0.2, TEX.M.woodDark);
    makeCrate(-4.9, -0.6, 0.55, 0.15);
    makeBarrel(-5.3, 3.0); makeBarrel(5.4, -0.4); makeBarrel(5.05, 0.5);
    makeTire(-5.4, -1.6, 3); makeTire(3.9, 2.9, 2);

    // fusebox on east wall
    var fbox = box(0.6, 0.8, 0.16, TEX.M.metalDark, 6.05, 1.55, -1.2, 0);
    fbox.rotation.y = -Math.PI / 2;
    // wall clock north wall
    var clockG = new THREE.Group();
    var face = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 24), new THREE.MeshStandardMaterial({ color: 0xd8d2c0, roughness: 0.6 }));
    face.rotation.x = Math.PI / 2;
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.03, 8, 24), TEX.M.woodDark);
    clockG.add(face, ring);
    clockG.position.set(1.6, 2.2, -3.55);
    scene.add(clockG);
    A.clockFace = clockG;

    // cellar hatch in floor
    var hatch = box(1.0, 0.04, 1.0, TEX.M.woodDark, -2.2, 0.03, 0.8, 0.2);
    A.hatch = hatch;
    // cellar stairs block (visual)
    box(1.2, 0.5, 1.2, TEX.M.dark, -2.2, 0.25, 0.8);

    // storage room (east, behind door at x=6.2, z in [-0.9..0.9])
    buildStorage();
    // cellar room (far away)
    buildCellar();

    // door frames colliders
    colliders.push({ x1: 6.2, z1: -3.6, x2: 6.4, z2: -1.0 });
    colliders.push({ x1: 6.2, z1: 1.0, x2: 6.4, z2: 3.6 });
    // perimeter
    colliders.push({ x1: -6.4, z1: -3.8, x2: 6.4, z2: -3.6 });
    colliders.push({ x1: -6.4, z1: 3.6, x2: 6.4, z2: 3.8 });
    colliders.push({ x1: -6.4, z1: -3.8, x2: -6.2, z2: 3.8 });
    colliders.push({ x1: 10.9, z1: -3.3, x2: 11.1, z2: 3.3 });
    colliders.push({ x1: 6.4, z1: 3.05, x2: 11.1, z2: 3.25 });
    colliders.push({ x1: 6.4, z1: -3.25, x2: 11.1, z2: -3.05 });
    // cellar perimeter
    colliders.push({ x1: 29.9, z1: -3.3, x2: 38.1, z2: -3.1 });
    colliders.push({ x1: 29.9, z1: 3.1, x2: 38.1, z2: 3.3 });
    colliders.push({ x1: 37.9, z1: -3.3, x2: 38.1, z2: 3.3 });
    colliders.push({ x1: 29.9, z1: -3.3, x2: 30.1, z2: 3.3 });

    // door teleports: storage doorway
    doorTeleports.push({ x1: 6.0, z1: -1.0, x2: 6.5, z2: 1.0, sideA: { x: 5.4, z: 0 }, sideB: { x: 7.2, z: 0 }, flag: 'storage_open' });
    // cellar hatch (auto teleport when flag cellar_open; else blocked by collider)
    doorTeleports.push({ x1: -2.9, z1: 0.3, x2: -1.5, z2: 1.3, sideA: { x: -2.2, z: 0.8, cellar: true }, sideB: { x: 31.2, z: 0 }, flag: 'cellar_open', hatch: true });
    // cellar return stairs
    doorTeleports.push({ x1: 30.0, z1: -1.0, x2: 30.6, z2: 1.0, sideA: { x: -2.2, z: 0.8 }, sideB: { x: 31.2, z: 0 }, flag: 'cellar_open', hidden: true });
  }

  function buildStorage() {
    var x0 = 6.4, x1 = 10.9, z0 = -3.05, z1 = 3.05;
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), TEX.M.dirt);
    floor.rotation.x = -Math.PI / 2; floor.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); scene.add(floor);
    var ceil = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), TEX.M.dark);
    ceil.rotation.x = Math.PI / 2; ceil.position.set((x0 + x1) / 2, 3.0, (z0 + z1) / 2); scene.add(ceil);
    var wE = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 3.0), TEX.M.brick);
    wE.position.set(10.9, 1.5, 0); wE.rotation.y = -Math.PI / 2; scene.add(wE);
    var wN = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.0), TEX.M.wall2);
    wN.position.set(8.65, 1.5, -3.05); scene.add(wN);
    var wS = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.0), TEX.M.wall2);
    wS.position.set(8.65, 1.5, 3.05); wS.rotation.y = Math.PI; scene.add(wS);

    // storage door leaf (blocks until open)
    var leaf = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 1.9), TEX.M.metalDark);
    leaf.position.set(6.3, 1.1, 0); scene.add(leaf);
    A.storageLeaf = leaf;

    makeShelf(10.4, 1.6, -Math.PI / 2);
    makeShelf(10.4, -1.6, -Math.PI / 2);
    makeCrate(8.2, -2.2, 0.6, 0.4);
    makeCrate(9.0, 2.3, 0.5, -0.3, TEX.M.woodDark);
    makeBarrel(7.4, 2.4);

    // storage light
    var g = new THREE.Group();
    var tube = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.12), TEX.M.tubeOff);
    var light = new THREE.PointLight(0xffe6b3, 0, 9, 1.6);
    light.position.y = -0.2;
    g.add(tube, light);
    g.position.set(8.65, 2.85, 0);
    scene.add(g);
    storageLight = { g: g, light: light, tube: tube, on: false };
  }

  function buildCellar() {
    var x0 = 30.1, x1 = 37.9, z0 = -3.1, z1 = 3.1;
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), TEX.M.dark);
    floor.rotation.x = -Math.PI / 2; floor.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); scene.add(floor);
    var ceil = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), TEX.M.dark);
    ceil.rotation.x = Math.PI / 2; ceil.position.set((x0 + x1) / 2, 2.7, (z0 + z1) / 2); scene.add(ceil);
    var stone = new THREE.MeshStandardMaterial({ map: TEX.tex(TEX.concrete('#4a4a4e'), 3, 1), roughness: 1 });
    var wE = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 2.7), stone);
    wE.position.set(37.9, 1.35, 0); wE.rotation.y = -Math.PI / 2; scene.add(wE);
    var wN = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 2.7), stone);
    wN.position.set(34, 1.35, -3.1); scene.add(wN);
    var wS = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 2.7), stone);
    wS.position.set(34, 1.35, 3.1); wS.rotation.y = Math.PI; scene.add(wS);
    // pipes
    for (var i = 0; i < 3; i++) {
      var p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.6, 8), TEX.M.rust);
      p.rotation.z = Math.PI / 2;
      p.position.set(34, 2.3 + i * 0.18, -2.9);
      scene.add(p);
    }
    // lab table + archive tables + valve wall
    makeTable(34.5, -2.0, 0, 2.2, 0.9, 0.9);
    makeTable(36.6, 0.6, Math.PI / 2, 1.8, 0.8, 0.85);
    makeTable(31.8, 1.8, Math.PI / 2, 1.6, 0.8, 0.8);
    makeCrate(37.0, -2.2, 0.55, 0.2, TEX.M.woodDark);
    makeCrate(30.9, -1.9, 0.5, -0.35);
    makeBarrel(37.2, 2.4);
    // cellar hanging light (always on when open — candle-ish)
    var cl = new THREE.PointLight(0xffb46a, 0, 8, 1.8);
    cl.position.set(34, 2.3, 0);
    scene.add(cl);
    var cb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), TEX.M.glow);
    cb.position.copy(cl.position);
    scene.add(cb);
    A.cellarLight = cl;
    A.cellarBulb = cb;
  }

  // dust particles
  function makeDust() {
    var n = 240, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 2.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: 0xcfc7b0, size: 0.02, transparent: true, opacity: 0.5 });
    dust = new THREE.Points(geo, mat);
    scene.add(dust);
  }

  function init(canvasEl, quality) {
    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: quality !== 'low' });
    renderer.shadowMap.enabled = quality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    applyQuality(quality);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080a);
    scene.fog = new THREE.Fog(0x07080a, 6, 22);

    camera = new THREE.PerspectiveCamera(72, 1, 0.08, 60);
    hemi = new THREE.HemisphereLight(0x8a93a5, 0x14110c, 0.32);
    scene.add(hemi);

    // flashlight (camera-follow spotlight) + near-field fill
    flash = new THREE.SpotLight(0xffe8c0, 1.5, 17, 0.6, 0.55, 1.3);
    flash.castShadow = quality !== 'low';
    if (flash.shadow) {
      flash.shadow.mapSize.set(1024, 1024);
      flash.shadow.camera.near = 0.2;
      flash.shadow.camera.far = 17;
    }
    flash.target.position.set(0, 0, -5);
    scene.add(flash);
    scene.add(flash.target);
    camLight = new THREE.PointLight(0xffdca8, 0.28, 3.2, 1.6);
    scene.add(camLight);

    scene.add(levelProps);

    buildGarage();
    makeDust();

    resize();
    window.addEventListener('resize', resize);
  }

  function applyQuality(q) {
    if (!renderer) return;
    var dpr = window.devicePixelRatio || 1;
    var f = q === 'low' ? 0.6 : (q === 'high' ? 1 : 0.8);
    renderer.setPixelRatio(Math.min(dpr, 2) * f);
    renderer.shadowMap.enabled = q !== 'low';
    if (scene && scene.fog) scene.fog.far = q === 'low' ? 14 : 22;
  }

  function resize() {
    if (!renderer) return;
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    if (camera) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
  }

  function setPower(on, silent) {
    power = on;
    W.power = on;
    fixtures.forEach(function (f) {
      f.on = on;
      if (on) { f.light.intensity = f.baseI; f.tube.material = TEX.M.tubeOn; f.cone.material.opacity = 0.04; }
      else { f.light.intensity = 0; f.tube.material = TEX.M.tubeOff; f.cone.material.opacity = 0; }
    });
    storageLight.on = on;
    if (on) {
      storageLight.light.intensity = 0.7;
      storageLight.tube.material = TEX.M.tubeOn;
      hemi.intensity = 0.5;
      if (!silent) AudioSys.SFX.powerUp();
      setTimeout(function () { AudioSys.startHum(); }, 900);
    } else {
      hemi.intensity = 0.32;
    }
  }

  function openStorageDoor() {
    if (A.storageLeaf) { A.storageLeaf.visible = false; }
  }
  function openCellar() {
    if (A.hatch) A.hatch.rotation.y = 1.4;
  }

  function setAreaAmbience(area, chapter) {
    // subtle mood shifts per chapter
    var fogc = 0x07080a, hi = 0.32;
    if (power) hi = 0.5;
    if (area === 'cellar') { fogc = 0x050507; hi = Math.max(0.14, hi - 0.18); }
    scene.fog.color.setHex(fogc);
    scene.background.setHex(fogc);
    hemi.intensity = hi;
    if (A.cellarLight) A.cellarLight.intensity = area === 'cellar' ? 0.9 : 0;
    if (A.cellarBulb) A.cellarBulb.visible = area === 'cellar';
  }

  function update(dt, t) {
    // flashlight follows camera
    if (flash && camera) {
      var dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      flash.position.copy(camera.position).addScaledVector(dir, 0.25);
      flash.position.y -= 0.14;
      flash.target.position.copy(camera.position).addScaledVector(dir, 7);
      camLight.position.copy(camera.position);
    }
    for (var i = 0; i < fixtures.length; i++) {
      var f = fixtures[i];
      if (!f.on) continue;
      var fl = 1;
      if (i === 1) fl = (Math.sin(t * 23) > 0.96 || Math.sin(t * 7.3) > 0.995) ? 0.15 : 1;
      f.light.intensity = f.baseI * fl;
      f.tube.material = (fl < 1 && Math.sin(t * 31) > 0.5) ? TEX.M.tubeOff : TEX.M.tubeOn;
      f.cone.material.opacity = 0.04 * fl;
    }
    if (storageLight.on) {
      storageLight.light.intensity = 0.7;
      storageLight.tube.material = TEX.M.tubeOn;
    }
    if (dust) {
      dust.rotation.y = t * 0.008;
      dust.position.y = Math.sin(t * 0.13) * 0.05;
    }
    if (A.cellarBulb && A.cellarBulb.visible) {
      A.cellarLight.intensity = 0.8 + Math.sin(t * 9) * 0.12;
    }
  }

  function addLevelProp(obj) { levelProps.add(obj); }
  function clearLevelProps() {
    while (levelProps.children.length) {
      var c = levelProps.children[0];
      levelProps.remove(c);
    }
  }

  // anchors: named spawn points {x, z, y, ry} for level interactables
  function anchors() {
    return {
      desk:        { x: -4.6, z: -2.7, y: 0.93, ry: 0 },
      workbench:   { x: -4.9, z: 1.6, y: 0.92, ry: Math.PI / 2 },
      shelf_g1:    { x: 5.45, z: 2.6, y: 1.05, ry: -Math.PI / 2 },
      shelf_g2:    { x: 0.8, z: -3.2, y: 1.05, ry: 0 },
      crate1:      { x: 4.8, z: 1.4, y: 0.72, ry: 0.3 },
      crate2:      { x: 5.4, z: 0.6, y: 0.60, ry: -0.2 },
      crate3:      { x: -4.9, z: -0.6, y: 0.66, ry: 0.15 },
      car1_hood:   { x: -2.6, z: 0.9, y: 1.0, ry: 0 },
      car2_hood:   { x: 3.1, z: 0.8, y: 1.0, ry: 0 },
      floor_c:     { x: 0.6, z: 0.6, y: 0.06, ry: 0 },
      floor_n:     { x: 1.8, z: -1.8, y: 0.06, ry: 0 },
      tire:        { x: -5.4, z: -1.6, y: 0.85, ry: 0 },
      barrel1:     { x: -5.3, z: 3.0, y: 0.95, ry: 0 },
      wall_tool:   { x: -6.0, z: 1.6, y: 1.7, ry: Math.PI / 2 },
      fusebox:     { x: 5.95, z: -1.2, y: 1.55, ry: -Math.PI / 2 },
      clock:       { x: 1.6, z: -3.5, y: 2.2, ry: 0 },
      hatch:       { x: -2.2, z: 0.8, y: 0.15, ry: 0.2 },
      bigdoor:     { x: 0, z: 3.4, y: 1.2, ry: Math.PI },
      // storage
      shelf_s1:    { x: 10.35, z: 1.6, y: 1.05, ry: -Math.PI / 2 },
      shelf_s2:    { x: 10.35, z: -1.6, y: 1.05, ry: -Math.PI / 2 },
      crate_s1:    { x: 8.2, z: -2.2, y: 0.70, ry: 0.4 },
      crate_s2:    { x: 9.0, z: 2.3, y: 0.60, ry: -0.3 },
      barrel_s1:   { x: 7.4, z: 2.4, y: 0.95, ry: 0 },
      // cellar
      cellar_lab:  { x: 34.5, z: -2.0, y: 0.98, ry: 0 },
      cellar_t2:   { x: 36.6, z: 0.6, y: 0.93, ry: Math.PI / 2 },
      cellar_t3:   { x: 31.8, z: 1.8, y: 0.88, ry: Math.PI / 2 },
      cellar_crate:{ x: 37.0, z: -2.2, y: 0.68, ry: 0.2 },
      cellar_crate2:{ x: 30.9, z: -1.9, y: 0.62, ry: -0.3 },
      cellar_wall: { x: 34.0, z: -2.9, y: 1.4, ry: 0 },
      cellar_floor:{ x: 33.0, z: 0.5, y: 0.06, ry: 0 },
      cellar_barrel:{ x: 37.2, z: 2.4, y: 0.95, ry: 0 }
    };
  }

  var api = {
    init: init, applyQuality: applyQuality, resize: resize,
    setPower: setPower, update: update,
    openStorageDoor: openStorageDoor, openCellar: openCellar,
    setAreaAmbience: setAreaAmbience,
    addLevelProp: addLevelProp, clearLevelProps: clearLevelProps,
    anchors: anchors,
    get scene() { return scene; }, get camera() { return camera; }, get renderer() { return renderer; },
    colliders: colliders, doorTeleports: doorTeleports,
    get power() { return power; }
  };
  W = api;
  return api;
})();
