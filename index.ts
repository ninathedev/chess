import express from 'express';
import { Piece } from './chess.js';

// Random function to simulate AI move selection
function random(array: any[] = []): any {
  return array[Math.floor(Math.random() * array.length)];
}

const app: express.Application = express();
app.use(express.json());
const PORT: number = 3000;
// sudo apt autoremove
app.get('/', (req: express.Request, res: express.Response) => {
  res.sendFile('public/index.html', { root: __dirname });
});
app.get('/c', (req: express.Request, res: express.Response) => {
  res.sendFile('public/chess.js', { root: __dirname });
});
app.get('/s', (req: express.Request, res: express.Response) => {
  res.sendFile('public/script.js', { root: __dirname });
});
app.get('/p', (req: express.Request, res: express.Response) => {
  res.sendFile('public/p5.min.js', { root: __dirname });
});

app.get('/img/:color/:piece.png', (req: express.Request, res: express.Response) => {
  const color: string = req.params.color ?? '';
  const piece: string = req.params.piece ?? '';
  if ((color === 'b' || color === 'w') && ['p', 'n', 'b', 'r', 'q', 'k'].includes(piece)) {
    res.sendFile(`img/${color}${piece}.png`, { root: __dirname });
  } else {
    res.status(404).send('Not Found');
  }
});

/*function simulateMove(board: (Piece | null)[][], move: any): (Piece | null)[][] {
  // Placeholder logic to simulate a move
  const newBoard = JSON.parse(JSON.stringify(board)) as (Piece | null)[][];
  const [fromX, fromY, toX, toY] = move;
  if (newBoard[toY] && newBoard[fromY] && newBoard[fromY][fromX] !== undefined) {
    newBoard[toY][toX] = newBoard[fromY][fromX];
  }
  if (newBoard[fromY] && newBoard[fromY][fromX] !== undefined) {
    newBoard[fromY][fromX] = null;
  }
  return newBoard;
}*/

function minimax(board: (Piece | null)[][], depth: number, isMaximizing: boolean, allBlackMoves: any[], allWhiteMoves: any[]): number {
  // Base case: return a static evaluation of the board
  if (depth === 0) {
    return evaluateBoard(board);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    // Generate all possible moves for maximizing player
    const moves = allBlackMoves; // Correct - maximizing is black
    for (const move of moves) {
      const simulatedBoard = simulateMove(board, move);
      const newAllBlackMoves: any[] = [];
      const newAllWhiteMoves: any[] = [];

      // Generate moves for the next level
      generateAllMoves(simulatedBoard, newAllBlackMoves, newAllWhiteMoves);

      const evaluation = minimax(simulatedBoard, depth - 1, false, newAllBlackMoves, newAllWhiteMoves);
      maxEval = Math.max(maxEval, evaluation);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    // Generate all possible moves for minimizing player
    const moves = allWhiteMoves; // Correct - minimizing is white
    for (const move of moves) {
      const simulatedBoard = simulateMove(board, move);
      const newAllBlackMoves: any[] = [];
      const newAllWhiteMoves: any[] = [];

      // Generate moves for the next level
      generateAllMoves(simulatedBoard, newAllBlackMoves, newAllWhiteMoves);

      const evaluation = minimax(simulatedBoard, depth - 1, true, newAllBlackMoves, newAllWhiteMoves);
      minEval = Math.min(minEval, evaluation);
    }
    return minEval;
  }
}

function evaluateBoard(board: (Piece | null)[][]): number {
  const pieceValues: { [key: string]: number } = {
    p: 1, // Pawn
    n: 3, // Knight
    b: 3, // Bishop
    r: 5, // Rook
    q: 9, // Queen
    k: 0  // King (typically not assigned a value for evaluation)
  };

  let evaluation = 0;

  for (let row of board) {
    for (let piece of row) {
      if (piece) {
        const value = pieceValues[piece.name.toLowerCase()] || 0;
        evaluation += piece.color === "white" ? value : -value;
      }
    }
  }
  return evaluation;
}

function simulateMove(board: (Piece | null)[][], move: any[]): (Piece | null)[][] {
  const [startCol, startRow, endCol, endRow] = move;
  // Create a deep copy to avoid modifying the original board
  const newBoard: (Piece | null)[][] = board.map(row =>
    row.map(piece => {
      if (piece) {
        // Re-create Piece object to preserve methods
        return new Piece(piece.name, piece.color);
      }
      return null;
    })
  );

  const movingPiece = newBoard[startRow]?.[startCol] ?? null;
  if (!movingPiece) {
    return newBoard; // Handle the case where there's no piece to move
  }

  if (newBoard[startRow]?.[startCol] !== undefined) {
    newBoard[startRow][startCol] = null;
  }
  if (newBoard[endRow]) {
    newBoard[endRow][endCol] = movingPiece;
  }

  return newBoard;
}

function generateAllMoves(board: (Piece | null)[][], blackMoves: any[], whiteMoves: any[]) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r]?.[c];
      if (piece) {
        const availableMoves = piece.getAvailableMoves(board, c, r);
        if (piece.color === "black") {
          for (const move of availableMoves) {
            blackMoves.push([c, r, move[0], move[1], move[2] ?? false, move[3] ?? false]);
          }
        } else if (piece.color === "white") {
          for (const move of availableMoves) {
            whiteMoves.push([c, r, move[0], move[1], move[2] ?? false, move[3] ?? false]);
          }
        }
      }
    }
  }
}


