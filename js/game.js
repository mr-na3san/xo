const game = (() => {
  let state = {
    board: [],
    size: 3,
    currentPlayer: 'X',
    vsMode: 'player',
    difficulty: 'medium',
    firstPlayer: 'X',
    lastStarter: 'X',
    scores: { X: 0, O: 0, draw: 0 },
    over: false,
    aiThinking: false,
    winCells: [],
  };

  const load = () => {
    try {
      const saved = localStorage.getItem('xoGameState');
      if (saved) {
        const s = JSON.parse(saved);
        if (s && s.board && !s.over) {
          state = { ...state, ...s };
          return true;
        }
      }
    } catch (e) {}
    return false;
  };

  const save = () => {
    try {
      localStorage.setItem('xoGameState', JSON.stringify(state));
    } catch (e) {}
  };

  const clear = () => {
    localStorage.removeItem('xoGameState');
  };

  const init = (opts) => {
    state.size = opts.size || 3;
    state.vsMode = opts.vsMode || 'player';
    state.difficulty = opts.difficulty || 'medium';
    state.firstPlayer = opts.firstPlayer || 'X';
    state.lastStarter = opts.firstPlayer || 'X';
    state.board = Array(state.size * state.size).fill(null);
    state.currentPlayer = state.firstPlayer;
    state.over = false;
    state.aiThinking = false;
    state.winCells = [];
    save();
  };

  const restart = () => {
    const next = state.lastStarter === 'X' ? 'O' : 'X';
    state.lastStarter = next;
    state.firstPlayer = next;
    state.board = Array(state.size * state.size).fill(null);
    state.currentPlayer = next;
    state.over = false;
    state.aiThinking = false;
    state.winCells = [];
    save();
  };

  const getState = () => ({ ...state, board: [...state.board], scores: { ...state.scores } });

  const move = (idx) => {
    if (state.over || state.board[idx] || state.aiThinking) return null;

    state.board[idx] = state.currentPlayer;

    const wins = aiEngine.getWins(state.size);
    let winLine = null;
    for (const line of wins) {
      const vals = line.map(i => state.board[i]);
      if (vals[0] && vals.every(v => v === vals[0])) {
        winLine = line;
        break;
      }
    }

    if (winLine) {
      state.over = true;
      state.winCells = winLine;
      state.scores[state.currentPlayer]++;
      save();
      return { type: 'win', player: state.currentPlayer, cells: winLine };
    }

    if (state.board.every(c => c)) {
      state.over = true;
      state.scores.draw++;
      save();
      return { type: 'draw' };
    }

    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    save();
    return { type: 'continue', player: state.currentPlayer };
  };

  const isAiTurn = () => {
    return state.vsMode === 'ai' && state.currentPlayer === 'O' && !state.over;
  };

  const doAiMove = () => {
    if (!isAiTurn()) return null;
    state.aiThinking = true;
    const idx = aiEngine.getMove([...state.board], state.size, state.difficulty);
    state.aiThinking = false;
    if (idx === null || idx === undefined) return null;
    return move(idx);
  };

  const resetScores = () => {
    state.scores = { X: 0, O: 0, draw: 0 };
    save();
  };

  return { init, restart, load, save, clear, getState, move, isAiTurn, doAiMove, resetScores };
})();
