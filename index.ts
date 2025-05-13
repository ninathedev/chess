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
app.get('/', (req: express.Request, res : express.Response) => {
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

function simulateMove(board: (Piece | null)[][], move: any): (Piece | null)[][] {
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
}

function minimax(board: (Piece | null)[][], depth: number, isMaximizing: boolean): number {
  // Base case: return a static evaluation of the board
  if (depth === 0) {
    return evaluateBoard(board);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    // Generate all possible moves for maximizing player
    const moves = generateMoves(board, "black");
    for (const move of moves) {
      const simulatedBoard = simulateMove(board, move);
      const evaluation = minimax(simulatedBoard, depth - 1, false);
      maxEval = Math.max(maxEval, evaluation);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    // Generate all possible moves for minimizing player
    const moves = generateMoves(board, "white");
    for (const move of moves) {
      const simulatedBoard = simulateMove(board, move);
      const evaluation = minimax(simulatedBoard, depth - 1, true);
      minEval = Math.min(minEval, evaluation);
    }
    return minEval;
  }
}

function evaluateBoard(board: (Piece | null)[][]): number {
  // Placeholder for board evaluation logic
  return 0;
}

function generateMoves(board: (Piece | null)[][], color: string): any[] {
  // Placeholder for move generation logic
  return [];
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
      const moveValue = minimax(simulatedBoard, depth - 1, false);
      
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