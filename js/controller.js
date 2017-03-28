console.log('controller.js connected');
//***************************************
// Controller - where the brains live
//***************************************
var controller = {
  currentPlayer: red,

  //******************************
  // initialize game after page loads
  //******************************

  // makeboard - initialize data and view
  makeBoard: function() {
    console.log('controller.makeBoard()');

    view.makeBoard();
    model.initialize();
  },

  //  placePieces - place pieces for start of game
  placePieces: function() {
    console.log('controler.placePieces()');

    // place black pieces
    for (var row = 0; row < 3; row++) {
      for(var col = 0; col < 8; col++) {
        if ((row % 2  + col) % 2 !== 0) {
          view.placePiece(black, row, col);
          model.placePiece(black, row, col);
        }
      }
    }

    // place red pieces
    for (var row = 5; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        if ((row % 2 + col) % 2 !== 0) {
          view.placePiece(red, row, col);
          model.placePiece(red, row, col);
        }
      }
    }
  },

  //**********************************
  // Start playing
  //***********************************

  // takeTurn - called at start of a players turn. Updates info area.
  // Add handlers to playable pieces
  takeTurn: function(player) {
    console.log('>>>>>> takeTurn() ' + player);

    // show whose turn it is
    var str = "It's " + player + "'s turn.";
    view.showTurn(str);

    // add handlers to playable pieces
    var validSquares = model.getValidPieces(player);
    for (var i = 0; i < validSquares.length; i++) {
      view.addSelectPieceHandler(validSquares[i][0], validSquares[i][1]);
    }
  },

  // pieceSelected - handler for when a player selects a piece.
  // Tells model which piece has been selected. Adds handlers to squares
  // that piece can move to.
  pieceSelected: function(row,  column) {
    console.log('>>>>>>>controller.pieceSelected() row '  + row + ' column ' + column);

    model.setSelectedPiece(row, column);

    var moveToSquares = model.getMoveToSquares(this.currentPlayer);
    for (var i = 0; i < moveToSquares.length; i++) {
      view.addSelectedSquareHandler(moveToSquares[i][0], moveToSquares[i][1]);
    }

    var jumpToSquares = model.getJumpToSquares(this.currentPlayer, row, column);
    for (var i = 0; i < jumpToSquares.length; i++) {
      view.addSelectedSquareHandler(jumpToSquares[i][0], jumpToSquares[i][1]);
    }
  },

  // squareSelected - handler for when a player selects a square to move to.
  // Tells model where to move piece to. Starts opponents turn.
  squareSelected: function(row, column) {
    console.log('>>>>>>> controller.squareSelected(' + row + ', ' + column + ')');


    // move piece in view
    var oldPosition = model.getSelectedPiece();
    view.removePiece( oldPosition[0], oldPosition[1]);
    view.placePiece(this.currentPlayer, row, column);

    // move piece in model
    var pieceJumped = model.movePiece(row, column);

    if (pieceJumped.length === 2) {
      // piece was jumped remove it from display
      view.removePiece(pieceJumped[0], pieceJumped[1]);
      view.removePiece(pieceJumped[0], pieceJumped[1]);
    }

    var numPieces = model.getNumPieces();
    view.showNumPieces(numPieces[0], numPieces[1]);

    var winner = model.getWinner();
    if (winner !== blank) {
      view.showWinner(winner);
      view.showTurn("");
      view.removeAllHandlers();
      return;
    }

    this.currentPlayer = this.currentPlayer === red ? black : red;
    this.takeTurn( this.currentPlayer);
  }
}
