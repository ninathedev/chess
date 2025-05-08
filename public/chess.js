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

  isMoveSafe(board, x, y, newX, newY) {
    let tempBoard = JSON.parse(JSON.stringify(board));
    tempBoard[newY][newX] = tempBoard[y][x];
    tempBoard[y][x] = null;
    return !this.isKingInCheck(tempBoard, this.color);
  };

  getPawnMoves(board, x, y) {
    let moves = [];
    let direction = this.color === "white" ? -1 : 1; // White moves up, black moves down
    let startRow = this.color === "white" ? 6 : 1; // Starting row for pawns

    // Move forward one square
    if (board[y + direction][x] === null && this.isMoveSafe(board, x, y, x, y + direction)) {
      moves.push([x, y + direction]);
      // Move forward two squares from starting position
      if (y === startRow && board[y + 2 * direction][x] === null && this.isMoveSafe(board, x, y, x, y + 2 * direction)) {
        moves.push([x, y + 2 * direction, false]); // false indicates normal move
      }
    }

    // Capture diagonally left
    if (x > 0 && board[y + direction][x - 1] !== null && board[y + direction][x - 1].color !== this.color && this.isMoveSafe(board, x, y, x - 1, y + direction)) {
      moves.push([x - 1, y + direction, false]); // false indicates normal capture
    }

    // Capture diagonally right
    if (x < 7 && board[y + direction][x + 1] !== null && board[y + direction][x + 1].color !== this.color && this.isMoveSafe(board, x, y, x + 1, y + direction)) {
      moves.push([x + 1, y + direction, false]); // false indicates normal capture
    }

    // En passant
    if (x > 0 && board[y][x - 1] !== null && board[y][x - 1].name === "p" && board[y][x - 1].color !== this.color && board[y][x - 1].movedHowLongAgo === 0 && this.isMoveSafe(board, x, y, x - 1, y + direction)) {
      moves.push([x - 1, y + direction, true]); // true indicates en passant
    }
    if (x < 7 && board[y][x + 1] !== null && board[y][x + 1].name === "p" && board[y][x + 1].color !== this.color && board[y][x + 1].movedHowLongAgo === 0 && this.isMoveSafe(board, x, y, x + 1, y + direction)) {
      moves.push([x + 1, y + direction, true]); // true indicates en passant
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
          if (!this.isMoveSafe(board, x, y, newX, newY)) continue;
          moves.push([newX, newY]);
        } else {
          if (board[newY][newX].color !== this.color && this.isMoveSafe(board, x, y, newX, newY)) {
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
        if ((board[newY][newX] === null || board[newY][newX].color !== this.color) && this.isMoveSafe(board, x, y, newX, newY)) {
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
          if (!this.isMoveSafe(board, x, y, newX, newY)) continue;
          moves.push([newX, newY]);
        } else {
          if (board[newY][newX].color !== this.color && this.isMoveSafe(board, x, y, newX, newY)) {
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
        if ((board[newY][newX] === null || board[newY][newX].color !== this.color) && this.isMoveSafe(board, x, y, newX, newY)) {
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
        !this.isSquareUnderAttack(board, x, y, this.color) &&
        !this.isSquareUnderAttack(board, 5, y, this.color) &&
        !this.isSquareUnderAttack(board, 6, y, this.color)
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
        !this.isSquareUnderAttack(board, x, y, this.color) &&
        !this.isSquareUnderAttack(board, 3, y, this.color) &&
        !this.isSquareUnderAttack(board, 2, y, this.color)
      ) {
        moves.push([2, y, true]); // Castling move
      }
    }

    return moves;
  }

  isSquareUnderAttack(board, x, y, color) {
    const opponentColor = color === "white" ? "black" : "white";
    const pawnDirection = opponentColor === "white" ? -1 : 1;

    // Check for pawn attacks
    const attackingRow = y - pawnDirection; // Row where the attacking pawn would be
    if (attackingRow >= 0 && attackingRow < 8) {
        // Check diagonal left attacker
        if (x > 0) {
            const leftAttacker = board[attackingRow][x - 1];
            if (leftAttacker && leftAttacker.name === "p" && leftAttacker.color === opponentColor) {
                return true;
            }
        }
        // Check diagonal right attacker
        if (x < 7) {
            const rightAttacker = board[attackingRow][x + 1];
            if (rightAttacker && rightAttacker.name === "p" && rightAttacker.color === opponentColor) {
                return true;
            }
        }
    }

    // Check for knight attacks
    const knightMoves = [
        { x: 2, y: 1 }, { x: 2, y: -1 },
        { x: -2, y: 1 }, { x: -2, y: -1 },
        { x: 1, y: 2 }, { x: 1, y: -2 },
        { x: -1, y: 2 }, { x: -1, y: -2 }
    ];
    for (const move of knightMoves) {
        const newX = x + move.x;
        const newY = y + move.y;
        if (newX >= 0 && newX <= 7 && newY >= 0 && newY <= 7) {
            const attacker = board[newY][newX];
            if (attacker && attacker.name === "n" && attacker.color === opponentColor) {
                return true;
            }
        }
    }

    // Check for rook and queen attacks (horizontally and vertically)
    const rookDirections = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
    for (const dir of rookDirections) {
        let newX = x + dir.x;
        let newY = y + dir.y;
        while (newX >= 0 && newX <= 7 && newY >= 0 && newY <= 7) {
            const attacker = board[newY][newX];
            if (attacker) {
                if ((attacker.name === "r" || attacker.name === "q") && attacker.color === opponentColor) return true;
                break;
            }
            newX += dir.x;
            newY += dir.y;
        }
    }

    // Check for bishop and queen attacks (diagonally)
    const bishopDirections = [{ x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }];
    for (const dir of bishopDirections) {
        let newX = x + dir.x;
        let newY = y + dir.y;
        while (newX >= 0 && newX <= 7 && newY >= 0 && newY <= 7) {
            const attacker = board[newY][newX];
            if (attacker) {
                if ((attacker.name === "b" || attacker.name === "q") && attacker.color === opponentColor) return true;
                break;
            }
            newX += dir.x;
            newY += dir.y;
        }
    }

    // Check for king attacks
    const kingMoves = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
    ];
    for (const move of kingMoves) {
        const newX = x + move.x;
        const newY = y + move.y;
        if (newX >= 0 && newX <= 7 && newY >= 0 && newY <= 7) {
            const attacker = board[newY][newX];
            if (attacker && attacker.name === "k" && attacker.color === opponentColor) {
                return true;
            }
        }
    }

    return false;
  }

  isKingInCheck(board, color) {
    let kingPosition = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = board[row][col];
        if (piece && piece.name === "k" && piece.color === color) {
          kingPosition = { x: col, y: row };
          break;
        }
      }
      if (kingPosition) break;
    }

    return this.isSquareUnderAttack(board, kingPosition.x, kingPosition.y, color);
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