const aiEngine = (() => {

  const getWins = (size) => {
    const wins = [];
    for (let r = 0; r < size; r++) {
      wins.push(Array.from({length: size}, (_, c) => r * size + c));
    }
    for (let c = 0; c < size; c++) {
      wins.push(Array.from({length: size}, (_, r) => r * size + c));
    }
    wins.push(Array.from({length: size}, (_, i) => i * size + i));
    wins.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));
    return wins;
  };

  const checkWinner = (board, size) => {
    const wins = getWins(size);
    for (const line of wins) {
      const vals = line.map(i => board[i]);
      if (vals[0] && vals.every(v => v === vals[0])) return vals[0];
    }
    return null;
  };

  const minimax = (board, size, isMax, depth, alpha, beta, maxDepth) => {
    const winner = checkWinner(board, size);
    if (winner === 'O') return 100 - depth;
    if (winner === 'X') return depth - 100;
    if (board.every(c => c) || depth >= maxDepth) return 0;

    const empty = board.reduce((a, v, i) => v ? a : [...a, i], []);
    let best = isMax ? -Infinity : Infinity;

    for (const idx of empty) {
      board[idx] = isMax ? 'O' : 'X';
      const score = minimax(board, size, !isMax, depth + 1, alpha, beta, maxDepth);
      board[idx] = null;
      if (isMax) {
        best = Math.max(best, score);
        alpha = Math.max(alpha, best);
      } else {
        best = Math.min(best, score);
        beta = Math.min(beta, best);
      }
      if (beta <= alpha) break;
    }
    return best;
  };

  const bestMove = (board, size, maxDepth) => {
    const empty = board.reduce((a, v, i) => v ? a : [...a, i], []);
    let bestScore = -Infinity;
    let move = empty[0];
    for (const idx of empty) {
      board[idx] = 'O';
      const score = minimax([...board], size, false, 0, -Infinity, Infinity, maxDepth);
      board[idx] = null;
      if (score > bestScore) { bestScore = score; move = idx; }
    }
    return move;
  };

  const randomMove = (board) => {
    const empty = board.reduce((a, v, i) => v ? a : [...a, i], []);
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const blockingMove = (board, size) => {
    const wins = getWins(size);
    for (const p of ['X', 'O']) {
      for (const line of wins) {
        const vals = line.map(i => board[i]);
        const filled = vals.filter(v => v === p).length;
        const empties = line.filter(i => !board[i]);
        if (filled === size - 1 && empties.length === 1) {
          if (p === 'X') return empties[0];
          if (p === 'O') return empties[0];
        }
      }
    }
    return null;
  };

  const getMove = (board, size, difficulty) => {
    const empty = board.reduce((a, v, i) => v ? a : [...a, i], []);
    if (!empty.length) return null;

    if (difficulty === 'easy') {
      if (Math.random() < 0.2) {
        const block = blockingMove(board, size);
        if (block !== null) return block;
      }
      return randomMove(board);
    }

    if (difficulty === 'medium') {
      const wins = getWins(size);
      for (const line of wins) {
        const vals = line.map(i => board[i]);
        if (vals.filter(v => v === 'O').length === size - 1 && line.filter(i => !board[i]).length === 1) {
          return line.find(i => !board[i]);
        }
      }
      for (const line of wins) {
        const vals = line.map(i => board[i]);
        if (vals.filter(v => v === 'X').length === size - 1 && line.filter(i => !board[i]).length === 1) {
          return line.find(i => !board[i]);
        }
      }
      if (Math.random() < 0.45) return randomMove(board);
      const center = Math.floor(size * size / 2);
      if (!board[center] && size % 2 !== 0) return center;
      return randomMove(board);
    }

    if (difficulty === 'hard') {
      const maxD = size === 3 ? 4 : 3;
      return bestMove([...board], size, maxD);
    }

    if (difficulty === 'impossible') {
      const maxD = size === 3 ? 9 : 5;
      return bestMove([...board], size, maxD);
    }

    return randomMove(board);
  };

  return { getMove, checkWinner, getWins };
})();
