// Web Audio API: procedural sounds, positional audio
const AudioSystem = (() => {
  let ctx = null;
  let masterGain = null;
  let playerX = 0, playerY = 0, playerAngle = 0;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.4;
      masterGain.connect(ctx.destination);
    }
    return ctx;
  }

  function positional(srcX, srcY, maxDist = 15) {
    if (!ctx) return { volume: 0, pan: 0 };
    const dx = srcX - playerX, dy = srcY - playerY;
    const dist = Math.hypot(dx, dy);
    const volume = Math.max(0, 1 - dist / maxDist);
    // Pan based on angle relative to player facing
    const angle = Math.atan2(dy, dx) - playerAngle;
    const pan = Math.sin(angle) * 0.8;
    return { volume, pan };
  }

  function playNoise(duration, freq, decay, volume = 1, pan = 0) {
    const ac = getCtx();
    const buf = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * decay));
    }
    const src = ac.createBufferSource();
    src.buffer = buf;

    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.5;

    const gain = ac.createGain();
    gain.gain.value = volume;

    const panner = ac.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));

    src.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);
    src.start();
    return src;
  }

  function playOsc(freq, type, duration, decay, volume = 1, pan = 0, freqEnd = null) {
    const ac = getCtx();
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + duration);
    }

    const gain = ac.createGain();
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

    const panner = ac.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);
    osc.start();
    osc.stop(ac.currentTime + duration);
  }

  return {
    setPlayerState(x, y, angle) {
      playerX = x; playerY = y; playerAngle = angle;
      // Resume context if suspended (browser autoplay policy)
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },

    playGunshot() {
      // White noise burst = gunshot
      playNoise(0.12, 800, 0.03, 1.2);
      playNoise(0.08, 200, 0.05, 0.8);
    },

    playAlert(srcX, srcY) {
      const { volume, pan } = positional(srcX, srcY);
      if (volume < 0.05) return;
      playOsc(220, 'sawtooth', 0.3, 0.08, volume * 0.5, pan, 110);
    },

    playSound(type, srcX, srcY) {
      const pos = (srcX !== undefined) ? positional(srcX, srcY) : { volume: 1, pan: 0 };
      if (pos.volume < 0.05) return;
      const v = pos.volume, p = pos.pan;

      switch(type) {
        case 'zombieAttack':
          playNoise(0.2, 300, 0.06, v * 0.7, p);
          playOsc(80, 'sawtooth', 0.15, 0.08, v * 0.5, p, 40);
          break;
        case 'soldierShoot':
          playNoise(0.1, 600, 0.02, v * 0.8, p);
          playNoise(0.05, 150, 0.03, v * 0.5, p);
          break;
        case 'demonCharge':
          playOsc(55, 'sawtooth', 0.4, 0.1, v * 0.8, p, 110);
          playNoise(0.4, 100, 0.15, v * 0.6, p);
          break;
        case 'demonAttack':
          playNoise(0.25, 150, 0.08, v * 0.9, p);
          playOsc(60, 'square', 0.2, 0.05, v * 0.6, p, 30);
          break;
        case 'bossRoar':
          playNoise(0.8, 80, 0.25, v * 1.0, p);
          playOsc(40, 'sawtooth', 0.6, 0.15, v * 0.8, p, 20);
          break;
        case 'bossShoot':
          playOsc(440, 'square', 0.15, 0.04, v * 0.8, p, 220);
          playNoise(0.1, 400, 0.03, v * 0.6, p);
          break;
        case 'hitFlesh':
          playNoise(0.06, 250, 0.015, v * 0.6, p);
          break;
        case 'pickup':
          playOsc(880, 'sine', 0.1, 0.03, 0.5, 0, 1320);
          break;
        case 'playerDeath':
          playNoise(0.5, 100, 0.12, 1.0);
          playOsc(60, 'sawtooth', 0.4, 0.1, 0.8, 0, 30);
          break;
        case 'levelComplete':
          playOsc(523, 'sine', 0.2, 0.05, 0.6, 0);
          setTimeout(() => playOsc(659, 'sine', 0.2, 0.05, 0.6, 0), 200);
          setTimeout(() => playOsc(784, 'sine', 0.3, 0.07, 0.7, 0), 400);
          break;
      }
    }
  };
})();
