/* THE LAST GARAGE — procedural audio (WebAudio, no files) */
window.AudioSys = (function () {
  var ctx = null, master = null, musicGain = null, sfxGain = null;
  var humNode = null, windNode = null, tickTimer = null;
  var volMusic = 0.7, volSfx = 0.8, started = false;

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = volMusic; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = volSfx; sfxGain.connect(master);
    return true;
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  function noiseBuffer(seconds) {
    var b = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    var d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function startAmbient() {
    if (!ensure() || started) return; started = true; resume();
    // wind (filtered noise, slow LFO)
    var src = ctx.createBufferSource(); src.buffer = noiseBuffer(4); src.loop = true;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
    var g = ctx.createGain(); g.gain.value = 0.05;
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    var lfoG = ctx.createGain(); lfoG.gain.value = 0.025;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    src.connect(lp); lp.connect(g); g.connect(musicGain);
    src.start(); lfo.start(); windNode = src;
    // distant drips
    scheduleDrip();
  }
  function scheduleDrip() {
    if (!ctx) return;
    tickTimer = setTimeout(function () {
      if (ctx) {
        var t = ctx.currentTime;
        var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(880, t);
        o.frequency.exponentialRampToValueAtTime(320, t + 0.09);
        var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.06, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + 0.2);
      }
      scheduleDrip();
    }, 5000 + Math.random() * 9000);
  }
  function startHum() {
    if (!ensure() || humNode) return; resume();
    var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 100;
    var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 50;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
    var g = ctx.createGain(); g.gain.value = 0.0;
    g.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.5);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(musicGain);
    o.start(); o2.start(); humNode = { o: o, o2: o2, g: g };
  }
  function stopHum() {
    if (!humNode) return;
    try { humNode.o.stop(); humNode.o2.stop(); } catch (e) {}
    humNode = null;
  }
  function stopAmbient() { stopHum(); if (windNode) { try { windNode.stop(); } catch (e) {} windNode = null; } started = false; if (tickTimer) clearTimeout(tickTimer); }

  function blip(freq, dur, type, vol, slideTo) {
    if (!ensure()) return; resume();
    var t = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + dur + 0.05);
  }
  function noiseHit(dur, freq, vol) {
    if (!ensure()) return; resume();
    var t = ctx.currentTime;
    var s = ctx.createBufferSource(); s.buffer = noiseBuffer(dur + 0.05);
    var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 800;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + dur + 0.05);
  }

  var SFX = {
    tap: function () { blip(520, 0.05, 'square', 0.06); },
    pickup: function () { blip(660, 0.09, 'triangle', 0.12); setTimeout(function () { blip(990, 0.12, 'triangle', 0.1); }, 70); },
    paper: function () { noiseHit(0.22, 2600, 0.08); },
    door: function () { noiseHit(0.4, 420, 0.22); blip(140, 0.35, 'sawtooth', 0.05, 90); },
    locked: function () { blip(180, 0.12, 'square', 0.08); setTimeout(function () { blip(140, 0.14, 'square', 0.08); }, 110); },
    fuse: function () { blip(300, 0.08, 'square', 0.1); setTimeout(function () { noiseHit(0.25, 1400, 0.2); }, 90); },
    powerUp: function () { blip(110, 0.7, 'sawtooth', 0.1, 220); setTimeout(function () { blip(220, 0.5, 'triangle', 0.08, 440); }, 300); },
    clockTick: function () { blip(1200, 0.03, 'square', 0.05); },
    solve: function () { [440, 554, 659, 880].forEach(function (f, i) { setTimeout(function () { blip(f, 0.14, 'triangle', 0.12); }, i * 90); }); },
    fail: function () { blip(220, 0.2, 'sawtooth', 0.1, 110); },
    lever: function () { noiseHit(0.1, 900, 0.14); },
    valve: function () { noiseHit(0.3, 500, 0.12); },
    scare: function () { noiseHit(0.7, 300, 0.4); blip(90, 0.8, 'sawtooth', 0.18, 45); },
    step: function () { noiseHit(0.07, 240, 0.05); },
    complete: function () { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { blip(f, 0.18, 'sine', 0.14); }, i * 120); }); },
    ach: function () { [659, 784, 988].forEach(function (f, i) { setTimeout(function () { blip(f, 0.16, 'triangle', 0.13); }, i * 110); }); }
  };

  return {
    SFX: SFX, ensure: ensure, resume: resume, startAmbient: startAmbient, stopAmbient: stopAmbient,
    startHum: startHum, stopHum: stopHum,
    setMusic: function (v) { volMusic = v; if (musicGain) musicGain.gain.value = v; },
    setSfx: function (v) { volSfx = v; if (sfxGain) sfxGain.gain.value = v; }
  };
})();

/* MusicBox — real audio loops shipped in assets/game/audio/*.wav */
window.Music = (function () {
  var cur = null, vol = 0.7;
  function play(name) {
    if (cur && cur.name === name) return;
    stop();
    try {
      var a = new Audio('audio/' + name + '.wav');
      a.loop = true;
      a.volume = vol;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
      cur = { name: name, el: a };
    } catch (e) {}
  }
  function stop() {
    if (!cur) return;
    try { cur.el.pause(); cur.el.removeAttribute('src'); } catch (e) {}
    cur = null;
  }
  function ensure() {
    if (cur && cur.el && cur.el.paused) {
      var p = cur.el.play();
      if (p && p.catch) p.catch(function () {});
    }
  }
  function setVol(v) { vol = v; if (cur) cur.el.volume = v; }
  return { play: play, stop: stop, ensure: ensure, setVol: setVol };
})();
