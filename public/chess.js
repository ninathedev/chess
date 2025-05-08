class Piece {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.hasMoved = false;
    this.movedHowLongAgo = 0; 
  }

  getAvailableMoves(board, x, y) {
    if (this.name === "p") {
      return this.getPawnMoves(board, x, y);
    }
    if (this.name === "r") {
      return this.getRookMoves(board, x, y);
    }
    if (this.name === "n") {
      return this.getKnightMoves(board, x, y);
    }
    if (this.name === "b") {
      return this.getBishopMoves(board, x, y);
    }
    if (this.name === "q") {
      return this.getQueenMoves(board, x, y);
    }
    if (this.name === "k") {
      return this.getKingMoves(board, x, y);
    }
    return [];
  }

  getPawnMoves(board, x, y) {
    let moves = [];
    let direction = this.color === "white" ? -1 : 1; // White moves up, black moves down
    let startRow = this.color === "white" ? 6 : 1; // Starting row for pawns

    // Helper function to check if a move puts the king in check
    const isMoveSafe = (board, x, y, newX, newY) => {
      let tempBoard = JSON.parse(JSON.stringify(board));
      tempBoard[newY][newX] = tempBoard[y][x];
      tempBoard[y][x] = null;
      return !this.isKingInCheck(tempBoard, this.color);
    };

    // Move forward one square
    if (board[y + direction][x] === null && isMoveSafe(board, x, y, x, y + direction)) {
      moves.push([x, y + direction]);
      // Move forward two squares from starting position
      if (y === startRow && board[y + 2 * direction][x] === null && isMoveSafe(board, x, y, x, y + 2 * direction)) {
        moves.push([x, y + 2 * direction, false]); // false indicates normal move
      }
    }

    // Capture diagonally left
    if (x > 0 && board[y + direction][x - 1] !== null && board[y + direction][x - 1].color !== this.color && isMoveSafe(board, x, y, x - 1, y + direction)) {
      moves.push([x - 1, y + direction, false]); // false indicates normal capture
    }

    // Capture diagonally right
    if (x < 7 && board[y + direction][x + 1] !== null && board[y + direction][x + 1].color !== this.color && isMoveSafe(board, x, y, x + 1, y + direction)) {
      moves.push([x + 1, y + direction, false]); // false indicates normal capture
    }

    // En passant
    if (this.movedHowLongAgo === 1) {
      if (x > 0 && board[y][x - 1] !== null && board[y][x - 1].name === "p" && board[y][x - 1].color !== this.color && board[y][x - 1].movedHowLongAgo === 1 && isMoveSafe(board, x, y, x - 1, y + direction)) {
        moves.push([x - 1, y + direction, true]); // true indicates en passant
      }
      if (x < 7 && board[y][x + 1] !== null && board[y][x + 1].name === "p" && board[y][x + 1].color !== this.color && board[y][x + 1].movedHowLongAgo === 1 && isMoveSafe(board, x, y, x + 1, y + direction)) {
        moves.push([x + 1, y + direction, true]); // true indicates en passant
      }
    }

    return moves;
  }

  getRookMoves(board, x, y) {
    let moves = [];

    let directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 }
    ];
    
    for (let direction of directions) {
      let newX = x;
      let newY = y;
      while (true) {
        newX += direction.x;
        newY += direction.y;
        if (newX < 0 || newX > 7 || newY < 0 || newY > 7) break;
        if (board[newY][newX] === null) {
          if (!isMoveSafe(board, x, y, newX, newY)) continue;
          moves.push([newX, newY]);
        } else {
          if (board[newY][newX].color !== this.color && isMoveSafe(board, x, y, newX, newY)) {
            moves.push([newX, newY]);
          }
          break;
        }
      }
    }
    return moves;
  }

  getKnightMoves(board, x, y) {
    let moves = [];

    let knightMoves = [
      { x: 2, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: 1 },
      { x: -2, y: -1 },
      { x: 1, y: 2 },
      { x: 1, y: -2 },
      { x: -1, y: 2 },
      { x: -1, y: -2 }
    ];

    for (let move of knightMoves) {
      let newX = x + move.x;
      let newY = y + move.y;
      if (newX >= 0 && newX <= 7 && newY >= 0 && newY <= 7) {
        if ((board[newY][newX] === null || board[newY][newX].color !== this.color) && isMoveSafe(board, x, y, newX, newY)) {
          moves.push([newX, newY]);
        }
      }
    }

    return moves;
  }

  getBishopMoves(board, x, y) {
    let moves = [];

    let directions = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 }
    ];

    for (let direction of directions) {
      let newX = x;
      let newY = y;
      while (true) {
        newX += direction.x;
        newY += direction.y;
        if (newX < 0 || newX > 7 || newY < 0 || newY > 7) break;
        if (board[newY][newX] === null) {
          if (!isMoveSafe(board, x, y, newX, newY)) continue;
          moves.push([newX, newY]);
        } else {
          if (board[newY][newX].color !== this.color && isMoveSafe(board, x, y, newX, newY)) {
            moves.push([newX, newY]);
          }
          break;
        }
      }
    }
    return moves;
  }

  getQueenMoves(board, x, y) {
    let moves = [];

    // Rook-like moves
    let rookMoves = this.getRookMoves(board, x, y);
    moves.push(...rookMoves);

    // Bishop-like moves
    let bishopMoves = this.getBishopMoves(board, x, y);
    moves.push(...bishopMoves);

    return moves;
  }

  getKingMoves(board, x, y) {
    let moves = [];

    let kingMoves = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 }
    ];

    for (let move of kingMoves) {
      let newX = x + move.x;
      let newY = y + move.y;
      if (newX >= 0 && newX <= 7 && newY >= 0 && newY <= 7) {
        if ((board[newY][newX] === null || board[newY][newX].color !== this.color) && isMoveSafe(board, x, y, newX, newY)) {
          moves.push([newX, newY, false]);
        }
      }
    }

    // Castling
    if (!this.hasMoved) {
      // Kingside castling
      if (
        board[y][5] === null &&
        board[y][6] === null &&
        board[y][7] !== null &&
        !board[y][7].hasMoved &&
        !isSquareUnderAttack(board, x, y, this.color) &&
        !isSquareUnderAttack(board, 5, y, this.color) &&
        !isSquareUnderAttack(board, 6, y, this.color)
      ) {
        moves.push([6, y, true]); // Castling move
      }
      // Queenside castling
      if (
        board[y][3] === null &&
        board[y][2] === null &&
        board[y][1] === null &&
        board[y][0] !== null &&
        !board[y][0].hasMoved &&
        !isSquareUnderAttack(board, x, y, this.color) &&
        !isSquareUnderAttack(board, 3, y, this.color) &&
        !isSquareUnderAttack(board, 2, y, this.color)
      ) {
        moves.push([2, y, true]); // Castling move
      }
    }

    return moves;
  }

  isSquareUnderAttack(board, x, y, color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = board[row][col];
        if (piece && piece.color !== color) {
          let opponentMoves = piece.getAvailableMoves(board, col, row);
          for (let move of opponentMoves) {
            if (move[0] === x && move[1] === y) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  isKingInCheck(board, color) {
    let kingPosition = null;

    // Find the king's position
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = board[row][col];
        if (piece !== null && piece.name === "k" && piece.color === color) {
          kingPosition = { x: col, y: row };
          break;
        }
      }
      if (kingPosition) break;
    }

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = board[row][col];
        if (piece && piece.color !== color) {
          console.log(piece);
          let opponentMoves = piece.getAvailableMoves(board, col, row);
          for (let move of opponentMoves) {
            if (move[0] === kingPosition.x && move[1] === kingPosition.y) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  getName() {
    return this.name;
  }

  getColor() {
    return this.color;
  }

  // helps with castling
  getHasMoved() {
    return this.hasMoved;
  }

  setHasMoved(hasMoved) {
    this.hasMoved = hasMoved;
  }

  // helps with en passant
  getMovedHowLongAgo() {
    return this.movedHowLongAgo;
  }

  add() {
    this.movedHowLongAgo++;
  }

  resetMoves() {
    this.movedHowLongAgo = 0;
  }
}