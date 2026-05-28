const audio = (() => {
  let ctx = null;
  let enabled = localStorage.getItem('soundEnabled') !== 'false';

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  const play = (type) => {
    if (!enabled) return;
    try {
      const c = getCtx();
      const g = c.createGain();
      g.connect(c.destination);

      if (type === 'placeX') {
        const o = c.createOscillator();
        o.connect(g);
        o.type = 'sine';
        o.frequency.setValueAtTime(480, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(620, c.currentTime + 0.09);
        g.gain.setValueAtTime(0.18, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
        o.start(c.currentTime);
        o.stop(c.currentTime + 0.18);
      } else if (type === 'placeO') {
        const o = c.createOscillator();
        o.connect(g);
        o.type = 'triangle';
        o.frequency.setValueAtTime(300, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.12);
        g.gain.setValueAtTime(0.2, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
        o.start(c.currentTime);
        o.stop(c.currentTime + 0.22);
      } else if (type === 'win') {
        [0, 0.12, 0.24].forEach((t, i) => {
          const o = c.createOscillator();
          o.connect(g);
          o.type = 'triangle';
          const freqs = [440, 554, 659];
          o.frequency.setValueAtTime(freqs[i], c.currentTime + t);
          g.gain.setValueAtTime(0.2, c.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + 0.3);
          o.start(c.currentTime + t);
          o.stop(c.currentTime + t + 0.3);
        });
      } else if (type === 'lose') {
        [0, 0.15].forEach((t, i) => {
          const o = c.createOscillator();
          o.connect(g);
          o.type = 'sawtooth';
          const freqs = [330, 220];
          o.frequency.setValueAtTime(freqs[i], c.currentTime + t);
          g.gain.setValueAtTime(0.12, c.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + 0.25);
          o.start(c.currentTime + t);
          o.stop(c.currentTime + t + 0.25);
        });
      } else if (type === 'draw') {
        const o = c.createOscillator();
        o.connect(g);
        o.type = 'sine';
        o.frequency.setValueAtTime(400, c.currentTime);
        o.frequency.linearRampToValueAtTime(300, c.currentTime + 0.4);
        g.gain.setValueAtTime(0.15, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
        o.start(c.currentTime);
        o.stop(c.currentTime + 0.4);
      } else if (type === 'click') {
        const o = c.createOscillator();
        o.connect(g);
        o.type = 'sine';
        o.frequency.setValueAtTime(800, c.currentTime);
        g.gain.setValueAtTime(0.08, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
        o.start(c.currentTime);
        o.stop(c.currentTime + 0.08);
      }
    } catch (e) {}
  };

  const vibrate = (pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const setEnabled = (val) => {
    enabled = val;
    localStorage.setItem('soundEnabled', val);
  };

  const isEnabled = () => enabled;

  return { play, vibrate, setEnabled, isEnabled };
})();
