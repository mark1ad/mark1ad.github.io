console.log( 'model.js connected');
//***************************************
// model - where the data lives
//
// The playable sqaures are indexed starting at 1. From the outside
// it appears to be 0 based.
//****************************************
var model = {
  outOfPlay: 'x', // marks a square that is not playable
  // board is 10x10. The squares on the edges are dummy squares to make
  // life easier in other operations
  board: [],
  selectedPiece: [],
  piecesLeft: {
  },

  //***************************************
  // Set up data objects - used once after page first loads
  //***************************************

  // makeRow - creates an array to store data for
  // one row of the board
  makeRow: function(row, initialValue) {
    console.log('model.makeRow()');

    this.board[row] = [];
    this.board[row].length = 8;
    this.board[row].fill(initialValue, blank, 8);
  },

  // initialize - creates the array to store state of the board in
  initialize: function() {
    console.log('model.initialize()');
    this.piecesLeft[red] = 12;
    this.piecesLeft[black] = 12;
    for (var row = 0; row < 8; row++) {
      this.makeRow( row, blank);
    }
  },


  //*****************************
  // Update game state
  //******************************
  placePiece: function(color, rowIndex, colIndex) {
    console.log('model.placePiece( ' + rowIndex + ', ' + colIndex + ')');

    // increment indexes because of edge rows
    this.board[rowIndex][colIndex] = color;
  },

  setSelectedPiece: function(row, column) {
    console.log('model.setSelectedPiece(' + row + ', ' + column + ')');
    this.selectedPiece = [ row, column ];
  },

  getSelectedPiece: function() {
    return [ this.selectedPiece[0], this.selectedPiece[1]];
  },

  // movePiece - moves a piece in the model. If the move was a jump remove the
  // jumped piece.
  // Returns an array with the coordinates of the jumped piece. If not a jump
  // return an empty array
  movePiece: function(row, column) {
    console.log('model.movePiece(' + row + ', ' + column + ')');

    var player = this.board[this.selectedPiece[0]][this.selectedPiece[1]];
    var direction = player === red ? -1 : 1;
    var jumpedPiece = [];

    // remove from current position
    this.board[this.selectedPiece[0]][this.selectedPiece[1]] = blank;
    // place on new position
    this.board[row][column] = player;

    // take care of a jumped piece
      var distanceMoved = Math.abs(this.selectedPiece[1] - column);
      if (distanceMoved === 2) {
        var opponent = player === red ? black : red;
        this.piecesLeft[opponent]--;
        // we've got a jumped
        if (column < this.selectedPiece[1]) {
          // jumped left remove from board
          jumpedPiece = [(this.selectedPiece[0] + direction),
            (this.selectedPiece[1] - 1)];
          this.board[jumpedPiece[0]][jumpedPiece[1]] = blank;
        }
        else {
          // jump right removed from board
          jumpedPiece = [(this.selectedPiece[0] + direction),
            (this.selectedPiece[1] + 1)];
          this.board[jumpedPiece[0]][jumpedPiece[1]] = blank;
        }
      }

    this.selectedPiece = [];

    return jumpedPiece;
  },

  //**********************************
  // Get playable squares/pieces
  //**********************************

  // pieceCanMove - returns an array of squares that piece can move to. array
  // is empty if there are no squares available
  pieceCanMove: function(direction, row, column) {
    console.log('pieceCanMove( ' + direction + ', ' + row + ', ' + column +')');
    var newRow = row + direction;
    var availableSquares = [];
    // var moveLeft = true;
    // var moveRight = true;

    if (newRow < 0 || newRow > 7) {
      // moving forward will take piece off the board
      return false;
    }

    //check moving left
    var newCol = column - 1;
    if (newCol >= 0) {
      // can move left
      if (this.board[newRow][newCol] === blank) {
        // sqaure is empty
        availableSquares.push( [newRow, newCol]);
      }
    }

    // check moving right
    newCol = column + 1;
    if (newCol < 8) {
      // piece can move right
      if (this.board[newRow][newCol] === blank) {
        // right square is empty
        availableSquares.push( [newRow, newCol]);
      }
    }
    return availableSquares;
  },

  // getValidPieces - returns an array of arrays. Inner arrays are the
    // coordinates of pieces that can be moved. [col, row]
  getValidPieces: function(player){
    // get direction pieces are moving. Red moves from 8 towards 0 so direction
    // is negative. Black is the opposite.
    var direction = player === red ? -1 : 1;

    var pieces = [];

    // check each row
    for (var row = 0; row < 8; row++) {
      // check each sqaure in row
      for (var col = 0; col < 8; col++ ) {
        // check if player is on this square
        if (this.board[row][col] === player) {
          // check if player can move
          var moveSquares = this.pieceCanMove(direction, row, col);
          var jumpSquares = this.getJumpToSquares(player, row, col);
          if (moveSquares.length > 0 || jumpSquares.length > 0) {
            pieces.push( [row, col]);
          }
        }
      }
    }

    return pieces;
  },

  // getMoveToSquares - returns an array or arrays. Inner arrays are the
  // coordinates of sqaures that a piece can move to. [row, column]
  getMoveToSquares: function(player) {
    console.log('model.getMoveToSquares() ' + player);

    var squares;
    var direction = player === red ? -1 : 1;

    squares = this.pieceCanMove(direction,
      this.selectedPiece[0],
      this.selectedPiece[1]);

    return squares;
  },

  // getJumpToSquares - Gets the squares that the selected piece can jump to.
  // Returns an array of array. Inner arrays are the squares to jump to.
  getJumpToSquares: function(player, row, col) {
    console.log('model.getJumpToSquares(' + player + ')');

    var direction = player === red ? -1 : 1;
    var squares = [];
    var opponent = player === red ? black : red;

    if ((row + direction) > 7 || (row + direction) < 0) {
      // landing square is off the end of the board
      return squares;
    }

    // check jumping left
    if ((col - 2 ) >= 0) {
      var jumpedSquare = this.board[row + direction][col - 1];
      var landingSquare = this.board[row + 2 * direction][col - 2];
      if (jumpedSquare === opponent && landingSquare === blank ) {
        // we have a jump
        squares.push([row + 2 * direction, col - 2]);
    }
  }

    // check jumping right
    if ((col + 2) <= 7) {
      jumpedSquare = this.board[row + direction][col + 1];
      landingSquare = this.board[row + 2 * direction][col + 2];
      if (jumpedSquare === opponent && landingSquare === blank) {
        // we have a jump
        squares.push([row + 2 * direction, col + 2]);
      }
    }

    return squares;
  },

  //***************************
  // Misc. methods
  //**************************
  getNumPieces: function() {
    return [ this.piecesLeft[red], this.piecesLeft[black]];
  },

  // getWinner - returns the winning player. Returns blank if no winner
  getWinner: function() {
    if (this.piecesLeft[red] <= 0) {
      // black won
      return black;
    }

    if (this.piecesLeft[black] <= 10) {
      // red won
      return red;
    }

    // no winner yet
    return blank;
  },

  //***********************************
  // debug methods
  //**********************************
  // TODO: this function is for debugging, remove when done.
  printBoard: function() {
    console.log('red pieces: ' + this.piecesLeft[red]);
    console.log('black pieces: ' + this.piecesLeft[black]);
    for (var i = 0; i < this.board.length; i++) {
      console.log(this.board[i]);
    }
  },


}
