let board = [];
let pieceImg = [];
let selectedPiece = null;
let isWhiteTurn = true; // Track whose turn it is

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
        fill(235,236,208,255); // White
      } else {
        fill(115,149,82,255); // Green
      }
      rect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let piece = board[r][c];
      if (piece) {
        // use switch case to determine the piece type and color
        let pieceType = piece.name;
        let pieceColor = piece.color === "white" ? 0 : 1; // 0 for white, 1 for black
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
    if (piece && ((isWhiteTurn && piece.color === "white") || (!isWhiteTurn && piece.color === "black"))) {
      selectedPiece = piece;
      selectedPiece.x = x; // Store the x coordinate of the selected piece
      selectedPiece.y = y; // Store the y coordinate of the selected piece
    } else {
      // Move the selected piece to the clicked square if it's a valid move
      if (selectedPiece) {
        let moves = selectedPiece.getAvailableMoves(board, selectedPiece.x, selectedPiece.y);
        for (let move of moves) {
          if (move[0] === x && move[1] === y) {
            board[y][x] = selectedPiece; // Move the piece to the new square
            board[selectedPiece.y][selectedPiece.x] = null; // Remove it from its old square
            selectedPiece.hasMoved = true; // Mark the piece as having moved
            isWhiteTurn = !isWhiteTurn; // Switch turns
            break;
          }
        }
        selectedPiece = null; // Deselect the piece after moving
      }
    }
  }
}