app.post('/minimax', (req: express.Request, res: express.Response) => {
  const depth: number = parseInt(req.body.depth as string) || 0;

  const board: (Piece | null)[][] = req.body.board as unknown as (Piece | null)[][];

  // req.body.board is a 2d array of Piece 
  /*
  example:

  board = [
    [new Piece("r", "black"), new Piece("n", "black"), new Piece("b", "black"), new Piece("q", "black"), new Piece("k", "black"), new Piece("b", "black"), new Piece("n", "black"), new Piece("r", "black")],
    [new Piece("p", "black"), new Piece("p", "black"), new Piece("p", "black"), new Piece("p", "black"), new Piece("p", "black"), new Piece("p", "black"), new Piece("p", "black"), new Piece("p", "black")],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [new Piece("p", "white"), new Piece("p", "white"), new Piece("p", "white"), new Piece("p", "white"), new Piece("p", "white"), new Piece("p", "white"), new Piece("p", "white"), new Piece("p", "white")],
    [new Piece("r", "white"), new Piece("n", "white"), new Piece("b", "white"), new Piece("q", "white"), new Piece("k", "white"), new Piece("b", "white"), new Piece("n", "white"), new Piece("r", "white")]
  ];
  */
  // for now, let's test this GET endpoint by waiting for the timer then giving a random move

  let aiMoves: any[] = []; // Changed from array[] to any[]
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let aiPieceData = board[r]?.[c] ?? null;
      let aiPiece: Piece | null = aiPieceData ? new Piece(aiPieceData.name, aiPieceData.color) : null;
      if (aiPiece && aiPiece.color === "black") {
        let aiAvailableMoves: any[] = aiPiece.getAvailableMoves(board, c, r);
        for (let move of aiAvailableMoves) {
          const newMove = [c, r, move[0], move[1], move[2] ?? false, move[3] ?? false];
          aiMoves.push(newMove);
        }
      }
    }
  }
  let humanMoves: any[] = []; // Changed from array[] to any[]
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let aiPieceData = board[r]?.[c] ?? null;
      let aiPiece: Piece | null = aiPieceData ? new Piece(aiPieceData.name, aiPieceData.color) : null;
      if (aiPiece && aiPiece.color === "white") {
        let aiAvailableMoves: any[] = aiPiece.getAvailableMoves(board, c, r);
        for (let move of aiAvailableMoves) {
          const newMove = [c, r, move[0], move[1], move[2] ?? false, move[3] ?? false];
          humanMoves.push(newMove);
        }
      }
    }
  }
  // Randomly select a move from the available moves
  if (aiMoves.length > 0) {
    /*
    let selectedMove = random(aiMoves);
    // Check if the move is a promotion
    if (selectedMove[4] === true && selectedMove[5] === true) {
      const promotionPieces = ['q', 'r', 'b', 'n']; // Queen, Rook, Bishop, Knight
      selectedMove.push(random(promotionPieces)); // Add a random promotion piece to the move
    }
    res.json({ move: selectedMove });
    */

    // minimax time!
    let bestMove: any = null;
    let bestValue: number = -Infinity;


    for (let move of aiMoves) {

      const simulatedBoard = simulateMove(board, move);
      const moveValue = minimax(simulatedBoard, depth - 1, false, aiMoves, humanMoves); // Assuming white moves next

      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }

    res.json({ move: bestMove });
  } else {
    res.status(204).send('No Content'); // No available moves, maybe checkmate or stalemate?
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});