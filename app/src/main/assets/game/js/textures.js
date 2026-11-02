window.TEX = (function() {
  function cv(w, h) {
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  function noiseOver(ctx, w, h, alpha, dark) {
    var img = ctx.getImageData(0, 0, w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() - 0.5) * alpha;
      d[i] = Math.max(0, Math.min(255, d[i] + n * (dark ? 0.6 : 1)));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n * (dark ? 0.6 : 1)));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * (dark ? 0.6 : 1)));
    }
    ctx.putImageData(img, 0, 0);
  }
  function stains(ctx, w, h, n, col) {
    for (var i = 0; i < n; i++) {
      var x = Math.random() * w, y = Math.random() * h, r = 8 + Math.random() * 60;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.fill();
    }
  }
  function tex(c, rx, ry) {
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (rx) t.repeat.set(rx, ry);
    t.anisotropy = 4;
    return t;
  }
  function concrete(base) {
    var c = cv(256, 256), x = c.getContext("2d");
    x.fillStyle = base || "#8e8b84";
    x.fillRect(0, 0, 256, 256);
    stains(x, 256, 256, 14, "rgba(60,55,48,0.16)");
    stains(x, 256, 256, 6, "rgba(120,110,90,0.12)");
    noiseOver(x, 256, 256, 42, false);
    x.strokeStyle = "rgba(40,38,34,0.35)";
    x.lineWidth = 1;
    for (var i = 0; i < 5; i++) {
      x.beginPath();
      var px = Math.random() * 256, py = Math.random() * 256;
      x.moveTo(px, py);
      for (var j = 0; j < 6; j++) {
        px += (Math.random() - 0.5) * 40;
        py += Math.random() * 30;
        x.lineTo(px, py);
      }
      x.stroke();
    }
    return c;
  }
  function floorTex() {
    var c = cv(256, 256), x = c.getContext("2d");
    x.fillStyle = "#75726b";
    x.fillRect(0, 0, 256, 256);
    stains(x, 256, 256, 20, "rgba(45,42,38,0.25)");
    noiseOver(x, 256, 256, 36, false);
    x.strokeStyle = "rgba(35,33,30,0.5)";
    x.lineWidth = 2;
    x.strokeRect(1, 1, 254, 254);
    x.beginPath();
    x.moveTo(128, 0);
    x.lineTo(128, 256);
    x.moveTo(0, 128);
    x.lineTo(256, 128);
    x.stroke();
    return c;
  }
  function wood(base) {
    var c = cv(256, 256), x = c.getContext("2d");
    x.fillStyle = base || "#7a5a38";
    x.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 6; i++) {
      x.fillStyle = "rgba(0,0,0,0.13)";
      x.fillRect(0, i * 43, 256, 2);
      x.strokeStyle = "rgba(60,40,20,0.25)";
      for (var j = 0; j < 8; j++) {
        x.beginPath();
        var y = i * 43 + 4 + Math.random() * 36;
        x.moveTo(0, y);
        x.bezierCurveTo(80, y + 3, 170, y - 3, 256, y);
        x.stroke();
      }
    }
    noiseOver(x, 256, 256, 30, false);
    return c;
  }
  function metal(col) {
    var c = cv(128, 128), x = c.getContext("2d");
    x.fillStyle = col || "#5d6a72";
    x.fillRect(0, 0, 128, 128);
    x.strokeStyle = "rgba(255,255,255,0.06)";
    for (var i = 0; i < 30; i++) {
      x.beginPath();
      var y = Math.random() * 128;
      x.moveTo(0, y);
      x.lineTo(128, y + Math.random() * 4 - 2);
      x.stroke();
    }
    noiseOver(x, 128, 128, 26, false);
    return c;
  }
  function dirt() {
    var c = cv(256, 256), x = c.getContext("2d");
    x.fillStyle = "#4e463c";
    x.fillRect(0, 0, 256, 256);
    stains(x, 256, 256, 26, "rgba(30,26,20,0.3)");
    noiseOver(x, 256, 256, 46, false);
    return c;
  }
  function brick() {
    var c = cv(256, 256), x = c.getContext("2d");
    x.fillStyle = "#6e4436";
    x.fillRect(0, 0, 256, 256);
    x.fillStyle = "#8a5a48";
    for (var r = 0; r < 8; r++) for (var b = 0; b < 4; b++) {
      var off = r % 2 * 32;
      x.fillRect(b * 64 + off - 30, r * 32 + 2, 58, 28);
    }
    noiseOver(x, 256, 256, 30, false);
    return c;
  }
  function rust() {
    var c = cv(128, 128), x = c.getContext("2d");
    x.fillStyle = "#6b5548";
    x.fillRect(0, 0, 128, 128);
    stains(x, 128, 128, 18, "rgba(140,70,30,0.4)");
    noiseOver(x, 128, 128, 36, false);
    return c;
  }
  function paper() {
    var c = cv(128, 160), x = c.getContext("2d");
    x.fillStyle = "#e8dfc8";
    x.fillRect(0, 0, 128, 160);
    stains(x, 128, 160, 5, "rgba(150,120,70,0.25)");
    x.strokeStyle = "#5a5040";
    x.lineWidth = 1.5;
    for (var i = 0; i < 9; i++) {
      x.beginPath();
      var y = 18 + i * 15;
      x.moveTo(14, y);
      for (var j = 0; j < 5; j++) x.lineTo(14 + j * 22 + 10, y + (Math.random() - 0.5) * 4);
      x.stroke();
    }
    return c;
  }
  var M = {};
  function build() {
    M.wall = new THREE.MeshStandardMaterial({ map: tex(concrete("#8e8b84"), 3, 2), roughness: 0.95 });
    M.wall2 = new THREE.MeshStandardMaterial({ map: tex(concrete("#7c7a74"), 2, 2), roughness: 0.95 });
    M.brick = new THREE.MeshStandardMaterial({ map: tex(brick(), 2, 1), roughness: 0.9 });
    M.floor = new THREE.MeshStandardMaterial({ map: tex(floorTex(), 4, 4), roughness: 0.9 });
    M.wood = new THREE.MeshStandardMaterial({ map: tex(wood(), 1, 1), roughness: 0.85 });
    M.woodDark = new THREE.MeshStandardMaterial({ map: tex(wood("#5a4228"), 1, 1), roughness: 0.85 });
    M.metal = new THREE.MeshStandardMaterial({ map: tex(metal(), 1, 1), roughness: 0.55, metalness: 0.6 });
    M.metalDark = new THREE.MeshStandardMaterial({ map: tex(metal("#3c444c"), 1, 1), roughness: 0.5, metalness: 0.7 });
    M.rust = new THREE.MeshStandardMaterial({ map: tex(rust(), 1, 1), roughness: 0.9, metalness: 0.3 });
    M.dirt = new THREE.MeshStandardMaterial({ map: tex(dirt(), 6, 6), roughness: 1 });
    M.paper = new THREE.MeshStandardMaterial({ map: tex(paper(), 1, 1), roughness: 0.9 });
    M.tubeOn = new THREE.MeshStandardMaterial({ color: 16315360, emissive: 16774092, emissiveIntensity: 1.4 });
    M.tubeOff = new THREE.MeshStandardMaterial({ color: 10132114, roughness: 0.4 });
    M.glow = new THREE.MeshBasicMaterial({ color: 16771504 });
    M.dark = new THREE.MeshStandardMaterial({ color: 1316378, roughness: 0.9 });
  }
  build();
  return { M, tex, concrete, wood, metal, cv };
})();
