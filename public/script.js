let board = [];
let pieceImg = [];
let selectedPiece = null;
let isWhiteTurn = true; // Track whose turn it is
let moveCounter = 0; // To track how long ago a pawn moved for en passant

function preload() {
  // Load any images or assets here if needed
  pieceImg.push(loadImage("img/w/p.png"));
  pieceImg.push(loadImage("img/w/r.png"));
  pieceImg.push(loadImage("img/w/n.png"));
  pieceImg.push(loadImage("img/w/b.png"));
  pieceImg.push(loadImage("img/w/q.png"));
  pieceImg.push(loadImage("img/w/k.png"));
  pieceImg.push(loadImage("img/b/p.png"));
  pieceImg.push(loadImage("img/b/r.png"));
  pieceImg.push(loadImage("img/b/n.png"));
  pieceImg.push(loadImage("img/b/b.png"));
  pieceImg.push(loadImage("img/b/q.png"));
  pieceImg.push(loadImage("img/b/k.png"));
}

function setup() {
  createCanvas(500, 500);

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
}

function draw() {
  background(255);
  noStroke();

  let tileSize = width / 8;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Alternate colors
      if ((row + col) % 2 === 0) {
        fill(235, 236, 208, 255); // White
      } else {
        fill(115, 149, 82, 255); // Green
      }
      rect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let piece = board[r][c];
      if (piece) {
        // Store the piece's current position for move generation
        piece.x = c;
        piece.y = r;
        let pieceType = piece.getName();
        let pieceColor = piece.getColor() === "white" ? 0 : 1; // 0 for white, 1 for black
        let imgIndex = pieceColor * 6 + "prnbqk".indexOf(pieceType); // Calculate the index based on color and type
        image(pieceImg[imgIndex], c * tileSize, r * tileSize, tileSize, tileSize); // Draw the piece
      }
    }
  }

  // i want to draw the available moves for the selected piece
  if (selectedPiece) {
    let moves = selectedPiece.getAvailableMoves(board, selectedPiece.x, selectedPiece.y);
    fill(255, 0, 0, 100); // Semi-transparent red for available moves
    for (let move of moves) {
      rect(move[0] * tileSize, move[1] * tileSize, tileSize, tileSize);
    }
  }
}

