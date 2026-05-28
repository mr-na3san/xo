const ui = (() => {
  const svgX = `<svg viewBox="0 0 24 24" fill="none"><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>`;
  const svgO = `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2.8"/></svg>`;
  const svgTrophy = `<svg viewBox="0 0 48 48" fill="none"><path d="M14 6h20v16c0 6.627-4.477 12-10 12S14 28.627 14 22V6z" stroke="var(--win)" stroke-width="2.5"/><path d="M14 12H8a4 4 0 0 0 0 8h6M34 12h6a4 4 0 0 1 0 8h-6" stroke="var(--win)" stroke-width="2.5" stroke-linecap="round"/><path d="M24 34v6M16 40h16" stroke="var(--win)" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  const svgDraw = `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="var(--textMuted)" stroke-width="2.5"/><path d="M16 20c0-4.418 3.582-8 8-8s8 3.582 8 8c0 3-1.5 5-4 7l-2 1.5V32" stroke="var(--textMuted)" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="37" r="1.5" fill="var(--textMuted)"/></svg>`;
  const svgRobot = `<svg viewBox="0 0 48 48" fill="none"><rect x="10" y="16" width="28" height="22" rx="6" stroke="var(--oColor)" stroke-width="2.5"/><rect x="17" y="22" width="5" height="5" rx="2" fill="var(--oColor)"/><rect x="26" y="22" width="5" height="5" rx="2" fill="var(--oColor)"/><path d="M19 32h10" stroke="var(--oColor)" stroke-width="2" stroke-linecap="round"/><path d="M24 16v-6M21 10h6" stroke="var(--oColor)" stroke-width="2" stroke-linecap="round"/><path d="M10 24H6M38 24h4" stroke="var(--oColor)" stroke-width="2" stroke-linecap="round"/></svg>`;

  let pendingConfig = {};

  const els = {
    loader: () => document.getElementById('loader'),
    app: () => document.getElementById('app'),
    screenMenu: () => document.getElementById('screenMenu'),
    screenGame: () => document.getElementById('screenGame'),
    board: () => document.getElementById('board'),
    boardWrap: () => document.getElementById('boardWrap'),
    turnIndicator: () => document.getElementById('turnIndicator'),
    turnInner: () => document.querySelector('.turnInner'),
    turnText: () => document.getElementById('turnText'),
    valX: () => document.getElementById('valX'),
    valO: () => document.getElementById('valO'),
    valDraw: () => document.getElementById('valDraw'),
    modalOverlay: () => document.getElementById('modalOverlay'),
    modal: () => document.getElementById('modal'),
    modalIcon: () => document.getElementById('modalIcon'),
    modalTitle: () => document.getElementById('modalTitle'),
    modalMsg: () => document.getElementById('modalMsg'),
    modalBtns: () => document.getElementById('modalBtns'),
    installBanner: () => document.getElementById('installBanner'),
    iconSun: () => document.getElementById('iconSun'),
    iconMoon: () => document.getElementById('iconMoon'),
    iconSoundOn: () => document.getElementById('iconSoundOn'),
    iconSoundOff: () => document.getElementById('iconSoundOff'),
    themeColor: () => document.getElementById('themeColor'),
  };

  const showScreen = (name) => {
    const screens = document.querySelectorAll('.screen');
    const next = document.getElementById('screen' + name);
    screens.forEach(s => {
      if (s === next) {
        s.classList.remove('slideOut', 'slideIn');
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  };

  const showModal = (opts) => {
    els.modalIcon().innerHTML = opts.icon || '';
    els.modalTitle().textContent = opts.title || '';
    els.modalMsg().textContent = opts.msg || '';
    els.modalBtns().innerHTML = '';

    const wrap = opts.btnsRow ? document.createElement('div') : null;
    if (wrap) { wrap.className = 'modalBtnRow'; els.modalBtns().appendChild(wrap); }

    (opts.btns || []).forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'modalBtn' + (b.primary ? ' primary' : '');
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        audio.play('click');
        audio.vibrate(10);
        if (b.action) b.action();
      });
      (wrap || els.modalBtns()).appendChild(btn);
    });

    els.modalOverlay().classList.remove('hidden');
  };

  const hideModal = () => {
    els.modalOverlay().classList.add('hidden');
  };

  const renderBoard = () => {
    const st = game.getState();
    const board = els.board();
    board.className = 'board size' + st.size;

    const cellSize = calcCellSize(st.size);
    board.style.width = cellSize + 'px';
    board.style.height = cellSize + 'px';

    board.innerHTML = '';
    st.board.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'cell' + (val ? ' played ' + (val === 'X' ? 'xCell' : 'oCell') : '');
      if (val) {
        const mark = document.createElement('div');
        mark.className = 'cellMark';
        mark.innerHTML = val === 'X' ? svgX : svgO;
        cell.appendChild(mark);
      }
      if (!val && !st.over) {
        cell.addEventListener('click', () => onCellClick(i));
      }
      board.appendChild(cell);
    });

    updateTurn(st.currentPlayer, st.over);
    updateScores(st.scores);
  };

  const calcCellSize = (size) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const available = Math.min(vw - 40, vh - 240);
    return Math.min(available, size === 4 ? 360 : 320);
  };

  const updateTurn = (player, over) => {
    const inner = els.turnInner();
    const text = els.turnText();
    if (over) {
      inner.classList.remove('isX', 'isO');
      text.textContent = 'Game over';
      return;
    }
    inner.classList.toggle('isX', player === 'X');
    inner.classList.toggle('isO', player === 'O');
    const st = game.getState();
    if (st.vsMode === 'ai' && player === 'O') {
      text.textContent = 'AI thinking';
    } else {
      text.textContent = player === 'X' ? "X's turn" : "O's turn";
    }
  };

  const updateScores = (scores) => {
    els.valX().textContent = scores.X;
    els.valO().textContent = scores.O;
    els.valDraw().textContent = scores.draw;

    animateScore(els.valX());
    animateScore(els.valO());
  };

  const animateScore = (el) => {
    el.style.transform = 'scale(1.4)';
    el.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
  };

  const highlightWin = (cells) => {
    const cellEls = els.board().children;
    cells.forEach(i => {
      cellEls[i].classList.add('winCell');
    });
  };

  const highlightDraw = () => {
    const cellEls = els.board().children;
    Array.from(cellEls).forEach((c, i) => {
      setTimeout(() => c.classList.add('drawCell'), i * 20);
    });
  };

  let aiLock = false;

  const onCellClick = (i) => {
    const st = game.getState();
    if (st.over || st.aiThinking || aiLock) return;

    audio.play('placeX');
    audio.vibrate(15);

    const result = game.move(i);
    if (!result) return;

    renderBoard();

    if (result.type === 'win') {
      highlightWin(result.cells);
      setTimeout(() => showGameOver(result), 700);
    } else if (result.type === 'draw') {
      highlightDraw();
      setTimeout(() => showGameOver(result), 700);
    } else if (result.type === 'continue') {
      if (game.isAiTurn()) {
        aiLock = true;
        updateTurn('O', false);
        setTimeout(() => {
          const aiResult = game.doAiMove();
          aiLock = false;
          if (aiResult) {
            audio.play('placeO');
            renderBoard();
            if (aiResult.type === 'win') {
              highlightWin(aiResult.cells);
              setTimeout(() => showGameOver(aiResult), 700);
            } else if (aiResult.type === 'draw') {
              highlightDraw();
              setTimeout(() => showGameOver(aiResult), 700);
            }
          }
        }, 420);
      }
    }
  };

  const showGameOver = (result) => {
    const st = game.getState();

    if (result.type === 'win') {
      const isAiWin = st.vsMode === 'ai' && result.player === 'O';
      const isPlayerWin = !isAiWin;

      if (isAiWin) {
        audio.play('lose');
        audio.vibrate([50, 30, 50]);
        showModal({
          icon: svgRobot,
          title: 'AI Wins',
          msg: 'Better luck next time!',
          btnsRow: true,
          btns: [
            { label: 'Menu', action: () => { hideModal(); goMenu(); } },
            { label: 'Rematch', primary: true, action: () => { hideModal(); restartGame(); } }
          ]
        });
      } else {
        audio.play('win');
        audio.vibrate([30, 20, 80]);
        showModal({
          icon: svgTrophy,
          title: result.player + ' Wins!',
          msg: st.vsMode === 'ai' ? 'You beat the AI!' : `Player ${result.player} wins the match!`,
          btnsRow: true,
          btns: [
            { label: 'Menu', action: () => { hideModal(); goMenu(); } },
            { label: 'Rematch', primary: true, action: () => { hideModal(); restartGame(); } }
          ]
        });
      }
    } else {
      audio.play('draw');
      audio.vibrate([20, 20, 20]);
      showModal({
        icon: svgDraw,
        title: "It's a Draw",
        msg: 'Great minds think alike.',
        btnsRow: true,
        btns: [
          { label: 'Menu', action: () => { hideModal(); goMenu(); } },
          { label: 'Rematch', primary: true, action: () => { hideModal(); restartGame(); } }
        ]
      });
    }
  };

  const restartGame = () => {
    aiLock = false;
    game.restart();
    renderBoard();
    if (game.isAiTurn()) {
      aiLock = true;
      updateTurn('O', false);
      setTimeout(() => {
        const aiResult = game.doAiMove();
        aiLock = false;
        if (aiResult) {
          audio.play('placeO');
          renderBoard();
        }
      }, 500);
    }
  };

  const goMenu = () => {
    game.clear();
    showScreen('Menu');
  };

  const startGame = (opts) => {
    aiLock = false;
    game.init(opts);
    renderBoard();
    showScreen('Game');
    if (game.isAiTurn()) {
      aiLock = true;
      updateTurn('O', false);
      setTimeout(() => {
        const aiResult = game.doAiMove();
        aiLock = false;
        if (aiResult) {
          audio.play('placeO');
          renderBoard();
        }
      }, 600);
    }
  };

  const showModeSelect = (size) => {
    pendingConfig.size = size;
    showModal({
      icon: svgRobot,
      title: 'Game Mode',
      msg: `Choose how to play ${size}×${size}`,
      btns: [
        {
          label: 'VS AI', primary: true, action: () => {
            hideModal();
            showDifficultySelect();
          }
        },
        {
          label: 'VS Player', action: () => {
            hideModal();
            showStarterSelect('player');
          }
        }
      ]
    });
  };

  const showDifficultySelect = () => {
    showModal({
      icon: svgRobot,
      title: 'AI Difficulty',
      msg: 'Select challenge level',
      btns: [
        { label: 'Easy', action: () => { hideModal(); pendingConfig.difficulty = 'easy'; showStarterSelect('ai'); } },
        { label: 'Medium', action: () => { hideModal(); pendingConfig.difficulty = 'medium'; showStarterSelect('ai'); } },
        { label: 'Hard', action: () => { hideModal(); pendingConfig.difficulty = 'hard'; showStarterSelect('ai'); } },
        { label: 'Impossible', primary: true, action: () => { hideModal(); pendingConfig.difficulty = 'impossible'; showStarterSelect('ai'); } }
      ]
    });
  };

  const showStarterSelect = (vsMode) => {
    pendingConfig.vsMode = vsMode;
    const isAi = vsMode === 'ai';
    showModal({
      icon: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="var(--accent)" stroke-width="2.5"/><path d="M16 24h16M24 16v16" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/></svg>`,
      title: 'Who Goes First?',
      msg: isAi ? 'Choose who makes the first move' : 'Select the starting player',
      btnsRow: true,
      btns: [
        {
          label: isAi ? 'Player' : 'X',
          primary: true,
          action: () => {
            hideModal();
            startGame({ ...pendingConfig, firstPlayer: 'X' });
          }
        },
        {
          label: isAi ? 'AI' : 'O',
          action: () => {
            hideModal();
            if (isAi) {
              startGame({ ...pendingConfig, firstPlayer: 'O' });
            } else {
              startGame({ ...pendingConfig, firstPlayer: 'O' });
            }
          }
        }
      ]
    });
  };

  const applyTheme = (theme) => {
    document.body.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    els.iconSun().classList.toggle('hidden', isDark);
    els.iconMoon().classList.toggle('hidden', !isDark);
    els.themeColor().setAttribute('content', isDark ? '#0f0f1a' : '#f0f0f8');
    localStorage.setItem('theme', theme);
  };

  const applySoundIcon = () => {
    const on = audio.isEnabled();
    els.iconSoundOn().classList.toggle('hidden', !on);
    els.iconSoundOff().classList.toggle('hidden', on);
  };

  const bindEvents = () => {
    document.getElementById('btn3x3').addEventListener('click', () => {
      audio.play('click');
      showModeSelect(3);
    });

    document.getElementById('btn4x4').addEventListener('click', () => {
      audio.play('click');
      showModeSelect(4);
    });

    document.getElementById('btnVsAI').addEventListener('click', () => {
      audio.play('click');
      pendingConfig.size = 3;
      showDifficultySelect();
    });

    document.getElementById('btnVsPlayer').addEventListener('click', () => {
      audio.play('click');
      pendingConfig.size = 3;
      showStarterSelect('player');
    });

    document.getElementById('btnTheme').addEventListener('click', () => {
      audio.play('click');
      const current = document.body.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('btnSound').addEventListener('click', () => {
      const next = !audio.isEnabled();
      audio.setEnabled(next);
      applySoundIcon();
      audio.play('click');
    });

    document.getElementById('btnBack').addEventListener('click', () => {
      audio.play('click');
      showModal({
        icon: `<svg viewBox="0 0 48 48" fill="none"><path d="M30 12L18 24l12 12" stroke="var(--textMuted)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        title: 'Leave Game?',
        msg: 'Your progress will be lost.',
        btnsRow: true,
        btns: [
          { label: 'Stay', action: () => hideModal() },
          { label: 'Leave', primary: true, action: () => { hideModal(); goMenu(); } }
        ]
      });
    });

    document.getElementById('btnRestart').addEventListener('click', () => {
      audio.play('click');
      restartGame();
    });

    window.addEventListener('resize', () => {
      const st = game.getState();
      if (st.board.length) renderBoard();
    });
  };

  const init = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    applySoundIcon();
    bindEvents();

    const loader = els.loader();
    const app = els.app();

    setTimeout(() => {
      loader.classList.add('fadeOut');
      app.classList.remove('hidden');
      showScreen('Menu');

      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);

      const hasSaved = game.load();
      if (hasSaved) {
        const st = game.getState();
        if (st.board && st.board.some(c => c)) {
          showModal({
            icon: `<svg viewBox="0 0 48 48" fill="none"><path d="M24 8v16l10 6" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="24" r="18" stroke="var(--accent)" stroke-width="2.5"/></svg>`,
            title: 'Resume Game?',
            msg: 'You have an unfinished match.',
            btnsRow: true,
            btns: [
              { label: 'New Game', action: () => { game.clear(); hideModal(); } },
              {
                label: 'Resume', primary: true, action: () => {
                  hideModal();
                  renderBoard();
                  showScreen('Game');
                  if (game.isAiTurn()) {
                    setTimeout(() => {
                      const aiResult = game.doAiMove();
                      if (aiResult) { audio.play('place'); renderBoard(); }
                    }, 500);
                  }
                }
              }
            ]
          });
        }
      }
    }, 1400);

    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const banner = els.installBanner();
      if (!localStorage.getItem('installDismissed')) {
        banner.classList.remove('hidden');
      }
    });

    document.getElementById('btnInstall').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      els.installBanner().classList.add('hidden');
    });

    document.getElementById('btnDismiss').addEventListener('click', () => {
      els.installBanner().classList.add('hidden');
      localStorage.setItem('installDismissed', '1');
    });
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => ui.init());