// use mouseClicked to select a piece and show its available moves
function mouseClicked() {
  let tileSize = width / 8;
  let x = Math.floor(mouseX / tileSize);
  let y = Math.floor(mouseY / tileSize);

  if (x >= 0 && x < 8 && y >= 0 && y < 8) {
    let piece = board[y][x];
    if (piece && ((isWhiteTurn && piece.getColor() === "white") || (!isWhiteTurn && piece.getColor() === "black"))) {
      selectedPiece = piece;
      // The x and y are already being set in the draw function
    } else {
      // Move the selected piece to the clicked square if it's a valid move
      if (selectedPiece) {
        let moves = selectedPiece.getAvailableMoves(board, selectedPiece.x, selectedPiece.y);
        for (let move of moves) {
          if (move[0] === x && move[1] === y) {
            let capturedPiece = board[y][x];
            let originalX = selectedPiece.x;
            let originalY = selectedPiece.y;

            // Handle en passant capture
            if (move[2] === true && move[3] === true) {
              board[originalY][x] = null; // Remove the captured pawn
            }
            if (move[2] === true && move[3] === false) {
              // promotion. 
              
                // Display a promotion dialog to the user
                let promotionChoice = prompt("Promote pawn to (q: Queen, r: Rook, b: Bishop, n: Knight) (if invalid, queen):", "q");
                if (promotionChoice === "q") {
                  selectedPiece.setName("q");
                } else if (promotionChoice === "r") {
                  selectedPiece.setName("r");
                } else if (promotionChoice === "b") {
                  selectedPiece.setName("b");
                } else if (promotionChoice === "n") {
                  selectedPiece.setName("n");
                } else {
                  selectedPiece.setName("q");
                }
            }

            // Move the piece
            board[y][x] = selectedPiece;
            board[originalY][originalX] = null;
            selectedPiece.setHasMoved(true);
            selectedPiece.resetMoves(); // Reset movedHowLongAgo

            // Handle castling
            if (selectedPiece.getName() === "k" && Math.abs(originalX - x) > 1 && move[2] === true) {
              let rookStartX = x > originalX ? 7 : 0;
              let rookY = originalY;
              let rookEndX = x > originalX ? x - 1 : x + 1;

              let castlingRook = board[rookY][rookStartX];
              if (castlingRook) {
                board[rookY][rookEndX] = castlingRook;
                board[rookY][rookStartX] = null;
                castlingRook.setHasMoved(true);
                castlingRook.resetMoves(); // Reset movedHowLongAgo for the rook as well
              }
            }



            // Increment move counter and update movedHowLongAgo for all pawns
            moveCounter++;
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                if (board[r][c]?.getName() === "p" && board[r][c] !== selectedPiece) {
                  board[r][c].add();
                }
              }
            }
            if (selectedPiece.getName() === "p") {
              selectedPiece.resetMoves(); // Reset for the moved pawn
            }

            isWhiteTurn = !isWhiteTurn; // Switch turns
            selectedPiece = null; // Deselect the piece after moving

            // ai time!!!
            // For simplicity, let's just make a random move for the AI for now.
            // loop through the board and store every available move for the AI
            let aiMoves = [];
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                let aiPiece = board[r][c];
                if (aiPiece && aiPiece.getColor() === "black") {
                  let aiAvailableMoves = aiPiece.getAvailableMoves(board, c, r);
                  for (let move of aiAvailableMoves) {
                    aiMoves.push([aiPiece, move]);
                  }
                }
              }
            }
            // If there are available moves, pick one at random
            if (aiMoves.length > 0) {
              let randomMove = random(aiMoves);
              let aiPiece = randomMove[0];
              let aiMove = randomMove[1];

              // Move the AI piece
              let aiOriginalX = aiPiece.x;
              let aiOriginalY = aiPiece.y;
              board[aiMove[1]][aiMove[0]] = aiPiece;
              board[aiOriginalY][aiOriginalX] = null;
              aiPiece.setHasMoved(true);
              aiPiece.resetMoves(); // Reset movedHowLongAgo for the AI piece

              // Handle en passant for AI move
              if (aiMove[2] === true && aiMove[3] === true) {
                board[aiOriginalY][aiMove[0]] = null; // Remove the captured pawn
              }
              if (aiMove[2] === true && aiMove[3] === false) {
                // promotion. randomly promote to a queen, rook, knight or bishop, but pick queen 75% of the time
                let promoteTo = random(["q", "r", "n", "b"]);
                if (random() < 0.75) {
                  promoteTo = "q"; // 75% chance to promote to a queen
                }

                board[aiMove[1]][aiMove[0]] = new Piece(promoteTo, "black");
              }

              // Handle castling for AI move
              if (aiPiece.getName() === "k" && Math.abs(aiOriginalX - aiMove[0]) > 1 && aiMove[2] === true) {
                let aiRookStartX = aiMove[0] > aiOriginalX ? 7 : 0;
                let aiRookY = aiOriginalY;
                let aiRookEndX = aiMove[0] > aiOriginalX ? aiMove[0] - 1 : aiMove[0] + 1;

                let aiCastlingRook = board[aiRookY][aiRookStartX];
                if (aiCastlingRook) {
                  board[aiRookY][aiRookEndX] = aiCastlingRook;
                  board[aiRookY][aiRookStartX] = null;
                  aiCastlingRook.setHasMoved(true);
                  aiCastlingRook.resetMoves(); // Reset movedHowLongAgo for the rook as well
                }
              }
              // Increment move counter and update movedHowLongAgo for all pawns
              moveCounter++;
              for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                  if (board[r][c]?.getName() === "p" && board[r][c] !== aiPiece) {
                    board[r][c].add();
                  }
                }
              }
              if (aiPiece.getName() === "p") {
                aiPiece.resetMoves(); // Reset for the moved pawn
              }

              isWhiteTurn = !isWhiteTurn; // Switch turns back to player
            }

            break;
          }
        }
        selectedPiece = null; // Deselect if the click was not a valid move
      }
    }
  }
}